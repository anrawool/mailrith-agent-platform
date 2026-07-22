import { createReadStream } from "node:fs";
import { stdin as processStdin } from "node:process";
import {
  MailrithApiError,
  createMailrithClient,
  mailrithSdkResources,
  type MailrithOperationRequest,
  type MailrithResponseMetadata,
  type MailrithSdkOperationDescriptor,
} from "@mailrith/sdk";
import { loginWithOAuth, resolveBearerCredential } from "./auth.js";
import {
  removeMailrithCliConfig,
  resolveMailrithConfigPath,
  writeMailrithCliConfig,
} from "./config.js";

export const mailrithCliVersion = "0.1.0-beta.1";

const inputMaxBytes = 1024 * 1024;
const diagnosticResponseMaxBytes = 128 * 1024;
const defaultMaxPages = 10;
const absoluteMaxPages = 100;
const secretFieldPattern = /(?:^|_)(?:access_?token|refresh_?token|approval_?token|authorization|api_?key|client_?secret|password|secret)(?:$|_)/i;
const booleanFlags = new Set([
  "all",
  "help",
  "json",
  "no-browser",
  "show-version",
  "yes",
]);

export const mailrithCliExitCodes = {
  success: 0,
  usage: 2,
  authentication: 3,
  permission: 4,
  notFound: 5,
  conflict: 6,
  rateLimit: 7,
  transient: 8,
  uncertain: 9,
} as const;

type ParsedArguments = {
  positionals: string[];
  flags: Map<string, string | boolean | string[]>;
};

type CliDependencies = {
  environment?: NodeJS.ProcessEnv;
  fetch?: typeof fetch;
  stdout?: (line: string) => void;
  stderr?: (line: string) => void;
};

export class MailrithCliError extends Error {
  readonly code: string;

  readonly exitCode: number;

  readonly details?: unknown;

  constructor(params: {
    message: string;
    code: string;
    exitCode: number;
    details?: unknown;
  }) {
    super(params.message);
    this.name = "MailrithCliError";
    this.code = params.code;
    this.exitCode = params.exitCode;
    this.details = params.details;
  }
}

const usageError = (message: string, details?: unknown) =>
  new MailrithCliError({
    message,
    code: "invalid_usage",
    exitCode: mailrithCliExitCodes.usage,
    details,
  });

const parseArguments = (argv: string[]): ParsedArguments => {
  const positionals: string[] = [];
  const flags = new Map<string, string | boolean | string[]>();

  const addFlag = (key: string, value: string | boolean) => {
    const existing = flags.get(key);
    if (typeof value === "string" && typeof existing === "string") {
      flags.set(key, [existing, value]);
      return;
    }
    if (typeof value === "string" && Array.isArray(existing)) {
      flags.set(key, [...existing, value]);
      return;
    }
    flags.set(key, value);
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (!value?.startsWith("--")) {
      if (value) positionals.push(value);
      continue;
    }

    const equalsIndex = value.indexOf("=");
    if (equalsIndex > 2) {
      addFlag(value.slice(2, equalsIndex), value.slice(equalsIndex + 1));
      continue;
    }

    const key = value.slice(2);
    if (booleanFlags.has(key)) {
      addFlag(key, true);
      continue;
    }

    const nextValue = argv[index + 1];
    if (!nextValue || nextValue.startsWith("--")) {
      throw usageError(`--${key} requires a value.`);
    }
    addFlag(key, nextValue);
    index += 1;
  }

  return { positionals, flags };
};

const getStringFlag = (args: ParsedArguments, key: string) => {
  const value = args.flags.get(key);
  if (Array.isArray(value)) return value.at(-1);
  return typeof value === "string" ? value : undefined;
};

const getStringFlags = (args: ParsedArguments, key: string) => {
  const value = args.flags.get(key);
  if (Array.isArray(value)) return value;
  return typeof value === "string" ? [value] : [];
};

const hasFlag = (args: ParsedArguments, key: string) =>
  args.flags.get(key) === true;

const parseBoundedInteger = (
  value: string | undefined,
  params: { label: string; minimum: number; maximum: number; fallback: number },
) => {
  if (value === undefined) return params.fallback;
  const parsed = Number(value);
  if (
    !Number.isInteger(parsed) ||
    parsed < params.minimum ||
    parsed > params.maximum
  ) {
    throw usageError(
      `${params.label} must be between ${params.minimum} and ${params.maximum}.`,
    );
  }
  return parsed;
};

const parseKeyValueFlags = (values: string[], label: string) => {
  const output: Record<string, string | string[]> = {};
  for (const value of values) {
    const separator = value.indexOf("=");
    if (separator < 1) {
      throw usageError(`${label} values must use name=value.`);
    }
    const key = value.slice(0, separator).trim();
    const entry = value.slice(separator + 1);
    if (!key || key.length > 100 || entry.length > 4096) {
      throw usageError(`${label} contains an invalid or oversized value.`);
    }
    const current = output[key];
    output[key] =
      current === undefined
        ? entry
        : Array.isArray(current)
          ? [...current, entry]
          : [current, entry];
  }
  return output;
};

const readBoundedStream = async (stream: NodeJS.ReadableStream) => {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of stream) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > inputMaxBytes) {
      throw usageError("Input exceeds the 1 MiB CLI limit.");
    }
    chunks.push(buffer);
  }
  return Buffer.concat(chunks).toString("utf8");
};

const readBody = async (args: ParsedArguments) => {
  const bodyFile = getStringFlag(args, "body-file");
  if (!bodyFile) return undefined;
  const source = await readBoundedStream(
    bodyFile === "-" ? processStdin : createReadStream(bodyFile),
  );
  try {
    return JSON.parse(source) as unknown;
  } catch {
    throw usageError("--body-file must contain valid JSON.");
  }
};

const redactSecrets = (value: unknown, depth = 0): unknown => {
  if (depth > 20) return "[depth-limited]";
  if (Array.isArray(value)) {
    return value.slice(0, 10_000).map((entry) => redactSecrets(entry, depth + 1));
  }
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
      key,
      secretFieldPattern.test(key) ? "[redacted]" : redactSecrets(entry, depth + 1),
    ]),
  );
};

const getErrorExitCode = (error: unknown) => {
  if (error instanceof MailrithCliError) return error.exitCode;
  if (error instanceof MailrithApiError) {
    if (error.status === 401) return mailrithCliExitCodes.authentication;
    if (error.status === 403) return mailrithCliExitCodes.permission;
    if (error.status === 404) return mailrithCliExitCodes.notFound;
    if (error.status === 409) return mailrithCliExitCodes.conflict;
    if (error.status === 429) return mailrithCliExitCodes.rateLimit;
    if (error.status >= 500 || error.status === 408)
      return mailrithCliExitCodes.transient;
  }
  return mailrithCliExitCodes.transient;
};

const emit = (params: {
  args: ParsedArguments;
  stdout: (line: string) => void;
  payload: unknown;
  metadata?: MailrithResponseMetadata | null;
  event?: string;
}) => {
  const safePayload = redactSecrets(params.payload);
  if (hasFlag(params.args, "json")) {
    params.stdout(
      JSON.stringify({
        ok: true,
        event: params.event ?? "result",
        request_id: params.metadata?.requestId ?? null,
        status: params.metadata?.status ?? null,
        data: safePayload,
      }),
    );
    return;
  }
  if (params.metadata?.requestId) {
    params.stdout(`Request ID: ${params.metadata.requestId}`);
  }
  params.stdout(JSON.stringify(safePayload, null, 2));
};

const findOperation = (namespace: string, methodName: string) => {
  const resource = mailrithSdkResources.find(
    (candidate) => candidate.namespace === namespace,
  );
  const operation = resource?.operations.find(
    (candidate) => candidate.methodName === methodName,
  );
  if (!operation) {
    throw usageError(`Unknown SDK operation ${namespace}.${methodName}.`);
  }
  return operation as MailrithSdkOperationDescriptor;
};

const normalizeApiBaseUrl = (value: string) => {
  const url = new URL(value);
  const isLocal = url.hostname === "127.0.0.1" || url.hostname === "localhost";
  if (url.protocol !== "https:" && !(isLocal && url.protocol === "http:")) {
    throw usageError("Mailrith API URLs must use HTTPS or localhost HTTP.");
  }
  url.pathname = url.pathname.replace(/\/+$/, "");
  url.search = "";
  url.hash = "";
  return url.toString().replace(/\/$/, "");
};

const buildOperationRequest = async (
  args: ParsedArguments,
): Promise<MailrithOperationRequest> => ({
  path: parseKeyValueFlags(getStringFlags(args, "path"), "--path") as Record<
    string,
    string
  >,
  query: parseKeyValueFlags(getStringFlags(args, "query"), "--query"),
  body: await readBody(args),
  idempotencyKey: getStringFlag(args, "idempotency-key"),
});

const getNextCursor = (payload: unknown) => {
  if (!payload || typeof payload !== "object") return null;
  const pagination = (payload as Record<string, unknown>).pagination;
  if (!pagination || typeof pagination !== "object") return null;
  const candidate = pagination as Record<string, unknown>;
  return candidate.has_more === true && typeof candidate.next_cursor === "string"
    ? candidate.next_cursor
    : null;
};

const invokeOperation = async (params: {
  args: ParsedArguments;
  operation: MailrithSdkOperationDescriptor;
  request: MailrithOperationRequest;
  token?: string;
  baseUrl: string;
  fetchImpl: typeof fetch;
  stdout: (line: string) => void;
}) => {
  let metadata: MailrithResponseMetadata | null = null;
  const client = createMailrithClient({
    apiKey: params.token,
    baseUrl: params.baseUrl,
    fetch: params.fetchImpl,
    defaultHeaders: { "x-mailrith-client": `cli/${mailrithCliVersion}` },
    onResponse: (value) => {
      metadata = value;
    },
  });

  const maxPages = hasFlag(params.args, "all")
    ? parseBoundedInteger(getStringFlag(params.args, "max-pages"), {
        label: "--max-pages",
        minimum: 1,
        maximum: absoluteMaxPages,
        fallback: defaultMaxPages,
      })
    : 1;
  let request = params.request;
  for (let page = 1; page <= maxPages; page += 1) {
    const payload = await client.request(params.operation, request);
    emit({
      args: params.args,
      stdout: params.stdout,
      payload,
      metadata,
      event: maxPages > 1 ? "page" : "result",
    });
    const nextCursor = getNextCursor(payload);
    if (!nextCursor) return;
    if (page === maxPages) {
      throw usageError(
        `Pagination stopped at the configured ${maxPages}-page limit. Continue with --query starting_after=${nextCursor}.`,
      );
    }
    request = {
      ...request,
      query: {
        ...request.query,
        starting_after: nextCursor,
        cursor: nextCursor,
      },
    };
  }
};

const readBoundedJsonResponse = async (response: Response) => {
  const reader = response.body?.getReader();
  if (!reader) return null;
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const result = await reader.read();
    if (result.done) break;
    size += result.value.length;
    if (size > diagnosticResponseMaxBytes) {
      await reader.cancel();
      throw new Error("Diagnostic response exceeded 128 KiB.");
    }
    chunks.push(result.value);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
};

const runDoctor = async (params: {
  args: ParsedArguments;
  baseUrl: string;
  token?: string;
  fetchImpl: typeof fetch;
  stdout: (line: string) => void;
}) => {
  const endpoints = [
    { name: "api", url: `${params.baseUrl}/v1`, auth: false },
    {
      name: "oauth",
      url: `${params.baseUrl}/.well-known/oauth-authorization-server`,
      auth: false,
    },
    {
      name: "mcp",
      url: `${params.baseUrl}/.well-known/oauth-protected-resource/mcp`,
      auth: false,
    },
    {
      name: "capabilities",
      url: `${params.baseUrl}/v1/capabilities`,
      auth: true,
    },
  ];
  const results = [];
  for (const endpoint of endpoints) {
    if (endpoint.auth && !params.token) {
      results.push({ name: endpoint.name, status: "skipped", reason: "no_credential" });
      continue;
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);
    try {
      const response = await params.fetchImpl(endpoint.url, {
        headers: {
          accept: "application/json",
          ...(endpoint.auth && params.token
            ? { authorization: `Bearer ${params.token}` }
            : {}),
          "x-mailrith-client": `cli/${mailrithCliVersion}`,
        },
        signal: controller.signal,
      });
      const body = await readBoundedJsonResponse(response).catch(() => null);
      results.push({
        name: endpoint.name,
        status: response.ok ? "ok" : "failed",
        http_status: response.status,
        contract_version:
          body && typeof body === "object" && "version" in body
            ? (body as { version: unknown }).version
            : null,
      });
    } catch (error) {
      results.push({
        name: endpoint.name,
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      clearTimeout(timeout);
    }
  }
  emit({ args: params.args, stdout: params.stdout, payload: { checks: results } });
  if (results.some((result) => result.status === "failed")) {
    throw new MailrithCliError({
      message: "One or more Mailrith diagnostics failed.",
      code: "doctor_failed",
      exitCode: mailrithCliExitCodes.transient,
      details: results,
    });
  }
};

const helpText = `Mailrith CLI ${mailrithCliVersion}

Commands:
  auth login [--scope workspace:read] [--no-browser]
  auth set-key [--from-env MAILRITH_API_KEY]
  auth logout
  discovery
  capabilities
  subscribers sync --body-file <path|->
  campaigns draft --body-file <path|->
  preview <namespace> <method> [--path name=value] [--body-file <path|->]
  execute <namespace> <method> --action-id <id> --yes [request options]
  activity list [--all --max-pages 10] [--query name=value]
  activity show <activity-id>
  progress broadcast <broadcast-id>
  call <namespace> <method> [request options]
  doctor

Common options:
  --json                   Emit one structured JSON object per result or page.
  --path name=value        Set a path parameter. Repeat when needed.
  --query name=value       Set a query parameter. Repeat when needed.
  --body-file <path|->     Read at most 1 MiB of JSON from a file or stdin.
  --idempotency-key <key>  Preserve one key across safe retries.
  --all --max-pages <n>    Follow cursors for at most 100 pages.
`;

export const runMailrithCli = async (
  argv: string[],
  dependencies: CliDependencies = {},
) => {
  const stdout = dependencies.stdout ?? console.log;
  const stderr = dependencies.stderr ?? console.error;
  const environment = dependencies.environment ?? process.env;
  const fetchImpl = dependencies.fetch ?? fetch;
  let args: ParsedArguments = {
    positionals: [],
    flags: new Map(),
  };

  try {
    args = parseArguments(argv);
    if (
      args.positionals.length === 0 ||
      hasFlag(args, "help") ||
      args.positionals[0] === "help"
    ) {
      stdout(helpText);
      return mailrithCliExitCodes.success;
    }
    if (args.positionals[0] === "version" || hasFlag(args, "show-version")) {
      stdout(mailrithCliVersion);
      return mailrithCliExitCodes.success;
    }

    const [command, subcommand, third] = args.positionals;
    if (command === "auth") {
      if (subcommand === "set-key") {
        const environmentName = getStringFlag(args, "from-env") ?? "MAILRITH_API_KEY";
        const token = environment[environmentName]?.trim();
        if (!token) {
          throw usageError(`${environmentName} is empty. Set it before running auth set-key.`);
        }
        const baseUrl = normalizeApiBaseUrl(
          getStringFlag(args, "base-url") ??
            environment.MAILRITH_API_BASE_URL ??
            "https://api.mailrith.com",
        );
        await writeMailrithCliConfig(
          { version: 1, baseUrl, credential: { kind: "api_key", token } },
          resolveMailrithConfigPath(environment),
        );
        emit({ args, stdout, payload: { configured: true, kind: "api_key", base_url: baseUrl } });
        return mailrithCliExitCodes.success;
      }
      if (subcommand === "login") {
        const result = await loginWithOAuth({
          baseUrl: normalizeApiBaseUrl(
            getStringFlag(args, "base-url") ??
              environment.MAILRITH_API_BASE_URL ??
              "https://api.mailrith.com",
          ),
          scopes:
            getStringFlags(args, "scope").length > 0
              ? getStringFlags(args, "scope")
              : ["workspace:read"],
          noBrowser: hasFlag(args, "no-browser"),
          port: parseBoundedInteger(getStringFlag(args, "port"), {
            label: "--port",
            minimum: 1024,
            maximum: 65535,
            fallback: 53682,
          }),
          fetch: fetchImpl,
          writeLine: stdout,
          configPath: resolveMailrithConfigPath(environment),
        });
        emit({ args, stdout, payload: { configured: true, kind: "oauth", ...result } });
        return mailrithCliExitCodes.success;
      }
      if (subcommand === "logout") {
        await removeMailrithCliConfig(resolveMailrithConfigPath(environment));
        emit({ args, stdout, payload: { configured: false } });
        return mailrithCliExitCodes.success;
      }
      throw usageError("Use auth login, auth set-key, or auth logout.");
    }

    if (command === "discovery") {
      await invokeOperation({
        args,
        operation: findOperation("discovery", "getMetadata"),
        request: {},
        baseUrl: normalizeApiBaseUrl(
          getStringFlag(args, "base-url") ??
            environment.MAILRITH_API_BASE_URL ??
            "https://api.mailrith.com",
        ),
        fetchImpl,
        stdout,
      });
      return mailrithCliExitCodes.success;
    }

    let credential: Awaited<ReturnType<typeof resolveBearerCredential>> | null = null;
    try {
      credential = await resolveBearerCredential({ fetch: fetchImpl, environment });
    } catch (error) {
      if (command !== "doctor") throw error;
    }
    const baseUrl = normalizeApiBaseUrl(
      getStringFlag(args, "base-url") ??
        environment.MAILRITH_API_BASE_URL ??
        credential?.baseUrl ??
        "https://api.mailrith.com",
    );

    if (command === "doctor") {
      await runDoctor({ args, baseUrl, token: credential?.token, fetchImpl, stdout });
      return mailrithCliExitCodes.success;
    }
    if (!credential) {
      throw new MailrithCliError({
        message: "A Mailrith credential is required.",
        code: "credential_required",
        exitCode: mailrithCliExitCodes.authentication,
      });
    }

    let operation: MailrithSdkOperationDescriptor;
    let request: MailrithOperationRequest;
    if (command === "capabilities") {
      operation = findOperation("discovery", "getCapabilities");
      request = {};
    } else if (command === "subscribers" && subcommand === "sync") {
      operation = findOperation("subscribers", "upsert");
      request = await buildOperationRequest(args);
    } else if (command === "campaigns" && subcommand === "draft") {
      operation = findOperation("broadcasts", "create");
      request = await buildOperationRequest(args);
    } else if (command === "activity" && subcommand === "list") {
      operation = findOperation("agentActivity", "list");
      request = await buildOperationRequest(args);
    } else if (command === "activity" && subcommand === "show" && third) {
      operation = findOperation("agentActivity", "get");
      request = { path: { activity_id: third } };
    } else if (command === "progress" && subcommand === "broadcast" && third) {
      operation = findOperation("broadcasts", "getSendProgress");
      request = { path: { broadcast_id: third } };
    } else if (command === "call" && subcommand && third) {
      operation = findOperation(subcommand, third);
      request = await buildOperationRequest(args);
      if (operation.operationId === "issueAgentApprovalToken") {
        throw usageError("Approval tokens are never printed. Use `mailrith execute` to claim and consume one in memory.");
      }
      if (operation.approvalPolicy === "required") {
        throw usageError("This operation requires a plan and approval. Use `mailrith preview`, then `mailrith execute`.");
      }
      if (
        ["execute", "bulk", "delete", "admin"].includes(operation.risk) &&
        !hasFlag(args, "yes")
      ) {
        throw usageError("High-impact CLI calls require --yes.");
      }
    } else if (command === "preview" && subcommand && third) {
      operation = findOperation(subcommand, third);
      if (operation.method === "GET") {
        throw usageError("Read operations do not need an action preview.");
      }
      request = await buildOperationRequest(args);
      request.query = { ...request.query, mode: "plan" };
    } else if (command === "execute" && subcommand && third) {
      operation = findOperation(subcommand, third);
      if (!hasFlag(args, "yes")) {
        throw usageError("Approved execution requires --yes.");
      }
      const actionId = getStringFlag(args, "action-id");
      if (!actionId) throw usageError("Approved execution requires --action-id.");
      request = await buildOperationRequest(args);

      let approvalToken = getStringFlag(args, "approval-token-env")
        ? environment[getStringFlag(args, "approval-token-env") as string]?.trim()
        : undefined;
      if (!approvalToken) {
        let approvalRequestId: string | undefined;
        const approvalClient = createMailrithClient({
          apiKey: credential.token,
          baseUrl,
          fetch: fetchImpl,
          defaultHeaders: { "x-mailrith-client": `cli/${mailrithCliVersion}` },
          onResponse: (value) => {
            approvalRequestId = value.requestId;
          },
        });
        const approvalResponse = (await approvalClient.request(
          findOperation("agentActions", "issueApprovalToken"),
          { path: { action_id: actionId } },
        )) as { data?: { approval_token?: string } };
        approvalToken = approvalResponse.data?.approval_token;
        if (!approvalToken) {
          throw new MailrithCliError({
            message: "Mailrith did not issue an approval token.",
            code: "approval_token_missing",
            exitCode: mailrithCliExitCodes.permission,
            details: { request_id: approvalRequestId ?? null },
          });
        }
      }
      request.headers = {
        ...request.headers,
        "x-mailrith-action-id": actionId,
        "x-mailrith-approval-token": approvalToken,
      };
    } else {
      throw usageError("Unknown Mailrith CLI command. Run `mailrith help`.");
    }

    await invokeOperation({
      args,
      operation,
      request,
      token: credential.token,
      baseUrl,
      fetchImpl,
      stdout,
    });
    return mailrithCliExitCodes.success;
  } catch (error) {
    const exitCode = getErrorExitCode(error);
    const cliError = error instanceof MailrithCliError ? error : null;
    const apiError = error instanceof MailrithApiError ? error : null;
    const payload = {
      ok: false,
      error: {
        code: cliError?.code ?? apiError?.code ?? "cli_failure",
        message: error instanceof Error ? error.message : String(error),
        request_id: apiError?.requestId ?? null,
        details: redactSecrets(cliError?.details ?? apiError?.responseBody),
      },
    };
    if (args?.flags.get("json") === true) {
      stderr(JSON.stringify(payload));
    } else {
      stderr(`${payload.error.code}: ${payload.error.message}`);
      if (payload.error.request_id) stderr(`Request ID: ${payload.error.request_id}`);
    }
    return exitCode;
  }
};
