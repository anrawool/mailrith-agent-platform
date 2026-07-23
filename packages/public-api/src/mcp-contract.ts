import {
  publicApiScopePresetByKey,
  type PublicApiScopeKey,
} from "./scopes.js";
import type {
  PublicApiAgentOperationRisk,
} from "./agent-risk.js";

export const publicApiMcpToolsetKeys = [
  "reporting",
  "subscriber_sync",
  "data_transfer",
  "content_and_targeting",
  "capture",
  "broadcast_preparation",
  "broadcast_sending",
  "sequence_preparation",
  "sequence_operations",
  "automations",
  "webhooks",
  "administration",
] as const;

export type PublicApiMcpToolsetKey =
  (typeof publicApiMcpToolsetKeys)[number];

export type PublicApiMcpToolset = {
  key: PublicApiMcpToolsetKey;
  label: string;
  description: string;
  scopeKeys: readonly PublicApiScopeKey[];
};

const presetScopes = (
  key:
    | "reporting"
    | "subscriber_sync"
    | "content_and_targeting"
    | "capture_management"
    | "broadcast_preparation"
    | "broadcast_sending"
    | "sequence_preparation"
    | "sequence_operations"
    | "automation_management"
    | "webhook_management"
    | "data_transfer"
    | "full_administration",
) => publicApiScopePresetByKey.get(key)?.scopeKeys ?? [];

export const publicApiMcpToolsets = [
  {
    key: "reporting",
    label: "Reporting",
    description:
      "Read workspace, Subscriber, content, workflow, and delivery information without changing it.",
    scopeKeys: presetScopes("reporting"),
  },
  {
    key: "subscriber_sync",
    label: "Subscriber Sync",
    description:
      "Manage individual Subscriber profiles, status, Tags, deletion, and custom fields.",
    scopeKeys: presetScopes("subscriber_sync"),
  },
  {
    key: "data_transfer",
    label: "Subscriber Import & Export",
    description:
      "Run bounded Subscriber imports and exports and monitor their jobs.",
    scopeKeys: presetScopes("data_transfer"),
  },
  {
    key: "content_and_targeting",
    label: "Templates, Tags, Fields & Segments",
    description:
      "Manage email templates, Tags, custom fields, and Segments.",
    scopeKeys: presetScopes("content_and_targeting"),
  },
  {
    key: "capture",
    label: "Forms, Landing Pages & Magic Links",
    description:
      "Manage Forms, Landing Pages, Magic Links, and their Subscriber capture data.",
    scopeKeys: presetScopes("capture_management"),
  },
  {
    key: "broadcast_preparation",
    label: "Broadcast Preparation",
    description:
      "Create, change, check, and delete Broadcast drafts without sending email.",
    scopeKeys: presetScopes("broadcast_preparation"),
  },
  {
    key: "broadcast_sending",
    label: "Broadcast Sending",
    description: "Review, test, send, monitor, and stop Broadcasts.",
    scopeKeys: presetScopes("broadcast_sending"),
  },
  {
    key: "sequence_preparation",
    label: "Sequence Preparation",
    description:
      "Create, change, and delete paused Sequences without activating them or enrolling Subscribers.",
    scopeKeys: presetScopes("sequence_preparation"),
  },
  {
    key: "sequence_operations",
    label: "Sequence Operations",
    description:
      "Activate or pause Sequences and add or remove individual Subscribers.",
    scopeKeys: presetScopes("sequence_operations"),
  },
  {
    key: "automations",
    label: "Automations",
    description: "Create, change, activate, pause, delete, and inspect Automations.",
    scopeKeys: presetScopes("automation_management"),
  },
  {
    key: "webhooks",
    label: "Outbound Webhook Setup",
    description:
      "Create, change, rotate secrets for, and delete outbound webhook subscriptions.",
    scopeKeys: presetScopes("webhook_management"),
  },
  {
    key: "administration",
    label: "Administration",
    description:
      "Use the complete public API surface, including bulk, deletion, and webhook administration.",
    scopeKeys: presetScopes("full_administration"),
  },
] as const satisfies readonly PublicApiMcpToolset[];

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
