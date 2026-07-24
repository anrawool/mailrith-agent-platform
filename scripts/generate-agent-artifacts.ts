import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
// Artifact generation must consume source so a stale or absent build directory
// cannot silently publish an older contract.
// eslint-disable-next-line no-restricted-imports
import {
  publicApiMcpErrorCategories,
  publicApiMcpOperationContractMap,
  publicApiMcpToolsets,
  publicApiAgentReadQuickstartScopeKeys,
  publicApiSdkResources,
  publicApiVersion,
} from "../packages/public-api/src/index.js";

export const generatedAgentArtifactsNotice =
  "// This file is generated from packages/public-api/src/index.ts.\n" +
  "// Run `pnpm generate:agent-artifacts` after changing the public API contract.\n";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const writeGeneratedFile = async (relativePath: string, contents: string) => {
  const absolutePath = path.join(repoRoot, relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, contents, "utf8");
};

const toSnakeCase = (value: string) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();

const toPythonEventPatternScopeRequirements = (
  requirements:
    | (typeof publicApiSdkResources)[number]["operations"][number]["eventPatternScopeRequirements"]
    | undefined,
) =>
  requirements
    ? {
        request_field: requirements.requestField,
        description: requirements.description,
        required_scopes_by_event_pattern:
          requirements.requiredScopesByEventPattern,
      }
    : undefined;

const toPythonPayloadFieldScopeRequirements = (
  requirements:
    | (typeof publicApiSdkResources)[number]["operations"][number]["payloadFieldScopeRequirements"]
    | undefined,
) =>
  requirements
    ? {
        description: requirements.description,
        required_scopes_by_field: requirements.requiredScopesByField,
      }
    : undefined;

export const buildPythonSdkManifest = () =>
  publicApiSdkResources.map((resource) => ({
    namespace: toSnakeCase(resource.namespace),
    name: resource.name,
    description: resource.description,
    operations: resource.operations.map((operation) => {
      const eventPatternScopeRequirements =
        toPythonEventPatternScopeRequirements(
          operation.eventPatternScopeRequirements,
        );
      const payloadFieldScopeRequirements =
        toPythonPayloadFieldScopeRequirements(
          operation.payloadFieldScopeRequirements,
        );
      return {
        namespace: toSnakeCase(operation.namespace),
        method_name: toSnakeCase(operation.methodName),
        operation_id: operation.operationId,
        method: operation.method,
        path: operation.path,
        summary: operation.summary,
        description: operation.description,
        auth_required: operation.authRequired,
        required_scopes: operation.requiredScopes,
        mcp_tool_name: operation.mcpToolName,
        risk: operation.risk,
        external_side_effect: operation.externalSideEffect,
        side_effect_class: operation.sideEffectClass,
        retry_mode: operation.retryMode,
        idempotency_policy: operation.idempotencyPolicy,
        toolsets: operation.toolsets,
        annotations: operation.annotations,
        risk_rationale: operation.riskRationale,
        path_params: operation.pathParams,
        query_params: operation.queryParams,
        header_params: operation.headerParams,
        has_request_body: operation.hasRequestBody,
        request_body_required: operation.requestBodyRequired,
        ...(eventPatternScopeRequirements
          ? { event_pattern_scope_requirements: eventPatternScopeRequirements }
          : {}),
        ...(payloadFieldScopeRequirements
          ? { payload_field_scope_requirements: payloadFieldScopeRequirements }
          : {}),
      };
    }),
  }));

export const buildTypeScriptSdkManifest = () => `${generatedAgentArtifactsNotice}
export const generatedMailrithSdkContractVersion = ${JSON.stringify(publicApiVersion)};

export const generatedMailrithAgentReadQuickstartScopeKeys = ${JSON.stringify(
  publicApiAgentReadQuickstartScopeKeys,
  null,
  2,
)} as const;

export const generatedMailrithSdkResources = ${JSON.stringify(
  publicApiSdkResources,
  null,
  2,
)} as const;
`;

export const buildPythonSdkManifestJson = () =>
  `${JSON.stringify(buildPythonSdkManifest(), null, 2)}\n`;

export const buildAgentContractVersionJson = () =>
  `${JSON.stringify({ contract_version: publicApiVersion }, null, 2)}\n`;

const canonicalizeJson = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => canonicalizeJson(item));
  }
  if (value === null || typeof value !== "object") {
    return value;
  }
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => [key, canonicalizeJson(item)]),
  );
};

export const buildMcpToolManifest = () => {
  const tools = publicApiSdkResources.flatMap((resource) =>
    resource.operations.map((operation) => {
      const contract = publicApiMcpOperationContractMap.get(
        operation.operationId,
      );
      if (!contract) {
        throw new Error(
          `MCP contract for ${operation.operationId} is not defined.`,
        );
      }
      return {
        name: operation.mcpToolName,
        operationId: operation.operationId,
        summary: operation.summary,
        description: operation.description,
        method: operation.method,
        path: operation.path,
        requiredScopes: operation.requiredScopes,
        risk: operation.risk,
        externalSideEffect: operation.externalSideEffect,
        sideEffectClass: operation.sideEffectClass,
        retryMode: operation.retryMode,
        idempotencyPolicy: operation.idempotencyPolicy,
        toolsets: operation.toolsets,
        annotations: operation.annotations,
        riskRationale: operation.riskRationale,
        requestBodyRequired: operation.requestBodyRequired,
        inputSchema: contract.inputSchema,
        outputSchema: contract.outputSchema,
      };
    }),
  );
  const schemaDigest = `sha256:${createHash("sha256")
    .update(
      JSON.stringify(
        canonicalizeJson(
          tools.map((tool) => ({
            name: tool.name,
            inputSchema: tool.inputSchema,
            outputSchema: tool.outputSchema,
          })),
        ),
      ),
    )
    .digest("hex")}`;

  return {
    name: "mailrith",
    manifestVersion: "1",
    contractVersion: publicApiVersion,
    schemaDigest,
    errorCategories: publicApiMcpErrorCategories,
    toolsets: publicApiMcpToolsets,
    tools,
  };
};

export const buildMcpToolManifestModule = () => `${generatedAgentArtifactsNotice}
export const generatedMailrithMcpToolManifest = ${JSON.stringify(
  buildMcpToolManifest(),
  null,
  2,
)} as const;
`;

const main = async () => {
  await writeGeneratedFile(
    "packages/sdk/src/generated.ts",
    buildTypeScriptSdkManifest(),
  );
  await writeGeneratedFile(
    "packages/python-sdk/mailrith_sdk/manifest.json",
    buildPythonSdkManifestJson(),
  );
  await writeGeneratedFile(
    "packages/python-sdk/mailrith_sdk/contract.json",
    buildAgentContractVersionJson(),
  );
  await writeGeneratedFile(
    "packages/mcp-server/src/generated-tool-manifest.ts",
    buildMcpToolManifestModule(),
  );
};

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
