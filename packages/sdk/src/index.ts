import {
  generatedMailrithAgentReadQuickstartScopeKeys,
  generatedMailrithDefaultWorkProfileKey,
  generatedMailrithSdkContractVersion,
  generatedMailrithSdkResources,
  generatedMailrithWorkProfiles,
} from "./generated.js";

export {
  createMailrithOperationDiscovery,
  getMailrithOperationCategory,
  mailrithOperationDiscovery,
  type MailrithDiscoverableOperation,
  type MailrithOperationCategory,
  type MailrithOperationSearchMatch,
  type MailrithOperationSearchParams,
  type MailrithOperationSearchSelection,
} from "./operation-discovery.js";

type GeneratedMailrithSdkResource = (typeof generatedMailrithSdkResources)[number];
type GeneratedMailrithSdkOperation = GeneratedMailrithSdkResource["operations"][number];

const generatedMailrithScopeKeys = Array.from(
  new Set([
    ...generatedMailrithWorkProfiles.flatMap((profile) => profile.scopeKeys),
    ...generatedMailrithSdkResources.flatMap((resource) =>
      resource.operations.flatMap((operation) => operation.requiredScopes),
    ),
  ]),
);
const generatedMailrithScopeByKey = new Map<string, string>(
  generatedMailrithScopeKeys.map((scope) => [scope, scope]),
);

const selectGeneratedScopes = (value: unknown) => {
  if (!Array.isArray(value)) return [];
  const selectedScopes: string[] = [];
  for (const candidate of value) {
    if (typeof candidate !== "string") continue;
    const scope = generatedMailrithScopeByKey.get(candidate);
    if (scope && !selectedScopes.includes(scope)) selectedScopes.push(scope);
    if (selectedScopes.length === 50) break;
  }
  return selectedScopes;
};

export type MailrithSdkOperationDescriptor = GeneratedMailrithSdkOperation;
export type MailrithSdkResourceDescriptor = GeneratedMailrithSdkResource;

export type MailrithSdkNamespace = GeneratedMailrithSdkResource["namespace"];
export type MailrithSdkOperationName<N extends MailrithSdkNamespace> = Extract<
  GeneratedMailrithSdkResource,
  { namespace: N }
>["operations"][number]["methodName"];

export type MailrithQueryPrimitive = string | number | boolean | null | undefined;
export type MailrithQueryValue = MailrithQueryPrimitive | MailrithQueryPrimitive[];

export type MailrithOperationRequest = {
  path?: Record<string, string | number>;
  query?: Record<string, MailrithQueryValue>;
  body?: unknown;
  headers?: Record<string, string>;
  idempotencyKey?: string;
  apiKey?: string;
  signal?: AbortSignal;
};

export type MailrithClientOptions = {
  baseUrl?: string;
  apiKey?: string;
  fetch?: typeof fetch;
  defaultHeaders?: Record<string, string>;
  idempotentRetryMaxAttempts?: number;
  idempotentRetryDelayMs?: number;
  onResponse?: (metadata: MailrithResponseMetadata) => void;
};

export type MailrithResponseMetadata = {
  operationId: string;
  requestId: string;
  status: number;
};

export type MailrithCredentialRecovery = {
  credentialType: "workspace_api_key" | "oauth_access_token";
  action: "replace_api_key" | "reconnect_oauth";
  message: string;
  missingScopes: string[];
  replacementScopes: string[];
  accessUpdateUrl?: string;
  permissionsHelpUrl?: string;
};

const parseCredentialRecovery = (
  responseBody: unknown,
): MailrithCredentialRecovery | null => {
  if (
    !responseBody ||
    typeof responseBody !== "object" ||
    Array.isArray(responseBody) ||
    !("error" in responseBody)
  ) {
    return null;
  }
  const error = responseBody.error;
  if (!error || typeof error !== "object" || Array.isArray(error)) {
    return null;
  }
  const value = error as Record<string, unknown>;
  const recovery =
    value.recovery &&
    typeof value.recovery === "object" &&
    !Array.isArray(value.recovery)
      ? (value.recovery as Record<string, unknown>)
      : null;
  if (
    (value.credential_type !== "workspace_api_key" &&
      value.credential_type !== "oauth_access_token") ||
    !recovery ||
    (recovery.action !== "replace_api_key" &&
      recovery.action !== "reconnect_oauth") ||
    typeof recovery.message !== "string"
  ) {
    return null;
  }
  const credentialType =
    value.credential_type === "workspace_api_key"
      ? "workspace_api_key"
      : "oauth_access_token";
  const action =
    recovery.action === "replace_api_key" ? "replace_api_key" : "reconnect_oauth";
  return {
    credentialType,
    action,
    message: recovery.message,
    missingScopes: selectGeneratedScopes(value.missing_scopes),
    replacementScopes: selectGeneratedScopes(
      Array.isArray(recovery.replacement_scopes)
        ? recovery.replacement_scopes
        : value.replacement_scopes,
    ),
    ...(typeof recovery.access_update_url === "string"
      ? { accessUpdateUrl: recovery.access_update_url }
      : {}),
    ...(typeof recovery.permissions_help_url === "string"
      ? { permissionsHelpUrl: recovery.permissions_help_url }
      : {}),
  };
};

export class MailrithApiError extends Error {
  readonly status: number;

  readonly type?: string;

  readonly code?: string;

  readonly responseBody: unknown;

  readonly requestId?: string;

  readonly clientRequestId: string;

  readonly credentialRecovery: MailrithCredentialRecovery | null;

  constructor(params: {
    status: number;
    message: string;
    type?: string;
    code?: string;
    responseBody: unknown;
    requestId?: string;
    clientRequestId?: string;
  }) {
    super(params.message);
    this.name = "MailrithApiError";
    this.status = params.status;
    this.type = params.type;
    this.code = params.code;
    this.responseBody = params.responseBody;
    this.requestId = params.requestId;
    this.clientRequestId = params.clientRequestId ?? `req_${crypto.randomUUID()}`;
    this.credentialRecovery = parseCredentialRecovery(params.responseBody);
  }
}

type MailrithOperationInvoker = <TResult = unknown>(
  request?: MailrithOperationRequest,
) => Promise<TResult>;

type MailrithNamespaceApi<N extends MailrithSdkNamespace> = {
  [O in MailrithSdkOperationName<N>]: MailrithOperationInvoker;
};

export type MailrithClient = MailrithClientBase & {
  [N in MailrithSdkNamespace]: MailrithNamespaceApi<N>;
};

const jsonContentType = "application/json";
const mailrithClientHeader = "x-mailrith-client";
const mailrithRequestIdHeader = "x-mailrith-request-id";

const normalizeBaseUrl = (value: string | undefined) => {
  const candidate = value ?? "https://api.mailrith.com";
  let end = candidate.length;
  while (end > 0 && candidate.charCodeAt(end - 1) === 47) {
    end -= 1;
  }
  return candidate.slice(0, end);
};

const encodePath = (
  pathname: string,
  pathParams?: Record<string, string | number>,
) => {
  let encoded = "";
  let cursor = 0;
  while (cursor < pathname.length) {
    const openingBrace = pathname.indexOf("{", cursor);
    if (openingBrace === -1) {
      encoded += pathname.slice(cursor);
      break;
    }
    const closingBrace = pathname.indexOf("}", openingBrace + 1);
    if (closingBrace === -1) {
      encoded += pathname.slice(cursor);
      break;
    }

    encoded += pathname.slice(cursor, openingBrace);
    const key = pathname.slice(openingBrace + 1, closingBrace);
    const value = pathParams?.[key];
    if (value === undefined || value === null || value === "") {
      throw new Error(`Missing required path parameter: ${key}.`);
    }
    encoded += encodeURIComponent(String(value));
    cursor = closingBrace + 1;
  }
  return encoded;
};

const appendQuery = (url: URL, query?: Record<string, MailrithQueryValue>) => {
  if (!query) {
    return;
  }

  for (const [key, value] of Object.entries(query)) {
    if (value == null) {
      continue;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item != null) {
          url.searchParams.append(key, String(item));
        }
      }
      continue;
    }
    url.searchParams.set(key, String(value));
  }
};

const serializeBody = (body: unknown) =>
  typeof body === "string" ? body : JSON.stringify(body);

const isJsonResponse = (response: Response) =>
  response.headers.get("content-type")?.includes(jsonContentType) ?? false;

const parseResponseBody = async (response: Response) => {
  if (response.status === 204) {
    return null;
  }
  if (isJsonResponse(response)) {
    return response.json();
  }
  const text = await response.text();
  return text.length > 0 ? text : null;
};

const isIdempotencyInProgressResponse = (
  response: Response,
  responseBody: unknown,
) => {
  if (
    response.status !== 409 ||
    !responseBody ||
    typeof responseBody !== "object" ||
    Array.isArray(responseBody) ||
    !("error" in responseBody)
  ) {
    return false;
  }
  const errorBody = responseBody.error;
  if (!errorBody || typeof errorBody !== "object" || Array.isArray(errorBody)) {
    return false;
  }
  return (
    "code" in errorBody &&
    errorBody.code === "idempotency_key_in_progress"
  );
};

const waitForRetry = (delayMs: number, signal?: AbortSignal) => {
  if (signal?.aborted) {
    return Promise.reject(signal.reason ?? new DOMException("Aborted", "AbortError"));
  }
  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      cleanup();
      resolve();
    }, delayMs);
    const handleAbort = () => {
      clearTimeout(timeout);
      cleanup();
      reject(signal?.reason ?? new DOMException("Aborted", "AbortError"));
    };
    const cleanup = () => signal?.removeEventListener("abort", handleAbort);
    signal?.addEventListener("abort", handleAbort, { once: true });
  });
};

export class MailrithClientBase {
  readonly baseUrl: string;

  readonly apiKey?: string;

  readonly operations = generatedMailrithSdkResources;

  private readonly fetchImpl: typeof fetch;

  private readonly defaultHeaders: Record<string, string>;

  private readonly idempotentRetryMaxAttempts: number;

  private readonly idempotentRetryDelayMs: number;

  private readonly onResponse?: (metadata: MailrithResponseMetadata) => void;

  constructor(options: MailrithClientOptions = {}) {
    this.baseUrl = normalizeBaseUrl(options.baseUrl);
    this.apiKey = options.apiKey;
    this.fetchImpl = options.fetch ?? fetch;
    this.defaultHeaders = options.defaultHeaders ?? {};
    this.idempotentRetryMaxAttempts = Math.max(
      1,
      Math.min(Math.floor(options.idempotentRetryMaxAttempts ?? 3), 5),
    );
    this.idempotentRetryDelayMs = Math.max(
      0,
      Math.min(Math.floor(options.idempotentRetryDelayMs ?? 250), 5_000),
    );
    this.onResponse = options.onResponse;
  }

  withApiKey(apiKey: string) {
    return createMailrithClient({
      baseUrl: this.baseUrl,
      apiKey,
      fetch: this.fetchImpl,
      defaultHeaders: this.defaultHeaders,
      idempotentRetryMaxAttempts: this.idempotentRetryMaxAttempts,
      idempotentRetryDelayMs: this.idempotentRetryDelayMs,
      onResponse: this.onResponse,
    });
  }

  getOperation<N extends MailrithSdkNamespace, O extends MailrithSdkOperationName<N>>(
    namespace: N,
    methodName: O,
  ) {
    const resource = generatedMailrithSdkResources.find((candidate) => candidate.namespace === namespace);
    return resource?.operations.find((candidate) => candidate.methodName === methodName) ?? null;
  }

  async request<TResult = unknown>(
    operation: GeneratedMailrithSdkOperation,
    request: MailrithOperationRequest = {},
  ): Promise<TResult> {
    const apiKey = request.apiKey ?? this.apiKey;
    const clientRequestId = `req_${crypto.randomUUID()}`;
    if (operation.authRequired && !apiKey) {
      throw new Error(
        `Mailrith operation ${operation.operationId} requires a bearer credential. Pass apiKey or an OAuth access token to the client or the individual request.`,
      );
    }

    const url = new URL(encodePath(operation.path, request.path), `${this.baseUrl}/`);
    appendQuery(url, request.query);

    const headers = new Headers(this.defaultHeaders);
    headers.set("accept", jsonContentType);
    if (request.body !== undefined) {
      headers.set("content-type", jsonContentType);
    }
    if (request.idempotencyKey) {
      headers.set("idempotency-key", request.idempotencyKey);
    } else if (operation.retryMode === "idempotency-key") {
      headers.set("idempotency-key", `op_${crypto.randomUUID()}`);
    }
    for (const [key, value] of Object.entries(request.headers ?? {})) {
      headers.set(key, value);
    }
    if (!headers.has(mailrithClientHeader)) {
      headers.set(mailrithClientHeader, "typescript_sdk/dev");
    }
    headers.set(mailrithRequestIdHeader, clientRequestId);
    if (apiKey) {
      headers.set("authorization", `Bearer ${apiKey}`);
    }

    const serializedBody =
      request.body === undefined ? undefined : serializeBody(request.body);
    const canRetry =
      operation.retryMode === "safe" ||
      (operation.retryMode === "idempotency-key" &&
        Boolean(headers.get("idempotency-key")));

    for (
      let attempt = 1;
      attempt <= this.idempotentRetryMaxAttempts;
      attempt += 1
    ) {
      let response: Response;
      try {
        response = await this.fetchImpl(url, {
          method: operation.method,
          headers,
          body: serializedBody,
          signal: request.signal,
        });
      } catch (error) {
        if (
          !canRetry ||
          attempt >= this.idempotentRetryMaxAttempts ||
          !(error instanceof TypeError) ||
          request.signal?.aborted
        ) {
          throw error;
        }
        await waitForRetry(this.idempotentRetryDelayMs * attempt, request.signal);
        continue;
      }

      const requestId =
        response.headers.get(mailrithRequestIdHeader) ?? clientRequestId;
      this.onResponse?.({
        operationId: operation.operationId,
        requestId,
        status: response.status,
      });

      let responseBody: unknown;
      try {
        responseBody = await parseResponseBody(response);
      } catch (error) {
        if (
          !response.ok ||
          !canRetry ||
          attempt >= this.idempotentRetryMaxAttempts ||
          request.signal?.aborted
        ) {
          throw error;
        }
        await waitForRetry(this.idempotentRetryDelayMs * attempt, request.signal);
        continue;
      }
      if (
        canRetry &&
        attempt < this.idempotentRetryMaxAttempts &&
        isIdempotencyInProgressResponse(response, responseBody)
      ) {
        await waitForRetry(this.idempotentRetryDelayMs * attempt, request.signal);
        continue;
      }
      if (!response.ok) {
        const errorBody =
          responseBody &&
          typeof responseBody === "object" &&
          "error" in responseBody &&
          typeof responseBody.error === "object" &&
          responseBody.error
            ? (responseBody.error as {
                message?: string;
                type?: string;
                code?: string;
              })
            : null;

        throw new MailrithApiError({
          status: response.status,
          message:
            errorBody?.message ??
            `Mailrith request failed with status ${response.status}.`,
          type: errorBody?.type,
          code: errorBody?.code,
          responseBody,
          requestId,
          clientRequestId,
        });
      }

      return responseBody as TResult;
    }

    throw new Error("Mailrith request could not be completed.");
  }
}

const createNamespace = (
  client: MailrithClientBase,
  resource: GeneratedMailrithSdkResource,
) =>
  Object.fromEntries(
    resource.operations.map((operation) => [
      operation.methodName,
      <TResult = unknown>(request?: MailrithOperationRequest) =>
        client.request<TResult>(operation, request),
    ]),
  );

export const mailrithSdkResources = generatedMailrithSdkResources;
export const mailrithSdkContractVersion = generatedMailrithSdkContractVersion;
export const mailrithAgentReadQuickstartScopeKeys =
  generatedMailrithAgentReadQuickstartScopeKeys;
export const mailrithWorkProfiles = generatedMailrithWorkProfiles;
export const mailrithDefaultWorkProfileKey =
  generatedMailrithDefaultWorkProfileKey;

export const createMailrithClient = (
  options: MailrithClientOptions = {},
): MailrithClient => {
  const client = new MailrithClientBase(options) as MailrithClient;

  for (const resource of generatedMailrithSdkResources) {
    Object.defineProperty(client, resource.namespace, {
      enumerable: true,
      configurable: false,
      writable: false,
      value: createNamespace(client, resource),
    });
  }

  return client;
};
