import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
  type Tool,
} from "@modelcontextprotocol/sdk/types.js";
import {
  publicApiAgentsPath,
  publicApiCapabilitiesPath,
  publicApiDefaultWorkProfileKey,
  publicApiDocsPath,
  publicApiMcpPath,
  publicApiMcpOAuthProtectedResourcePath,
  publicApiOpenApiPath,
  publicApiReferencePath,
  publicApiVersion,
  isPublicApiMcpToolsetKey,
  publicApiMcpToolsets,
  publicApiMcpToolsetKeys,
  publicApiReadScopeKeys,
  publicApiScopeKeys,
  publicApiSubmittedMcpOperationIds,
  publicApiSubmittedMcpProfile,
  resolvePublicApiMcpToolsets,
  type PublicApiMcpErrorCategory,
  type PublicApiMcpToolsetKey,
} from "@mailrith/public-api";
import {
  MailrithApiError,
  createMailrithOperationDiscovery,
  createMailrithClient,
  getMailrithOperationCategory,
  mailrithSdkResources,
  type MailrithClient,
  type MailrithOperationCategory,
  type MailrithQueryValue,
  type MailrithSdkOperationDescriptor,
} from "@mailrith/sdk";
import * as z from "zod/v4";
import { generatedMailrithMcpToolManifest } from "./generated-tool-manifest.js";
import { createLazyMcpSchemaCache } from "./lazy-schema-cache.js";

export { generatedMailrithMcpToolManifest };

const defaultBaseUrl = "https://api.mailrith.com";
const mcpRequestMaxBodyBytes = 1024 * 1024;
export const mailrithMcpMaxAnonymousBatchItems = 1;
export const mailrithMcpMaxAuthenticatedBatchItems = 25;
const mcpServerInfo = {
  name: "mailrith",
  version: "1.0.1",
} as const;

type MailrithFetch = typeof fetch;

export const mailrithMcpProfileKeys = [
  "submitted",
  "compact",
  "custom",
] as const;
export type MailrithMcpProfile =
  (typeof mailrithMcpProfileKeys)[number];

export type MailrithMcpServerOptions = {
  baseUrl?: string;
  apiKey?: string;
  fetch?: MailrithFetch;
  client?: MailrithClient;
  grantedScopes?: readonly string[];
  enabledToolsets?: readonly PublicApiMcpToolsetKey[];
  readOnly?: boolean;
  includeOutputSchemas?: boolean;
  capabilityContext?: MailrithMcpCapabilityContext;
  /**
   * `submitted` is the fixed public catalog used by listed platforms.
   * `compact` preserves the legacy seven routing tools.
   * `custom` exposes generated focused tools with caller-configured filters.
   */
  profile?: MailrithMcpProfile;
};

export type MailrithMcpCapabilityLimitation = {
  code: string;
  message: string;
  setupUrl?: string;
  affectedOperationIds?: readonly string[];
};

export type MailrithMcpCapabilityContext = {
  workspace: { id: string; name: string } | null;
  credentialType: "workspace_api_key" | "oauth_access_token" | null;
  scopes: readonly string[];
  effectiveOperationIds: readonly string[] | null;
  limitations: readonly MailrithMcpCapabilityLimitation[];
};

export type MailrithMcpToolDefinition = {
  name: string;
  title: string;
  operation: MailrithSdkOperationDescriptor;
  description: string;
  inputSchema: z.ZodType;
  outputSchema: z.ZodType;
  inputJsonSchema: Record<string, unknown>;
  outputJsonSchema: Record<string, unknown>;
  annotations: {
    title: string;
    readOnlyHint: boolean;
    destructiveHint: boolean;
    idempotentHint: boolean;
    openWorldHint: boolean;
  };
  securitySchemes: readonly [
    {
      type: "oauth2";
      scopes: readonly string[];
    },
  ];
  meta: Record<string, unknown>;
  invoke: (
    args?: Record<string, unknown>,
  ) => Promise<{
    content: Array<{ type: "text"; text: string }>;
    structuredContent?: Record<string, unknown>;
    isError?: boolean;
    _meta?: Record<string, unknown>;
  }>;
};

type MailrithMcpToolDescriptor = Tool & {
  securitySchemes?: readonly {
    type: "oauth2";
    scopes: readonly string[];
  }[];
};

export const mailrithMcpStandardOAuthScopes = [
  ...new Set(publicApiMcpToolsets.flatMap((toolset) => toolset.scopeKeys)),
];

export const mailrithMcpToolsetsHeader = "mailrith-mcp-toolsets";
export const mailrithMcpReadOnlyHeader = "mailrith-mcp-read-only";
export const mailrithMcpIncludeOutputSchemasHeader =
  "mailrith-mcp-include-output-schemas";

const normalizeBaseUrl = (value: string | undefined) =>
  (value ?? defaultBaseUrl).replace(/\/+$/, "");

const resolveMarketingOrigin = (baseUrl: string) => {
  const url = new URL(baseUrl);
  if (url.hostname === "api.mailrith.com") {
    return "https://mailrith.com";
  }
  if (url.hostname === "api-stage.mailrith.com") {
    return "https://stage.mailrith.com";
  }
  if (url.hostname === "api-feature.mailrith.com") {
    return "https://feature.mailrith.com";
  }
  if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
    return "http://localhost:4321";
  }
  return `${url.protocol}//${url.host}`;
};

const resolveAppOrigin = (baseUrl: string) => {
  const url = new URL(baseUrl);
  if (url.hostname === "api.mailrith.com") {
    return "https://app.mailrith.com";
  }
  if (url.hostname === "api-stage.mailrith.com") {
    return "https://app-stage.mailrith.com";
  }
  if (url.hostname === "api-feature.mailrith.com") {
    return "https://app-feature.mailrith.com";
  }
  if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
    return "http://localhost:5173";
  }
  return `${url.protocol}//${url.host}`;
};

const stringifyToolPayload = (value: unknown) => {
  if (typeof value === "string") {
    return value;
  }
  return JSON.stringify(value, null, 2);
};

const createToolRequestId = () => `mcp_${crypto.randomUUID()}`;

const buildToolResult = (
  operationId: string,
  requestId: string,
  response: unknown,
) => {
  const payload = {
    operation_id: operationId,
    request_id: requestId,
    response,
  };
  return {
    content: [
      {
        type: "text" as const,
        text: stringifyToolPayload(payload),
      },
    ],
    structuredContent: payload,
  };
};

const resolveToolErrorCategory = (error: MailrithApiError) => {
  if (error.status === 401) return "authentication";
  if (error.status === 403) return "permission";
  if (error.status === 400 || error.status === 422) return "validation";
  if (error.status === 409) return "conflict";
  if (error.status === 429) return "rate_limit";
  if (
    error.status === 408 ||
    error.status === 425 ||
    error.status >= 500
  ) {
    return "transient";
  }
  return "unknown";
};

const buildToolErrorResult = (
  operationId: string,
  requestId: string,
  error: unknown,
) => {
  if (error instanceof MailrithApiError) {
    const category = resolveToolErrorCategory(error);
    const responseError =
      error.responseBody &&
      typeof error.responseBody === "object" &&
      !Array.isArray(error.responseBody) &&
      "error" in error.responseBody &&
      error.responseBody.error &&
      typeof error.responseBody.error === "object" &&
      !Array.isArray(error.responseBody.error)
        ? (error.responseBody.error as Record<string, unknown>)
        : null;
    const requiredScopes = Array.isArray(responseError?.required_scopes)
      ? responseError.required_scopes.filter(
          (scope): scope is string => typeof scope === "string",
        )
      : [];
    const reconnectRequired =
      responseError?.reconnect_required === true;
    const credentialType =
      responseError?.credential_type === "oauth_access_token" ||
      responseError?.credential_type === "workspace_api_key"
        ? responseError.credential_type
        : null;
    const responseRecovery =
      responseError?.recovery &&
      typeof responseError.recovery === "object" &&
      !Array.isArray(responseError.recovery)
        ? (responseError.recovery as Record<string, unknown>)
        : null;
    const replacementScopes = Array.isArray(
      responseError?.replacement_scopes,
    )
      ? responseError.replacement_scopes
          .filter((scope): scope is string => typeof scope === "string")
          .slice(0, 50)
      : [];
    const recoveryReplacementScopes = Array.isArray(
      responseRecovery?.replacement_scopes,
    )
      ? responseRecovery.replacement_scopes
          .filter((scope): scope is string => typeof scope === "string")
          .slice(0, 50)
      : replacementScopes;
    const recovery =
      responseRecovery &&
      (responseRecovery.action === "reconnect_oauth" ||
        responseRecovery.action === "replace_api_key") &&
      typeof responseRecovery.message === "string"
        ? {
            action: responseRecovery.action,
            message: responseRecovery.message,
            ...(recoveryReplacementScopes.length > 0
              ? { replacement_scopes: recoveryReplacementScopes }
              : {}),
            ...(typeof responseRecovery.access_update_url === "string"
              ? { access_update_url: responseRecovery.access_update_url }
              : {}),
            ...(typeof responseRecovery.permissions_help_url === "string"
              ? {
                  permissions_help_url:
                    responseRecovery.permissions_help_url,
                }
              : {}),
          }
        : null;
    const permissionsHelpUrl =
      typeof responseError?.permissions_help_url === "string"
        ? responseError.permissions_help_url
        : null;
    const accessUpdateUrl =
      typeof responseError?.access_update_url === "string"
        ? responseError.access_update_url
        : null;
    const missingScopes = Array.isArray(responseError?.missing_scopes)
      ? responseError.missing_scopes
          .filter((scope): scope is string => typeof scope === "string")
          .slice(0, 50)
      : requiredScopes;
    const recommendedWorkProfiles = Array.isArray(
      responseError?.recommended_work_profiles,
    )
      ? responseError.recommended_work_profiles
          .filter((profile): profile is string => typeof profile === "string")
          .slice(0, 20)
      : [];
    const responseDetails =
      responseError?.details &&
      typeof responseError.details === "object" &&
      !Array.isArray(responseError.details)
        ? (responseError.details as Record<string, unknown>)
        : null;
    const responseDetailsResource =
      responseDetails?.resource &&
      typeof responseDetails.resource === "object" &&
      !Array.isArray(responseDetails.resource)
        ? (responseDetails.resource as Record<string, unknown>)
        : null;
    const details =
      responseDetails &&
      (typeof responseDetails.field === "string" ||
        typeof responseDetails.reason === "string" ||
        (typeof responseDetailsResource?.type === "string" &&
          typeof responseDetailsResource.id === "string"))
        ? {
            ...(typeof responseDetails.field === "string"
              ? { field: responseDetails.field }
              : {}),
            ...(typeof responseDetails.reason === "string"
              ? { reason: responseDetails.reason }
              : {}),
            ...(typeof responseDetailsResource?.type === "string" &&
            typeof responseDetailsResource.id === "string"
              ? {
                  resource: {
                    type: responseDetailsResource.type,
                    id: responseDetailsResource.id,
                  },
                }
              : {}),
          }
        : null;
    const responsePrerequisite =
      responseError?.prerequisite &&
      typeof responseError.prerequisite === "object" &&
      !Array.isArray(responseError.prerequisite)
        ? (responseError.prerequisite as Record<string, unknown>)
        : null;
    const prerequisiteScopes = Array.isArray(
      responsePrerequisite?.required_scopes,
    )
      ? responsePrerequisite.required_scopes
          .filter((scope): scope is string => typeof scope === "string")
          .slice(0, 50)
      : [];
    const prerequisite =
      responsePrerequisite &&
      typeof responsePrerequisite.resource === "string" &&
      (responsePrerequisite.state === "missing" ||
        responsePrerequisite.state === "disabled")
        ? {
            resource: responsePrerequisite.resource,
            state: responsePrerequisite.state,
            ...(prerequisiteScopes.length > 0
              ? { required_scopes: prerequisiteScopes }
              : {}),
            ...(typeof responsePrerequisite.work_profile === "string"
              ? { work_profile: responsePrerequisite.work_profile }
              : {}),
            ...(typeof responsePrerequisite.setup_url === "string"
              ? { setup_url: responsePrerequisite.setup_url }
              : {}),
          }
        : null;
    const responseRetry =
      responseError?.retry &&
      typeof responseError.retry === "object" &&
      !Array.isArray(responseError.retry)
        ? (responseError.retry as Record<string, unknown>)
        : null;
    const retry =
      responseRetry &&
      typeof responseRetry.safe === "boolean" &&
      typeof responseRetry.guidance === "string"
        ? {
            safe: responseRetry.safe,
            guidance: responseRetry.guidance,
          }
        : null;
    const payload = {
      operation_id: operationId,
      request_id: requestId,
      error: {
        category,
        status: error.status,
        code: error.code ?? error.type ?? `http_${error.status}`,
        message: error.message,
        retryable: category === "rate_limit" || category === "transient",
        ...(requiredScopes.length > 0
          ? { required_scopes: requiredScopes }
          : {}),
        ...(missingScopes.length > 0
          ? { missing_scopes: missingScopes }
          : {}),
        ...(replacementScopes.length > 0
          ? { replacement_scopes: replacementScopes }
          : {}),
        ...(recommendedWorkProfiles.length > 0
          ? { recommended_work_profiles: recommendedWorkProfiles }
          : {}),
        ...(accessUpdateUrl ? { access_update_url: accessUpdateUrl } : {}),
        ...(credentialType ? { credential_type: credentialType } : {}),
        ...(reconnectRequired ? { reconnect_required: true } : {}),
        ...(permissionsHelpUrl
          ? { permissions_help_url: permissionsHelpUrl }
          : {}),
        ...(details ? { details } : {}),
        ...(prerequisite ? { prerequisite } : {}),
        ...(retry ? { retry } : {}),
        ...(recovery ? { recovery } : {}),
      },
    };
    return {
      isError: true as const,
      content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  }

  const message = error instanceof Error ? error.message : String(error);
  const payload = {
    operation_id: operationId,
    request_id: requestId,
    error: {
      category: "unknown" as PublicApiMcpErrorCategory,
      status: null,
      code: "mcp_unknown_error",
      message,
      retryable: false,
    },
  };

  return {
    isError: true as const,
    content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }],
    structuredContent: payload,
  };
};

const buildToolValidationErrorResult = (
  operationId: string,
  requestId: string,
  error: z.ZodError,
) => {
  const payload = {
    operation_id: operationId,
    request_id: requestId,
    error: {
      category: "validation" as PublicApiMcpErrorCategory,
      status: null,
      code: "invalid_tool_arguments",
      message: "The tool arguments do not match the published schema.",
      retryable: false,
      issues: error.issues.slice(0, 20).map((issue) => ({
        path: issue.path.map(String).join("."),
        code: issue.code,
        message: issue.message,
      })),
    },
  };
  return {
    isError: true as const,
    content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }],
    structuredContent: payload,
  };
};

const createToolDescription = (
  operation: MailrithSdkOperationDescriptor,
  apiReferenceUrl: string,
) => {
  const summary = String(operation.summary);
  const description = operation.description ? String(operation.description) : "";
  const parts = [
    description && description !== summary ? description : `${summary}.`,
  ].filter((part): part is string => Boolean(part));

  if (operation.sideEffectClass !== "none") {
    parts.push(`Effect: ${operation.sideEffectClass}.`);
  }

  if (operation.idempotencyPolicy === "resource-state") {
    parts.push("Retry after reading the current resource state.");
  } else if (operation.idempotencyPolicy === "idempotency-key") {
    parts.push("Retry with the same idempotency_key.");
  }

  if (operation.requiredScopes.length > 0) {
    parts.push(
      `Permission${operation.requiredScopes.length === 1 ? "" : "s"}: ${operation.requiredScopes.join(", ")}.`,
    );
  } else {
    parts.push("Permission: none.");
  }

  const queryParams: readonly string[] = operation.queryParams;
  if (
    queryParams.includes("limit") ||
    queryParams.includes("starting_after") ||
    queryParams.includes("cursor")
  ) {
    parts.push(
      "Pagination: use bounded pages and returned cursors.",
    );
  }

  if (
    operation.operationId === "getBroadcastSendProgress" ||
    operation.operationId === "getSubscriberImportJob" ||
    operation.operationId === "getSubscriberExportJob"
  ) {
    parts.push(
      "Polling: wait at least 2 seconds, use exponential backoff up to 30 seconds, stop at a terminal state, and stop after 15 minutes.",
    );
  }

  parts.push(`API reference: ${apiReferenceUrl}.`);

  return parts.join(" ");
};

const createToolTitle = (operation: MailrithSdkOperationDescriptor) => {
  const summary = String(operation.summary).trim();
  return summary.length > 0
    ? `${summary.charAt(0).toUpperCase()}${summary.slice(1)}`
    : operation.operationId;
};

const toQueryValue = (value: unknown): MailrithQueryValue | undefined => {
  if (value === undefined) {
    return undefined;
  }
  if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.filter(
      (item) =>
        item === null ||
        typeof item === "string" ||
        typeof item === "number" ||
        typeof item === "boolean",
    ) as MailrithQueryValue;
  }
  return undefined;
};

const buildOperationRequest = (
  operation: MailrithSdkOperationDescriptor,
  args: Record<string, unknown>,
) => {
  const path =
    operation.pathParams.length > 0
      ? Object.fromEntries(
          operation.pathParams
            .map((param) => [param, args[param]])
            .filter((entry): entry is [string, string | number] =>
              typeof entry[1] === "string" || typeof entry[1] === "number",
            ),
        )
      : undefined;

  const queryEntries = operation.queryParams
    .map((param) => [param, toQueryValue(args[param])])
    .filter(
      (entry): entry is [string, MailrithQueryValue] => entry[1] !== undefined,
    );
  const query =
    queryEntries.length > 0 ? Object.fromEntries(queryEntries) : undefined;

  return {
    path,
    query,
    body: operation.hasRequestBody ? args.body : undefined,
    idempotencyKey:
      typeof args.idempotency_key === "string" ? args.idempotency_key : undefined,
  };
};

const createDiscoveryGuideText = (
  baseUrl: string,
  profile: MailrithMcpProfile,
) => {
  const marketingOrigin = resolveMarketingOrigin(baseUrl);
  const openApiUrl = `${baseUrl}${publicApiOpenApiPath}`;
  const metadataUrl = `${baseUrl}/${publicApiVersion}`;
  const capabilitiesUrl = `${baseUrl}${publicApiCapabilitiesPath}`;

  const workflowSteps =
    profile === "compact"
      ? [
          "4. Call mailrith_check_connection to confirm the current workspace, scopes, and any permissions needed for your intended operation.",
          "5. Call mailrith_search_operations, then mailrith_get_operation for only the operation you need.",
          "6. Run the operation through mailrith_read, mailrith_write, mailrith_delete, or mailrith_live.",
          "7. Prefer these compact MCP tools instead of loading the complete REST or SDK manifest into the conversation.",
        ]
      : [
          "4. Call discovery_get_capabilities to confirm the current workspace, scopes, and any permissions needed for your intended operation.",
          "5. Use the narrow focused tool whose name and schema match the requested action.",
          "6. Keep draft changes, preflight, testing, activation, and delivery as separate calls.",
          "7. Read the current resource or progress state before retrying an uncertain mutation.",
        ];

  return [
    "# Mailrith MCP Server",
    "",
    "Use the Mailrith MCP tools as the highest-level agent interface.",
    "",
    "Recommended flow:",
    `1. Read ${marketingOrigin}/llms.txt or ${marketingOrigin}${publicApiAgentsPath}.`,
    `2. Inspect ${metadataUrl} and ${openApiUrl} if you need the raw REST contract.`,
    `3. Authenticate this MCP server with a workspace API key or OAuth access token before calling protected tools.`,
    ...workflowSteps,
    "",
    "Human docs:",
    `- ${marketingOrigin}${publicApiDocsPath}`,
    `- ${marketingOrigin}${publicApiReferencePath}`,
    `- ${marketingOrigin}${publicApiAgentsPath}`,
    "",
    "Remote MCP endpoint:",
    `- ${baseUrl}${publicApiMcpPath}`,
    "",
    "REST discovery endpoints:",
    `- ${metadataUrl}`,
    `- ${openApiUrl}`,
    `- ${capabilitiesUrl}`,
  ].join("\n");
};

const createJsonRpcErrorResponse = (
  code: number,
  message: string,
  status = 400,
) =>
  new Response(
    JSON.stringify({
      jsonrpc: "2.0",
      error: {
        code,
        message,
      },
      id: null,
    }),
    {
      status,
      headers: {
        "content-type": "application/json",
      },
    },
  );

const validateRequestContentLength = (
  request: Request,
  maxBodyBytes: number,
) => {
  const contentLength = request.headers.get("content-length");
  if (!contentLength) {
    return { ok: true as const };
  }
  const parsed = Number.parseInt(contentLength, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return { ok: true as const };
  }
  if (parsed > maxBodyBytes) {
    return { ok: false as const };
  }
  return { ok: true as const };
};

const readBoundedRequestText = async (
  request: Request,
  maxBodyBytes: number,
) => {
  const contentLength = validateRequestContentLength(request, maxBodyBytes);
  if (!contentLength.ok) {
    return { ok: false as const };
  }
  if (!request.body) {
    return { ok: true as const, body: "" };
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let bodyBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      if (!value) {
        continue;
      }
      bodyBytes += value.byteLength;
      if (bodyBytes > maxBodyBytes) {
        await reader.cancel().catch(() => undefined);
        return { ok: false as const };
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const merged = new Uint8Array(bodyBytes);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  const body = new TextDecoder().decode(
    chunks.length === 1 ? chunks[0] : merged,
  );
  return { ok: true as const, body };
};

const parseMcpJsonBody = async (request: Request) => {
  const body = await readBoundedRequestText(request, mcpRequestMaxBodyBytes);
  if (!body.ok) {
    return { ok: false as const, status: 413 };
  }
  if (!body.body.trim()) {
    return { ok: true as const, value: undefined };
  }
  try {
    return { ok: true as const, value: JSON.parse(body.body) as unknown };
  } catch {
    return { ok: true as const, value: undefined };
  }
};

export const resolveMailrithMcpApiKey = (request: Request) => {
  const authorization = request.headers.get("authorization");
  if (authorization?.startsWith("Bearer ")) {
    const value = authorization.slice("Bearer ".length).trim();
    if (value) {
      return value;
    }
  }

  return undefined;
};

const publicApiMcpToolsetByKey = new Map(
  publicApiMcpToolsets.map((toolset) => [toolset.key, toolset] as const),
);
const publicApiReadScopeSet = new Set<string>(publicApiReadScopeKeys);

const resolveBooleanHeader = (
  request: Request,
  name: string,
  fallback: boolean,
) => {
  const value = request.headers.get(name);
  if (value == null) return { ok: true as const, value: fallback };
  if (value === "true") return { ok: true as const, value: true };
  if (value === "false") return { ok: true as const, value: false };
  return { ok: false as const, value };
};

export const resolveEnabledMcpToolsets = (
  request: Request,
  configuredToolsets: readonly PublicApiMcpToolsetKey[] | undefined,
) => {
  const header = request.headers.get(mailrithMcpToolsetsHeader);
  const requestedValues = header
    ? header
        .split(/[\s,]+/)
        .map((value) => value.trim())
        .filter(Boolean)
    : null;
  if (requestedValues) {
    const invalidValues = requestedValues.filter(
      (value) => !isPublicApiMcpToolsetKey(value),
    );
    if (invalidValues.length > 0) {
      return {
        ok: false as const,
        invalidValues,
      };
    }
  }

  const configured = configuredToolsets
    ? new Set(configuredToolsets)
    : new Set(publicApiMcpToolsetKeys);
  const selected = requestedValues
    ? requestedValues.filter(
      (value): value is PublicApiMcpToolsetKey =>
        isPublicApiMcpToolsetKey(value) && configured.has(value),
    )
    : configuredToolsets
      ? publicApiMcpToolsetKeys.filter((toolset) => configured.has(toolset))
      : [publicApiDefaultWorkProfileKey];
  if (selected.length === 0) {
    return {
      ok: false as const,
      invalidValues: requestedValues ?? ["standard"],
    };
  }

  const readOnly = resolveBooleanHeader(
    request,
    mailrithMcpReadOnlyHeader,
    false,
  );
  if (!readOnly.ok) {
    return {
      ok: false as const,
      invalidValues: [`${mailrithMcpReadOnlyHeader}=${readOnly.value}`],
    };
  }
  const includeOutputSchemas = resolveBooleanHeader(
    request,
    mailrithMcpIncludeOutputSchemasHeader,
    false,
  );
  if (!includeOutputSchemas.ok) {
    return {
      ok: false as const,
      invalidValues: [
        `${mailrithMcpIncludeOutputSchemasHeader}=${includeOutputSchemas.value}`,
      ],
    };
  }
  const challengeScopes = [
    ...new Set(
      selected.flatMap(
        (toolset) =>
          publicApiMcpToolsetByKey.get(toolset)?.scopeKeys ?? [],
      ).filter((scope) => !readOnly.value || publicApiReadScopeSet.has(scope)),
    ),
  ];

  return {
    ok: true as const,
    toolsets: [...new Set(selected)],
    challengeScopes,
    readOnly: readOnly.value,
    includeOutputSchemas: includeOutputSchemas.value,
  };
};

const quoteAuthHeaderValue = (value: string) =>
  `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;

const createMcpWwwAuthenticateChallenge = (params: {
  baseUrl: string;
  error: "invalid_token" | "insufficient_scope";
  errorDescription: string;
  requiredScopes: readonly string[];
}) => {
  const authParams = [
    `realm=${quoteAuthHeaderValue("mailrith")}`,
    `error=${quoteAuthHeaderValue(params.error)}`,
    `error_description=${quoteAuthHeaderValue(params.errorDescription)}`,
    `resource_metadata=${quoteAuthHeaderValue(
      `${params.baseUrl}${publicApiMcpOAuthProtectedResourcePath}`,
    )}`,
  ];
  if (params.requiredScopes.length > 0) {
    authParams.push(
      `scope=${quoteAuthHeaderValue(params.requiredScopes.join(" "))}`,
    );
  }
  return `Bearer ${authParams.join(", ")}`;
};

const resolveMcpReplacementScopes = (
  currentScopes: readonly string[],
  missingScopes: readonly string[],
) => {
  const replacementScopeSet = new Set([
    ...currentScopes,
    ...missingScopes,
  ]);
  return publicApiScopeKeys.filter((scope) =>
    replacementScopeSet.has(scope),
  );
};

const createMcpAuthResponse = (
  baseUrl: string,
  status: 401 | 403,
  error: "invalid_token" | "insufficient_scope",
  errorDescription: string,
  requiredScopes: readonly string[],
  credentialType?: "workspace_api_key" | "oauth_access_token",
  currentScopes: readonly string[] = [],
  missingScopes: readonly string[] = requiredScopes,
) => {
  const isOAuth = credentialType !== "workspace_api_key";
  const accessUpdateUrl =
    credentialType === "workspace_api_key"
      ? new URL(
        "/settings?tab=api-keys",
        resolveAppOrigin(baseUrl),
      ).toString()
      : null;
  const replacementScopes = resolveMcpReplacementScopes(
    currentScopes,
    missingScopes,
  );
  const challengeScopes =
    status === 403 && replacementScopes.length > 0
      ? replacementScopes
      : requiredScopes;
  const recovery =
    status === 403 && credentialType
      ? {
          action: isOAuth ? "reconnect_oauth" : "replace_api_key",
          message: isOAuth
            ? "Reconnect the app from the app that started the connection, approve the missing permissions, and retry this action."
            : "Create a replacement workspace API key with all listed replacement permissions, replace the saved key in the calling app, confirm the action works, and then revoke the old key.",
          replacement_scopes: replacementScopes,
          access_update_url: accessUpdateUrl,
          permissions_help_url: `${resolveMarketingOrigin(baseUrl)}/developers/authentication#add-permissions`,
        }
      : null;

  return new Response(
    JSON.stringify({
      error,
      error_description: errorDescription,
      required_scopes: requiredScopes,
      ...(status === 403 ? { missing_scopes: missingScopes } : {}),
      ...(status === 403 && replacementScopes.length > 0
        ? { replacement_scopes: replacementScopes }
        : {}),
      ...(credentialType ? { credential_type: credentialType } : {}),
      reconnect_required: status === 403 && isOAuth,
      permissions_help_url: `${resolveMarketingOrigin(baseUrl)}/developers/authentication#add-permissions`,
      ...(accessUpdateUrl ? { access_update_url: accessUpdateUrl } : {}),
      ...(recovery ? { recovery } : {}),
    }),
    {
      status,
      headers: {
        "content-type": "application/json",
        "WWW-Authenticate": createMcpWwwAuthenticateChallenge({
          baseUrl,
          error,
          errorDescription,
          requiredScopes: challengeScopes,
        }),
      },
    },
  );
};

const buildToolAuthorizationErrorResult = (params: {
  operationId: string;
  requestId: string;
  baseUrl: string;
  requiredScopes: readonly string[];
  capabilityContext: MailrithMcpCapabilityContext | null;
}) => {
  const currentScopes = params.capabilityContext?.scopes ?? [];
  const currentScopeSet = new Set(currentScopes);
  const missingScopes = params.requiredScopes.filter(
    (scope) => !currentScopeSet.has(scope),
  );
  const credentialType = params.capabilityContext?.credentialType ?? null;
  const hasCredential = credentialType !== null;
  const isApiKey = credentialType === "workspace_api_key";
  const status = hasCredential ? 403 : 401;
  const code = hasCredential ? "insufficient_scope" : "authentication_required";
  const message = hasCredential
    ? "This connection is missing permissions required by the selected Mailrith tool."
    : "Connect Mailrith before using this tool.";
  const replacementScopes = resolveMcpReplacementScopes(
    currentScopes,
    params.requiredScopes,
  );
  const accessUpdateUrl = isApiKey
    ? new URL("/settings?tab=api-keys", resolveAppOrigin(params.baseUrl)).toString()
    : null;
  const permissionsHelpUrl =
    `${resolveMarketingOrigin(params.baseUrl)}/developers/authentication#add-permissions`;
  const payload = {
    operation_id: params.operationId,
    request_id: params.requestId,
    error: {
      category: (hasCredential ? "permission" : "authentication") as
        | "permission"
        | "authentication",
      status,
      code,
      message,
      retryable: false,
      required_scopes: [...params.requiredScopes],
      missing_scopes: missingScopes,
      replacement_scopes: replacementScopes,
      ...(credentialType ? { credential_type: credentialType } : {}),
      ...(!isApiKey && hasCredential ? { reconnect_required: true } : {}),
      permissions_help_url: permissionsHelpUrl,
      ...(accessUpdateUrl ? { access_update_url: accessUpdateUrl } : {}),
      recovery: {
        action: isApiKey ? "replace_api_key" : "reconnect_oauth",
        message: isApiKey
          ? "Create a replacement workspace API key with the listed permissions, update the calling client, verify it, and then revoke the old key."
          : hasCredential
            ? "Reconnect Mailrith from the calling app and approve the listed permissions."
            : "Connect Mailrith from the calling app and approve the listed permissions.",
        replacement_scopes: replacementScopes,
        ...(accessUpdateUrl ? { access_update_url: accessUpdateUrl } : {}),
        permissions_help_url: permissionsHelpUrl,
      },
    },
  };
  const shouldAdvertiseOAuth = !isApiKey;
  const challenge = createMcpWwwAuthenticateChallenge({
    baseUrl: params.baseUrl,
    error: hasCredential ? "insufficient_scope" : "invalid_token",
    errorDescription: message,
    requiredScopes:
      hasCredential && replacementScopes.length > 0
        ? replacementScopes
        : params.requiredScopes,
  });
  return {
    isError: true as const,
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(payload, null, 2),
      },
    ],
    structuredContent: payload,
    ...(shouldAdvertiseOAuth
      ? {
          _meta: {
            "mcp/www_authenticate": [challenge],
          },
        }
      : {}),
  };
};

const createMcpToolAuthorizationResponse = (params: {
  id: string | number | null;
  operationId: string;
  baseUrl: string;
  requiredScopes: readonly string[];
  capabilityContext: MailrithMcpCapabilityContext | null;
}) => {
  const result = buildToolAuthorizationErrorResult({
    operationId: params.operationId,
    requestId: createToolRequestId(),
    baseUrl: params.baseUrl,
    requiredScopes: params.requiredScopes,
    capabilityContext: params.capabilityContext,
  });
  const credentialType = params.capabilityContext?.credentialType ?? null;
  const currentScopes = params.capabilityContext?.scopes ?? [];
  const replacementScopes = resolveMcpReplacementScopes(
    currentScopes,
    params.requiredScopes,
  );
  const hasCredential = credentialType !== null;
  const status = hasCredential ? 403 : 401;
  const error = hasCredential ? "insufficient_scope" : "invalid_token";
  const errorDescription = hasCredential
    ? "This connection is missing permissions required by the selected Mailrith tool."
    : "Connect Mailrith before using this tool.";

  return new Response(
    JSON.stringify({
      jsonrpc: "2.0",
      id: params.id,
      result,
    }),
    {
      status,
      headers: {
        "content-type": "application/json",
        "WWW-Authenticate": createMcpWwwAuthenticateChallenge({
          baseUrl: params.baseUrl,
          error,
          errorDescription,
          requiredScopes:
            hasCredential && replacementScopes.length > 0
              ? replacementScopes
              : params.requiredScopes,
        }),
      },
    },
  );
};

const toJsonRpcMessages = (value: unknown): Array<Record<string, unknown>> =>
  Array.isArray(value)
    ? value.filter(
        (entry): entry is Record<string, unknown> =>
          entry != null && typeof entry === "object" && !Array.isArray(entry),
      )
    : value != null && typeof value === "object" && !Array.isArray(value)
      ? [value as Record<string, unknown>]
      : [];

const sdkOperations: MailrithSdkOperationDescriptor[] = [];
for (const resource of mailrithSdkResources) {
  sdkOperations.push(
    ...(resource.operations as readonly MailrithSdkOperationDescriptor[]),
  );
}
const sdkOperationById = new Map<string, MailrithSdkOperationDescriptor>(
  sdkOperations.map((operation) => [operation.operationId, operation] as const),
);
const sdkOperationByToolName = new Map<string, MailrithSdkOperationDescriptor>(
  sdkOperations.map((operation) => [operation.mcpToolName, operation] as const),
);
const submittedMcpOperationIdSet = new Set<string>(
  publicApiSubmittedMcpOperationIds,
);
const submittedMcpOperationOrder = new Map<string, number>(
  publicApiSubmittedMcpOperationIds.map((operationId, index) => [
    operationId,
    index,
  ]),
);
if (submittedMcpOperationIdSet.size !== publicApiSubmittedMcpOperationIds.length) {
  throw new Error("The submitted MCP profile contains duplicate operation IDs.");
}
for (const operationId of publicApiSubmittedMcpOperationIds) {
  if (!sdkOperationById.has(operationId)) {
    throw new Error(
      `Submitted MCP operation ${operationId} is missing from the generated SDK contract.`,
    );
  }
}

export const mailrithSubmittedMcpToolNames =
  publicApiSubmittedMcpOperationIds.map((operationId) => {
    const operation = sdkOperationById.get(operationId);
    if (!operation) {
      throw new Error(
        `Submitted MCP operation ${operationId} is missing from the generated SDK contract.`,
      );
    }
    return operation.mcpToolName;
  });

export const mailrithSubmittedMcpOperationOAuthScopes =
  publicApiScopeKeys.filter((scope) =>
    publicApiSubmittedMcpOperationIds.some((operationId) =>
      (
        sdkOperationById.get(operationId)?.requiredScopes as
          | readonly string[]
          | undefined
      )?.includes(scope),
    ),
  );

/**
 * The capability tool is the submitted profile's OAuth bootstrap. Requesting
 * the complete public scope catalog lets Mailrith present every Work Profile
 * and default a general-purpose connection to Full Email Marketing Access.
 * Consent still grants only the profile or custom permissions the user
 * approves, and every other submitted tool advertises its exact operation
 * scopes for focused linking and step-up authorization.
 */
export const mailrithSubmittedMcpOAuthScopes = [
  ...mailrithMcpStandardOAuthScopes,
];

const submittedMcpOAuthBootstrapOperationId = "getPublicApiCapabilities";

const resolveSubmittedMcpToolOAuthScopes = (
  operation: MailrithSdkOperationDescriptor,
) =>
  operation.operationId === submittedMcpOAuthBootstrapOperationId
    ? [...mailrithSubmittedMcpOAuthScopes]
    : [...operation.requiredScopes];

const resolveMcpToolOperation = (toolName: string) =>
  sdkOperationByToolName.get(toolName) ?? null;

const resolveMcpToolCallOperation = (toolName: string, args?: unknown) => {
  const compactOperationId =
    (toolName === "mailrith_read" ||
      toolName === "mailrith_write" ||
      toolName === "mailrith_delete" ||
      toolName === "mailrith_live") &&
    args &&
    typeof args === "object" &&
    !Array.isArray(args) &&
    typeof (args as { operation_id?: unknown }).operation_id === "string"
      ? (args as { operation_id: string }).operation_id
      : null;
  const operation = compactOperationId
    ? sdkOperationById.get(compactOperationId) ?? null
    : resolveMcpToolOperation(toolName);
  return operation;
};

const resolveMcpToolRequiredScopes = (toolName: string, args?: unknown) => {
  const operation = resolveMcpToolCallOperation(toolName, args);
  if (!operation) {
    return [] as string[];
  }
  return [...operation.requiredScopes];
};

const resolveSingleMcpToolCallAuthorization = (parsedBody: unknown) => {
  const messages = toJsonRpcMessages(parsedBody);
  if (messages.length !== 1 || messages[0]?.method !== "tools/call") {
    return null;
  }
  const message = messages[0];
  const params = message.params;
  if (!params || typeof params !== "object" || Array.isArray(params)) {
    return null;
  }
  const paramsRecord = params as { name?: unknown; arguments?: unknown };
  if (typeof paramsRecord.name !== "string") {
    return null;
  }
  const operation = resolveMcpToolCallOperation(
    paramsRecord.name,
    paramsRecord.arguments,
  );
  if (!operation) {
    return null;
  }
  const id =
    typeof message.id === "string" || typeof message.id === "number"
      ? message.id
      : null;
  return {
    id,
    operationId: operation.operationId,
    requiredScopes: submittedMcpOperationIdSet.has(operation.operationId)
      ? resolveSubmittedMcpToolOAuthScopes(operation)
      : [...operation.requiredScopes],
  };
};

const resolveMcpRequestRequiredScopes = (parsedBody: unknown) => {
  const requiredScopes = new Set<string>();
  const messages = toJsonRpcMessages(parsedBody);

  for (const message of messages) {
    if (message.method !== "tools/call") {
      continue;
    }
    const params = message.params;
    if (!params || typeof params !== "object" || Array.isArray(params)) {
      continue;
    }
    const paramsRecord = params as { name?: unknown; arguments?: unknown };
    const toolName = paramsRecord.name;
    if (typeof toolName !== "string") {
      continue;
    }
    for (const scope of resolveMcpToolRequiredScopes(
      toolName,
      paramsRecord.arguments,
    )) {
      requiredScopes.add(scope);
    }
  }

  return [...requiredScopes];
};

const asCapabilityRecord = (value: unknown) =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const boundedCapabilityString = (
  value: unknown,
  maximumLength: number,
) =>
  typeof value === "string" && value.length <= maximumLength
    ? value
    : null;

export const parseMailrithMcpCapabilityContext = (
  value: unknown,
): MailrithMcpCapabilityContext | null => {
  const envelope = asCapabilityRecord(value);
  const data = asCapabilityRecord(envelope?.data);
  const credential = asCapabilityRecord(data?.credential);
  if (!data || !credential || !Array.isArray(credential.scopes)) {
    return null;
  }

  const scopeSet = new Set(
    credential.scopes
      .slice(0, 100)
      .map((scope) => boundedCapabilityString(scope, 100))
      .filter((scope): scope is string => scope !== null),
  );
  const workspaceValue = asCapabilityRecord(data.workspace);
  const workspaceId = boundedCapabilityString(workspaceValue?.id, 160);
  const workspaceName = boundedCapabilityString(workspaceValue?.name, 200);
  const credentialType =
    credential.type === "workspace_api_key" ||
    credential.type === "oauth_access_token"
      ? credential.type
      : null;

  let effectiveOperationIds: string[] | null = null;
  if (Array.isArray(data.resources)) {
    const operationIdSet = new Set<string>();
    for (const resource of data.resources.slice(0, 50)) {
      const resourceRecord = asCapabilityRecord(resource);
      if (!Array.isArray(resourceRecord?.operations)) continue;
      for (const operation of resourceRecord.operations) {
        if (operationIdSet.size >= 500) break;
        const operationRecord = asCapabilityRecord(operation);
        const operationId = boundedCapabilityString(
          operationRecord?.operation_id,
          160,
        );
        if (operationId) operationIdSet.add(operationId);
      }
      if (operationIdSet.size >= 500) break;
    }
    effectiveOperationIds = [...operationIdSet];
  }

  const limitations: MailrithMcpCapabilityLimitation[] = [];
  if (Array.isArray(data.limitations)) {
    for (const limitation of data.limitations.slice(0, 25)) {
      const record = asCapabilityRecord(limitation);
      const code = boundedCapabilityString(record?.code, 100);
      const message = boundedCapabilityString(record?.message, 500);
      const setupUrl = boundedCapabilityString(record?.setup_url, 2_048);
      if (!code || !message) continue;
      const affectedOperationIds = Array.isArray(
        record?.affected_operation_ids,
      )
        ? record.affected_operation_ids
            .slice(0, 500)
            .map((operationId) =>
              boundedCapabilityString(operationId, 160),
            )
            .filter(
              (operationId): operationId is string =>
                operationId !== null,
            )
        : [];
      limitations.push({
        code,
        message,
        affectedOperationIds,
        ...(setupUrl ? { setupUrl } : {}),
      });
    }
  }

  return {
    workspace:
      workspaceId && workspaceName
        ? { id: workspaceId, name: workspaceName }
        : null,
    credentialType,
    scopes: [...scopeSet],
    effectiveOperationIds,
    limitations,
  };
};

const readCapabilityContext = async (response: Response) =>
  parseMailrithMcpCapabilityContext(
    await response.json().catch(() => null),
  );

const validateMcpBearerCredential = async (params: {
  baseUrl: string;
  apiKey: string;
  fetch: MailrithFetch;
  requiredScopes: string[];
  enabledToolsets: readonly PublicApiMcpToolsetKey[];
  readOnly: boolean;
}) => {
  const response = await params.fetch(
    `${params.baseUrl}${publicApiCapabilitiesPath}`,
    {
      method: "GET",
      headers: {
        authorization: `Bearer ${params.apiKey}`,
        "x-mailrith-client": "mcp/dev",
        ...createMcpCapabilityContextHeaders({
          enabledToolsets: params.enabledToolsets,
          readOnly: params.readOnly,
        }),
      },
    },
  );

  if (response.status === 401) {
    return { ok: false as const, reason: "invalid_token" as const };
  }

  if (!response.ok) {
    return { ok: false as const, reason: "unavailable" as const };
  }

  const capabilityContext = await readCapabilityContext(response);
  if (!capabilityContext) {
    return { ok: false as const, reason: "unavailable" as const };
  }
  const scopes = capabilityContext.scopes;
  const scopeSet = new Set(scopes);
  const missingScopes = params.requiredScopes.filter(
    (scope) => !scopeSet.has(scope),
  );
  if (missingScopes.length > 0) {
    return {
      ok: false as const,
      reason: "insufficient_scope" as const,
      missingScopes,
      requiredScopes: params.requiredScopes,
      scopes,
      credentialType: capabilityContext.credentialType,
      capabilityContext,
    };
  }

  return {
    ok: true as const,
    scopes,
    credentialType: capabilityContext.credentialType,
    capabilityContext,
  };
};

const toZodSchema = (schema: unknown) =>
  z.fromJSONSchema(
    schema as Parameters<typeof z.fromJSONSchema>[0],
  );

const compiledMcpSchemas = createLazyMcpSchemaCache(toZodSchema);

const createToolAvailabilityFilter = (
  options: Pick<
    MailrithMcpServerOptions,
    "grantedScopes" | "enabledToolsets" | "readOnly"
  > & {
    profile?: "submitted" | "custom";
  },
) => {
  const grantedScopes = options.grantedScopes
    ? new Set(options.grantedScopes)
    : null;
  const enabledToolsets = options.enabledToolsets
    ? new Set(options.enabledToolsets)
    : null;

  return (tool: (typeof generatedMailrithMcpToolManifest.tools)[number]) => {
    if (options.profile === "submitted") {
      return submittedMcpOperationIdSet.has(tool.operationId);
    }
    if (
      grantedScopes &&
      !tool.requiredScopes.every((scope) => grantedScopes.has(scope))
    ) {
      return false;
    }
    if (
      enabledToolsets &&
      !tool.toolsets.some((toolset) => enabledToolsets.has(toolset))
    ) {
      return false;
    }
    if (options.readOnly && !tool.annotations.readOnlyHint) {
      return false;
    }
    return true;
  };
};

export const createMailrithMcpToolDefinitions = (
  client: MailrithClient,
  options: Pick<
    MailrithMcpServerOptions,
    | "grantedScopes"
    | "enabledToolsets"
    | "readOnly"
    | "capabilityContext"
    | "baseUrl"
    | "apiKey"
  > & {
    profile?: "submitted" | "custom";
    enforceRuntimeAuthorization?: boolean;
  } = {},
): MailrithMcpToolDefinition[] => {
  const apiReferenceUrl =
    `${resolveMarketingOrigin(normalizeBaseUrl(options.baseUrl))}${publicApiReferencePath}`;

  return generatedMailrithMcpToolManifest.tools
    .filter(createToolAvailabilityFilter(options))
    .sort((left, right) =>
      options.profile === "submitted"
        ? (submittedMcpOperationOrder.get(left.operationId) ?? 0) -
          (submittedMcpOperationOrder.get(right.operationId) ?? 0)
        : 0,
    )
    .map((tool) => {
      const operation = sdkOperationById.get(tool.operationId);
      if (!operation) {
        throw new Error(
          `SDK operation ${tool.operationId} is missing from the generated contract.`,
        );
      }
      const getSchemas = () => compiledMcpSchemas.get(tool);
      const advertisedOAuthScopes =
        options.profile === "submitted"
          ? resolveSubmittedMcpToolOAuthScopes(operation)
          : [...operation.requiredScopes];
      const securitySchemes = [
        {
          type: "oauth2" as const,
          scopes: advertisedOAuthScopes,
        },
      ] as const;
      return {
        name: tool.name,
        title: createToolTitle(operation),
        operation,
        description: createToolDescription(operation, apiReferenceUrl),
        get inputSchema() {
          return getSchemas().inputSchema;
        },
        get outputSchema() {
          return getSchemas().outputSchema;
        },
        inputJsonSchema: tool.inputSchema as Record<string, unknown>,
        outputJsonSchema: tool.outputSchema as Record<string, unknown>,
        annotations: tool.annotations,
        securitySchemes,
        meta: {
          securitySchemes,
          "mailrith/operationId": tool.operationId,
          "mailrith/requiredScopes": [...operation.requiredScopes],
          "mailrith/risk": tool.risk,
          "mailrith/sideEffectClass": tool.sideEffectClass,
          "mailrith/idempotencyPolicy": tool.idempotencyPolicy,
          "mailrith/toolsets": tool.toolsets,
          "mailrith/schemaDigest":
            generatedMailrithMcpToolManifest.schemaDigest,
        },
        invoke: async (args = {}) => {
          const requestId = createToolRequestId();
          if (options.enforceRuntimeAuthorization) {
            const capabilityContext =
              options.capabilityContext ??
              (options.grantedScopes
                ? {
                    workspace: null,
                    credentialType: null,
                    scopes: options.grantedScopes,
                    effectiveOperationIds: null,
                    limitations: [],
                  }
                : null);
            const grantedScopeSet = new Set(capabilityContext?.scopes ?? []);
            const canDelegateAuthorizationToApi =
              capabilityContext === null &&
              typeof options.apiKey === "string" &&
              options.apiKey.trim().length > 0;
            if (
              (!capabilityContext && !canDelegateAuthorizationToApi) ||
              (capabilityContext !== null &&
                !operation.requiredScopes.every((scope) =>
                  grantedScopeSet.has(scope),
                ))
            ) {
              return buildToolAuthorizationErrorResult({
                operationId: operation.operationId,
                requestId,
                baseUrl: normalizeBaseUrl(options.baseUrl),
                requiredScopes: operation.requiredScopes,
                capabilityContext,
              });
            }
          }
          const schemas = getSchemas();
          const validatedArgs = schemas.inputSchema.safeParse(args);
          if (!validatedArgs.success) {
            return buildToolValidationErrorResult(
              operation.operationId,
              requestId,
              validatedArgs.error,
            );
          }
          try {
            const response = await client.request(
              operation,
              buildOperationRequest(
                operation,
                validatedArgs.data as Record<string, unknown>,
              ),
            );
            return buildToolResult(operation.operationId, requestId, response);
          } catch (error) {
            return buildToolErrorResult(
              operation.operationId,
              requestId,
              error,
            );
          }
        },
      };
    });
};

type MailrithCompactOperationCategory = MailrithOperationCategory;

type MailrithCompactToolDefinition = {
  name: string;
  title: string;
  description: string;
  inputSchema: z.ZodType;
  inputJsonSchema: Tool["inputSchema"];
  annotations: Tool["annotations"];
  invoke: (
    args?: Record<string, unknown>,
  ) => Promise<{
    content: Array<{ type: "text"; text: string }>;
    structuredContent?: Record<string, unknown>;
    isError?: boolean;
  }>;
};

const compactOperationCategory = (
  operation: MailrithSdkOperationDescriptor,
): MailrithCompactOperationCategory =>
  getMailrithOperationCategory(operation);

const compactOperationCategoryLabels: Record<
  MailrithCompactOperationCategory,
  string
> = {
  read: "mailrith_read",
  write: "mailrith_write",
  delete: "mailrith_delete",
  live: "mailrith_live",
};

const createCompactToolResult = (
  toolName: string,
  response: Record<string, unknown>,
) => {
  const payload = {
    operation_id: toolName,
    request_id: createToolRequestId(),
    response,
  };
  return {
    content: [
      {
        type: "text" as const,
        text: stringifyToolPayload(payload),
      },
    ],
    structuredContent: payload,
  };
};

const createCompactToolError = (
  toolName: string,
  code: string,
  message: string,
  details: Record<string, unknown> = {},
) => {
  const payload = {
    operation_id: toolName,
    request_id: createToolRequestId(),
    error: {
      category: "validation" as const,
      status: null,
      code,
      message,
      retryable: false,
      ...details,
    },
  };
  return {
    isError: true as const,
    content: [
      {
        type: "text" as const,
        text: stringifyToolPayload(payload),
      },
    ],
    structuredContent: payload,
  };
};

const compactSearchInputSchema = z.object({
  query: z.string().trim().max(200).optional(),
  category: z
    .enum(["read", "write", "delete", "live"])
    .optional(),
  resource: z.string().trim().max(100).optional(),
  limit: z.number().int().min(1).max(25).default(12),
});

const compactGetOperationInputSchema = z.object({
  operation_id: z.string().trim().min(1).max(160),
  include_output_schema: z.boolean().default(false),
});

const compactExecuteInputSchema = z.object({
  operation_id: z.string().trim().min(1).max(160),
  arguments: z.record(z.string(), z.unknown()).optional(),
});

const compactConnectionInputSchema = z.object({
  operation_id: z.string().trim().min(1).max(160).optional(),
});

const compactSearchInputJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    query: {
      type: "string",
      maxLength: 200,
      description:
        "Words from the task, resource name, operation name, or stable operation ID.",
    },
    category: {
      type: "string",
      enum: ["read", "write", "delete", "live"],
      description: "Optional operation-effect filter.",
    },
    resource: {
      type: "string",
      maxLength: 100,
      description: "Optional Mailrith resource or SDK namespace.",
    },
    limit: {
      type: "integer",
      minimum: 1,
      maximum: 25,
      default: 12,
    },
  },
} as Tool["inputSchema"];

const compactGetOperationInputJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["operation_id"],
  properties: {
    operation_id: {
      type: "string",
      maxLength: 160,
      description:
        "Stable operation ID returned by mailrith_search_operations.",
    },
    include_output_schema: {
      type: "boolean",
      default: false,
      description:
        "Include this operation's exact output schema in this response.",
    },
  },
} as Tool["inputSchema"];

const compactExecuteInputJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["operation_id"],
  properties: {
    operation_id: {
      type: "string",
      maxLength: 160,
      description:
        "Stable operation ID returned by mailrith_search_operations.",
    },
    arguments: {
      type: "object",
      description:
        "Arguments that match the input_schema returned by mailrith_get_operation.",
      additionalProperties: true,
    },
  },
} as Tool["inputSchema"];

const compactConnectionInputJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    operation_id: {
      type: "string",
      maxLength: 160,
      description:
        "Optional operation to diagnose against the connection's current permissions.",
    },
  },
} as Tool["inputSchema"];

const compactReadAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
};

const compactWriteAnnotations = {
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
  openWorldHint: false,
};

const compactDeleteAnnotations = {
  readOnlyHint: false,
  destructiveHint: true,
  idempotentHint: false,
  openWorldHint: false,
};

const compactLiveAnnotations = {
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
  openWorldHint: true,
};

const withCompactAnnotationTitle = (
  title: string,
  annotations: Omit<
    NonNullable<Tool["annotations"]>,
    "title"
  >,
): NonNullable<Tool["annotations"]> => ({
  title,
  ...annotations,
});

type CompactCapabilityAvailability = {
  context: MailrithMcpCapabilityContext;
  scopeSet: ReadonlySet<string>;
  effectiveOperationIdSet: ReadonlySet<string> | null;
};

const createCompactCapabilityAvailability = (
  context: MailrithMcpCapabilityContext | null | undefined,
): CompactCapabilityAvailability | null =>
  context
    ? {
        context,
        scopeSet: new Set(context.scopes),
        effectiveOperationIdSet: context.effectiveOperationIds
          ? new Set(context.effectiveOperationIds)
          : null,
      }
    : null;

const serializeCompactCapabilityLimitation = (
  limitation: MailrithMcpCapabilityLimitation,
) => ({
  code: limitation.code,
  message: limitation.message,
  ...(limitation.affectedOperationIds
    ? { affected_operation_ids: limitation.affectedOperationIds }
    : {}),
  ...(limitation.setupUrl ? { setup_url: limitation.setupUrl } : {}),
});

const describeCompactOperation = (
  operation: MailrithSdkOperationDescriptor,
  availability: CompactCapabilityAvailability | null,
  options: Pick<
    MailrithMcpServerOptions,
    "enabledToolsets" | "readOnly"
  > = {},
) => {
  const missingScopes = availability
    ? operation.requiredScopes.filter(
        (scope) => !availability.scopeSet.has(scope),
      )
    : [];
  const excludedByToolset =
    options.enabledToolsets !== undefined &&
    !operation.toolsets.some((toolset) =>
      options.enabledToolsets?.includes(toolset),
    );
  const excludedByReadOnly =
    options.readOnly === true &&
    compactOperationCategory(operation) !== "read";
  const connectionFilterLimitations = [
    ...(excludedByToolset
      ? [
          {
            code: "mcp_toolset_filter_active",
            message:
              "This operation is outside the active MCP toolsets. Reconnect with a Work Profile that includes it.",
          },
        ]
      : []),
    ...(excludedByReadOnly
      ? [
          {
            code: "mcp_read_only_filter_active",
            message:
              "This MCP connection is read-only. Reconnect without the read-only restriction to use this operation.",
          },
        ]
      : []),
  ];
  const effectivelyAvailable =
    excludedByToolset || excludedByReadOnly || missingScopes.length > 0
      ? false
      : operation.authRequired === false
        ? true
        : availability?.effectiveOperationIdSet
          ? availability.effectiveOperationIdSet.has(operation.operationId)
          : null;
  const blockingLimitations =
    effectivelyAvailable === false && missingScopes.length === 0
      ? [
          ...connectionFilterLimitations,
          ...(availability?.context.limitations
          .filter(
            (limitation) =>
              (!limitation.affectedOperationIds ||
                limitation.affectedOperationIds.length === 0 ||
                limitation.affectedOperationIds?.includes(
                  operation.operationId,
                )),
          )
          .map(serializeCompactCapabilityLimitation) ?? []),
        ]
      : [];
  const recommendedWorkProfiles = resolvePublicApiMcpToolsets(
    operation.requiredScopes,
  );
  return {
    operation_id: operation.operationId,
    resource: operation.namespace,
    summary: operation.summary,
    category: compactOperationCategory(operation),
    required_scopes: operation.requiredScopes,
    available:
      availability === null &&
      !excludedByToolset &&
      !excludedByReadOnly
        ? null
        : effectivelyAvailable,
    availability:
      availability === null &&
      !excludedByToolset &&
      !excludedByReadOnly
        ? "unknown"
        : effectivelyAvailable === null
        ? "unknown"
        : missingScopes.length > 0
          ? "missing_permission"
          : effectivelyAvailable
            ? "available"
            : "blocked",
    ...(missingScopes.length > 0
      ? {
          missing_scopes: missingScopes,
          recommended_work_profiles: recommendedWorkProfiles,
        }
      : {}),
    ...(blockingLimitations.length > 0
      ? { blocking_limitations: blockingLimitations }
      : effectivelyAvailable === false && missingScopes.length === 0
        ? {
            blocking_limitations: [
              {
                code: "operation_unavailable",
                message:
                  "The operation is omitted from this workspace's current effective capabilities.",
              },
            ],
          }
        : {}),
  };
};

const selectCompactCatalogOperations = (
  _options: Pick<MailrithMcpServerOptions, "enabledToolsets" | "readOnly">,
) => sdkOperations;

export const createMailrithMcpCompactToolDefinitions = (
  client: MailrithClient,
  options: Pick<
    MailrithMcpServerOptions,
    | "baseUrl"
    | "grantedScopes"
    | "enabledToolsets"
    | "readOnly"
    | "includeOutputSchemas"
    | "capabilityContext"
  > = {},
): MailrithCompactToolDefinition[] => {
  const allOperationTools = createMailrithMcpToolDefinitions(client);
  const operationToolById = new Map(
    allOperationTools.map((tool) => [tool.operation.operationId, tool]),
  );
  const grantedScopes = options.grantedScopes
    ? new Set<string>(options.grantedScopes)
    : null;
  let capabilityAvailability = createCompactCapabilityAvailability(
    options.capabilityContext ??
      (grantedScopes
        ? {
            workspace: null,
            credentialType: null,
            scopes: [...grantedScopes],
            effectiveOperationIds: null,
            limitations: [],
          }
        : null),
  );
  let capabilityContextLoaded = options.capabilityContext !== undefined;
  let capabilityContextLoad:
    | Promise<CompactCapabilityAvailability | null>
    | null = null;
  const catalogOperations = selectCompactCatalogOperations(options);
  const operationDiscovery =
    createMailrithOperationDiscovery(catalogOperations);
  const baseUrl = normalizeBaseUrl(options.baseUrl);

  const getOperation = (operationId: string) =>
    catalogOperations.find(
      (operation) => operation.operationId === operationId,
    ) ?? null;

  const loadCapabilityAvailability = async (): Promise<
    CompactCapabilityAvailability | null
  > => {
    if (capabilityContextLoaded) {
      return capabilityAvailability;
    }
    if (capabilityContextLoad) {
      return capabilityContextLoad;
    }
    const capabilityTool = operationToolById.get(
      "getPublicApiCapabilities",
    );
    if (!capabilityTool) {
      capabilityContextLoaded = true;
      return capabilityAvailability;
    }
    const load = (async () => {
      const capabilityResult = await capabilityTool.invoke({});
      if (!capabilityResult.isError) {
        const context = parseMailrithMcpCapabilityContext(
          (capabilityResult.structuredContent?.response as unknown) ?? null,
        );
        if (context) {
          capabilityAvailability =
            createCompactCapabilityAvailability(context);
        }
      }
      capabilityContextLoaded = true;
      return capabilityAvailability;
    })();
    capabilityContextLoad = load;
    try {
      return await load;
    } finally {
      capabilityContextLoad = null;
    }
  };

  const invokeOperation = async (
    toolName: string,
    expectedCategory: MailrithCompactOperationCategory,
    args: Record<string, unknown>,
  ) => {
    const parsed = compactExecuteInputSchema.safeParse(args);
    if (!parsed.success) {
      return buildToolValidationErrorResult(
        toolName,
        createToolRequestId(),
        parsed.error,
      );
    }
    const operation = getOperation(parsed.data.operation_id);
    if (!operation) {
      return createCompactToolError(
        toolName,
        "operation_not_found",
        "The operation is not available in the active Mailrith toolsets.",
      );
    }
    const actualCategory = compactOperationCategory(operation);
    if (actualCategory !== expectedCategory) {
      return createCompactToolError(
        toolName,
        "wrong_operation_tool",
        `Use ${compactOperationCategoryLabels[actualCategory]} for ${operation.operationId}.`,
        {
          operation_id_requested: operation.operationId,
          required_tool: compactOperationCategoryLabels[actualCategory],
        },
      );
    }
    if (options.readOnly && actualCategory !== "read") {
      return createCompactToolError(
        toolName,
        "read_only_connection",
        "This MCP connection is restricted to read-only operations.",
      );
    }
    if (
      options.enabledToolsets &&
      !operation.toolsets.some((toolset) =>
        options.enabledToolsets?.includes(toolset),
      )
    ) {
      return createCompactToolError(
        toolName,
        "toolset_restricted",
        "This operation is outside the active MCP toolsets. Reconnect with a Work Profile that includes it.",
        {
          recommended_work_profiles: resolvePublicApiMcpToolsets(
            operation.requiredScopes,
          ),
        },
      );
    }
    const operationTool = operationToolById.get(operation.operationId);
    if (!operationTool) {
      return createCompactToolError(
        toolName,
        "operation_contract_missing",
        "The operation contract is temporarily unavailable.",
      );
    }
    return operationTool.invoke(parsed.data.arguments ?? {});
  };

  return [
    {
      name: "mailrith_check_connection",
      title: "Check Mailrith connection",
      description:
        "Check the authenticated workspace and permissions. Optionally diagnose one operation and return missing permissions, a suitable Work Profile, and where the user can update access.",
      inputSchema: compactConnectionInputSchema,
      inputJsonSchema: compactConnectionInputJsonSchema,
      annotations: withCompactAnnotationTitle(
        "Check Mailrith connection",
        compactReadAnnotations,
      ),
      invoke: async (args = {}) => {
        const parsed = compactConnectionInputSchema.safeParse(args);
        if (!parsed.success) {
          return buildToolValidationErrorResult(
            "mailrith_check_connection",
            createToolRequestId(),
            parsed.error,
          );
        }
        const capabilityTool = operationToolById.get(
          "getPublicApiCapabilities",
        );
        if (!capabilityTool) {
          return createCompactToolError(
            "mailrith_check_connection",
            "capability_contract_missing",
            "Mailrith connection diagnostics are temporarily unavailable.",
          );
        }
        const capabilityResult = await capabilityTool.invoke({});
        if (capabilityResult.isError) {
          return capabilityResult;
        }
        const capability = parseMailrithMcpCapabilityContext(
          (capabilityResult.structuredContent?.response as unknown) ?? null,
        );
        if (
          !capability ||
          !capability.workspace ||
          !capability.credentialType
        ) {
          return createCompactToolError(
            "mailrith_check_connection",
            "invalid_capability_response",
            "Mailrith returned an invalid connection response.",
          );
        }
        capabilityAvailability =
          createCompactCapabilityAvailability(capability);
        capabilityContextLoaded = true;
        const requestedOperation = parsed.data.operation_id
          ? getOperation(parsed.data.operation_id)
          : null;
        if (parsed.data.operation_id && !requestedOperation) {
          return createCompactToolError(
            "mailrith_check_connection",
            "operation_not_found",
            "The operation is not available in the active Mailrith toolsets.",
          );
        }
        const currentScopeSet = new Set(capability.scopes);
        const missingScopes = requestedOperation
          ? requestedOperation.requiredScopes.filter(
              (scope) => !currentScopeSet.has(scope),
            )
          : [];
        const replacementScopeSet = new Set([
          ...capability.scopes,
          ...missingScopes,
        ]);
        const replacementScopes = publicApiScopeKeys.filter((scope) =>
          replacementScopeSet.has(scope),
        );
        const permissionsUrl =
          capability.credentialType === "workspace_api_key"
            ? new URL("/settings", resolveAppOrigin(baseUrl))
            : null;
        if (permissionsUrl) {
          permissionsUrl.searchParams.set(
            "workspace",
            capability.workspace.id,
          );
          permissionsUrl.searchParams.set("tab", "api-keys");
        }
        return createCompactToolResult("mailrith_check_connection", {
          connected: true,
          workspace: capability.workspace,
          credential_type: capability.credentialType,
          scopes: capability.scopes,
          ...(requestedOperation
            ? {
                operation: describeCompactOperation(
                  requestedOperation,
                  capabilityAvailability,
                  options,
                ),
                missing_scopes: missingScopes,
                replacement_scopes: replacementScopes,
                recommended_work_profiles: resolvePublicApiMcpToolsets(
                  requestedOperation.requiredScopes,
                ),
                ...(permissionsUrl
                  ? { access_update_url: permissionsUrl.toString() }
                  : {}),
                recovery:
                  missingScopes.length > 0
                    ? {
                        action:
                          capability.credentialType === "oauth_access_token"
                            ? "reconnect_oauth"
                            : "replace_api_key",
                        message:
                          capability.credentialType === "oauth_access_token"
                            ? "Reconnect Mailrith from the app that started the connection, approve the missing permissions, and retry."
                            : "Create a replacement API key with all listed replacement permissions, replace the saved key in the calling app, confirm the action works, and then revoke the old key.",
                        replacement_scopes: replacementScopes,
                        ...(permissionsUrl
                          ? {
                              access_update_url:
                                permissionsUrl.toString(),
                            }
                          : {}),
                      }
                    : null,
                reconnect_required:
                  capability.credentialType === "oauth_access_token" &&
                  missingScopes.length > 0,
              }
            : {}),
          limitations: capability.limitations.map(
            serializeCompactCapabilityLimitation,
          ),
        });
      },
    },
    {
      name: "mailrith_search_operations",
      title: "Find Mailrith operations",
      description:
        "Search the compact Mailrith operation index by task, resource, or effect. Returns bounded ranked summaries and marks ambiguous results that must be narrowed before execution. Use mailrith_get_operation for one exact schema.",
      inputSchema: compactSearchInputSchema,
      inputJsonSchema: compactSearchInputJsonSchema,
      annotations: withCompactAnnotationTitle(
        "Find Mailrith operations",
        compactReadAnnotations,
      ),
      invoke: async (args = {}) => {
        const parsed = compactSearchInputSchema.safeParse(args);
        if (!parsed.success) {
          return buildToolValidationErrorResult(
            "mailrith_search_operations",
            createToolRequestId(),
            parsed.error,
          );
        }
        const discovery = operationDiscovery.search({
          query: parsed.data.query,
          resource: parsed.data.resource,
          category: parsed.data.category,
        });
        const matches = discovery.matches;
        const availability = await loadCapabilityAvailability();
        const suggestions =
          matches.length === 0 && parsed.data.query
            ? [
                "Try a resource name such as Subscribers, Broadcasts, Forms, Sequences, or Automations.",
                "Add an action word such as find, create, update, preview, send, or delete.",
                "Use the optional resource or category filter to narrow the catalog.",
              ]
            : [];
        return createCompactToolResult("mailrith_search_operations", {
          data: matches
            .slice(0, parsed.data.limit)
            .map((match) =>
              describeCompactOperation(
                match.operation,
                availability,
                options,
              ),
            ),
          selection: discovery.selection,
          pagination: {
            returned: Math.min(matches.length, parsed.data.limit),
            total_matches: matches.length,
            truncated: matches.length > parsed.data.limit,
          },
          ...(suggestions.length > 0 ? { suggestions } : {}),
        });
      },
    },
    {
      name: "mailrith_get_operation",
      title: "Get one Mailrith operation schema",
      description:
        "Load the exact input schema, permission boundary, effect category, and retry behavior for one operation returned by mailrith_search_operations.",
      inputSchema: compactGetOperationInputSchema,
      inputJsonSchema: compactGetOperationInputJsonSchema,
      annotations: withCompactAnnotationTitle(
        "Get one Mailrith operation schema",
        compactReadAnnotations,
      ),
      invoke: async (args = {}) => {
        const parsed = compactGetOperationInputSchema.safeParse(args);
        if (!parsed.success) {
          return buildToolValidationErrorResult(
            "mailrith_get_operation",
            createToolRequestId(),
            parsed.error,
          );
        }
        const operation = getOperation(parsed.data.operation_id);
        const operationTool = operation
          ? operationToolById.get(operation.operationId)
          : null;
        if (!operation || !operationTool) {
          return createCompactToolError(
            "mailrith_get_operation",
            "operation_not_found",
            "The operation is not available in the active Mailrith toolsets.",
          );
        }
        const availability = await loadCapabilityAvailability();
        return createCompactToolResult("mailrith_get_operation", {
          ...describeCompactOperation(operation, availability, options),
          method: operation.method,
          path: operation.path,
          description: operation.description,
          retry_mode: operation.retryMode,
          idempotency_policy: operation.idempotencyPolicy,
          execution_tool:
            compactOperationCategoryLabels[
              compactOperationCategory(operation)
            ],
          input_schema: operationTool.inputJsonSchema,
          ...(parsed.data.include_output_schema ||
          options.includeOutputSchemas
            ? { output_schema: operationTool.outputJsonSchema }
            : {}),
        });
      },
    },
    {
      name: "mailrith_read",
      title: "Run a Mailrith read operation",
      description:
        "Run one side-effect-free operation after loading its exact schema with mailrith_get_operation.",
      inputSchema: compactExecuteInputSchema,
      inputJsonSchema: compactExecuteInputJsonSchema,
      annotations: withCompactAnnotationTitle(
        "Run a Mailrith read operation",
        compactReadAnnotations,
      ),
      invoke: (args = {}) =>
        invokeOperation("mailrith_read", "read", args),
    },
    {
      name: "mailrith_write",
      title: "Run a Mailrith draft or workspace operation",
      description:
        "Create or change draft, metadata, or workspace resources that do not immediately perform a live action.",
      inputSchema: compactExecuteInputSchema,
      inputJsonSchema: compactExecuteInputJsonSchema,
      annotations: withCompactAnnotationTitle(
        "Run a Mailrith draft or workspace operation",
        compactWriteAnnotations,
      ),
      invoke: (args = {}) =>
        invokeOperation("mailrith_write", "write", args),
    },
    {
      name: "mailrith_delete",
      title: "Run a Mailrith delete operation",
      description:
        "Delete a Mailrith resource. Load the operation schema and current resource state first; operations that delete a live-capable resource still require Perform Live Actions access.",
      inputSchema: compactExecuteInputSchema,
      inputJsonSchema: compactExecuteInputJsonSchema,
      annotations: withCompactAnnotationTitle(
        "Run a Mailrith delete operation",
        compactDeleteAnnotations,
      ),
      invoke: (args = {}) =>
        invokeOperation("mailrith_delete", "delete", args),
    },
    {
      name: "mailrith_live",
      title: "Run a Mailrith live action",
      description:
        "Run an operation that can send email, affect a running workflow, change Subscriber delivery or targeting state, publish a public capture surface, or configure outbound event delivery. The credential must also have Perform Live Actions access.",
      inputSchema: compactExecuteInputSchema,
      inputJsonSchema: compactExecuteInputJsonSchema,
      annotations: withCompactAnnotationTitle(
        "Run a Mailrith live action",
        compactLiveAnnotations,
      ),
      invoke: (args = {}) =>
        invokeOperation("mailrith_live", "live", args),
    },
  ];
};

export const createMcpCapabilityContextHeaders = (
  options: Pick<MailrithMcpServerOptions, "enabledToolsets" | "readOnly">,
) => ({
  ...(options.enabledToolsets
    ? {
        [mailrithMcpToolsetsHeader]: options.enabledToolsets.join(","),
      }
    : {}),
  ...(options.readOnly ? { [mailrithMcpReadOnlyHeader]: "true" } : {}),
});

export const createMailrithMcpServer = (
  options: MailrithMcpServerOptions = {},
) => {
  const baseUrl = normalizeBaseUrl(options.baseUrl);
  const profile = options.profile ?? "submitted";
  const capabilityContextHeaders = createMcpCapabilityContextHeaders(options);
  const client =
    options.client ??
    createMailrithClient({
      baseUrl,
      apiKey: options.apiKey,
      fetch: options.fetch,
      defaultHeaders: {
        "x-mailrith-client": "mcp/dev",
        ...capabilityContextHeaders,
      },
    });

  const server = new McpServer(mcpServerInfo, {
    instructions:
      profile === "submitted"
        ? publicApiSubmittedMcpProfile.instructions
        : undefined,
  });
  const tools =
    profile === "compact"
      ? createMailrithMcpCompactToolDefinitions(client, {
          ...options,
          baseUrl,
        })
      : createMailrithMcpToolDefinitions(client, {
          ...options,
          baseUrl,
          profile: profile === "submitted" ? "submitted" : "custom",
          enforceRuntimeAuthorization: profile === "submitted",
        });
  const catalogOperations =
    profile === "compact"
      ? selectCompactCatalogOperations(options)
      : tools.map((tool) =>
          "operation" in tool
            ? tool.operation
            : sdkOperationByToolName.get(tool.name),
        ).filter(
          (operation): operation is MailrithSdkOperationDescriptor =>
            operation !== undefined,
        );
  const capabilityAvailability = createCompactCapabilityAvailability(
    options.capabilityContext ??
      (options.grantedScopes
        ? {
            workspace: null,
            credentialType: null,
            scopes: options.grantedScopes,
            effectiveOperationIds: null,
            limitations: [],
          }
        : null),
  );
  const toolByName = new Map(tools.map((tool) => [tool.name, tool]));
  server.server.registerCapabilities({ tools: { listChanged: false } });
  server.server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: tools.map(
      (tool): MailrithMcpToolDescriptor => {
        const focusedTool =
          "outputJsonSchema" in tool ? tool : null;
        return {
          name: tool.name,
          title: tool.title,
          description: tool.description,
          inputSchema: tool.inputJsonSchema as Tool["inputSchema"],
          ...(focusedTool &&
          (profile === "submitted" || options.includeOutputSchemas)
            ? {
                outputSchema:
                  focusedTool.outputJsonSchema as Tool["outputSchema"],
              }
            : {}),
          annotations: tool.annotations,
          ...(focusedTool
            ? {
                securitySchemes: focusedTool.securitySchemes,
                _meta: focusedTool.meta,
              }
            : {}),
        };
      },
    ),
  }));
  server.server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const tool = toolByName.get(request.params.name);
    if (!tool) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Tool ${request.params.name} is not available for this credential and toolset selection.`,
      );
    }
    const args = request.params.arguments;
    const result = await tool.invoke(
      args && typeof args === "object" && !Array.isArray(args) ? args : {},
    );
    return result;
  });

  server.registerResource(
    "mailrith-operation-index",
    "mailrith://operations",
    {
      title: "Mailrith Operation Index",
      description:
        "A compact operation index without nested request or response schemas.",
      mimeType: "application/json",
    },
    async () => ({
      contents: [
        {
          uri: "mailrith://operations",
          mimeType: "application/json",
          text: JSON.stringify(
            catalogOperations.map((operation) =>
              describeCompactOperation(
                operation,
                capabilityAvailability,
                options,
              ),
            ),
          ),
        },
      ],
    }),
  );

  server.registerResource(
    "mailrith-discovery-guide",
    "mailrith://discovery",
    {
      title: "Mailrith Discovery Guide",
      description: "Recommended discovery order and official Mailrith entry points.",
      mimeType: "text/markdown",
    },
    async () => ({
      contents: [
        {
          uri: "mailrith://discovery",
          mimeType: "text/markdown",
          text: createDiscoveryGuideText(baseUrl, profile),
        },
      ],
    }),
  );

  server.registerPrompt(
    "mailrith_agent_plan",
    {
      title: "Plan a Mailrith task",
      description:
        "Generate a concise plan for a Mailrith task before calling tools.",
      argsSchema: {
        goal: z.string().describe("The Mailrith task or outcome you want to achieve."),
      },
    },
    async ({ goal }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: [
              "You are planning work against Mailrith.",
              "Start by reading mailrith://discovery.",
              profile === "compact"
                ? "Then use mailrith_search_operations and mailrith_get_operation to identify only the operations needed for this goal:"
                : "Then select the smallest sequence of focused Mailrith tools needed for this goal:",
              goal,
            ].join("\n"),
          },
        },
      ],
    }),
  );

  return server;
};

export const runMailrithMcpStdioServer = async (
  options: MailrithMcpServerOptions = {},
) => {
  const server = createMailrithMcpServer(options);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  return server;
};

export const handleMailrithMcpHttpRequest = async (
  request: Request,
  options: MailrithMcpServerOptions = {},
) => {
  const baseUrl = normalizeBaseUrl(options.baseUrl);
  const profile = options.profile ?? "submitted";
  if (request.method !== "POST" && request.method !== "DELETE") {
    return createJsonRpcErrorResponse(-32000, "Method not allowed.", 405);
  }

  const parsedBody =
    request.method === "POST"
      ? await parseMcpJsonBody(request.clone() as unknown as Request)
      : null;
  if (parsedBody && !parsedBody.ok) {
    return createJsonRpcErrorResponse(
      -32000,
      "Request body is too large.",
      parsedBody.status,
    );
  }
  const apiKey = resolveMailrithMcpApiKey(request) ?? options.apiKey;
  const batchItemCount = Array.isArray(parsedBody?.value)
    ? parsedBody.value.length
    : 0;
  if (
    !apiKey &&
    profile === "submitted" &&
    batchItemCount > mailrithMcpMaxAnonymousBatchItems
  ) {
    return createJsonRpcErrorResponse(
      -32000,
      "Anonymous MCP requests must contain one JSON-RPC message.",
      413,
    );
  }
  if (batchItemCount > mailrithMcpMaxAuthenticatedBatchItems) {
    return createJsonRpcErrorResponse(
      -32000,
      `MCP batches cannot contain more than ${mailrithMcpMaxAuthenticatedBatchItems} messages.`,
      413,
    );
  }
  const enabledToolsets =
    profile === "submitted"
      ? {
          ok: true as const,
          toolsets: publicApiMcpToolsetKeys,
          challengeScopes: mailrithSubmittedMcpOAuthScopes,
          readOnly: false,
          includeOutputSchemas: true,
        }
      : resolveEnabledMcpToolsets(request, options.enabledToolsets);
  if (!enabledToolsets.ok) {
    return createJsonRpcErrorResponse(
      -32602,
      `Unknown Mailrith MCP toolset: ${enabledToolsets.invalidValues.join(", ")}.`,
      400,
    );
  }
  const requiredScopes = resolveMcpRequestRequiredScopes(parsedBody?.value);
  const messages = toJsonRpcMessages(parsedBody?.value);
  const hasToolCall = messages.some(
    (message) => message.method === "tools/call",
  );
  const singleToolCall = resolveSingleMcpToolCallAuthorization(
    parsedBody?.value,
  );
  const challengeScopes: string[] =
    requiredScopes.length > 0
      ? requiredScopes
      : enabledToolsets.challengeScopes;
  if (!apiKey) {
    if (profile === "submitted") {
      if (hasToolCall) {
        if (singleToolCall) {
          return createMcpToolAuthorizationResponse({
            ...singleToolCall,
            baseUrl,
            capabilityContext: null,
          });
        }
        return createMcpAuthResponse(
          baseUrl,
          401,
          "invalid_token",
          "Authentication is required before calling Mailrith tools.",
          challengeScopes,
        );
      }
      const server = createMailrithMcpServer({
        ...options,
        baseUrl,
        profile,
        apiKey: undefined,
        grantedScopes: undefined,
        enabledToolsets: undefined,
        readOnly: false,
        includeOutputSchemas: true,
        capabilityContext: undefined,
      });
      const transport = new WebStandardStreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true,
      });
      await server.connect(transport);
      try {
        return await transport.handleRequest(request, {
          parsedBody: parsedBody?.value,
        });
      } finally {
        await transport.close().catch(() => undefined);
        await server.close().catch(() => undefined);
      }
    }
    return createMcpAuthResponse(
      baseUrl,
      401,
      "invalid_token",
      "Authentication is required before using the Mailrith MCP server.",
      challengeScopes,
    );
  }

  const validation = await validateMcpBearerCredential({
    baseUrl,
    apiKey,
    fetch: options.fetch ?? fetch,
    requiredScopes,
    enabledToolsets: enabledToolsets.toolsets,
    readOnly: enabledToolsets.readOnly,
  });
  if (!validation.ok && validation.reason === "invalid_token") {
    return createMcpAuthResponse(
      baseUrl,
      401,
      "invalid_token",
      "The Mailrith MCP bearer token is invalid or expired.",
      challengeScopes,
    );
  }
  if (!validation.ok && validation.reason === "insufficient_scope") {
    if (profile === "submitted" && singleToolCall) {
      return createMcpToolAuthorizationResponse({
        ...singleToolCall,
        baseUrl,
        capabilityContext: validation.capabilityContext,
      });
    }
    return createMcpAuthResponse(
      baseUrl,
      403,
      "insufficient_scope",
      "The Mailrith MCP bearer token is missing required scopes.",
      validation.requiredScopes,
      validation.credentialType ?? undefined,
      validation.scopes,
      validation.missingScopes,
    );
  }
  if (!validation.ok && validation.reason === "unavailable") {
    return createJsonRpcErrorResponse(
      -32001,
      "Mailrith credential validation is temporarily unavailable.",
      503,
    );
  }

  // A fresh server is created for every request. The hosted endpoint therefore
  // has no cross-request sessions or in-memory subscriber state, which keeps
  // Worker memory bounded and prevents one credential from leaking into
  // another request.
  const server = createMailrithMcpServer({
    ...options,
    apiKey,
    grantedScopes: validation.scopes,
    enabledToolsets: enabledToolsets.toolsets,
    readOnly: enabledToolsets.readOnly,
    includeOutputSchemas: enabledToolsets.includeOutputSchemas,
    capabilityContext: validation.capabilityContext,
    profile,
  });
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  await server.connect(transport);
  try {
    return await transport.handleRequest(request, {
      parsedBody: parsedBody?.value,
    });
  } finally {
    await transport.close().catch(() => undefined);
    await server.close().catch(() => undefined);
  }
};
