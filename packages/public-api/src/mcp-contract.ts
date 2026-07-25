import {
  publicApiWorkProfiles,
  type PublicApiScopeKey,
  type PublicApiWorkProfileKey,
} from "./resource-contract.js";
import type {
  PublicApiAgentOperationRisk,
} from "./agent-risk.js";

export type PublicApiMcpToolsetKey = PublicApiWorkProfileKey;

export const publicApiMcpToolsetKeys = publicApiWorkProfiles.map(
  (profile) => profile.key,
) as PublicApiMcpToolsetKey[];

export type PublicApiMcpToolset = {
  key: PublicApiMcpToolsetKey;
  label: string;
  description: string;
  scopeKeys: readonly PublicApiScopeKey[];
};

export const publicApiMcpToolsets = publicApiWorkProfiles.map((profile) => ({
  key: profile.key,
  label: profile.label,
  description: profile.description,
  scopeKeys: profile.scopeKeys,
})) satisfies readonly PublicApiMcpToolset[];

const publicApiMcpToolsetScopeMap = new Map(
  publicApiMcpToolsets.map((toolset) => [
    toolset.key,
    new Set<string>(toolset.scopeKeys),
  ]),
);

export const isPublicApiMcpToolsetKey = (
  value: string,
): value is PublicApiMcpToolsetKey =>
  publicApiMcpToolsetScopeMap.has(value as PublicApiMcpToolsetKey);

export const resolvePublicApiMcpToolsets = (
  requiredScopes: readonly string[],
): PublicApiMcpToolsetKey[] =>
  publicApiMcpToolsets
    .filter((toolset) => {
      const toolsetScopes = publicApiMcpToolsetScopeMap.get(toolset.key);
      return requiredScopes.every((scope) => toolsetScopes?.has(scope));
    })
    .map((toolset) => toolset.key);

export type PublicApiMcpToolAnnotations = {
  readOnlyHint: boolean;
  destructiveHint: boolean;
  idempotentHint: boolean;
  openWorldHint: boolean;
};

export const createPublicApiMcpToolAnnotations = (
  risk: Pick<
    PublicApiAgentOperationRisk,
    "risk" | "externalSideEffect" | "idempotencyPolicy"
  >,
): PublicApiMcpToolAnnotations => ({
  readOnlyHint: risk.risk === "read",
  destructiveHint: risk.risk === "delete",
  idempotentHint: risk.idempotencyPolicy !== "idempotency-key",
  openWorldHint: risk.externalSideEffect,
});

export const publicApiMcpErrorCategories = [
  "validation",
  "authentication",
  "permission",
  "conflict",
  "rate_limit",
  "transient",
  "unknown",
] as const;

export type PublicApiMcpErrorCategory =
  (typeof publicApiMcpErrorCategories)[number];

export type PublicApiMcpOperationContract = {
  operationId: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
};

type OpenApiParameter = {
  name: string;
  in: "query" | "path" | "header";
  required?: boolean;
  description: string;
  schema: Record<string, unknown>;
};

type OpenApiOperation = {
  operationId: string;
  parameters?: OpenApiParameter[];
  requestBody?: {
    required?: boolean;
    content: Record<string, { schema: Record<string, unknown> }>;
  };
  responses: Record<
    string,
    {
      content?: Record<string, { schema: Record<string, unknown> }>;
    }
  >;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

class JsonSchemaDocumentBuilder {
  private readonly definitions: Record<string, Record<string, unknown>> = {};

  constructor(
    private readonly componentSchemas: Record<
      string,
      Record<string, unknown>
    >,
  ) {}

  private addComponentReference(name: string) {
    const source = this.componentSchemas[name];
    if (!source) {
      throw new Error(`OpenAPI component schema ${name} is not defined.`);
    }
    if (Object.prototype.hasOwnProperty.call(this.definitions, name)) {
      return;
    }
    this.definitions[name] = {};
    this.definitions[name] = this.normalize(source) as Record<string, unknown>;
  }

  normalize(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map((item) => this.normalize(item));
    }
    if (!isRecord(value)) {
      return value;
    }

    const normalized: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      if (key === "nullable") {
        continue;
      }
      if (key === "$ref" && typeof item === "string") {
        const match = item.match(/^#\/components\/schemas\/([^/]+)$/);
        if (match?.[1]) {
          this.addComponentReference(match[1]);
          normalized.$ref = `#/$defs/${match[1]}`;
          continue;
        }
      }
      normalized[key] = this.normalize(item);
    }

    if (value.example !== undefined && normalized.examples === undefined) {
      normalized.examples = [this.normalize(value.example)];
    }

    if (value.nullable === true) {
      return {
        anyOf: [normalized, { type: "null" }],
      };
    }

    return normalized;
  }

  build(root: Record<string, unknown>): Record<string, unknown> {
    const normalized = this.normalize(root);
    if (!isRecord(normalized)) {
      throw new Error("An MCP schema root must be a JSON Schema object.");
    }
    if (Object.keys(this.definitions).length === 0) {
      return normalized;
    }
    return {
      ...normalized,
      $defs: this.definitions,
    };
  }
}

const mcpHeaderParameterNames: Record<string, string> = {
  "idempotency-key": "idempotency_key",
};

const toMcpParameterName = (parameter: OpenApiParameter) =>
  parameter.in === "header"
    ? (mcpHeaderParameterNames[parameter.name.toLowerCase()] ?? parameter.name)
    : parameter.name;

const withParameterDescription = (
  schema: unknown,
  description: string,
): Record<string, unknown> => ({
  ...(isRecord(schema) ? schema : {}),
  description,
});

export const createPublicApiMcpOperationContract = (
  operation: OpenApiOperation,
  componentSchemas: Record<string, Record<string, unknown>>,
): PublicApiMcpOperationContract => {
  const inputBuilder = new JsonSchemaDocumentBuilder(componentSchemas);
  const inputProperties: Record<string, unknown> = {};
  const requiredInputNames = new Set<string>();

  for (const parameter of operation.parameters ?? []) {
    const inputName = toMcpParameterName(parameter);
    inputProperties[inputName] = withParameterDescription(
      inputBuilder.normalize(parameter.schema),
      parameter.description,
    );
    if (parameter.in === "path" || parameter.required) {
      requiredInputNames.add(inputName);
    }
  }

  if (operation.requestBody) {
    const bodySchema = operation.requestBody.content["application/json"]?.schema;
    if (!bodySchema) {
      throw new Error(
        `Public API operation ${operation.operationId} has no JSON request schema.`,
      );
    }
    inputProperties.body = withParameterDescription(
      inputBuilder.normalize(bodySchema),
      "The exact JSON request body defined by the Mailrith public API contract.",
    );
    if (operation.requestBody.required) {
      requiredInputNames.add("body");
    }
  }

  const inputSchema = inputBuilder.build({
    type: "object",
    additionalProperties: false,
    properties: inputProperties,
    ...(requiredInputNames.size > 0
      ? { required: [...requiredInputNames] }
      : {}),
  });

  const outputBuilder = new JsonSchemaDocumentBuilder(componentSchemas);
  const successfulResponseSchemas = Object.entries(operation.responses)
    .filter(([status]) => /^2\d\d$/.test(status))
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, response]) => {
      const responseSchema = response.content?.["application/json"]?.schema;
      return responseSchema
        ? outputBuilder.normalize(responseSchema)
        : { type: "null" };
    });
  const responseSchema =
    successfulResponseSchemas.length === 1
      ? successfulResponseSchemas[0]
      : { anyOf: successfulResponseSchemas };

  const outputSchema = outputBuilder.build({
    type: "object",
    additionalProperties: false,
    required: ["operation_id", "request_id"],
    anyOf: [{ required: ["response"] }, { required: ["error"] }],
    properties: {
      operation_id: {
        type: "string",
        const: operation.operationId,
        description: "The stable Mailrith public API operation ID.",
      },
      request_id: {
        type: "string",
        pattern: "^mcp_[0-9a-f-]{36}$",
        description: "The stable correlation ID for this MCP tool invocation.",
      },
      response: responseSchema,
      error: {
        type: "object",
        additionalProperties: false,
        required: [
          "category",
          "status",
          "code",
          "message",
          "retryable",
        ],
        properties: {
          category: {
            type: "string",
            enum: publicApiMcpErrorCategories,
          },
          status: {
            anyOf: [{ type: "integer" }, { type: "null" }],
          },
          code: { type: "string" },
          message: { type: "string" },
          retryable: { type: "boolean" },
          required_scopes: {
            type: "array",
            maxItems: 50,
            items: { type: "string" },
          },
          missing_scopes: {
            type: "array",
            maxItems: 50,
            items: { type: "string" },
          },
          replacement_scopes: {
            type: "array",
            maxItems: 50,
            items: { type: "string" },
          },
          credential_type: {
            type: "string",
            enum: ["workspace_api_key", "oauth_access_token"],
          },
          recommended_work_profiles: {
            type: "array",
            maxItems: 20,
            items: { type: "string" },
          },
          access_update_url: { type: "string", format: "uri" },
          reconnect_required: { type: "boolean" },
          permissions_help_url: { type: "string", format: "uri" },
          recovery: {
            type: "object",
            additionalProperties: false,
            required: ["action", "message"],
            properties: {
              action: {
                type: "string",
                enum: ["replace_api_key", "reconnect_oauth"],
              },
              message: { type: "string" },
              replacement_scopes: {
                type: "array",
                maxItems: 50,
                items: { type: "string" },
              },
              access_update_url: { type: "string", format: "uri" },
              permissions_help_url: { type: "string", format: "uri" },
            },
          },
          details: {
            type: "object",
            additionalProperties: false,
            properties: {
              field: { type: "string" },
              reason: { type: "string" },
              resource: {
                type: "object",
                additionalProperties: false,
                required: ["type", "id"],
                properties: {
                  type: { type: "string" },
                  id: { type: "string" },
                },
              },
            },
          },
          issues: {
            type: "array",
            maxItems: 20,
            items: {
              type: "object",
              additionalProperties: false,
              required: ["path", "code", "message"],
              properties: {
                path: { type: "string" },
                code: { type: "string" },
                message: { type: "string" },
              },
            },
          },
          prerequisite: {
            type: "object",
            additionalProperties: false,
            required: ["resource", "state"],
            properties: {
              resource: { type: "string" },
              state: {
                type: "string",
                enum: ["missing", "disabled"],
              },
              required_scopes: {
                type: "array",
                maxItems: 50,
                items: { type: "string" },
              },
              work_profile: { type: "string" },
              setup_url: { type: "string", format: "uri" },
            },
          },
          retry: {
            type: "object",
            additionalProperties: false,
            required: ["safe", "guidance"],
            properties: {
              safe: { type: "boolean" },
              guidance: { type: "string" },
            },
          },
        },
      },
    },
  });

  return {
    operationId: operation.operationId,
    inputSchema,
    outputSchema,
  };
};
