import { chmod, mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";

const configMaxBytes = 16 * 1024;

export type StoredApiKeyCredential = {
  kind: "api_key";
  token: string;
};

export type StoredOAuthCredential = {
  kind: "oauth";
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  clientId: string;
  tokenEndpoint: string;
  resource: string;
  redirectUri: string;
  scopes: string[];
};

export type MailrithCliConfig = {
  version: 1;
  baseUrl: string;
  credential: StoredApiKeyCredential | StoredOAuthCredential;
};

export const resolveMailrithConfigPath = (environment = process.env) => {
  const explicitPath = environment.MAILRITH_CONFIG_FILE?.trim();
  if (explicitPath) {
    return path.resolve(explicitPath);
  }

  const configRoot =
    environment.XDG_CONFIG_HOME?.trim() || path.join(homedir(), ".config");
  return path.join(configRoot, "mailrith", "config.json");
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const parseConfig = (value: unknown): MailrithCliConfig | null => {
  if (!value || typeof value !== "object") {
    return null;
  }
  const candidate = value as Record<string, unknown>;
  if (
    candidate.version !== 1 ||
    !isNonEmptyString(candidate.baseUrl) ||
    !candidate.credential ||
    typeof candidate.credential !== "object"
  ) {
    return null;
  }

  const credential = candidate.credential as Record<string, unknown>;
  if (credential.kind === "api_key" && isNonEmptyString(credential.token)) {
    return {
      version: 1,
      baseUrl: candidate.baseUrl,
      credential: { kind: "api_key", token: credential.token },
    };
  }

  if (
    credential.kind === "oauth" &&
    isNonEmptyString(credential.accessToken) &&
    isNonEmptyString(credential.refreshToken) &&
    isNonEmptyString(credential.expiresAt) &&
    isNonEmptyString(credential.clientId) &&
    isNonEmptyString(credential.tokenEndpoint) &&
    isNonEmptyString(credential.resource) &&
    isNonEmptyString(credential.redirectUri) &&
    Array.isArray(credential.scopes) &&
    credential.scopes.length > 0 &&
    credential.scopes.length <= 50 &&
    credential.scopes.every(isNonEmptyString)
  ) {
    return {
      version: 1,
      baseUrl: candidate.baseUrl,
      credential: {
        kind: "oauth",
        accessToken: credential.accessToken,
        refreshToken: credential.refreshToken,
        expiresAt: credential.expiresAt,
        clientId: credential.clientId,
        tokenEndpoint: credential.tokenEndpoint,
        resource: credential.resource,
        redirectUri: credential.redirectUri,
        scopes: credential.scopes,
      },
    };
  }

  return null;
};

export const readMailrithCliConfig = async (
  configPath = resolveMailrithConfigPath(),
) => {
  try {
    const source = await readFile(configPath, "utf8");
    if (Buffer.byteLength(source, "utf8") > configMaxBytes) {
      throw new Error("Mailrith CLI configuration exceeds the 16 KiB limit.");
    }
    const parsed = parseConfig(JSON.parse(source) as unknown);
    if (!parsed) {
      throw new Error("Mailrith CLI configuration is invalid.");
    }
    return parsed;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw error;
  }
};

export const writeMailrithCliConfig = async (
  config: MailrithCliConfig,
  configPath = resolveMailrithConfigPath(),
) => {
  const source = `${JSON.stringify(config, null, 2)}\n`;
  if (Buffer.byteLength(source, "utf8") > configMaxBytes) {
    throw new Error("Mailrith CLI configuration exceeds the 16 KiB limit.");
  }

  const directory = path.dirname(configPath);
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const temporaryPath = `${configPath}.${process.pid}.${crypto.randomUUID()}.tmp`;

  try {
    await writeFile(temporaryPath, source, {
      encoding: "utf8",
      flag: "wx",
      mode: 0o600,
    });
    await rename(temporaryPath, configPath);
    await chmod(configPath, 0o600);
  } catch (error) {
    await unlink(temporaryPath).catch(() => undefined);
    throw error;
  }
};

export const removeMailrithCliConfig = async (
  configPath = resolveMailrithConfigPath(),
) => {
  await unlink(configPath).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== "ENOENT") {
      throw error;
    }
  });
};
