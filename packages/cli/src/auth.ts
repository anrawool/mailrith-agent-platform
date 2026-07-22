import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import http from "node:http";
import { spawn } from "node:child_process";
import {
  readMailrithCliConfig,
  resolveMailrithConfigPath,
  writeMailrithCliConfig,
  type MailrithCliConfig,
  type StoredOAuthCredential,
} from "./config.js";

const defaultApiBaseUrl = "https://api.mailrith.com";
const defaultOAuthPort = 53682;
const oauthTimeoutMilliseconds = 5 * 60 * 1000;

type OAuthMetadata = {
  authorization_endpoint: string;
  token_endpoint: string;
  registration_endpoint: string;
};

type OAuthRegistration = {
  client_id: string;
};

type OAuthTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
};

export type OAuthLoginOptions = {
  baseUrl?: string;
  scopes: string[];
  noBrowser?: boolean;
  fetch?: typeof fetch;
  port?: number;
  writeLine?: (line: string) => void;
  configPath?: string;
};

const normalizeBaseUrl = (value: string | undefined) =>
  (value ?? defaultApiBaseUrl).replace(/\/+$/, "");

const parseJsonResponse = async <T>(response: Response, label: string) => {
  const body = (await response.json().catch(() => null)) as T | null;
  if (!response.ok || !body) {
    throw new Error(`${label} failed with HTTP ${response.status}.`);
  }
  return body;
};

const createPkce = () => {
  const verifier = randomBytes(48).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge };
};

const safeEqual = (left: string, right: string) => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
};

const openBrowser = (url: string) => {
  const command =
    process.platform === "darwin"
      ? { file: "open", args: [url] }
      : process.platform === "win32"
        ? { file: "cmd", args: ["/c", "start", "", url] }
        : { file: "xdg-open", args: [url] };
  const child = spawn(command.file, command.args, {
    detached: true,
    stdio: "ignore",
  });
  child.once("error", () => undefined);
  child.unref();
};

const assertSameSecureOrigin = (baseUrl: string, metadata: OAuthMetadata) => {
  const base = new URL(baseUrl);
  for (const [name, value] of Object.entries(metadata)) {
    const endpoint = new URL(value);
    const localHttp =
      endpoint.protocol === "http:" &&
      (endpoint.hostname === "127.0.0.1" || endpoint.hostname === "localhost");
    if ((endpoint.protocol !== "https:" && !localHttp) || endpoint.origin !== base.origin) {
      throw new Error(`OAuth ${name} must use the Mailrith API origin over HTTPS or localhost HTTP.`);
    }
  }
};

const waitForAuthorizationCode = async (params: {
  port: number;
  expectedState: string;
  authorizationUrl: string;
  noBrowser: boolean;
  writeLine: (line: string) => void;
}) => {
  let timeout: NodeJS.Timeout | undefined;
  let server: http.Server | undefined;

  try {
    const codePromise = new Promise<string>((resolve, reject) => {
      server = http.createServer((request, response) => {
        const url = new URL(request.url ?? "/", `http://127.0.0.1:${params.port}`);
        if (url.pathname !== "/callback") {
          response.writeHead(404).end("Not found");
          return;
        }

        const state = url.searchParams.get("state") ?? "";
        const code = url.searchParams.get("code") ?? "";
        const oauthError = url.searchParams.get("error");
        if (oauthError) {
          response.writeHead(400, { "content-type": "text/plain; charset=utf-8" });
          response.end("Mailrith authorization was not completed. You can close this tab.");
          reject(new Error(`OAuth authorization failed: ${oauthError}.`));
          return;
        }
        if (!code || !safeEqual(state, params.expectedState)) {
          response.writeHead(400, { "content-type": "text/plain; charset=utf-8" });
          response.end("Invalid Mailrith authorization response.");
          reject(new Error("OAuth callback state or code is invalid."));
          return;
        }

        response.writeHead(200, {
          "content-security-policy": "default-src 'none'; frame-ancestors 'none'",
          "content-type": "text/plain; charset=utf-8",
          "referrer-policy": "no-referrer",
          "x-content-type-options": "nosniff",
          "x-frame-options": "DENY",
        });
        response.end("Mailrith authorization is complete. You can close this tab.");
        resolve(code);
      });

      server.once("error", reject);
      server.listen(params.port, "127.0.0.1");
      timeout = setTimeout(
        () => reject(new Error("OAuth login timed out after five minutes.")),
        oauthTimeoutMilliseconds,
      );
    });

    params.writeLine(`Open this Mailrith authorization URL:\n${params.authorizationUrl}`);
    if (!params.noBrowser) {
      try {
        openBrowser(params.authorizationUrl);
      } catch {
        params.writeLine("The browser could not be opened automatically. Use the URL above.");
      }
    }

    return await codePromise;
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
    await new Promise<void>((resolve) => {
      if (!server?.listening) {
        resolve();
        return;
      }
      server.close(() => resolve());
    });
  }
};

const discoverOAuth = async (baseUrl: string, fetchImpl: typeof fetch) =>
  parseJsonResponse<OAuthMetadata>(
    await fetchImpl(`${baseUrl}/.well-known/oauth-authorization-server`, {
      headers: { accept: "application/json" },
    }),
    "OAuth discovery",
  );

const registerCli = async (params: {
  metadata: OAuthMetadata;
  redirectUri: string;
  scopes: string[];
  fetchImpl: typeof fetch;
}) =>
  parseJsonResponse<OAuthRegistration>(
    await params.fetchImpl(params.metadata.registration_endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        client_name: "Mailrith CLI",
        redirect_uris: [params.redirectUri],
        token_endpoint_auth_method: "none",
        grant_types: ["authorization_code", "refresh_token"],
        response_types: ["code"],
        scope: params.scopes.join(" "),
      }),
    }),
    "OAuth client registration",
  );

export const loginWithOAuth = async (options: OAuthLoginOptions) => {
  const baseUrl = normalizeBaseUrl(options.baseUrl);
  const fetchImpl = options.fetch ?? fetch;
  const port = options.port ?? defaultOAuthPort;
  if (!Number.isInteger(port) || port < 1024 || port > 65535) {
    throw new Error("OAuth callback port must be between 1024 and 65535.");
  }
  const scopes = Array.from(new Set(options.scopes.map((scope) => scope.trim()).filter(Boolean)));
  if (scopes.length === 0 || scopes.length > 50) {
    throw new Error("OAuth login requires between 1 and 50 scopes.");
  }

  const metadata = await discoverOAuth(baseUrl, fetchImpl);
  assertSameSecureOrigin(baseUrl, metadata);
  const redirectUri = `http://127.0.0.1:${port}/callback`;
  const existingConfig = await readMailrithCliConfig(options.configPath);
  const existingOAuthCredential =
    existingConfig?.credential.kind === "oauth" ? existingConfig.credential : null;
  const registration =
    existingOAuthCredential &&
    existingConfig?.baseUrl === baseUrl &&
    existingOAuthCredential.redirectUri === redirectUri &&
    scopes.every((scope) => existingOAuthCredential.scopes.includes(scope))
      ? { client_id: existingOAuthCredential.clientId }
      : await registerCli({ metadata, redirectUri, scopes, fetchImpl });

  const { verifier, challenge } = createPkce();
  const state = randomBytes(32).toString("base64url");
  const resource = `${baseUrl}/v1`;
  const authorizationUrl = new URL(metadata.authorization_endpoint);
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("client_id", registration.client_id);
  authorizationUrl.searchParams.set("redirect_uri", redirectUri);
  authorizationUrl.searchParams.set("scope", scopes.join(" "));
  authorizationUrl.searchParams.set("resource", resource);
  authorizationUrl.searchParams.set("code_challenge", challenge);
  authorizationUrl.searchParams.set("code_challenge_method", "S256");
  authorizationUrl.searchParams.set("state", state);

  const code = await waitForAuthorizationCode({
    port,
    expectedState: state,
    authorizationUrl: authorizationUrl.toString(),
    noBrowser: options.noBrowser ?? false,
    writeLine: options.writeLine ?? console.log,
  });

  const tokenBody = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: registration.client_id,
    code,
    code_verifier: verifier,
    redirect_uri: redirectUri,
    resource,
  });
  const token = await parseJsonResponse<OAuthTokenResponse>(
    await fetchImpl(metadata.token_endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/x-www-form-urlencoded",
      },
      body: tokenBody,
    }),
    "OAuth token exchange",
  );
  if (!token.access_token || !token.refresh_token || !Number.isFinite(token.expires_in)) {
    throw new Error("OAuth token exchange returned an incomplete token response.");
  }

  const config: MailrithCliConfig = {
    version: 1,
    baseUrl,
    credential: {
      kind: "oauth",
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      expiresAt: new Date(Date.now() + token.expires_in * 1000).toISOString(),
      clientId: registration.client_id,
      tokenEndpoint: metadata.token_endpoint,
      resource,
      redirectUri,
      scopes,
    },
  };
  await writeMailrithCliConfig(config, options.configPath);
  return { baseUrl, scopes };
};

const refreshOAuthCredential = async (
  config: MailrithCliConfig & { credential: StoredOAuthCredential },
  fetchImpl: typeof fetch,
  configPath: string,
) => {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: config.credential.clientId,
    refresh_token: config.credential.refreshToken,
    resource: config.credential.resource,
  });
  const token = await parseJsonResponse<OAuthTokenResponse>(
    await fetchImpl(config.credential.tokenEndpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/x-www-form-urlencoded",
      },
      body,
    }),
    "OAuth token refresh",
  );
  if (!token.access_token || !Number.isFinite(token.expires_in)) {
    throw new Error("OAuth token refresh returned an incomplete token response.");
  }

  const refreshed: MailrithCliConfig = {
    ...config,
    credential: {
      ...config.credential,
      accessToken: token.access_token,
      refreshToken: token.refresh_token ?? config.credential.refreshToken,
      expiresAt: new Date(Date.now() + token.expires_in * 1000).toISOString(),
    },
  };
  await writeMailrithCliConfig(refreshed, configPath);
  return token.access_token;
};

export const resolveBearerCredential = async (params: {
  fetch?: typeof fetch;
  environment?: NodeJS.ProcessEnv;
}) => {
  const environment = params.environment ?? process.env;
  const configPath = resolveMailrithConfigPath(environment);
  const environmentToken =
    environment.MAILRITH_ACCESS_TOKEN?.trim() ||
    environment.MAILRITH_API_KEY?.trim();
  if (environmentToken) {
    return {
      token: environmentToken,
      baseUrl: normalizeBaseUrl(environment.MAILRITH_API_BASE_URL),
      source: "environment" as const,
    };
  }

  const config = await readMailrithCliConfig(configPath);
  if (!config) {
    throw new Error("No Mailrith credential is configured. Run `mailrith auth login` or set MAILRITH_API_KEY.");
  }
  if (config.credential.kind === "api_key") {
    return { token: config.credential.token, baseUrl: config.baseUrl, source: "config" as const };
  }

  const expiresAt = new Date(config.credential.expiresAt).getTime();
  const token =
    Number.isFinite(expiresAt) && expiresAt > Date.now() + 30_000
      ? config.credential.accessToken
      : await refreshOAuthCredential(
          config as MailrithCliConfig & { credential: StoredOAuthCredential },
          params.fetch ?? fetch,
          configPath,
        );
  return { token, baseUrl: config.baseUrl, source: "config" as const };
};
