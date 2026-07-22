import {
  generatedMailrithSdkContractVersion,
  generatedMailrithSdkResources,
} from "./generated.js";

type GeneratedMailrithSdkResource = (typeof generatedMailrithSdkResources)[number];
type GeneratedMailrithSdkOperation = GeneratedMailrithSdkResource["operations"][number];

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
  onResponse?: (metadata: MailrithResponseMetadata) => void;
};

export type MailrithResponseMetadata = {
  operationId: string;
  requestId: string;
  status: number;
};

export class MailrithApiError extends Error {
  readonly status: number;

  readonly type?: string;

  readonly code?: string;

  readonly responseBody: unknown;

  readonly requestId?: string;

  constructor(params: {
    status: number;
    message: string;
    type?: string;
    code?: string;
    responseBody: unknown;
    requestId?: string;
  }) {
    super(params.message);
    this.name = "MailrithApiError";
    this.status = params.status;
    this.type = params.type;
    this.code = params.code;
    this.responseBody = params.responseBody;
    this.requestId = params.requestId;
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

const normalizeBaseUrl = (value: string | undefined) => (value ?? "https://api.mailrith.com").replace(
  /\/+$/,
  "",
);

const encodePath = (pathname: string, pathParams?: Record<string, string | number>) =>
  pathname.replace(/\{([^}]+)\}/g, (_segment, key: string) => {
    const value = pathParams?.[key];
    if (value === undefined || value === null || value === "") {
      throw new Error(`Missing required path parameter: ${key}.`);
    }
    return encodeURIComponent(String(value));
  });

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

export class MailrithClientBase {
  readonly baseUrl: string;

  readonly apiKey?: string;

  readonly operations = generatedMailrithSdkResources;

  private readonly fetchImpl: typeof fetch;

  private readonly defaultHeaders: Record<string, string>;

  private readonly onResponse?: (metadata: MailrithResponseMetadata) => void;

  constructor(options: MailrithClientOptions = {}) {
    this.baseUrl = normalizeBaseUrl(options.baseUrl);
    this.apiKey = options.apiKey;
    this.fetchImpl = options.fetch ?? fetch;
    this.defaultHeaders = options.defaultHeaders ?? {};
    this.onResponse = options.onResponse;
  }

  withApiKey(apiKey: string) {
    return createMailrithClient({
      baseUrl: this.baseUrl,
      apiKey,
      fetch: this.fetchImpl,
      defaultHeaders: this.defaultHeaders,
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
    if (operation.authRequired && !apiKey) {
      throw new Error(
        `Mailrith operation ${operation.operationId} requires a bearer credential. Pass apiKey or an OAuth access token to the client or the individual request.`,
      );
    }

    const url = new URL(encodePath(operation.path, request.path), `${this.baseUrl}/`);
    appendQuery(url, request.query);

    const headers = new Headers(this.defaultHeaders);
    headers.set("accept", jsonContentType);
    if (!headers.has(mailrithClientHeader)) {
      headers.set(mailrithClientHeader, "typescript_sdk/dev");
    }
    if (!headers.has(mailrithRequestIdHeader)) {
      headers.set(mailrithRequestIdHeader, `req_${crypto.randomUUID()}`);
    }

    if (request.body !== undefined) {
      headers.set("content-type", jsonContentType);
    }
    if (request.idempotencyKey) {
      headers.set("idempotency-key", request.idempotencyKey);
    }
    if (apiKey) {
      headers.set("authorization", `Bearer ${apiKey}`);
    }
    for (const [key, value] of Object.entries(request.headers ?? {})) {
      headers.set(key, value);
    }

    const outgoingRequestId = headers.get(mailrithRequestIdHeader) ?? "unknown";

    const response = await this.fetchImpl(url, {
      method: operation.method,
      headers,
      body: request.body === undefined ? undefined : serializeBody(request.body),
      signal: request.signal,
    });

    const requestId =
      response.headers.get(mailrithRequestIdHeader) ?? outgoingRequestId;
    this.onResponse?.({
      operationId: operation.operationId,
      requestId,
      status: response.status,
    });

    const responseBody = await parseResponseBody(response);
    if (!response.ok) {
      const errorBody =
        responseBody &&
        typeof responseBody === "object" &&
        "error" in responseBody &&
        typeof responseBody.error === "object" &&
        responseBody.error
          ? (responseBody.error as { message?: string; type?: string; code?: string })
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
      });
    }

    return responseBody as TResult;
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
