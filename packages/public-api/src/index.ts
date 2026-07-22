import { publicApiScopeDefinitions } from "./scopes.js";
import type { PublicApiScopeKey } from "./scopes.js";
import { getPublicApiAgentOperationRisk } from "./agent-risk.js";
import {
  createPublicApiMcpOperationContract,
  createPublicApiMcpToolAnnotations,
  resolvePublicApiMcpToolsets,
} from "./mcp-contract.js";
import type {
  PublicApiAgentApprovalPolicy,
  PublicApiAgentIdempotencyPolicy,
  PublicApiAgentRetryMode,
  PublicApiAgentRiskClass,
  PublicApiAgentSideEffectClass,
} from "./agent-risk.js";
import type {
  PublicApiMcpToolAnnotations,
  PublicApiMcpToolsetKey,
} from "./mcp-contract.js";

export {
  getPublicApiAgentOperationRisk,
  publicApiAgentApprovalPolicies,
  publicApiAgentDataScopes,
  publicApiAgentIdempotencyPolicies,
  publicApiAgentOperationRiskCatalog,
  publicApiAgentRetryModes,
  publicApiAgentRiskClasses,
  publicApiAgentSideEffectClasses,
} from "./agent-risk.js";
export type {
  PublicApiAgentApprovalPolicy,
  PublicApiAgentDataScope,
  PublicApiAgentIdempotencyPolicy,
  PublicApiAgentOperationRisk,
  PublicApiAgentRetryMode,
  PublicApiAgentRiskClass,
  PublicApiAgentSideEffectClass,
} from "./agent-risk.js";

export {
  createPublicApiMcpOperationContract,
  createPublicApiMcpToolAnnotations,
  isPublicApiMcpToolsetKey,
  publicApiMcpErrorCategories,
  publicApiMcpToolsetKeys,
  publicApiMcpToolsets,
  resolvePublicApiMcpToolsets,
} from "./mcp-contract.js";
export type {
  PublicApiMcpErrorCategory,
  PublicApiMcpOperationContract,
  PublicApiMcpToolAnnotations,
  PublicApiMcpToolset,
  PublicApiMcpToolsetKey,
} from "./mcp-contract.js";

export {
  hasHighImpactPublicApiScope,
  isPublicApiScopeKey,
  normalizePublicApiScopeKeys,
  validatePublicApiScopeKeys,
  publicApiDefaultScopeKeys,
  publicApiReadScopeKeys,
  publicApiScopeDefinitionByKey,
  publicApiScopeDefinitions,
  publicApiScopeKeys,
  publicApiScopePresetByKey,
  publicApiScopePresets,
} from "./scopes.js";
export type {
  PublicApiScopeAction,
  PublicApiScopeDefinition,
  PublicApiScopeKey,
  PublicApiScopePreset,
  PublicApiScopePresetKey,
} from "./scopes.js";

export type PublicApiSection = {
  id: string;
  title: string;
  body: string[];
};

export type PublicApiOperation = {
  method: string;
  path: string;
  summary: string;
  description: string;
  tags: string[];
  operationId: string;
  security?: Array<Record<string, string[]>>;
  parameters?: Array<{
    name: string;
    in: "query" | "path" | "header";
    required?: boolean;
    description: string;
    schema: Record<string, unknown>;
  }>;
  requestBody?: {
    required?: boolean;
    content: Record<string, { schema: Record<string, unknown> }>;
  };
  responses: Record<
    string,
    {
      description: string;
      content?: Record<string, { schema: Record<string, unknown> }>;
    }
  >;
  "x-mailrith-payload-field-scopes"?: Record<string, readonly string[]>;
};

export type PublicApiPayloadFieldScopeRequirements = {
  description: string;
  requiredScopesByField: Record<string, readonly PublicApiScopeKey[]>;
};

export type PublicApiTagDefinition = {
  name: string;
  description: string;
};

export type PublicApiSpec = {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  servers: Array<{ url: string; description: string }>;
  tags: PublicApiTagDefinition[];
  paths: Record<string, Record<string, PublicApiOperation>>;
  components: {
    securitySchemes: Record<string, Record<string, unknown>>;
    schemas: Record<string, Record<string, unknown>>;
  };
};

export type PublicApiCapabilityOperation = {
  method: string;
  path: string;
  operationId: string;
  summary: string;
  description?: string;
  requiredScopes: string[];
  eventPatternScopeRequirements?: PublicApiWebhookEventPatternScopeRequirements;
  payloadFieldScopeRequirements?: PublicApiPayloadFieldScopeRequirements;
};

export const publicApiSubscriberPayloadFieldScopeRequirements = {
  description:
    "Subscriber relationship fields require their matching granular permission in addition to the operation's base permissions.",
  requiredScopesByField: {
    status: ["subscribers:eligibility", "consent:write"],
    existing_tag_ids: ["subscribers:targeting"],
    new_tags: ["subscribers:targeting"],
    form_id: ["subscribers:targeting"],
    sequence_ids: ["subscribers:sequence_enroll"],
    consent_evidence: ["consent:write"],
  },
} as const satisfies PublicApiPayloadFieldScopeRequirements;

export type PublicApiCapabilityResource = {
  key: string;
  name: string;
  description: string;
  operations: PublicApiCapabilityOperation[];
};

export type PublicApiWebhookEventPatternScopeRequirements = {
  requestField: "event_patterns";
  description: string;
  requiredScopesByEventPattern: Record<
    PublicApiWebhookEventPattern,
    PublicApiScopeKey[]
  >;
};

export const emailTemplateNameMaxLength = 160;
export const emailTemplateBodyDocumentMaxBytes = 500 * 1024;

const dateTimeSchema = {
  type: "string",
  format: "date-time",
};

const nullableDateTimeSchema = {
  ...dateTimeSchema,
  nullable: true,
};

const stringArraySchema = {
  type: "array",
  items: { type: "string" },
};

const formDefinitionPropertiesSchema = {
  display: {
    type: "object",
    additionalProperties: true,
  },
  builder: {
    type: "object",
    additionalProperties: true,
  },
};

const formDefinitionSchema = {
  type: "object",
  description:
    "Builder-backed form definition. Field and style data live under the builder payload.",
  required: ["builder"],
  properties: formDefinitionPropertiesSchema,
  additionalProperties: false,
};

const formUpsertDefinitionSchema = {
  ...formDefinitionSchema,
  description:
    "Builder-backed form definition. Include display and builder data only; field and style data must live inside the builder payload.",
};

const subscriberCountrySchema = {
  type: "string",
  nullable: true,
  description:
    "Two-letter country code or country name. Mailrith stores Subscriber country as a two-letter country code.",
};

const workspaceCountrySchema = {
  type: "string",
  nullable: true,
  description: "Country for the workspace address.",
};

const baseHeadersSchema = {
  type: "object",
  properties: {
    "Content-Type": { type: "string", example: "application/json" },
    Authorization: { type: "string", example: "Bearer mrk_example_secret_key" },
  },
};

export const publicApiVersion = "v1";
export const publicApiBasePath = `/${publicApiVersion}`;
export const publicApiDocsPath = "/developers";
export const publicApiAgentsPath = "/developers/agents";
export const publicApiSdkDocsPath = "/developers/sdks";
export const publicApiMcpDocsPath = "/developers/mcp";
export const publicApiMcpPath = "/mcp";
export const publicApiReferencePath = "/developers/api-reference";
export const publicApiOAuthWellKnownPath =
  "/.well-known/oauth-authorization-server";
export const publicApiOpenIdConfigurationPath =
  "/.well-known/openid-configuration";
export const publicApiOAuthProtectedResourcePath =
  "/.well-known/oauth-protected-resource";
export const publicApiMcpOAuthProtectedResourcePath = `${publicApiOAuthProtectedResourcePath}${publicApiMcpPath}`;
export const publicApiOAuthAuthorizePath = "/oauth/authorize";
export const publicApiOAuthTokenPath = "/oauth/token";
export const publicApiOAuthRevokePath = "/oauth/revoke";
export const publicApiOAuthRegisterPath = "/oauth/register";
export const publicApiOpenApiPath = `${publicApiBasePath}/openapi.json`;
export const publicApiCapabilitiesPath = `${publicApiBasePath}/capabilities`;
export const publicApiWebhookSubscriptionsPath = `${publicApiBasePath}/webhook-subscriptions`;
export const publicApiLlmsPath = "/llms.txt";
export const publicApiLlmsFullPath = "/llms-full.txt";
export const publicApiCatalogPath = "/.well-known/api-catalog";
export const publicApiAgentStatusPath = "/.well-known/agent-status.json";
export const publicApiMcpServerCardPath =
  "/.well-known/mcp/server-card.json";
export const publicApiAgentSkillsIndexPath =
  "/.well-known/agent-skills/index.json";
export const publicApiAgentSkillPath =
  "/.well-known/agent-skills/mailrith-api/SKILL.md";

export const publicApiGuides: PublicApiSection[] = [
  {
    id: "quickstart",
    title: "Quickstart",
    body: [
      "Call the versioned API with `Authorization: Bearer <credential>`. Use either a workspace API key or an OAuth access token issued to an approved client.",
      "The public `v1` API supports subscriber sync and core Mailrith control plane resources: broadcasts, templates, sequences, automations, magic links, forms, landing pages, and async subscriber jobs.",
    ],
  },
  {
    id: "authentication",
    title: "Authentication",
    body: [
      "Every protected `v1` request must use a workspace-scoped bearer credential.",
      "Send `Authorization: Bearer <credential>` with every protected request.",
      "Use workspace API keys for direct integrations that store and manage their own secrets.",
      "Approved OAuth clients can discover Mailrith's delegated authorization server at `/.well-known/oauth-authorization-server`.",
      "Use the OAuth discovery and token exchange endpoints when an integration needs delegated bearer credentials instead of long-lived API keys.",
      "OAuth authorization and dynamic client registration reject the full request when any requested scope is not listed in the server metadata.",
    ],
  },
  {
    id: "pagination",
    title: "Pagination",
    body: [
      "List endpoints return a `pagination` block that includes `has_more` and `next_cursor`.",
      "Treat `next_cursor` as an opaque cursor. To request the next page, send that cursor as `starting_after`.",
    ],
  },
  {
    id: "errors",
    title: "Errors",
    body: [
      "Non-2xx API responses use a stable error envelope with `type`, `code`, and `message` fields.",
      "Validation failures return `400`, authentication failures return `401`, missing resources return `404`, and duplicate or conflict cases return `409`.",
    ],
  },
  {
    id: "idempotency",
    title: "Idempotency",
    body: [
      "Asynchronous job creation endpoints accept an `Idempotency-Key` header so callers can safely retry requests after network failures.",
      "When a caller reuses the same key with the same request body, Mailrith returns the original successful job response.",
    ],
  },
  {
    id: "webhooks",
    title: "Webhooks",
    body: [
      "Create `v1` webhook subscriptions to receive signed events for subscriber changes, form submissions, landing page submissions, broadcast state changes, and automation lifecycle activity.",
      "Mailrith signs every webhook delivery with `webhook-id`, `webhook-timestamp`, and `webhook-signature` headers. The signature uses an HMAC-SHA256 signing secret that Mailrith returns once when the subscription is created.",
      "Current webhook events include subscriber.created, subscriber.updated, subscriber.status_changed, form.submitted, landing_page.submitted, broadcast state changes, and automation lifecycle events.",
      "Dedicated Subscriber compliance events are subscriber.consent_withdrawn, subscriber.erasure_requested, subscriber.erasure_completed, subscriber.processing_restricted, subscriber.objection_recorded, and subscriber.privacy_request_completed. These payloads contain stable IDs and compact references, not email addresses or raw technical evidence.",
    ],
  },
  {
    id: "versioning",
    title: "Versioning",
    body: [
      "Public API URLs include the version in the path. New breaking changes ship in a new top-level version instead of changing `v1` behavior without notice.",
      "The initial public release is available only on the versioned `v1` API.",
    ],
  },
];

export const publicApiWebhookEventTypes = [
  "subscriber.created",
  "subscriber.updated",
  "subscriber.status_changed",
  "subscriber.consent_withdrawn",
  "subscriber.erasure_requested",
  "subscriber.erasure_completed",
  "subscriber.processing_restricted",
  "subscriber.objection_recorded",
  "subscriber.privacy_request_completed",
  "form.submitted",
  "landing_page.submitted",
  "broadcast.state_changed",
  "automation.entered",
  "automation.step_executed",
  "automation.completed",
] as const;

export type PublicApiWebhookEventType =
  (typeof publicApiWebhookEventTypes)[number];

export const publicApiWebhookWildcardPatterns = [
  "*",
  "subscriber.*",
  "form.*",
  "landing_page.*",
  "broadcast.*",
  "automation.*",
] as const;

export type PublicApiWebhookWildcardPattern =
  (typeof publicApiWebhookWildcardPatterns)[number];

export type PublicApiWebhookEventPattern =
  | PublicApiWebhookEventType
  | PublicApiWebhookWildcardPattern;

export const publicApiWebhookEventPatternValues = [
  ...publicApiWebhookWildcardPatterns,
  ...publicApiWebhookEventTypes,
] as const satisfies readonly PublicApiWebhookEventPattern[];

const publicApiWebhookEventPatternSet = new Set<string>(
  publicApiWebhookEventPatternValues,
);

export const isPublicApiWebhookEventPattern = (
  value: string,
): value is PublicApiWebhookEventPattern =>
  publicApiWebhookEventPatternSet.has(value);

const publicApiWebhookEventRequiredScopes = {
  "subscriber.created": ["subscribers:read"],
  "subscriber.updated": ["subscribers:read"],
  "subscriber.status_changed": ["subscribers:read"],
  "subscriber.consent_withdrawn": ["consent:read"],
  "subscriber.erasure_requested": ["consent:read"],
  "subscriber.erasure_completed": ["consent:read"],
  "subscriber.processing_restricted": ["consent:read"],
  "subscriber.objection_recorded": ["consent:read"],
  "subscriber.privacy_request_completed": ["consent:read"],
  "form.submitted": ["forms:read", "subscribers:read"],
  "landing_page.submitted": ["landing_pages:read", "subscribers:read"],
  "broadcast.state_changed": ["broadcasts:read"],
  "automation.entered": ["automations:read", "subscribers:read"],
  "automation.step_executed": ["automations:read", "subscribers:read"],
  "automation.completed": ["automations:read", "subscribers:read"],
} as const satisfies Record<
  PublicApiWebhookEventType,
  readonly PublicApiScopeKey[]
>;

export const getPublicApiWebhookEventPatternRequiredScopes = (
  eventPatterns: readonly PublicApiWebhookEventPattern[],
): PublicApiScopeKey[] => {
  const requiredScopes = new Set<PublicApiScopeKey>();
  for (const eventPattern of eventPatterns) {
    const matchingEventTypes =
      eventPattern === "*"
        ? publicApiWebhookEventTypes
        : eventPattern.endsWith(".*")
          ? publicApiWebhookEventTypes.filter((eventType) =>
              eventType.startsWith(eventPattern.slice(0, -1)),
            )
          : [eventPattern as PublicApiWebhookEventType];
    for (const eventType of matchingEventTypes) {
      for (const scope of publicApiWebhookEventRequiredScopes[eventType]) {
        requiredScopes.add(scope);
      }
    }
  }
  return publicApiScopeDefinitions
    .map((definition) => definition.key)
    .filter((scopeKey) => requiredScopes.has(scopeKey));
};

export const publicApiWebhookEventPatternScopeRequirements = {
  requestField: "event_patterns",
  description:
    "When creating or updating a webhook subscription, each selected event pattern requires these read scopes in addition to `webhook_subscriptions:configure`.",
  requiredScopesByEventPattern: Object.fromEntries(
    publicApiWebhookEventPatternValues.map((eventPattern) => [
      eventPattern,
      getPublicApiWebhookEventPatternRequiredScopes([eventPattern]),
    ]),
  ) as Record<PublicApiWebhookEventPattern, PublicApiScopeKey[]>,
} satisfies PublicApiWebhookEventPatternScopeRequirements;

export const publicApiWebhookSignatureHeaders = {
  id: "webhook-id",
  timestamp: "webhook-timestamp",
  signature: "webhook-signature",
  signaturePrefix: "v1",
} as const;

export const publicApiTags: PublicApiTagDefinition[] = [
  {
    name: "Platform",
    description:
      "Version metadata, discovery URLs, capability discovery, and the machine-readable OpenAPI document.",
  },
  {
    name: "Workspace",
    description:
      "Read the current authenticated workspace profile and execution context.",
  },
  {
    name: "Agent Actions",
    description:
      "Inspect server-enforced action plans and claim one-time execution tokens after human approval.",
  },
  {
    name: "Analytics",
    description: "Run bounded aggregate delivery and engagement reports.",
  },
  {
    name: "Diagnostics",
    description: "Inspect bounded workflow and delivery diagnostics.",
  },
  {
    name: "Consent And Privacy Events",
    description: "Record minimal Subscriber consent and privacy evidence.",
  },
  {
    name: "Recommendations",
    description: "Create evidence-backed, non-executing recommendations.",
  },
  {
    name: "Experiments",
    description: "Define safeguarded, recommendation-only experiments.",
  },
  {
    name: "Subscribers",
    description:
      "Create or upsert subscribers and list subscriber records in a workspace.",
  },
  {
    name: "Tags",
    description:
      "Read and create subscriber tags used for targeting, automation, and imports.",
  },
  {
    name: "Custom Fields",
    description:
      "Read and manage the typed custom-field schema available to the authenticated workspace.",
  },
  {
    name: "Email Templates",
    description:
      "Create and manage reusable email templates for the authenticated workspace.",
  },
  {
    name: "Forms",
    description:
      "Read and manage embeddable form definitions and presentation settings.",
  },
  {
    name: "Landing Pages",
    description:
      "Read and manage hosted landing pages, page definitions, and public URLs.",
  },
  {
    name: "Sequences",
    description:
      "Create and manage email sequences, sequence status, and delivery configuration.",
  },
  {
    name: "Automations",
    description:
      "Create and manage automation definitions and lifecycle state.",
  },
  {
    name: "Magic Links",
    description:
      "Create and manage magic links used in broadcasts, sequences, and automations.",
  },
  {
    name: "Broadcasts",
    description:
      "Create, schedule, test, send, and inspect one-off broadcasts.",
  },
  {
    name: "Segments",
    description: "Read saved segments and preview dynamic segment definitions.",
  },
  {
    name: "Jobs",
    description:
      "Create and inspect asynchronous subscriber import and export jobs.",
  },
  {
    name: "Webhooks",
    description:
      "Create and manage outbound webhook subscriptions for Mailrith events and signed event delivery.",
  },
];

export const publicApiCapabilityResources: PublicApiCapabilityResource[] = [
  {
    key: "workspace",
    name: "Workspace",
    description:
      "Read the current authenticated workspace profile, mailing context, and stable workspace identifier.",
    operations: [
      {
        method: "GET",
        path: "/v1/workspace",
        operationId: "getWorkspace",
        summary: "Get the current workspace",
        requiredScopes: ["workspace:read"],
      },
    ],
  },
  {
    key: "agent_actions",
    name: "Agent Actions",
    description:
      "Inspect an action plan and claim its one-time execution token after a workspace owner approves it.",
    operations: [
      {
        method: "GET",
        path: "/v1/agent-actions/{action_id}",
        operationId: "getAgentAction",
        summary: "Get an agent action plan",
        requiredScopes: ["approvals:read"],
      },
      {
        method: "POST",
        path: "/v1/agent-actions/{action_id}/approval-token",
        operationId: "issueAgentApprovalToken",
        summary: "Claim an approved action token",
        requiredScopes: ["approvals:write"],
      },
    ],
  },
  {
    key: "agent_activity",
    name: "Agent Activity",
    description:
      "Inspect the bounded, redacted activity trail for agent-originated workspace changes.",
    operations: [
      {
        method: "GET",
        path: "/v1/agent-activity",
        operationId: "listAgentActivity",
        summary: "List agent activity",
        requiredScopes: ["activity:read"],
      },
      {
        method: "GET",
        path: "/v1/agent-activity/{activity_id}",
        operationId: "getAgentActivity",
        summary: "Get agent activity",
        requiredScopes: ["activity:read"],
      },
    ],
  },
  {
    key: "analytics",
    name: "Analytics",
    description:
      "Run bounded aggregate reports from compact daily rollups, with explicit metric definitions and previous-period comparisons.",
    operations: [
      {
        method: "POST",
        path: "/v1/analytics/reports",
        operationId: "createAnalyticsReport",
        summary: "Create or reuse an analytics report",
        requiredScopes: ["analytics:read"],
      },
      {
        method: "GET",
        path: "/v1/analytics/reports/{report_id}",
        operationId: "getAnalyticsReport",
        summary: "Get an analytics report",
        description: "Returns one unexpired bounded analytics report by identifier.",
        requiredScopes: ["analytics:read"],
      },
    ],
  },
  {
    key: "diagnostics",
    name: "Diagnostics",
    description:
      "Inspect bounded, privacy-conscious execution, delivery, suppression, consent, and engagement diagnostics.",
    operations: [
      {
        method: "GET",
        path: "/v1/diagnostics/automations/{automation_id}/runs",
        operationId: "listAutomationRunDiagnostics",
        summary: "List Automation run diagnostics",
        description:
          "Returns at most 50 recent runs with redacted errors and bounded step execution details.",
        requiredScopes: ["diagnostics:read"],
      },
      {
        method: "GET",
        path: "/v1/diagnostics/automations/{automation_id}/runs/{run_id}",
        operationId: "getAutomationRunDiagnostics",
        summary: "Get Automation run diagnostics",
        description:
          "Returns one Automation run with status, timing, retries, outcomes, and redacted step failures.",
        requiredScopes: ["diagnostics:read"],
      },
      {
        method: "GET",
        path: "/v1/diagnostics/sequences/{sequence_id}",
        operationId: "getSequenceDiagnostics",
        summary: "Get Sequence diagnostics",
        description:
          "Returns bounded Sequence failure, retry, status, and message outcome details.",
        requiredScopes: ["diagnostics:read"],
      },
      {
        method: "GET",
        path: "/v1/diagnostics/broadcasts/{broadcast_id}",
        operationId: "getBroadcastDiagnostics",
        summary: "Get Broadcast diagnostics",
        description:
          "Returns selection totals, provider readiness, and the 20 most common structured delivery reasons.",
        requiredScopes: ["diagnostics:read"],
      },
      {
        method: "GET",
        path: "/v1/diagnostics/subscribers/{subscriber_id}",
        operationId: "getSubscriberActivityDiagnostics",
        summary: "Get privacy-conscious Subscriber diagnostics",
        description:
          "Returns a 90-day, bounded activity view without exposing the Subscriber email address.",
        requiredScopes: ["diagnostics:read", "consent:read"],
      },
    ],
  },
  {
    key: "consent",
    name: "Consent And Privacy Events",
    description:
      "Record minimal, reference-based Subscriber consent and privacy events without raw technical evidence.",
    operations: [
      {
        method: "POST",
        path: "/v1/subscribers/{subscriber_id}/compliance-events",
        operationId: "recordSubscriberComplianceEvent",
        summary: "Record a Subscriber compliance event",
        requiredScopes: ["consent:write"],
      },
    ],
  },
  {
    key: "recommendations",
    name: "Recommendations",
    description:
      "Create evidence-backed recommendations that cannot execute and must become a policy-checked action plan first.",
    operations: [
      {
        method: "GET",
        path: "/v1/recommendations",
        operationId: "listRecommendations",
        summary: "List recommendations",
        description:
          "Returns the current credential's unexpired recommendations in a bounded page.",
        requiredScopes: ["recommendations:read"],
      },
      {
        method: "POST",
        path: "/v1/recommendations",
        operationId: "createRecommendation",
        summary: "Create a recommendation",
        requiredScopes: ["recommendations:draft"],
      },
      {
        method: "GET",
        path: "/v1/recommendations/{recommendation_id}",
        operationId: "getRecommendation",
        summary: "Get a recommendation",
        description:
          "Returns one unexpired recommendation created by the current credential.",
        requiredScopes: ["recommendations:read"],
      },
      {
        method: "POST",
        path: "/v1/recommendations/{recommendation_id}/plan",
        operationId: "planRecommendation",
        summary: "Create a policy-checked action plan from a recommendation",
        requiredScopes: ["recommendations:draft", "approvals:read"],
      },
    ],
  },
  {
    key: "experiments",
    name: "Experiments",
    description:
      "Define reference-only, recommendation-only experiments with minimum samples, duration, and fixed safeguards.",
    operations: [
      {
        method: "GET",
        path: "/v1/experiments",
        operationId: "listExperiments",
        summary: "List experiments",
        description: "Returns a bounded page of reference-only experiments.",
        requiredScopes: ["experiments:read"],
      },
      {
        method: "POST",
        path: "/v1/experiments",
        operationId: "createExperiment",
        summary: "Create an experiment",
        requiredScopes: ["experiments:draft"],
      },
      {
        method: "GET",
        path: "/v1/experiments/{experiment_id}",
        operationId: "getExperiment",
        summary: "Get an experiment",
        description:
          "Returns one experiment, its fixed safeguards, and aggregate decision evidence.",
        requiredScopes: ["experiments:read"],
      },
      {
        method: "POST",
        path: "/v1/experiments/{experiment_id}/decision",
        operationId: "recordExperimentDecision",
        summary: "Record an aggregate winner decision",
        requiredScopes: ["experiments:draft"],
      },
    ],
  },
  {
    key: "subscribers",
    name: "Subscribers",
    description:
      "List subscribers in the authenticated workspace and create or upsert subscriber records by email.",
    operations: [
      {
        method: "GET",
        path: "/v1/subscribers",
        operationId: "listSubscribers",
        summary: "List subscribers",
        requiredScopes: ["subscribers:read"],
      },
      {
        method: "POST",
        path: "/v1/subscribers",
        operationId: "upsertSubscriber",
        summary: "Create or upsert a subscriber",
        requiredScopes: ["subscribers:profile"],
        payloadFieldScopeRequirements:
          publicApiSubscriberPayloadFieldScopeRequirements,
      },
      {
        method: "PATCH",
        path: "/v1/subscribers/{subscriber_id}",
        operationId: "updateSubscriber",
        summary: "Update a subscriber",
        requiredScopes: ["subscribers:profile"],
        payloadFieldScopeRequirements:
          publicApiSubscriberPayloadFieldScopeRequirements,
      },
      {
        method: "PUT",
        path: "/v1/subscribers/{subscriber_id}/status",
        operationId: "updateSubscriberStatus",
        summary: "Change Subscriber sending eligibility",
        requiredScopes: ["subscribers:eligibility", "consent:write"],
      },
      {
        method: "PUT",
        path: "/v1/subscribers/{subscriber_id}/tags/{tag_id}",
        operationId: "addSubscriberTag",
        summary: "Add a tag to a subscriber",
        requiredScopes: ["subscribers:targeting"],
      },
      {
        method: "DELETE",
        path: "/v1/subscribers/{subscriber_id}/tags/{tag_id}",
        operationId: "removeSubscriberTag",
        summary: "Remove a tag from a subscriber",
        requiredScopes: ["subscribers:targeting"],
      },
      {
        method: "PUT",
        path: "/v1/subscribers/{subscriber_id}/sequences/{sequence_id}",
        operationId: "addSubscriberSequence",
        summary: "Add a subscriber to a sequence",
        requiredScopes: ["subscribers:sequence_enroll"],
      },
      {
        method: "DELETE",
        path: "/v1/subscribers/{subscriber_id}/sequences/{sequence_id}",
        operationId: "removeSubscriberSequence",
        summary: "Remove a subscriber from a sequence",
        requiredScopes: ["subscribers:sequence_enroll"],
      },
    ],
  },
  {
    key: "tags",
    name: "Tags",
    description:
      "Read the workspace tag catalog and create tags for targeting, imports, and automation entry conditions.",
    operations: [
      {
        method: "GET",
        path: "/v1/tags",
        operationId: "listTags",
        summary: "List tags",
        requiredScopes: ["tags:read"],
      },
      {
        method: "POST",
        path: "/v1/tags",
        operationId: "createTag",
        summary: "Create a tag",
        requiredScopes: ["tags:configure"],
      },
    ],
  },
  {
    key: "custom_fields",
    name: "Custom Fields",
    description:
      "Read and manage custom-field definitions before writing subscriber custom-field values.",
    operations: [
      {
        method: "GET",
        path: "/v1/custom-fields",
        operationId: "listCustomFields",
        summary: "List custom fields",
        requiredScopes: ["custom_fields:read"],
      },
      {
        method: "POST",
        path: "/v1/custom-fields",
        operationId: "createCustomField",
        summary: "Create a custom field",
        requiredScopes: ["custom_fields:configure"],
      },
      {
        method: "GET",
        path: "/v1/custom-fields/{custom_field_id}",
        operationId: "getCustomField",
        summary: "Get a custom field",
        requiredScopes: ["custom_fields:read"],
      },
      {
        method: "PUT",
        path: "/v1/custom-fields/{custom_field_id}",
        operationId: "updateCustomField",
        summary: "Update a custom field",
        requiredScopes: ["custom_fields:configure"],
      },
      {
        method: "DELETE",
        path: "/v1/custom-fields/{custom_field_id}",
        operationId: "deleteCustomField",
        summary: "Delete a custom field",
        requiredScopes: ["custom_fields:delete"],
      },
    ],
  },
  {
    key: "email_templates",
    name: "Email Templates",
    description:
      "Create and manage reusable email templates that agents can apply across broadcasts, sequences, and automations.",
    operations: [
      {
        method: "GET",
        path: "/v1/email-templates",
        operationId: "listEmailTemplates",
        summary: "List email templates",
        requiredScopes: ["email_templates:read"],
      },
      {
        method: "POST",
        path: "/v1/email-templates",
        operationId: "createEmailTemplate",
        summary: "Create an email template",
        requiredScopes: ["email_templates:draft"],
      },
      {
        method: "GET",
        path: "/v1/email-templates/{template_id}",
        operationId: "getEmailTemplate",
        summary: "Get an email template",
        requiredScopes: ["email_templates:read"],
      },
      {
        method: "PUT",
        path: "/v1/email-templates/{template_id}",
        operationId: "updateEmailTemplate",
        summary: "Update an email template",
        requiredScopes: ["email_templates:draft"],
      },
      {
        method: "DELETE",
        path: "/v1/email-templates/{template_id}",
        operationId: "deleteEmailTemplate",
        summary: "Delete an email template",
        requiredScopes: ["email_templates:delete"],
      },
    ],
  },
  {
    key: "forms",
    name: "Forms",
    description:
      "Create and manage Mailrith-managed forms, then inspect definitions, styling payloads, and public URLs.",
    operations: [
      {
        method: "GET",
        path: "/v1/forms",
        operationId: "listForms",
        summary: "List forms",
        requiredScopes: ["forms:read"],
      },
      {
        method: "POST",
        path: "/v1/forms",
        operationId: "createForm",
        summary: "Create a form",
        requiredScopes: ["forms:configure"],
      },
      {
        method: "GET",
        path: "/v1/forms/{form_id}",
        operationId: "getForm",
        summary: "Get a form",
        requiredScopes: ["forms:read"],
      },
      {
        method: "GET",
        path: "/v1/forms/{form_id}/submissions",
        operationId: "listFormSubmissions",
        summary: "List form submissions",
        requiredScopes: ["forms:submissions_read"],
      },
      {
        method: "PUT",
        path: "/v1/forms/{form_id}",
        operationId: "updateForm",
        summary: "Update a form",
        requiredScopes: ["forms:configure"],
      },
      {
        method: "DELETE",
        path: "/v1/forms/{form_id}",
        operationId: "deleteForm",
        summary: "Delete a form",
        requiredScopes: ["forms:delete"],
      },
    ],
  },
  {
    key: "landing_pages",
    name: "Landing Pages",
    description:
      "Create and manage Mailrith-hosted landing pages, custom slugs, page definitions, settings, and public URLs.",
    operations: [
      {
        method: "GET",
        path: "/v1/landing-pages",
        operationId: "listLandingPages",
        summary: "List landing pages",
        requiredScopes: ["landing_pages:read"],
      },
      {
        method: "POST",
        path: "/v1/landing-pages",
        operationId: "createLandingPage",
        summary: "Create a landing page",
        requiredScopes: ["landing_pages:configure"],
      },
      {
        method: "GET",
        path: "/v1/landing-pages/{landing_page_id}",
        operationId: "getLandingPage",
        summary: "Get a landing page",
        requiredScopes: ["landing_pages:read"],
      },
      {
        method: "GET",
        path: "/v1/landing-pages/{landing_page_id}/submissions",
        operationId: "listLandingPageSubmissions",
        summary: "List landing page submissions",
        requiredScopes: ["landing_pages:submissions_read"],
      },
      {
        method: "PUT",
        path: "/v1/landing-pages/{landing_page_id}",
        operationId: "updateLandingPage",
        summary: "Update a landing page",
        requiredScopes: ["landing_pages:configure"],
      },
      {
        method: "DELETE",
        path: "/v1/landing-pages/{landing_page_id}",
        operationId: "deleteLandingPage",
        summary: "Delete a landing page",
        requiredScopes: ["landing_pages:delete"],
      },
    ],
  },
  {
    key: "sequences",
    name: "Sequences",
    description:
      "Create and manage onboarding or lifecycle sequences, including status, delivery settings, and definition payloads.",
    operations: [
      {
        method: "GET",
        path: "/v1/sequences",
        operationId: "listSequences",
        summary: "List sequences",
        requiredScopes: ["sequences:read"],
      },
      {
        method: "POST",
        path: "/v1/sequences",
        operationId: "createSequence",
        summary: "Create a sequence",
        requiredScopes: ["sequences:draft"],
      },
      {
        method: "GET",
        path: "/v1/sequences/{sequence_id}",
        operationId: "getSequence",
        summary: "Get a sequence",
        requiredScopes: ["sequences:read"],
      },
      {
        method: "PUT",
        path: "/v1/sequences/{sequence_id}",
        operationId: "updateSequence",
        summary: "Update a sequence",
        requiredScopes: ["sequences:draft"],
      },
      {
        method: "PUT",
        path: "/v1/sequences/{sequence_id}/status",
        operationId: "updateSequenceStatus",
        summary: "Activate or pause a sequence",
        requiredScopes: ["sequences:activate"],
      },
      {
        method: "DELETE",
        path: "/v1/sequences/{sequence_id}",
        operationId: "deleteSequence",
        summary: "Delete a sequence",
        requiredScopes: ["sequences:delete"],
      },
    ],
  },
  {
    key: "automations",
    name: "Automations",
    description:
      "Create and manage automations with explicit lifecycle states and normalized definition payloads.",
    operations: [
      {
        method: "GET",
        path: "/v1/automations",
        operationId: "listAutomations",
        summary: "List automations",
        requiredScopes: ["automations:read"],
      },
      {
        method: "POST",
        path: "/v1/automations",
        operationId: "createAutomation",
        summary: "Create an automation",
        requiredScopes: ["automations:draft"],
      },
      {
        method: "GET",
        path: "/v1/automations/{automation_id}",
        operationId: "getAutomation",
        summary: "Get an automation",
        requiredScopes: ["automations:read"],
      },
      {
        method: "PUT",
        path: "/v1/automations/{automation_id}",
        operationId: "updateAutomation",
        summary: "Update an automation",
        requiredScopes: ["automations:draft"],
      },
      {
        method: "PUT",
        path: "/v1/automations/{automation_id}/status",
        operationId: "updateAutomationStatus",
        summary: "Activate or pause an automation",
        requiredScopes: ["automations:activate"],
      },
      {
        method: "DELETE",
        path: "/v1/automations/{automation_id}",
        operationId: "deleteAutomation",
        summary: "Delete an automation",
        requiredScopes: ["automations:delete"],
      },
    ],
  },
  {
    key: "magic_links",
    name: "Magic Links",
    description:
      "Create and manage magic links with explicit targets, post-click actions, and a public execution URL.",
    operations: [
      {
        method: "GET",
        path: "/v1/magic-links",
        operationId: "listMagicLinks",
        summary: "List magic links",
        requiredScopes: ["magic_links:read"],
      },
      {
        method: "POST",
        path: "/v1/magic-links",
        operationId: "createMagicLink",
        summary: "Create a magic link",
        requiredScopes: ["magic_links:configure"],
      },
      {
        method: "GET",
        path: "/v1/magic-links/{magic_link_id}",
        operationId: "getMagicLink",
        summary: "Get a magic link",
        requiredScopes: ["magic_links:read"],
      },
      {
        method: "PUT",
        path: "/v1/magic-links/{magic_link_id}",
        operationId: "updateMagicLink",
        summary: "Update a magic link",
        requiredScopes: ["magic_links:configure"],
      },
      {
        method: "DELETE",
        path: "/v1/magic-links/{magic_link_id}",
        operationId: "deleteMagicLink",
        summary: "Delete a magic link",
        requiredScopes: ["magic_links:delete"],
      },
    ],
  },
  {
    key: "broadcasts",
    name: "Broadcasts",
    description:
      "Create and manage broadcast drafts, schedule future delivery, send test emails, and launch immediate sends.",
    operations: [
      {
        method: "GET",
        path: "/v1/broadcasts",
        operationId: "listBroadcasts",
        summary: "List broadcasts",
        requiredScopes: ["broadcasts:read"],
      },
      {
        method: "POST",
        path: "/v1/broadcasts",
        operationId: "createBroadcast",
        summary: "Create a broadcast",
        requiredScopes: ["broadcasts:draft"],
      },
      {
        method: "GET",
        path: "/v1/broadcasts/{broadcast_id}/progress",
        operationId: "getBroadcastSendProgress",
        summary: "Get broadcast send progress",
        requiredScopes: ["broadcasts:read"],
      },
      {
        method: "GET",
        path: "/v1/broadcasts/{broadcast_id}/delivery-errors",
        operationId: "listBroadcastDeliveryErrors",
        summary: "List broadcast delivery errors",
        requiredScopes: ["broadcasts:read"],
      },
      {
        method: "GET",
        path: "/v1/broadcasts/{broadcast_id}",
        operationId: "getBroadcast",
        summary: "Get a broadcast",
        requiredScopes: ["broadcasts:read"],
      },
      {
        method: "PUT",
        path: "/v1/broadcasts/{broadcast_id}",
        operationId: "updateBroadcast",
        summary: "Update a broadcast",
        requiredScopes: ["broadcasts:draft"],
      },
      {
        method: "DELETE",
        path: "/v1/broadcasts/{broadcast_id}",
        operationId: "deleteBroadcast",
        summary: "Delete a broadcast",
        description:
          "Deletes a draft, scheduled, or failed broadcast. Broadcasts cannot be deleted after they start sending.",
        requiredScopes: ["broadcasts:delete"],
      },
      {
        method: "GET",
        path: "/v1/broadcasts/{broadcast_id}/preflight",
        operationId: "preflightBroadcast",
        summary: "Inspect broadcast readiness",
        requiredScopes: ["broadcasts:preflight"],
      },
      {
        method: "POST",
        path: "/v1/broadcasts/{broadcast_id}/send",
        operationId: "sendBroadcast",
        summary: "Send a broadcast now",
        requiredScopes: ["broadcasts:send"],
      },
      {
        method: "POST",
        path: "/v1/broadcasts/{broadcast_id}/cancel",
        operationId: "cancelBroadcastSend",
        summary: "Cancel a broadcast send",
        description:
          "Requests cancellation for remaining delivery work. Emails already accepted by the provider cannot be recalled.",
        requiredScopes: ["broadcasts:cancel"],
      },
      {
        method: "POST",
        path: "/v1/broadcasts/{broadcast_id}/test",
        operationId: "testBroadcast",
        summary: "Send a broadcast test email",
        requiredScopes: ["broadcasts:test"],
      },
    ],
  },
  {
    key: "segments",
    name: "Segments",
    description:
      "Create and manage saved segments, and preview unsaved segment definitions before persisting them.",
    operations: [
      {
        method: "GET",
        path: "/v1/segments",
        operationId: "listSegments",
        summary: "List segments",
        requiredScopes: ["segments:read"],
      },
      {
        method: "POST",
        path: "/v1/segments",
        operationId: "createSegment",
        summary: "Create a segment",
        requiredScopes: ["segments:configure"],
      },
      {
        method: "GET",
        path: "/v1/segments/{segment_id}",
        operationId: "getSegment",
        summary: "Get a segment",
        requiredScopes: ["segments:read"],
      },
      {
        method: "PUT",
        path: "/v1/segments/{segment_id}",
        operationId: "updateSegment",
        summary: "Update a segment",
        requiredScopes: ["segments:configure"],
      },
      {
        method: "DELETE",
        path: "/v1/segments/{segment_id}",
        operationId: "deleteSegment",
        summary: "Delete a segment",
        requiredScopes: ["segments:delete"],
      },
      {
        method: "POST",
        path: "/v1/segments/preview",
        operationId: "previewSegment",
        summary: "Preview a segment definition",
        requiredScopes: ["segments:read"],
      },
    ],
  },
  {
    key: "webhook_subscriptions",
    name: "Webhook Subscriptions",
    description:
      "Create and manage signed outbound webhook subscriptions so agents can react to Mailrith events without polling.",
    operations: [
      {
        method: "GET",
        path: "/v1/webhook-subscriptions",
        operationId: "listWebhookSubscriptions",
        summary: "List webhook subscriptions",
        requiredScopes: ["webhook_subscriptions:read"],
      },
      {
        method: "POST",
        path: "/v1/webhook-subscriptions",
        operationId: "createWebhookSubscription",
        summary: "Create a webhook subscription",
        requiredScopes: ["webhook_subscriptions:configure"],
        eventPatternScopeRequirements:
          publicApiWebhookEventPatternScopeRequirements,
      },
      {
        method: "GET",
        path: "/v1/webhook-subscriptions/{webhook_subscription_id}",
        operationId: "getWebhookSubscription",
        summary: "Get a webhook subscription",
        requiredScopes: ["webhook_subscriptions:read"],
      },
      {
        method: "PUT",
        path: "/v1/webhook-subscriptions/{webhook_subscription_id}",
        operationId: "updateWebhookSubscription",
        summary: "Update a webhook subscription",
        requiredScopes: ["webhook_subscriptions:configure"],
        eventPatternScopeRequirements:
          publicApiWebhookEventPatternScopeRequirements,
      },
      {
        method: "DELETE",
        path: "/v1/webhook-subscriptions/{webhook_subscription_id}",
        operationId: "deleteWebhookSubscription",
        summary: "Delete a webhook subscription",
        requiredScopes: ["webhook_subscriptions:delete"],
      },
      {
        method: "POST",
        path: "/v1/webhook-subscriptions/{webhook_subscription_id}/rotate-secret",
        operationId: "rotateWebhookSubscriptionSecret",
        summary: "Rotate a webhook signing secret",
        requiredScopes: ["webhook_subscriptions:secret_rotate"],
      },
    ],
  },
  {
    key: "jobs",
    name: "Import and Export Jobs",
    description:
      "Queue asynchronous subscriber import and export jobs and poll them to completion.",
    operations: [
      {
        method: "POST",
        path: "/v1/jobs/subscriber-imports",
        operationId: "createSubscriberImportJob",
        summary: "Create a subscriber import job",
        requiredScopes: ["subscribers:bulk_import"],
      },
      {
        method: "GET",
        path: "/v1/jobs/subscriber-imports/{job_id}",
        operationId: "getSubscriberImportJob",
        summary: "Get a subscriber import job",
        requiredScopes: ["jobs:read"],
      },
      {
        method: "POST",
        path: "/v1/jobs/subscriber-exports",
        operationId: "createSubscriberExportJob",
        summary: "Create a subscriber export job",
        requiredScopes: ["subscribers:bulk_export"],
      },
      {
        method: "GET",
        path: "/v1/jobs/subscriber-exports/{job_id}",
        operationId: "getSubscriberExportJob",
        summary: "Get a subscriber export job",
        requiredScopes: ["subscribers:bulk_export"],
      },
    ],
  },
];

const schemas = {
  Error: {
    type: "object",
    required: ["error"],
    properties: {
      error: {
        type: "object",
        required: ["type", "code", "message"],
        properties: {
          type: {
            type: "string",
            enum: [
              "invalid_request",
              "authentication_error",
              "permission_error",
              "not_found",
              "conflict",
              "api_error",
            ],
          },
          code: { type: "string" },
          message: { type: "string" },
        },
      },
    },
  },
  AgentAction: {
    type: "object",
    additionalProperties: false,
    required: [
      "id",
      "workspace_id",
      "operation_id",
      "risk",
      "state",
      "policy_decision",
      "credential",
      "targets",
      "input_digest",
      "resource_version",
      "preview",
      "approval",
      "result",
      "approval_url",
      "return_url",
      "expires_at",
      "created_at",
      "updated_at",
    ],
    properties: {
      id: { type: "string" },
      workspace_id: { type: "string" },
      operation_id: { type: "string" },
      risk: {
        type: "string",
        enum: ["draft", "test", "execute", "bulk", "delete", "admin"],
      },
      state: {
        type: "string",
        enum: [
          "pending",
          "blocked",
          "approved",
          "executing",
          "completed",
          "failed",
          "uncertain",
          "denied",
          "expired",
        ],
      },
      policy_decision: {
        type: "string",
        enum: ["human_required", "policy_approved", "blocked"],
      },
      credential: {
        type: "object",
        additionalProperties: false,
        required: ["type", "id"],
        properties: {
          type: {
            type: "string",
            enum: ["workspace_api_key", "oauth_authorization"],
          },
          id: { type: "string" },
        },
      },
      targets: {
        type: "array",
        maxItems: 20,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["type", "id"],
          properties: { type: { type: "string" }, id: { type: "string" } },
        },
      },
      input_digest: { type: "string", pattern: "^[0-9a-f]{64}$" },
      resource_version: { type: "string" },
      preview: {
        type: "object",
        additionalProperties: false,
        required: [
          "affected_subscriber_count",
          "expected_side_effects",
          "warnings",
          "blocking_issues",
          "summary",
        ],
        properties: {
          affected_subscriber_count: {
            anyOf: [{ type: "integer", minimum: 0 }, { type: "null" }],
          },
          expected_side_effects: {
            type: "array",
            maxItems: 20,
            items: {
              type: "object",
              additionalProperties: false,
              required: ["code", "description"],
              properties: {
                code: { type: "string" },
                description: { type: "string" },
              },
            },
          },
          warnings: { type: "array", maxItems: 20, items: { type: "string" } },
          blocking_issues: {
            type: "array",
            maxItems: 20,
            items: { type: "string" },
          },
          summary: {
            type: "object",
            additionalProperties: false,
            properties: {
              sandbox: { type: "boolean" },
              active_subscriber_count: { type: "integer", minimum: 0 },
              current_status: { type: "string" },
              currently_enabled: { type: "boolean" },
              delivery_connection_configured: { type: "boolean" },
              provider_readiness: { type: "string" },
              sender_verification: { type: "string" },
              event_webhook_health: { type: "string" },
              estimated_duration_seconds: {
                anyOf: [{ type: "integer", minimum: 0 }, { type: "null" }],
              },
              expected_provider_cost: { type: "null" },
              truncated: { type: "boolean" },
            },
          },
        },
      },
      approval: {
        type: "object",
        additionalProperties: false,
        required: [
          "approved_by_user_id",
          "approved_by_policy",
          "approved_at",
          "denied_at",
          "denial_code",
          "token_expires_at",
        ],
        properties: {
          approved_by_user_id: { type: ["string", "null"] },
          approved_by_policy: { type: ["string", "null"] },
          approved_at: { anyOf: [{ type: "string", format: "date-time" }, { type: "null" }] },
          denied_at: { anyOf: [{ type: "string", format: "date-time" }, { type: "null" }] },
          denial_code: { type: ["string", "null"] },
          token_expires_at: { anyOf: [{ type: "string", format: "date-time" }, { type: "null" }] },
        },
      },
      result: {
        type: "object",
        additionalProperties: false,
        required: ["resource_type", "resource_id", "outcome_code"],
        properties: {
          resource_type: { type: ["string", "null"] },
          resource_id: { type: ["string", "null"] },
          outcome_code: { type: ["string", "null"] },
        },
      },
      approval_url: { type: ["string", "null"] },
      return_url: { type: ["string", "null"] },
      expires_at: { type: "string", format: "date-time" },
      created_at: { type: "string", format: "date-time" },
      updated_at: { type: "string", format: "date-time" },
    },
  },
  AgentActionResponse: {
    type: "object",
    additionalProperties: false,
    required: ["data"],
    properties: { data: { $ref: "#/components/schemas/AgentAction" } },
  },
  AgentActivity: {
    type: "object",
    additionalProperties: false,
    required: [
      "id",
      "workspace_id",
      "request_id",
      "action_id",
      "plan_id",
      "approval_id",
      "operation_id",
      "risk",
      "outcome",
      "state",
      "error_code",
      "credential",
      "client",
      "permission_keys",
      "targets",
      "primary_target",
      "changed_fields",
      "approval",
      "result",
      "attempts",
      "duration_ms",
      "retention",
      "created_at",
      "updated_at",
      "completed_at",
    ],
    properties: {
      id: { type: "string" },
      workspace_id: { type: "string" },
      request_id: { type: "string" },
      action_id: { type: "string" },
      plan_id: { type: ["string", "null"] },
      approval_id: { type: ["string", "null"] },
      operation_id: { type: "string" },
      risk: {
        type: "string",
        enum: ["draft", "test", "execute", "bulk", "delete", "admin"],
      },
      outcome: {
        type: "string",
        enum: ["allowed", "denied", "failed", "canceled", "completed"],
      },
      state: { type: "string" },
      error_code: { type: ["string", "null"] },
      credential: {
        type: "object",
        additionalProperties: false,
        required: ["type", "id", "oauth_client_id"],
        properties: {
          type: { type: "string" },
          id: { type: "string" },
          oauth_client_id: { type: ["string", "null"] },
        },
      },
      client: {
        type: "object",
        additionalProperties: false,
        required: ["kind", "version"],
        properties: {
          kind: { type: "string" },
          version: { type: ["string", "null"] },
        },
      },
      permission_keys: {
        type: "array",
        maxItems: 24,
        items: { type: "string" },
      },
      targets: {
        type: "array",
        maxItems: 20,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["type", "id"],
          properties: { type: { type: "string" }, id: { type: "string" } },
        },
      },
      primary_target: {
        anyOf: [
          {
            type: "object",
            additionalProperties: false,
            required: ["type", "id"],
            properties: { type: { type: "string" }, id: { type: "string" } },
          },
          { type: "null" },
        ],
      },
      changed_fields: {
        type: "array",
        maxItems: 24,
        items: { type: "string" },
      },
      approval: {
        type: "object",
        additionalProperties: false,
        required: [
          "approved_by_user_id",
          "approved_by_policy",
          "approved_at",
          "denied_at",
        ],
        properties: {
          approved_by_user_id: { type: ["string", "null"] },
          approved_by_policy: { type: ["string", "null"] },
          approved_at: {
            anyOf: [{ type: "string", format: "date-time" }, { type: "null" }],
          },
          denied_at: {
            anyOf: [{ type: "string", format: "date-time" }, { type: "null" }],
          },
        },
      },
      result: {
        type: "object",
        additionalProperties: false,
        required: ["resource_type", "resource_id", "outcome_code"],
        properties: {
          resource_type: { type: ["string", "null"] },
          resource_id: { type: ["string", "null"] },
          outcome_code: { type: ["string", "null"] },
        },
      },
      attempts: {
        type: "object",
        additionalProperties: false,
        required: ["count", "first_at", "last_at"],
        properties: {
          count: { type: "integer", minimum: 1 },
          first_at: { type: "string", format: "date-time" },
          last_at: { type: "string", format: "date-time" },
        },
      },
      duration_ms: {
        anyOf: [{ type: "integer", minimum: 0 }, { type: "null" }],
      },
      retention: {
        type: "object",
        additionalProperties: false,
        required: ["expires_at", "legal_hold", "legal_hold_expires_at"],
        properties: {
          expires_at: {
            anyOf: [{ type: "string", format: "date-time" }, { type: "null" }],
          },
          legal_hold: { type: "boolean" },
          legal_hold_expires_at: {
            anyOf: [{ type: "string", format: "date-time" }, { type: "null" }],
          },
        },
      },
      created_at: { type: "string", format: "date-time" },
      updated_at: { type: "string", format: "date-time" },
      completed_at: {
        anyOf: [{ type: "string", format: "date-time" }, { type: "null" }],
      },
    },
  },
  AgentActivityResponse: {
    type: "object",
    additionalProperties: false,
    required: ["data"],
    properties: { data: { $ref: "#/components/schemas/AgentActivity" } },
  },
  AgentActivityListResponse: {
    type: "object",
    additionalProperties: false,
    required: ["data"],
    properties: {
      data: {
        type: "object",
        additionalProperties: false,
        required: ["items", "next_cursor", "has_more", "range"],
        properties: {
          items: {
            type: "array",
            maxItems: 100,
            items: { $ref: "#/components/schemas/AgentActivity" },
          },
          next_cursor: { type: ["string", "null"] },
          has_more: { type: "boolean" },
          range: {
            type: "object",
            additionalProperties: false,
            required: ["from", "to"],
            properties: {
              from: { type: "string", format: "date-time" },
              to: { type: "string", format: "date-time" },
            },
          },
        },
      },
    },
  },
  AgentApprovalTokenResponse: {
    type: "object",
    additionalProperties: false,
    required: ["data"],
    properties: {
      data: {
        type: "object",
        additionalProperties: false,
        required: ["action_id", "approval_token", "expires_at"],
        properties: {
          action_id: { type: "string" },
          approval_token: { type: "string" },
          expires_at: { type: "string", format: "date-time" },
        },
      },
    },
  },
  Pagination: {
    type: "object",
    required: ["has_more", "next_cursor"],
    properties: {
      has_more: { type: "boolean" },
      next_cursor: { type: "string", nullable: true },
    },
  },
  ApiMetadata: {
    type: "object",
    required: [
      "version",
      "documentation_url",
      "reference_url",
      "agents_url",
      "sdk_docs_url",
      "typescript_sdk_url",
      "python_sdk_url",
      "mcp_docs_url",
      "mcp_url",
      "llms_url",
      "llms_full_url",
      "openapi_url",
      "capabilities_url",
      "webhook_subscriptions_url",
      "oauth_authorization_server_url",
    ],
    properties: {
      version: { type: "string" },
      documentation_url: { type: "string" },
      reference_url: { type: "string" },
      agents_url: { type: "string" },
      sdk_docs_url: { type: "string" },
      typescript_sdk_url: { type: "string" },
      python_sdk_url: { type: "string" },
      mcp_docs_url: { type: "string" },
      mcp_url: { type: "string" },
      llms_url: { type: "string" },
      llms_full_url: { type: "string" },
      openapi_url: { type: "string" },
      capabilities_url: { type: "string" },
      webhook_subscriptions_url: { type: "string" },
      oauth_authorization_server_url: { type: "string" },
    },
  },
  CapabilityOperation: {
    type: "object",
    required: ["method", "path", "operation_id", "summary", "required_scopes"],
    properties: {
      method: { type: "string" },
      path: { type: "string" },
      operation_id: { type: "string" },
      summary: { type: "string" },
      required_scopes: {
        type: "array",
        items: { type: "string" },
      },
      event_pattern_scope_requirements: {
        $ref: "#/components/schemas/WebhookEventPatternScopeRequirements",
      },
    },
  },
  CapabilityResource: {
    type: "object",
    required: ["key", "name", "description", "operations"],
    properties: {
      key: { type: "string" },
      name: { type: "string" },
      description: { type: "string" },
      operations: {
        type: "array",
        items: { $ref: "#/components/schemas/CapabilityOperation" },
      },
    },
  },
  Capabilities: {
    type: "object",
    required: [
      "version",
      "workspace",
      "authentication",
      "credential",
      "discovery",
      "sdks",
      "mcp",
      "conventions",
      "events",
      "resources",
    ],
    properties: {
      version: { type: "string" },
      workspace: {
        type: "object",
        required: ["id", "name"],
        properties: {
          id: { type: "string" },
          name: { type: "string" },
        },
      },
      authentication: {
        type: "object",
        required: [
          "type",
          "header_name",
          "header_value_prefix",
          "workspace_scoped",
          "scopes_supported",
          "supported_credential_types",
        ],
        properties: {
          type: { type: "string", enum: ["bearer"] },
          header_name: { type: "string" },
          header_value_prefix: { type: "string" },
          workspace_scoped: { type: "boolean" },
          scopes_supported: {
            type: "array",
            items: { type: "string" },
          },
          supported_credential_types: {
            type: "array",
            items: {
              type: "string",
              enum: ["workspace_api_key", "oauth_access_token"],
            },
          },
        },
      },
      credential: {
        oneOf: [
          {
            type: "object",
            required: [
              "type",
              "id",
              "name",
              "status",
              "scopes",
              "key_preview",
              "created_at",
              "updated_at",
            ],
            properties: {
              type: { type: "string", enum: ["workspace_api_key"] },
              id: { type: "string" },
              name: { type: "string" },
              status: {
                type: "string",
                enum: ["active", "expired", "revoked", "rotated"],
              },
              scopes: {
                type: "array",
                items: { type: "string" },
              },
              key_preview: { type: "string" },
              expires_at: nullableDateTimeSchema,
              last_used_at: nullableDateTimeSchema,
              revoked_at: nullableDateTimeSchema,
              created_at: dateTimeSchema,
              updated_at: dateTimeSchema,
            },
          },
          {
            type: "object",
            required: [
              "type",
              "id",
              "status",
              "scopes",
              "token_preview",
              "client",
              "created_by_user_id",
              "last_authorized_by_user_id",
              "expires_at",
              "created_at",
              "updated_at",
            ],
            properties: {
              type: { type: "string", enum: ["oauth_access_token"] },
              id: { type: "string" },
              status: {
                type: "string",
                enum: ["active"],
              },
              scopes: {
                type: "array",
                items: { type: "string" },
              },
              token_preview: { type: "string" },
              client: {
                type: "object",
                required: ["id", "name"],
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                },
              },
              created_by_user_id: { type: "string", nullable: true },
              last_authorized_by_user_id: {
                type: "string",
                nullable: true,
              },
              expires_at: dateTimeSchema,
              last_used_at: nullableDateTimeSchema,
              revoked_at: nullableDateTimeSchema,
              created_at: dateTimeSchema,
              updated_at: dateTimeSchema,
            },
          },
        ],
      },
      discovery: {
        type: "object",
        required: [
          "documentation_url",
          "reference_url",
          "agents_url",
          "sdk_docs_url",
          "typescript_sdk_url",
          "python_sdk_url",
          "mcp_docs_url",
          "mcp_url",
          "llms_url",
          "llms_full_url",
          "openapi_url",
          "webhook_subscriptions_url",
          "oauth_authorization_server_url",
        ],
        properties: {
          documentation_url: { type: "string" },
          reference_url: { type: "string" },
          agents_url: { type: "string" },
          sdk_docs_url: { type: "string" },
          typescript_sdk_url: { type: "string" },
          python_sdk_url: { type: "string" },
          mcp_docs_url: { type: "string" },
          mcp_url: { type: "string" },
          llms_url: { type: "string" },
          llms_full_url: { type: "string" },
          openapi_url: { type: "string" },
          webhook_subscriptions_url: { type: "string" },
          oauth_authorization_server_url: { type: "string" },
        },
      },
      sdks: {
        $ref: "#/components/schemas/PublicApiSdks",
      },
      mcp: {
        $ref: "#/components/schemas/PublicApiMcp",
      },
      conventions: {
        type: "object",
        required: [
          "pagination_type",
          "pagination_limit_param",
          "pagination_cursor_param",
          "idempotency_header",
        ],
        properties: {
          pagination_type: { type: "string", enum: ["cursor"] },
          pagination_limit_param: { type: "string" },
          pagination_cursor_param: { type: "string" },
          idempotency_header: { type: "string" },
        },
      },
      events: {
        $ref: "#/components/schemas/WebhookEventSupport",
      },
      resources: {
        type: "array",
        items: { $ref: "#/components/schemas/CapabilityResource" },
      },
    },
  },
  PublicApiSdks: {
    type: "object",
    required: ["typescript", "python"],
    properties: {
      typescript: {
        type: "object",
        required: ["package_name", "docs_url", "language"],
        properties: {
          package_name: { type: "string" },
          docs_url: { type: "string" },
          language: { type: "string", enum: ["typescript"] },
        },
      },
      python: {
        type: "object",
        required: ["package_name", "docs_url", "language"],
        properties: {
          package_name: { type: "string" },
          docs_url: { type: "string" },
          language: { type: "string", enum: ["python"] },
        },
      },
    },
  },
  PublicApiMcp: {
    type: "object",
    required: [
      "package_name",
      "docs_url",
      "server_url",
      "recommended_transport",
      "supported_transports",
    ],
    properties: {
      package_name: { type: "string" },
      docs_url: { type: "string" },
      server_url: { type: "string" },
      recommended_transport: { type: "string", enum: ["streamable_http"] },
      supported_transports: {
        type: "array",
        items: {
          type: "string",
          enum: ["streamable_http", "stdio"],
        },
      },
    },
  },
  WebhookSigning: {
    type: "object",
    required: [
      "algorithm",
      "id_header",
      "timestamp_header",
      "signature_header",
      "signature_prefix",
    ],
    properties: {
      algorithm: { type: "string", enum: ["hmac-sha256"] },
      id_header: { type: "string" },
      timestamp_header: { type: "string" },
      signature_header: { type: "string" },
      signature_prefix: { type: "string" },
    },
  },
  WebhookEventSupport: {
    type: "object",
    required: [
      "subscriptions_url",
      "supported_events",
      "supported_event_patterns",
      "required_scopes_by_event_pattern",
      "signing",
    ],
    properties: {
      subscriptions_url: { type: "string" },
      supported_events: {
        type: "array",
        items: { type: "string" },
      },
      supported_event_patterns: {
        type: "array",
        items: { type: "string" },
      },
      required_scopes_by_event_pattern: {
        type: "object",
        additionalProperties: {
          type: "array",
          items: { type: "string" },
        },
      },
      signing: {
        $ref: "#/components/schemas/WebhookSigning",
      },
    },
  },
  WebhookEventPatternScopeRequirements: {
    type: "object",
    required: [
      "request_field",
      "description",
      "required_scopes_by_event_pattern",
    ],
    properties: {
      request_field: { type: "string", enum: ["event_patterns"] },
      description: { type: "string" },
      required_scopes_by_event_pattern: {
        type: "object",
        additionalProperties: {
          type: "array",
          items: { type: "string" },
        },
      },
    },
  },
  WebhookSubscription: {
    type: "object",
    required: [
      "id",
      "name",
      "url",
      "status",
      "event_patterns",
      "signing_secret_preview",
      "delivery_attempts",
      "last_delivery_status",
      "last_delivery_error",
      "last_delivered_at",
      "last_failed_at",
      "created_at",
      "updated_at",
    ],
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      url: { type: "string" },
      status: {
        type: "string",
        description:
          "New direct API Subscribers default to Unconfirmed when status is omitted. Active requires consent_evidence.",
        enum: ["active", "disabled"],
      },
      event_patterns: {
        type: "array",
        description:
          "Events or wildcard patterns to deliver. The caller also needs read access for each selected event family; events that include subscriber details require `subscribers:read`.",
        items: { type: "string" },
      },
      signing_secret_preview: { type: "string" },
      delivery_attempts: { type: "integer", minimum: 0 },
      last_delivery_status: {
        type: "string",
        nullable: true,
        enum: ["delivered", "failed", null],
      },
      last_delivery_error: { type: "string", nullable: true },
      last_delivered_at: nullableDateTimeSchema,
      last_failed_at: nullableDateTimeSchema,
      created_at: dateTimeSchema,
      updated_at: dateTimeSchema,
    },
  },
  WebhookSubscriptionCreateRequest: {
    type: "object",
    required: ["name", "url", "event_patterns"],
    properties: {
      name: { type: "string" },
      url: {
        type: "string",
        description:
          "Public HTTPS destination URL for signed event delivery. Localhost, private network, link-local, and reserved destinations are not accepted.",
      },
      event_patterns: {
        type: "array",
        description:
          "Events or wildcard patterns to deliver. Updating this field, or changing a subscription that already has event patterns, requires read access for the selected event families.",
        items: { type: "string" },
      },
      status: {
        type: "string",
        enum: ["active", "disabled"],
      },
    },
  },
  WebhookSubscriptionUpdateRequest: {
    type: "object",
    properties: {
      name: { type: "string" },
      url: {
        type: "string",
        description:
          "Public HTTPS destination URL for signed event delivery. Localhost, private network, link-local, and reserved destinations are not accepted.",
      },
      event_patterns: {
        type: "array",
        items: { type: "string" },
      },
      status: {
        type: "string",
        enum: ["active", "disabled"],
      },
    },
  },
  WebhookSubscriptionCreateResult: {
    type: "object",
    required: ["subscription", "signing_secret"],
    properties: {
      subscription: {
        $ref: "#/components/schemas/WebhookSubscription",
      },
      signing_secret: { type: "string" },
    },
  },
  WorkspaceReference: {
    type: "object",
    required: ["id", "name"],
    properties: {
      id: { type: "string" },
      name: { type: "string" },
    },
  },
  Workspace: {
    type: "object",
    required: [
      "id",
      "name",
      "logo",
      "address",
      "city",
      "state",
      "postal_code",
      "country",
      "time_zone",
      "created_at",
      "updated_at",
    ],
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      logo: { type: "string", nullable: true },
      address: { type: "string", nullable: true },
      city: { type: "string", nullable: true },
      state: {
        type: "string",
        nullable: true,
        description: "State, province, or region for the workspace address.",
      },
      postal_code: {
        type: "string",
        nullable: true,
        description: "Postal or ZIP code for the workspace address.",
      },
      country: workspaceCountrySchema,
      time_zone: { type: "string", nullable: true },
      created_at: dateTimeSchema,
      updated_at: dateTimeSchema,
    },
  },
  TagSummary: {
    type: "object",
    required: ["id", "name"],
    properties: {
      id: { type: "string" },
      name: { type: "string" },
    },
  },
  Subscriber: {
    type: "object",
    required: [
      "id",
      "email",
      "name",
      "status",
      "country",
      "subscribed_at",
      "tags",
      "sequence_ids",
      "custom_fields",
      "created_at",
      "updated_at",
    ],
    properties: {
      id: { type: "string" },
      email: { type: "string", format: "email" },
      name: { type: "string" },
      status: {
        type: "string",
        enum: [
          "Active",
          "Unconfirmed",
          "Unsubscribed",
          "Complained",
          "Bounced",
          "Blocked",
        ],
      },
      country: subscriberCountrySchema,
      subscribed_at: dateTimeSchema,
      last_opened_at: nullableDateTimeSchema,
      tags: {
        type: "array",
        items: { $ref: "#/components/schemas/TagSummary" },
      },
      sequence_ids: stringArraySchema,
      custom_fields: {
        type: "object",
        additionalProperties: true,
      },
      created_at: dateTimeSchema,
      updated_at: dateTimeSchema,
    },
  },
  SubscriberUpsertRequest: {
    type: "object",
    required: ["email"],
    properties: {
      email: { type: "string", format: "email" },
      name: { type: "string" },
      status: {
        type: "string",
        enum: [
          "Active",
          "Unconfirmed",
          "Unsubscribed",
          "Complained",
          "Bounced",
          "Blocked",
        ],
      },
      country: subscriberCountrySchema,
      subscribed_on: {
        type: "string",
        example: "2026-04-11",
        description: "Subscriber-local subscription date in YYYY-MM-DD format.",
      },
      create_only: {
        type: "boolean",
        description:
          "When true, Mailrith returns a 409 conflict instead of updating an existing subscriber with the same email.",
      },
      custom_fields: {
        type: "object",
        additionalProperties: true,
        description:
          "Custom field values keyed by custom field ID. For Multi Select fields, send an array of option names or a comma-separated string. Blank optional values leave saved values unchanged when updating an existing subscriber, and filled-in invalid values are rejected.",
      },
      consent_evidence: { $ref: "#/components/schemas/ConsentEvidence" },
    },
    example: {
      email: "ada@example.com",
      name: "Ada Lovelace",
      status: "Unconfirmed",
      country: "DE",
      custom_fields: {
        cf_company: "Analytical Engines",
      },
    },
  },
  SubscriberUpdateRequest: {
    type: "object",
    properties: {
      email: { type: "string", format: "email" },
      name: { type: "string" },
      country: subscriberCountrySchema,
      subscribed_on: {
        type: "string",
        example: "2026-04-11",
        description: "Subscriber-local subscription date in YYYY-MM-DD format.",
      },
      custom_fields: {
        type: "object",
        additionalProperties: true,
        description:
          "Custom field values keyed by custom field ID. For Multi Select fields, send an array of option names or a comma-separated string. Blank optional values leave saved values unchanged, and filled-in invalid values are rejected.",
      },
    },
    example: {
      name: "Ada Lovelace",
      country: "DE",
      custom_fields: {
        cf_company: "Analytical Engines",
      },
    },
  },
  SubscriberStatusRequest: {
    type: "object",
    required: ["status"],
    properties: {
      status: {
        type: "string",
        enum: [
          "Active",
          "Unconfirmed",
          "Unsubscribed",
          "Complained",
          "Bounced",
          "Blocked",
        ],
      },
      consent_evidence: { $ref: "#/components/schemas/ConsentEvidence" },
    },
  },
  ConsentEvidence: {
    type: "object",
    description:
      "Compact evidence required when the public API makes a Subscriber Active. Keep raw consent text, IP addresses, and user-agent data in your evidence system; Mailrith stores only this version, reference, URL, and optional SHA-256 digest.",
    required: ["lawful_basis", "collected_at", "evidence_reference"],
    additionalProperties: false,
    properties: {
      lawful_basis: { type: "string", maxLength: 64 },
      consent_text_version: { type: "string", maxLength: 128, nullable: true },
      collected_at: dateTimeSchema,
      source_url: { type: "string", format: "uri", maxLength: 2048, nullable: true },
      evidence_reference: { type: "string", maxLength: 512 },
      technical_evidence_hash: {
        type: "string",
        pattern: "^[a-f0-9]{64}$",
        nullable: true,
      },
    },
  },
  Tag: {
    type: "object",
    required: [
      "id",
      "name",
      "description",
      "gdpr_consent_purpose",
      "subscriber_count",
      "created_at",
      "updated_at",
    ],
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      description: { type: "string", nullable: true },
      gdpr_consent_purpose: {
        type: "string",
        nullable: true,
        enum: ["email_marketing", "ads_personalization"],
        description:
          "Read-only GDPR consent purpose for Mailrith consent tags. Null for ordinary tags.",
      },
      subscriber_count: { type: "integer" },
      created_at: dateTimeSchema,
      updated_at: dateTimeSchema,
    },
  },
  TagCreateRequest: {
    type: "object",
    required: ["name"],
    properties: {
      name: {
        type: "string",
        description:
          "Tag name to create. You can also create the GDPR consent tag names when you need to apply consent collected outside Mailrith.",
      },
      description: { type: "string", nullable: true },
    },
  },
  CustomField: {
    type: "object",
    required: ["id", "label", "type", "settings", "created_at", "updated_at"],
    properties: {
      id: { type: "string" },
      label: { type: "string" },
      type: { type: "string" },
      settings: {
        type: "object",
        required: ["options"],
        properties: {
          options: stringArraySchema,
        },
      },
      created_at: dateTimeSchema,
      updated_at: dateTimeSchema,
    },
  },
  CustomFieldUpsertRequest: {
    type: "object",
    required: ["label", "type"],
    properties: {
      label: { type: "string" },
      type: {
        type: "string",
        enum: [
          "Text",
          "Number",
          "Date",
          "Select (Dropdown)",
          "Single Select",
          "Multi Select",
          "Text Area",
          "Checkbox",
        ],
      },
      settings: {
        type: "object",
        properties: {
          options: stringArraySchema,
        },
        additionalProperties: true,
      },
    },
  },
  Form: {
    type: "object",
    required: [
      "id",
      "name",
      "definition",
      "public_token",
      "subscribers_90d",
      "views_90d",
      "conversion_rate_90d",
      "submit_url",
      "embed_url",
      "hosted_url",
      "created_at",
      "updated_at",
    ],
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      definition: formDefinitionSchema,
      public_token: { type: "string" },
      subscribers_90d: { type: "integer" },
      views_90d: { type: "integer" },
      conversion_rate_90d: { type: "number" },
      submit_url: { type: "string" },
      embed_url: { type: "string" },
      hosted_url: { type: "string" },
      created_at: dateTimeSchema,
      updated_at: dateTimeSchema,
    },
  },
  FormUpsertRequest: {
    type: "object",
    required: ["name", "definition"],
    properties: {
      name: { type: "string" },
      definition: formUpsertDefinitionSchema,
    },
    additionalProperties: false,
  },
  FormSubmission: {
    type: "object",
    required: ["id", "form_id", "form_name", "subscriber", "submitted_at"],
    properties: {
      id: { type: "string" },
      form_id: { type: "string" },
      form_name: { type: "string" },
      subscriber: { $ref: "#/components/schemas/Subscriber" },
      submitted_at: dateTimeSchema,
    },
  },
  LandingPage: {
    type: "object",
    required: [
      "id",
      "name",
      "slug",
      "custom_path",
      "customPath",
      "definition",
      "styles",
      "settings",
      "public_token",
      "public_url",
      "subscribers_90d",
      "views_90d",
      "conversion_rate_90d",
      "created_at",
      "updated_at",
    ],
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      slug: { type: "string" },
      custom_path: {
        type: "string",
        nullable: true,
        description:
          "Optional Pro custom slug for the workspace's verified landing page subdomain.",
      },
      customPath: {
        type: "string",
        nullable: true,
        description:
          "Camel-case alias for custom_path. Optional Pro custom slug for the workspace's verified landing page subdomain.",
      },
      definition: {
        type: "object",
        additionalProperties: true,
      },
      styles: {
        type: "object",
        additionalProperties: true,
      },
      settings: {
        type: "object",
        additionalProperties: true,
      },
      public_token: { type: "string" },
      public_url: { type: "string" },
      subscribers_90d: { type: "integer" },
      views_90d: { type: "integer" },
      conversion_rate_90d: { type: "number" },
      created_at: dateTimeSchema,
      updated_at: dateTimeSchema,
    },
  },
  LandingPageSubmission: {
    type: "object",
    required: [
      "id",
      "landing_page_id",
      "landing_page_name",
      "landing_page_slug",
      "landing_page_public_url",
      "form_block_id",
      "subscriber",
      "submitted_at",
    ],
    properties: {
      id: { type: "string" },
      landing_page_id: { type: "string" },
      landing_page_name: { type: "string" },
      landing_page_slug: { type: "string" },
      landing_page_public_url: { type: "string" },
      form_block_id: { type: "string" },
      subscriber: { $ref: "#/components/schemas/Subscriber" },
      submitted_at: dateTimeSchema,
    },
  },
  LandingPageUpsertRequest: {
    type: "object",
    required: ["name", "slug", "definition"],
    properties: {
      name: { type: "string" },
      slug: { type: "string" },
      custom_path: {
        type: "string",
        nullable: true,
        description:
          "Optional Pro custom slug. Omit this field to keep the existing custom slug when updating a landing page.",
      },
      customPath: {
        type: "string",
        nullable: true,
        description:
          "Camel-case alias for custom_path. Omit this field to keep the existing custom slug when updating a landing page.",
      },
      definition: {
        type: "object",
        additionalProperties: true,
      },
      styles: {
        type: "object",
        additionalProperties: true,
      },
      settings: {
        type: "object",
        additionalProperties: true,
      },
    },
  },
  EmailTemplate: {
    type: "object",
    required: [
      "id",
      "name",
      "body",
      "body_document",
      "enabled",
      "workspaces",
      "created_at",
      "updated_at",
    ],
    properties: {
      id: { type: "string" },
      name: {
        type: "string",
        maxLength: emailTemplateNameMaxLength,
      },
      body: { type: "string" },
      body_document: {
        type: "object",
        description: `Structured email editor content. The serialized document must be ${emailTemplateBodyDocumentMaxBytes} bytes or less.`,
        additionalProperties: true,
      },
      enabled: { type: "boolean" },
      workspaces: {
        type: "array",
        items: { $ref: "#/components/schemas/WorkspaceReference" },
      },
      created_at: dateTimeSchema,
      updated_at: dateTimeSchema,
    },
  },
  EmailTemplateUpsertRequest: {
    type: "object",
    required: ["name", "body_document"],
    properties: {
      name: {
        type: "string",
        maxLength: emailTemplateNameMaxLength,
      },
      body_document: {
        type: "object",
        description: `Structured email editor content. The serialized document must be ${emailTemplateBodyDocumentMaxBytes} bytes or less.`,
        additionalProperties: true,
      },
      enabled: { type: "boolean" },
    },
  },
  Sequence: {
    type: "object",
    required: [
      "id",
      "name",
      "status",
      "is_updating",
      "connection_id",
      "from_name",
      "from_email",
      "reply_to_email",
      "track_opens",
      "track_clicks",
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "definition",
      "subscriber_count",
      "open_rate",
      "click_rate",
      "unsubscribed_count",
      "bounced_count",
      "complained_count",
      "created_at",
      "updated_at",
    ],
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      status: { type: "string", enum: ["running", "paused"] },
      is_updating: {
        type: "boolean",
        description:
          "True while Mailrith updates existing Subscriber progress after a structural Sequence change.",
      },
      connection_id: { type: "string", nullable: true },
      from_name: { type: "string", nullable: true },
      from_email: { type: "string", nullable: true },
      reply_to_email: { type: "string", nullable: true },
      track_opens: { type: "boolean" },
      track_clicks: { type: "boolean" },
      utm_source: { type: "string", nullable: true },
      utm_medium: { type: "string", nullable: true },
      utm_campaign: { type: "string", nullable: true },
      utm_term: { type: "string", nullable: true },
      utm_content: { type: "string", nullable: true },
      definition: {
        type: "object",
        additionalProperties: true,
      },
      subscriber_count: { type: "integer" },
      open_rate: { type: "integer" },
      click_rate: { type: "integer" },
      unsubscribed_count: { type: "integer" },
      bounced_count: { type: "integer" },
      complained_count: { type: "integer" },
      send_progress: {
        allOf: [{ $ref: "#/components/schemas/BroadcastSendProgress" }],
        nullable: true,
      },
      created_at: dateTimeSchema,
      updated_at: dateTimeSchema,
    },
  },
  BroadcastSendProgress: {
    type: "object",
    required: [
      "run_id",
      "phase",
      "selected",
      "materialized",
      "accepted",
      "skipped",
      "retrying",
      "permanent_failed",
      "unknown",
      "canceled",
      "percent_complete",
      "effective_rate",
      "provider_limited_rate",
      "provider",
      "estimated_completion",
      "estimated_completion_basis",
      "last_progress_at",
      "pause_reason",
      "next_retry_at",
      "next_retry_action",
      "pause_message",
      "terminal",
    ],
    properties: {
      run_id: { type: "string" },
      phase: {
        type: "string",
        enum: [
          "preparing",
          "sending",
          "paused",
          "canceling",
          "sent",
          "sent_with_errors",
          "canceled",
          "failed",
        ],
      },
      selected: { type: "integer" },
      materialized: { type: "integer" },
      accepted: { type: "integer" },
      skipped: { type: "integer" },
      retrying: { type: "integer" },
      permanent_failed: { type: "integer" },
      unknown: { type: "integer" },
      canceled: { type: "integer" },
      percent_complete: { type: "number" },
      effective_rate: { type: "number" },
      provider_limited_rate: { type: "number", nullable: true },
      provider: {
        type: "string",
        nullable: true,
        description: "The email delivery provider used by this send.",
      },
      estimated_completion: nullableDateTimeSchema,
      estimated_completion_basis: {
        type: "string",
        enum: ["current-rate", "provider-quota"],
        nullable: true,
        description:
          "Whether the estimate uses only the current rate or also includes known provider quota windows.",
      },
      last_progress_at: nullableDateTimeSchema,
      pause_reason: { type: "string", nullable: true },
      next_retry_at: nullableDateTimeSchema,
      next_retry_action: {
        type: "string",
        enum: ["resume", "recheck"],
        nullable: true,
        description:
          "Whether the next time is a known quota reset or another connection check.",
      },
      pause_message: { type: "string", nullable: true },
      terminal: { type: "boolean" },
    },
  },
  BroadcastSendPreflight: {
    type: "object",
    description:
      "Current Subscriber estimate, provider capacity, sender and event setup health, duration estimate, and blocking issues.",
    required: [
      "workspace_id",
      "broadcast_id",
      "subject",
      "recipient_estimate",
      "connection",
      "provider_production_status",
      "remaining_daily_quota",
      "sending_quota",
      "safe_send_rate",
      "estimated_duration_seconds",
      "sender_authentication_status",
      "event_webhook_health",
      "blocking_issues",
      "checked_at",
      "send_proof",
      "send_proof_expires_at",
    ],
    properties: {
      workspace_id: { type: "string" },
      broadcast_id: { type: "string" },
      subject: { type: "string" },
      recipient_estimate: { type: "integer", minimum: 0 },
      connection: {
        type: "object",
        required: ["id", "name", "provider"],
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          provider: { type: "string" },
        },
      },
      provider_production_status: {
        type: "string",
        enum: ["production", "restricted", "unknown"],
      },
      remaining_daily_quota: { type: "integer", minimum: 0, nullable: true },
      sending_quota: {
        type: "object",
        nullable: true,
        required: ["remaining", "limit", "period"],
        properties: {
          remaining: { type: "integer", minimum: 0 },
          limit: { type: "integer", minimum: 1 },
          period: {
            type: "string",
            enum: ["rolling-24-hours", "day", "month"],
          },
        },
      },
      safe_send_rate: { type: "number", exclusiveMinimum: 0, nullable: true },
      estimated_duration_seconds: {
        type: "integer",
        minimum: 0,
        nullable: true,
      },
      sender_authentication_status: {
        type: "string",
        enum: ["verified", "unverified", "unknown"],
      },
      event_webhook_health: {
        type: "string",
        enum: ["healthy", "unknown"],
      },
      blocking_issues: {
        type: "array",
        items: {
          type: "object",
          required: ["code", "message", "resolution"],
          properties: {
            code: { type: "string" },
            message: { type: "string" },
            resolution: { type: "string" },
          },
        },
      },
      checked_at: dateTimeSchema,
      send_proof: {
        type: "string",
        nullable: true,
        description:
          "Short-lived proof returned when preflight passes. Submit it unchanged to Send so Mailrith can accept the durable run without repeating the expensive Subscriber count and provider checks.",
      },
      send_proof_expires_at: {
        ...nullableDateTimeSchema,
        description:
          "When the short-lived Send proof expires. Run preflight again after this time.",
      },
    },
  },
  BroadcastDeliveryError: {
    type: "object",
    required: [
      "id",
      "subscriber_id",
      "outcome",
      "attempt_count",
      "error_code",
      "updated_at",
    ],
    properties: {
      id: { type: "integer", minimum: 1 },
      subscriber_id: { type: "string" },
      outcome: { type: "string", enum: ["failed", "unknown"] },
      attempt_count: { type: "integer", minimum: 0 },
      error_code: { type: "string", nullable: true },
      updated_at: dateTimeSchema,
    },
  },
  SequenceUpsertRequest: {
    type: "object",
    required: ["name", "definition"],
    properties: {
      name: { type: "string" },
      connection_id: { type: "string", nullable: true },
      reply_to_email: { type: "string", nullable: true },
      track_opens: { type: "boolean" },
      track_clicks: { type: "boolean" },
      utm_source: { type: "string", nullable: true },
      utm_medium: { type: "string", nullable: true },
      utm_campaign: { type: "string", nullable: true },
      utm_term: { type: "string", nullable: true },
      utm_content: { type: "string", nullable: true },
      definition: {
        type: "object",
        additionalProperties: true,
      },
    },
  },
  SequenceStatusRequest: {
    type: "object",
    required: ["status"],
    properties: {
      status: { type: "string", enum: ["running", "paused"] },
    },
  },
  Automation: {
    type: "object",
    required: [
      "id",
      "name",
      "status",
      "is_updating",
      "definition",
      "subscriber_count",
      "created_at",
      "updated_at",
    ],
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      status: { type: "string", enum: ["draft", "running", "paused"] },
      is_updating: {
        type: "boolean",
        description:
          "True while Mailrith updates existing Subscriber progress after a structural Automation change.",
      },
      definition: {
        type: "object",
        additionalProperties: true,
      },
      subscriber_count: { type: "integer" },
      created_at: dateTimeSchema,
      updated_at: dateTimeSchema,
    },
  },
  AutomationUpsertRequest: {
    type: "object",
    required: ["name", "definition"],
    properties: {
      name: { type: "string" },
      definition: {
        type: "object",
        additionalProperties: true,
      },
    },
  },
  AutomationStatusRequest: {
    type: "object",
    required: ["status"],
    properties: {
      status: { type: "string", enum: ["running", "paused"] },
    },
  },
  MagicLink: {
    type: "object",
    required: [
      "id",
      "name",
      "target_type",
      "redirect_url",
      "success_message",
      "add_tag_ids",
      "remove_tag_ids",
      "add_sequence_ids",
      "remove_sequence_ids",
      "click_count",
      "public_url",
      "created_at",
      "updated_at",
    ],
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      target_type: { type: "string", enum: ["redirect", "message"] },
      redirect_url: { type: "string" },
      success_message: { type: "string" },
      add_tag_ids: stringArraySchema,
      remove_tag_ids: stringArraySchema,
      add_sequence_ids: stringArraySchema,
      remove_sequence_ids: stringArraySchema,
      click_count: { type: "integer" },
      public_url: { type: "string" },
      created_at: dateTimeSchema,
      updated_at: dateTimeSchema,
    },
  },
  MagicLinkUpsertRequest: {
    type: "object",
    required: ["name", "target_type"],
    properties: {
      name: { type: "string" },
      target_type: { type: "string", enum: ["redirect", "message"] },
      redirect_url: { type: "string", nullable: true },
      success_message: { type: "string", nullable: true },
      add_tag_ids: stringArraySchema,
      remove_tag_ids: stringArraySchema,
      add_sequence_ids: stringArraySchema,
      remove_sequence_ids: stringArraySchema,
    },
  },
  Broadcast: {
    type: "object",
    required: [
      "id",
      "subject",
      "preview_text",
      "body",
      "body_document",
      "status",
      "scheduled_at",
      "completed_at",
      "connection_id",
      "from_name",
      "from_email",
      "reply_to_email",
      "audience_definition",
      "track_opens",
      "track_clicks",
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "recipient_count",
      "opened_count",
      "clicked_count",
      "unsubscribed_count",
      "bounced_count",
      "complained_count",
      "created_at",
      "updated_at",
    ],
    properties: {
      id: { type: "string" },
      subject: { type: "string" },
      preview_text: { type: "string", nullable: true },
      body: { type: "string" },
      body_document: {
        type: "object",
        additionalProperties: true,
      },
      status: {
        type: "string",
        enum: ["draft", "scheduled", "running", "completed", "failed"],
      },
      scheduled_at: nullableDateTimeSchema,
      completed_at: nullableDateTimeSchema,
      connection_id: { type: "string", nullable: true },
      from_name: { type: "string", nullable: true },
      from_email: { type: "string", nullable: true },
      reply_to_email: { type: "string", nullable: true },
      audience_definition: {
        type: "object",
        nullable: true,
        additionalProperties: true,
      },
      track_opens: { type: "boolean" },
      track_clicks: { type: "boolean" },
      utm_source: { type: "string", nullable: true },
      utm_medium: { type: "string", nullable: true },
      utm_campaign: { type: "string", nullable: true },
      utm_term: { type: "string", nullable: true },
      utm_content: { type: "string", nullable: true },
      recipient_count: { type: "integer" },
      opened_count: { type: "integer" },
      clicked_count: { type: "integer" },
      unsubscribed_count: { type: "integer" },
      bounced_count: { type: "integer" },
      complained_count: { type: "integer" },
      created_at: dateTimeSchema,
      updated_at: dateTimeSchema,
    },
  },
  BroadcastUpsertRequest: {
    type: "object",
    required: ["subject", "body_document"],
    properties: {
      subject: { type: "string" },
      preview_text: { type: "string", nullable: true },
      body_document: {
        type: "object",
        additionalProperties: true,
      },
      connection_id: { type: "string", nullable: true },
      reply_to_email: { type: "string", nullable: true },
      audience_definition: {
        type: "object",
        nullable: true,
        additionalProperties: true,
      },
      track_opens: { type: "boolean" },
      track_clicks: { type: "boolean" },
      utm_source: { type: "string", nullable: true },
      utm_medium: { type: "string", nullable: true },
      utm_campaign: { type: "string", nullable: true },
      utm_term: { type: "string", nullable: true },
      utm_content: { type: "string", nullable: true },
    },
  },
  BroadcastTestRequest: {
    type: "object",
    required: ["recipient"],
    properties: {
      recipient: { type: "string", format: "email" },
    },
  },
  ActionResult: {
    type: "object",
    required: ["status"],
    properties: {
      status: { type: "string", enum: ["completed"] },
    },
  },
  Segment: {
    type: "object",
    required: [
      "id",
      "name",
      "description",
      "definition",
      "confirmed_subscriber_count",
      "total_subscriber_count",
      "created_at",
      "updated_at",
    ],
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      description: { type: "string", nullable: true },
      definition: {
        type: "object",
        additionalProperties: true,
      },
      confirmed_subscriber_count: { type: "integer" },
      total_subscriber_count: { type: "integer" },
      created_at: dateTimeSchema,
      updated_at: dateTimeSchema,
    },
  },
  SegmentUpsertRequest: {
    type: "object",
    required: ["name", "definition"],
    properties: {
      name: { type: "string" },
      description: { type: "string", nullable: true },
      definition: {
        type: "object",
        description: "The segment filters. Include at least one filter group.",
        additionalProperties: true,
      },
    },
  },
  SegmentPreviewRequest: {
    type: "object",
    required: ["definition"],
    properties: {
      definition: {
        type: "object",
        description:
          "The segment filters to preview. Include at least one filter group.",
        additionalProperties: true,
      },
      current_segment_id: {
        type: "string",
        nullable: true,
        description:
          "When previewing an edit to an existing segment, include that segment id so Mailrith can catch circular segment references before saving.",
      },
    },
  },
  SegmentPreview: {
    type: "object",
    required: ["confirmed_subscriber_count", "total_subscriber_count"],
    properties: {
      confirmed_subscriber_count: { type: "integer" },
      total_subscriber_count: { type: "integer" },
    },
  },
  SubscriberImportJob: {
    type: "object",
    required: [
      "id",
      "status",
      "imported_count",
      "error_message",
      "started_at",
      "completed_at",
      "created_at",
      "updated_at",
    ],
    properties: {
      id: { type: "string" },
      status: {
        type: "string",
        enum: ["Queued", "Processing", "Completed", "Failed"],
      },
      imported_count: { type: "integer", nullable: true },
      error_message: { type: "string", nullable: true },
      started_at: nullableDateTimeSchema,
      completed_at: nullableDateTimeSchema,
      created_at: dateTimeSchema,
      updated_at: dateTimeSchema,
    },
  },
  SubscriberImportJobCreateRequest: {
    type: "object",
    required: ["csv_text", "mappings"],
    properties: {
      csv_text: { type: "string" },
      mappings: {
        type: "array",
        description:
          "Map each CSV column and each Mailrith field only once. Every csv_column value must exactly match a header in csv_text.",
        items: {
          type: "object",
          required: ["csv_column", "field"],
          properties: {
            csv_column: { type: "string" },
            field: {
              type: "object",
              required: ["type"],
              properties: {
                type: {
                  type: "string",
                  enum: [
                    "email",
                    "name",
                    "custom-field",
                    "country",
                    "subscriber-status",
                  ],
                },
                custom_field_id: { type: "string", nullable: true },
              },
            },
          },
        },
      },
      new_tag_name: { type: "string", nullable: true },
      existing_tag_ids: stringArraySchema,
      sequence_ids: stringArraySchema,
    },
  },
  SubscriberExportJob: {
    type: "object",
    required: [
      "id",
      "status",
      "selection",
      "exported_count",
      "file_name",
      "download_url",
      "expires_at",
      "error_message",
      "started_at",
      "completed_at",
      "created_at",
      "updated_at",
    ],
    properties: {
      id: { type: "string" },
      status: {
        type: "string",
        enum: ["Queued", "Processing", "Completed", "Failed"],
      },
      selection: {
        type: "object",
        required: ["query", "status", "cold_only"],
        properties: {
          query: { type: "string", nullable: true },
          status: {
            type: "string",
            nullable: true,
            enum: [
              "Active",
              "Unconfirmed",
              "Unsubscribed",
              "Complained",
              "Bounced",
              "Blocked",
              null,
            ],
          },
          cold_only: { type: "boolean" },
        },
      },
      exported_count: { type: "integer", nullable: true },
      file_name: { type: "string", nullable: true },
      download_url: { type: "string", nullable: true },
      expires_at: nullableDateTimeSchema,
      error_message: { type: "string", nullable: true },
      started_at: nullableDateTimeSchema,
      completed_at: nullableDateTimeSchema,
      created_at: dateTimeSchema,
      updated_at: dateTimeSchema,
    },
  },
  SubscriberExportJobCreateRequest: {
    type: "object",
    properties: {
      query: { type: "string", nullable: true },
      status: {
        type: "string",
        nullable: true,
        enum: [
          "Active",
          "Unconfirmed",
          "Unsubscribed",
          "Complained",
          "Bounced",
          "Blocked",
          null,
        ],
      },
      cold_only: { type: "boolean" },
    },
  },
  AnalyticsReport: {
    type: "object",
    additionalProperties: true,
    description:
      "A 24-hour cached report with at most 100 aggregate rows, explicit definitions, freshness, attribution, and optional previous-period comparison.",
  },
  AnalyticsReportCreateRequest: {
    type: "object",
    required: ["from", "to"],
    additionalProperties: false,
    properties: {
      from: { type: "string", format: "date" },
      to: { type: "string", format: "date" },
      source_types: {
        type: "array",
        maxItems: 3,
        items: { type: "string", enum: ["broadcast", "sequence", "automation"] },
      },
      source_ids: { type: "array", maxItems: 20, items: { type: "string" } },
      group_by: {
        type: "array",
        maxItems: 2,
        items: {
          type: "string",
          enum: ["source_type", "campaign", "message", "provider", "day"],
        },
      },
      compare_previous: { type: "boolean", default: true },
    },
  },
  DiagnosticResult: {
    type: "object",
    additionalProperties: true,
    description:
      "A bounded diagnostic result. Subscriber email addresses and Automation input/output snapshots are omitted.",
  },
  ComplianceEventCreateRequest: {
    type: "object",
    required: ["type"],
    additionalProperties: false,
    properties: {
      type: {
        type: "string",
        enum: [
          "consent_withdrawn",
          "erasure_requested",
          "erasure_completed",
          "processing_restricted",
          "objection_recorded",
          "privacy_request_completed",
        ],
      },
      evidence_reference: { type: "string", maxLength: 512, nullable: true },
      occurred_at: nullableDateTimeSchema,
    },
  },
  Recommendation: {
    type: "object",
    additionalProperties: true,
    description:
      "Evidence-backed advice only. A recommendation has no execution endpoint and must create a separate action plan before any mutation can run.",
  },
  RecommendationCreateRequest: {
    type: "object",
    required: [
      "proposed_operation_id",
      "proposed_request",
      "evidence",
      "confidence",
      "expected_effect",
      "risk_class",
    ],
    additionalProperties: false,
    properties: {
      proposed_operation_id: { type: "string", maxLength: 128 },
      proposed_request: { type: "object", additionalProperties: true },
      evidence: { type: "array", minItems: 1, maxItems: 10, items: { type: "object" } },
      confidence: { type: "number", minimum: 0, maximum: 1 },
      expected_effect: { type: "object", additionalProperties: true },
      risk_class: { type: "string", maxLength: 64 },
    },
  },
  Experiment: {
    type: "object",
    additionalProperties: true,
    description:
      "A reference-only experiment with fixed safety limits and recommendation-only winner behavior.",
  },
  ExperimentCreateRequest: {
    type: "object",
    required: [
      "type",
      "source_type",
      "source_id",
      "metric",
      "minimum_sample_size",
      "minimum_duration_hours",
      "variants",
    ],
    additionalProperties: false,
    properties: {
      type: { type: "string", enum: ["subject", "content", "timing", "segment"] },
      source_type: { type: "string", enum: ["broadcast", "sequence", "automation"] },
      source_id: { type: "string" },
      metric: { type: "string", enum: ["opened", "clicked", "unsubscribed", "complained"] },
      minimum_sample_size: { type: "integer", minimum: 100, maximum: 1000000 },
      minimum_duration_hours: { type: "integer", minimum: 1, maximum: 2160 },
      status: { type: "string", enum: ["draft", "running"], default: "draft" },
      variants: {
        type: "array",
        minItems: 2,
        maxItems: 5,
        items: {
          type: "object",
          required: ["id", "label", "source_reference", "digest"],
          additionalProperties: false,
          properties: {
            id: { type: "string" },
            label: { type: "string" },
            source_reference: { type: "string" },
            digest: { type: "string", pattern: "^[a-f0-9]{64}$" },
          },
        },
      },
    },
  },
  ExperimentDecisionRequest: {
    type: "object",
    required: ["winner_variant_id", "evidence"],
    properties: {
      winner_variant_id: { type: "string" },
      evidence: { type: "object", additionalProperties: true },
    },
  },
};

const security = [{ WorkspaceApiKey: [] }];
const idempotencyKeyParameter = {
  name: "Idempotency-Key",
  in: "header",
  description: "Optional idempotency key to retry the request safely.",
  schema: { type: "string" },
} as const;

const listOperationResponse = (itemRef: string) => ({
  description: "Successful response",
  content: {
    "application/json": {
      schema: {
        type: "object",
        required: ["data", "pagination"],
        properties: {
          data: {
            type: "array",
            items: { $ref: itemRef },
          },
          pagination: { $ref: "#/components/schemas/Pagination" },
        },
      },
    },
  },
});

const itemOperationResponse = (
  itemRef: string,
  description = "Successful response",
) => ({
  description,
  content: {
    "application/json": {
      schema: {
        type: "object",
        required: ["data"],
        properties: {
          data: { $ref: itemRef },
        },
      },
    },
  },
});

export const publicApiSpec: PublicApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "Mailrith API",
    version: publicApiVersion,
    description:
      "Mailrith's public API for subscriber sync, workspace discovery, product control-plane operations, and async subscriber import/export jobs.",
  },
  servers: [
    { url: "https://api.mailrith.com", description: "Production" },
    { url: "https://api-stage.mailrith.com", description: "Stage" },
    { url: "http://localhost:8787", description: "Local development" },
  ],
  tags: publicApiTags,
  components: {
    securitySchemes: {
      WorkspaceApiKey: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "Bearer Credential",
        description:
          "Workspace-scoped bearer credential. Mailrith accepts either a workspace API key or an OAuth access token issued to an approved client.",
      },
    },
    schemas,
  },
  paths: {
    "/v1": {
      get: {
        method: "GET",
        path: "/v1",
        summary: "Get API metadata",
        description:
          "Returns the current public API version and discovery links for docs, llms files, the OpenAPI contract, webhook subscriptions, and the authenticated capability endpoint.",
        tags: ["Platform"],
        operationId: "getPublicApiMeta",
        responses: {
          "200": {
            description: "Successful response",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiMetadata" },
              },
            },
          },
        },
      },
    },
    "/v1/capabilities": {
      get: {
        method: "GET",
        path: "/v1/capabilities",
        summary: "Get authenticated API capabilities",
        description:
          "Returns the current workspace context, discovery URLs, shared request conventions, supported webhook events, and public resource operations available to the authenticated bearer credential.",
        tags: ["Platform"],
        operationId: "getPublicApiCapabilities",
        security,
        responses: {
          "200": {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["data"],
                  properties: {
                    data: { $ref: "#/components/schemas/Capabilities" },
                  },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/openapi.json": {
      get: {
        method: "GET",
        path: "/v1/openapi.json",
        summary: "Get the OpenAPI document",
        description:
          "Returns the machine-readable OpenAPI 3.1 contract for the current public API.",
        tags: ["Platform"],
        operationId: "getPublicApiOpenApiDocument",
        responses: {
          "200": {
            description: "Successful response",
            content: {
              "application/json": {
                schema: { type: "object" },
              },
            },
          },
        },
      },
    },
    "/v1/analytics/reports": {
      post: {
        method: "POST",
        path: "/v1/analytics/reports",
        summary: "Create or reuse an analytics report",
        description:
          "Runs from compact rollups. Ranges through 31 days complete inline; longer ranges are queued. Results expire after 24 hours and never exceed 100 rows.",
        tags: ["Analytics"],
        operationId: "createAnalyticsReport",
        security,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AnalyticsReportCreateRequest" },
            },
          },
        },
        responses: {
          "200": itemOperationResponse("#/components/schemas/AnalyticsReport"),
          "202": itemOperationResponse(
            "#/components/schemas/AnalyticsReport",
            "The bounded report was queued.",
          ),
        },
      },
    },
    "/v1/analytics/reports/{report_id}": {
      get: {
        method: "GET",
        path: "/v1/analytics/reports/{report_id}",
        summary: "Get an analytics report",
        description: "Returns one unexpired bounded analytics report by identifier.",
        tags: ["Analytics"],
        operationId: "getAnalyticsReport",
        security,
        parameters: [
          { name: "report_id", in: "path", required: true, description: "Stable analytics report identifier.", schema: { type: "string" } },
          { name: "limit", in: "query", description: "Maximum aggregate row count, from 1 to 50.", schema: { type: "integer", minimum: 1, maximum: 50 } },
          { name: "starting_after", in: "query", description: "Opaque next_cursor returned by the previous report page.", schema: { type: "string" } },
        ],
        responses: {
          "200": itemOperationResponse("#/components/schemas/AnalyticsReport"),
        },
      },
    },
    "/v1/diagnostics/automations/{automation_id}/runs": {
      get: {
        method: "GET",
        path: "/v1/diagnostics/automations/{automation_id}/runs",
        summary: "List Automation run diagnostics",
        description:
          "Returns at most 50 recent runs with redacted errors and bounded step execution details.",
        tags: ["Diagnostics"],
        operationId: "listAutomationRunDiagnostics",
        security,
        parameters: [
          { name: "automation_id", in: "path", required: true, description: "Automation identifier.", schema: { type: "string" } },
          { name: "limit", in: "query", description: "Maximum run count, from 1 to 50.", schema: { type: "integer", minimum: 1, maximum: 50 } },
        ],
        responses: {
          "200": itemOperationResponse("#/components/schemas/DiagnosticResult"),
        },
      },
    },
    "/v1/diagnostics/automations/{automation_id}/runs/{run_id}": {
      get: {
        method: "GET",
        path: "/v1/diagnostics/automations/{automation_id}/runs/{run_id}",
        summary: "Get Automation run diagnostics",
        description:
          "Returns one Automation run with status, timing, retries, outcomes, and redacted step failures.",
        tags: ["Diagnostics"],
        operationId: "getAutomationRunDiagnostics",
        security,
        parameters: [
          { name: "automation_id", in: "path", required: true, description: "Automation identifier.", schema: { type: "string" } },
          { name: "run_id", in: "path", required: true, description: "Automation run identifier.", schema: { type: "string" } },
        ],
        responses: {
          "200": itemOperationResponse("#/components/schemas/DiagnosticResult"),
        },
      },
    },
    "/v1/diagnostics/sequences/{sequence_id}": {
      get: {
        method: "GET",
        path: "/v1/diagnostics/sequences/{sequence_id}",
        summary: "Get Sequence diagnostics",
        description:
          "Returns bounded Sequence failure, retry, status, and message outcome details.",
        tags: ["Diagnostics"],
        operationId: "getSequenceDiagnostics",
        security,
        parameters: [
          { name: "sequence_id", in: "path", required: true, description: "Sequence identifier.", schema: { type: "string" } },
          { name: "limit", in: "query", description: "Maximum failure count, from 1 to 50.", schema: { type: "integer", minimum: 1, maximum: 50 } },
        ],
        responses: {
          "200": itemOperationResponse("#/components/schemas/DiagnosticResult"),
        },
      },
    },
    "/v1/diagnostics/broadcasts/{broadcast_id}": {
      get: {
        method: "GET",
        path: "/v1/diagnostics/broadcasts/{broadcast_id}",
        summary: "Get Broadcast diagnostics",
        description:
          "Returns selection totals, provider readiness, and the 20 most common structured delivery reasons.",
        tags: ["Diagnostics"],
        operationId: "getBroadcastDiagnostics",
        security,
        parameters: [
          { name: "broadcast_id", in: "path", required: true, description: "Broadcast identifier.", schema: { type: "string" } },
        ],
        responses: {
          "200": itemOperationResponse("#/components/schemas/DiagnosticResult"),
        },
      },
    },
    "/v1/diagnostics/subscribers/{subscriber_id}": {
      get: {
        method: "GET",
        path: "/v1/diagnostics/subscribers/{subscriber_id}",
        summary: "Get privacy-conscious Subscriber diagnostics",
        description:
          "Returns a 90-day, bounded activity view without exposing the Subscriber email address.",
        tags: ["Diagnostics"],
        operationId: "getSubscriberActivityDiagnostics",
        security,
        parameters: [
          { name: "subscriber_id", in: "path", required: true, description: "Subscriber identifier.", schema: { type: "string" } },
        ],
        responses: {
          "200": itemOperationResponse("#/components/schemas/DiagnosticResult"),
        },
      },
    },
    "/v1/subscribers/{subscriber_id}/compliance-events": {
      post: {
        method: "POST",
        path: "/v1/subscribers/{subscriber_id}/compliance-events",
        summary: "Record a Subscriber compliance event",
        description:
          "Stores a one-way subject hash and optional external evidence reference. Raw IP, user-agent, and evidence payloads are not accepted.",
        tags: ["Consent And Privacy Events"],
        operationId: "recordSubscriberComplianceEvent",
        security,
        parameters: [
          { name: "subscriber_id", in: "path", required: true, description: "Subscriber identifier.", schema: { type: "string" } },
          idempotencyKeyParameter,
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ComplianceEventCreateRequest" },
            },
          },
        },
        responses: {
          "201": itemOperationResponse("#/components/schemas/DiagnosticResult"),
        },
      },
    },
    "/v1/recommendations": {
      get: {
        method: "GET",
        path: "/v1/recommendations",
        summary: "List recommendations",
        description:
          "Returns the current credential's unexpired recommendations in a bounded page.",
        tags: ["Recommendations"],
        operationId: "listRecommendations",
        security,
        parameters: [
          { name: "limit", in: "query", description: "Maximum recommendation count, from 1 to 50.", schema: { type: "integer", minimum: 1, maximum: 50 } },
          { name: "starting_after", in: "query", description: "Opaque next_cursor returned by the previous page.", schema: { type: "string" } },
        ],
        responses: {
          "200": listOperationResponse("#/components/schemas/Recommendation"),
        },
      },
      post: {
        method: "POST",
        path: "/v1/recommendations",
        summary: "Create a recommendation",
        description:
          "Stores bounded evidence and a proposed request. This endpoint cannot execute the request.",
        tags: ["Recommendations"],
        operationId: "createRecommendation",
        security,
        parameters: [idempotencyKeyParameter],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RecommendationCreateRequest" },
            },
          },
        },
        responses: {
          "201": itemOperationResponse("#/components/schemas/Recommendation"),
        },
      },
    },
    "/v1/recommendations/{recommendation_id}": {
      get: {
        method: "GET",
        path: "/v1/recommendations/{recommendation_id}",
        summary: "Get a recommendation",
        description:
          "Returns one unexpired recommendation created by the current credential.",
        tags: ["Recommendations"],
        operationId: "getRecommendation",
        security,
        parameters: [
          { name: "recommendation_id", in: "path", required: true, description: "Recommendation identifier.", schema: { type: "string" } },
        ],
        responses: {
          "200": itemOperationResponse("#/components/schemas/Recommendation"),
        },
      },
    },
    "/v1/recommendations/{recommendation_id}/plan": {
      post: {
        method: "POST",
        path: "/v1/recommendations/{recommendation_id}/plan",
        summary: "Create a policy-checked action plan from a recommendation",
        description:
          "Creates the normal Mailrith action preview. It does not approve or execute the proposed request.",
        tags: ["Recommendations"],
        operationId: "planRecommendation",
        security,
        parameters: [
          { name: "recommendation_id", in: "path", required: true, description: "Recommendation identifier.", schema: { type: "string" } },
          idempotencyKeyParameter,
        ],
        responses: {
          "201": itemOperationResponse("#/components/schemas/AgentAction"),
        },
      },
    },
    "/v1/experiments": {
      get: {
        method: "GET",
        path: "/v1/experiments",
        summary: "List experiments",
        description: "Returns a bounded page of reference-only experiments.",
        tags: ["Experiments"],
        operationId: "listExperiments",
        security,
        parameters: [
          { name: "limit", in: "query", description: "Maximum experiment count, from 1 to 50.", schema: { type: "integer", minimum: 1, maximum: 50 } },
          { name: "starting_after", in: "query", description: "Opaque next_cursor returned by the previous page.", schema: { type: "string" } },
        ],
        responses: {
          "200": listOperationResponse("#/components/schemas/Experiment"),
        },
      },
      post: {
        method: "POST",
        path: "/v1/experiments",
        summary: "Create an experiment",
        description:
          "Stores only variant references and digests under fixed safety safeguards; it never stores per-Subscriber assignments.",
        tags: ["Experiments"],
        operationId: "createExperiment",
        security,
        parameters: [idempotencyKeyParameter],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ExperimentCreateRequest" },
            },
          },
        },
        responses: {
          "201": itemOperationResponse("#/components/schemas/Experiment"),
        },
      },
    },
    "/v1/experiments/{experiment_id}": {
      get: {
        method: "GET",
        path: "/v1/experiments/{experiment_id}",
        summary: "Get an experiment",
        description:
          "Returns one experiment, its fixed safeguards, and aggregate decision evidence.",
        tags: ["Experiments"],
        operationId: "getExperiment",
        security,
        parameters: [
          { name: "experiment_id", in: "path", required: true, description: "Experiment identifier.", schema: { type: "string" } },
        ],
        responses: {
          "200": itemOperationResponse("#/components/schemas/Experiment"),
        },
      },
    },
    "/v1/experiments/{experiment_id}/decision": {
      post: {
        method: "POST",
        path: "/v1/experiments/{experiment_id}/decision",
        summary: "Record an aggregate winner decision",
        description:
          "Validates minimum sample and duration safeguards. The decision is recorded as recommendation-only and never changes a campaign automatically.",
        tags: ["Experiments"],
        operationId: "recordExperimentDecision",
        security,
        parameters: [
          { name: "experiment_id", in: "path", required: true, description: "Experiment identifier.", schema: { type: "string" } },
          idempotencyKeyParameter,
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ExperimentDecisionRequest" },
            },
          },
        },
        responses: {
          "200": itemOperationResponse("#/components/schemas/Experiment"),
        },
      },
    },
    "/v1/agent-activity": {
      get: {
        method: "GET",
        path: "/v1/agent-activity",
        summary: "List agent activity",
        description:
          "Returns one redacted row per logical agent-originated mutation. Results use keyset pagination, default to seven days, and cannot span more than 30 days.",
        tags: ["Agent Activity"],
        operationId: "listAgentActivity",
        security,
        parameters: [
          {
            name: "limit",
            in: "query",
            description: "Number of activity rows to return, from 1 to 100.",
            schema: { type: "integer", minimum: 1, maximum: 100 },
          },
          {
            name: "cursor",
            in: "query",
            description: "Opaque cursor returned by the previous page.",
            schema: { type: "string" },
          },
          {
            name: "from",
            in: "query",
            description: "Inclusive ISO start timestamp. Defaults to seven days ago.",
            schema: { type: "string", format: "date-time" },
          },
          {
            name: "to",
            in: "query",
            description: "Inclusive ISO end timestamp. Defaults to now.",
            schema: { type: "string", format: "date-time" },
          },
          ...[
            ["client", "Exact OAuth client identifier."],
            ["credential_type", "Exact credential type."],
            ["credential_id", "Exact credential identifier."],
            ["operation", "Exact operation identifier."],
            ["risk", "Exact risk tier."],
            ["outcome", "Exact activity outcome."],
            ["resource_type", "Exact target resource type."],
            ["resource_id", "Exact target resource identifier."],
            ["request_id", "Exact request correlation identifier."],
            ["action_id", "Exact action identifier."],
          ].map(([name, description]) => ({
            name,
            in: "query" as const,
            description,
            schema: { type: "string" },
          })),
        ],
        responses: {
          "200": {
            description: "A bounded page of redacted agent activity.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AgentActivityListResponse" },
              },
            },
          },
          "400": {
            description: "A cursor, filter, or date range is invalid.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/agent-activity/{activity_id}": {
      get: {
        method: "GET",
        path: "/v1/agent-activity/{activity_id}",
        summary: "Get agent activity",
        description:
          "Returns one redacted activity trail with correlation, approval, retry, result, and retention metadata.",
        tags: ["Agent Activity"],
        operationId: "getAgentActivity",
        security,
        parameters: [
          {
            name: "activity_id",
            in: "path",
            required: true,
            description: "The activity or action identifier.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "The redacted activity trail.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AgentActivityResponse" },
              },
            },
          },
          "404": {
            description: "The activity row was not found.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/agent-actions/{action_id}": {
      get: {
        method: "GET",
        path: "/v1/agent-actions/{action_id}",
        summary: "Get an agent action plan",
        description:
          "Returns the bounded preview and current approval or execution state for an action created by this credential.",
        tags: ["Agent Actions"],
        operationId: "getAgentAction",
        security,
        parameters: [
          {
            name: "action_id",
            in: "path",
            required: true,
            description: "The action plan identifier.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "The action plan was returned.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AgentActionResponse" },
              },
            },
          },
          "404": {
            description: "The action plan was not found for this credential.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/agent-actions/{action_id}/approval-token": {
      post: {
        method: "POST",
        path: "/v1/agent-actions/{action_id}/approval-token",
        summary: "Claim an approved action token",
        description:
          "Issues the approved action's short-lived, single-use execution token once. The token is bound to this credential, operation, canonical input, and resource version.",
        tags: ["Agent Actions"],
        operationId: "issueAgentApprovalToken",
        security,
        parameters: [
          {
            name: "action_id",
            in: "path",
            required: true,
            description: "The approved action plan identifier.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "The one-time execution token was issued.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AgentApprovalTokenResponse",
                },
              },
            },
          },
          "409": {
            description:
              "The action is not approved, expired, revoked, or its token was already issued.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/workspace": {
      get: {
        method: "GET",
        path: "/v1/workspace",
        summary: "Get the current workspace",
        description:
          "Returns the authenticated workspace profile and mailing context used by broadcasts, sequences, automations, forms, and magic links.",
        tags: ["Workspace"],
        operationId: "getWorkspace",
        security,
        responses: {
          "200": itemOperationResponse("#/components/schemas/Workspace"),
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/webhook-subscriptions": {
      get: {
        method: "GET",
        path: "/v1/webhook-subscriptions",
        summary: "List webhook subscriptions",
        description:
          "Returns the outbound webhook subscriptions configured for the authenticated workspace.",
        tags: ["Webhooks"],
        operationId: "listWebhookSubscriptions",
        security,
        responses: {
          "200": listOperationResponse(
            "#/components/schemas/WebhookSubscription",
          ),
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      post: {
        method: "POST",
        path: "/v1/webhook-subscriptions",
        summary: "Create a webhook subscription",
        description:
          "Creates a signed outbound webhook subscription and returns the signing secret once. The caller must also have read scopes for the selected event families.",
        tags: ["Webhooks"],
        operationId: "createWebhookSubscription",
        security,
        parameters: [idempotencyKeyParameter],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/WebhookSubscriptionCreateRequest",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Webhook subscription created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["data"],
                  properties: {
                    data: {
                      $ref: "#/components/schemas/WebhookSubscriptionCreateResult",
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid request",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "409": {
            description: "Conflict",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/webhook-subscriptions/{webhook_subscription_id}": {
      get: {
        method: "GET",
        path: "/v1/webhook-subscriptions/{webhook_subscription_id}",
        summary: "Get a webhook subscription",
        description:
          "Returns one outbound webhook subscription configured for the authenticated workspace.",
        tags: ["Webhooks"],
        operationId: "getWebhookSubscription",
        security,
        parameters: [
          {
            name: "webhook_subscription_id",
            in: "path",
            required: true,
            description: "The webhook subscription identifier.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": itemOperationResponse(
            "#/components/schemas/WebhookSubscription",
          ),
          "404": {
            description: "Not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      put: {
        method: "PUT",
        path: "/v1/webhook-subscriptions/{webhook_subscription_id}",
        summary: "Update a webhook subscription",
        description:
          "Updates the destination URL, status, or event pattern set for an existing webhook subscription. The caller must also have read scopes for the subscription's event families.",
        tags: ["Webhooks"],
        operationId: "updateWebhookSubscription",
        security,
        parameters: [
          {
            name: "webhook_subscription_id",
            in: "path",
            required: true,
            description: "The webhook subscription identifier.",
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/WebhookSubscriptionUpdateRequest",
              },
            },
          },
        },
        responses: {
          "200": itemOperationResponse(
            "#/components/schemas/WebhookSubscription",
          ),
          "400": {
            description: "Invalid request",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "404": {
            description: "Not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "409": {
            description: "Conflict",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      delete: {
        method: "DELETE",
        path: "/v1/webhook-subscriptions/{webhook_subscription_id}",
        summary: "Delete a webhook subscription",
        description:
          "Deletes an existing outbound webhook subscription from the authenticated workspace.",
        tags: ["Webhooks"],
        operationId: "deleteWebhookSubscription",
        security,
        parameters: [
          {
            name: "webhook_subscription_id",
            in: "path",
            required: true,
            description: "The webhook subscription identifier.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Webhook subscription deleted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["data"],
                  properties: {
                    data: {
                      type: "object",
                      required: ["id", "deleted"],
                      properties: {
                        id: { type: "string" },
                        deleted: { type: "boolean", enum: [true] },
                      },
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/webhook-subscriptions/{webhook_subscription_id}/rotate-secret": {
      post: {
        method: "POST",
        path: "/v1/webhook-subscriptions/{webhook_subscription_id}/rotate-secret",
        summary: "Rotate a webhook signing secret",
        description:
          "Invalidates the existing webhook signing secret and returns a replacement once.",
        tags: ["Webhook Subscriptions"],
        operationId: "rotateWebhookSubscriptionSecret",
        security,
        parameters: [
          {
            name: "webhook_subscription_id",
            in: "path",
            required: true,
            description: "The webhook subscription identifier.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": itemOperationResponse(
            "#/components/schemas/WebhookSubscriptionCreateResult",
            "Webhook signing secret rotated",
          ),
          "404": {
            description: "Webhook subscription not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/email-templates": {
      get: {
        method: "GET",
        path: "/v1/email-templates",
        summary: "List email templates",
        description:
          "Returns reusable email templates linked to the authenticated workspace.",
        tags: ["Email Templates"],
        operationId: "listEmailTemplates",
        security,
        parameters: [
          {
            name: "limit",
            in: "query",
            description: "Maximum number of items to return.",
            schema: { type: "integer", minimum: 1, maximum: 100 },
          },
          {
            name: "starting_after",
            in: "query",
            description: "Opaque cursor returned by the previous page.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": listOperationResponse("#/components/schemas/EmailTemplate"),
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      post: {
        method: "POST",
        path: "/v1/email-templates",
        summary: "Create an email template",
        description:
          "Creates a reusable email template scoped to the authenticated workspace.",
        tags: ["Email Templates"],
        operationId: "createEmailTemplate",
        security,
        parameters: [
          {
            name: "Idempotency-Key",
            in: "header",
            description: "Optional idempotency key for safe retries.",
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/EmailTemplateUpsertRequest",
              },
            },
          },
        },
        responses: {
          "201": itemOperationResponse(
            "#/components/schemas/EmailTemplate",
            "Email template created",
          ),
          "400": {
            description: "Invalid request",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/email-templates/{template_id}": {
      get: {
        method: "GET",
        path: "/v1/email-templates/{template_id}",
        summary: "Get an email template",
        description:
          "Returns a reusable email template linked to the authenticated workspace.",
        tags: ["Email Templates"],
        operationId: "getEmailTemplate",
        security,
        parameters: [
          {
            name: "template_id",
            in: "path",
            required: true,
            description: "The email template identifier.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": itemOperationResponse("#/components/schemas/EmailTemplate"),
          "404": {
            description: "Not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      put: {
        method: "PUT",
        path: "/v1/email-templates/{template_id}",
        summary: "Update an email template",
        description:
          "Updates the content or enabled state of an existing email template.",
        tags: ["Email Templates"],
        operationId: "updateEmailTemplate",
        security,
        parameters: [
          {
            name: "template_id",
            in: "path",
            required: true,
            description: "The email template identifier.",
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/EmailTemplateUpsertRequest",
              },
            },
          },
        },
        responses: {
          "200": itemOperationResponse("#/components/schemas/EmailTemplate"),
          "400": {
            description: "Invalid request",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "404": {
            description: "Not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "409": {
            description:
              "The request conflicts with the current email template state.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      delete: {
        method: "DELETE",
        path: "/v1/email-templates/{template_id}",
        summary: "Delete an email template",
        description:
          "Deletes an existing email template linked to the authenticated workspace.",
        tags: ["Email Templates"],
        operationId: "deleteEmailTemplate",
        security,
        parameters: [
          {
            name: "template_id",
            in: "path",
            required: true,
            description: "The email template identifier.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "204": {
            description: "Email template deleted",
          },
          "404": {
            description: "Not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "409": {
            description:
              "The request conflicts with the current email template state.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/broadcasts": {
      get: {
        method: "GET",
        path: "/v1/broadcasts",
        summary: "List broadcasts",
        description:
          "Returns broadcast drafts, scheduled sends, active sends, and completed sends.",
        tags: ["Broadcasts"],
        operationId: "listBroadcasts",
        security,
        parameters: [
          {
            name: "limit",
            in: "query",
            description: "Maximum number of items to return.",
            schema: { type: "integer", minimum: 1, maximum: 100 },
          },
          {
            name: "starting_after",
            in: "query",
            description: "Opaque cursor returned by the previous page.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": listOperationResponse("#/components/schemas/Broadcast"),
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      post: {
        method: "POST",
        path: "/v1/broadcasts",
        summary: "Create a broadcast",
        description:
          "Creates a broadcast draft or scheduled broadcast in the authenticated workspace.",
        tags: ["Broadcasts"],
        operationId: "createBroadcast",
        security,
        parameters: [
          {
            name: "Idempotency-Key",
            in: "header",
            description: "Optional idempotency key for safe retries.",
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/BroadcastUpsertRequest" },
            },
          },
        },
        responses: {
          "201": itemOperationResponse(
            "#/components/schemas/Broadcast",
            "Broadcast created",
          ),
          "400": {
            description: "Invalid request",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/broadcasts/{broadcast_id}": {
      get: {
        method: "GET",
        path: "/v1/broadcasts/{broadcast_id}",
        summary: "Get a broadcast",
        description:
          "Returns a broadcast draft, scheduled send, active send, or completed send.",
        tags: ["Broadcasts"],
        operationId: "getBroadcast",
        security,
        parameters: [
          {
            name: "broadcast_id",
            in: "path",
            required: true,
            description: "The broadcast identifier.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": itemOperationResponse("#/components/schemas/Broadcast"),
          "404": {
            description: "Not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      put: {
        method: "PUT",
        path: "/v1/broadcasts/{broadcast_id}",
        summary: "Update a broadcast",
        description: "Updates a broadcast draft or scheduled send in place.",
        tags: ["Broadcasts"],
        operationId: "updateBroadcast",
        security,
        parameters: [
          {
            name: "broadcast_id",
            in: "path",
            required: true,
            description: "The broadcast identifier.",
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/BroadcastUpsertRequest" },
            },
          },
        },
        responses: {
          "200": itemOperationResponse("#/components/schemas/Broadcast"),
          "400": {
            description: "Invalid request",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "404": {
            description: "Not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      delete: {
        method: "DELETE",
        path: "/v1/broadcasts/{broadcast_id}",
        summary: "Delete a broadcast",
        description:
          "Deletes a draft, scheduled, or failed broadcast from the authenticated workspace. Broadcasts cannot be deleted after they start sending.",
        tags: ["Broadcasts"],
        operationId: "deleteBroadcast",
        security,
        parameters: [
          {
            name: "broadcast_id",
            in: "path",
            required: true,
            description: "The broadcast identifier.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "204": {
            description: "Broadcast deleted",
          },
          "404": {
            description: "Not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "409": {
            description: "Broadcast cannot be deleted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/broadcasts/{broadcast_id}/preflight": {
      get: {
        method: "GET",
        path: "/v1/broadcasts/{broadcast_id}/preflight",
        summary: "Inspect broadcast readiness",
        description:
          "Optionally checks the current Subscriber estimate, provider capacity, sender setup, event tracking, and blocking issues. This diagnostic is not required before starting a durable send.",
        tags: ["Broadcasts"],
        operationId: "preflightBroadcast",
        security,
        parameters: [
          {
            name: "broadcast_id",
            in: "path",
            required: true,
            description: "The broadcast identifier.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": itemOperationResponse(
            "#/components/schemas/BroadcastSendPreflight",
            "Broadcast preflight",
          ),
          "404": {
            description: "Resource not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/broadcasts/{broadcast_id}/progress": {
      get: {
        method: "GET",
        path: "/v1/broadcasts/{broadcast_id}/progress",
        summary: "Get broadcast send progress",
        description:
          "Returns bounded delivery progress, current rates, timing, outcome counts, and pause state. Poll until terminal is true; use 5 to 10 second intervals while progress changes and back off to 30 seconds when unchanged.",
        tags: ["Broadcasts"],
        operationId: "getBroadcastSendProgress",
        security,
        parameters: [
          {
            name: "broadcast_id",
            in: "path",
            required: true,
            description: "The broadcast identifier.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": itemOperationResponse(
            "#/components/schemas/BroadcastSendProgress",
            "Broadcast send progress",
          ),
          "404": {
            description: "Resource not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/broadcasts/{broadcast_id}/delivery-errors": {
      get: {
        method: "GET",
        path: "/v1/broadcasts/{broadcast_id}/delivery-errors",
        summary: "List broadcast delivery errors",
        description:
          "Returns a cursor-paginated page of permanent failures and unknown delivery results.",
        tags: ["Broadcasts"],
        operationId: "listBroadcastDeliveryErrors",
        security,
        parameters: [
          {
            name: "broadcast_id",
            in: "path",
            required: true,
            description: "The broadcast identifier.",
            schema: { type: "string" },
          },
          {
            name: "cursor",
            in: "query",
            description: "The last delivery ID returned by the previous page.",
            schema: { type: "integer" },
          },
          {
            name: "limit",
            in: "query",
            description: "The number of errors to return, from 1 to 100.",
            schema: { type: "integer", minimum: 1, maximum: 100 },
          },
        ],
        responses: {
          "200": {
            description: "Delivery error page",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["data"],
                  properties: {
                    data: {
                      type: "object",
                      required: ["items", "next_cursor"],
                      properties: {
                        items: {
                          type: "array",
                          items: {
                            $ref: "#/components/schemas/BroadcastDeliveryError",
                          },
                        },
                        next_cursor: { type: "integer", nullable: true },
                      },
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Resource not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/broadcasts/{broadcast_id}/send": {
      post: {
        method: "POST",
        path: "/v1/broadcasts/{broadcast_id}/send",
        summary: "Send a broadcast now",
        description:
          "Immediately creates durable preparation for a broadcast draft or scheduled send. Mailrith calculates the exact Subscriber total and checks provider readiness in the background before delivery. A 202 response means the durable send was accepted, not that provider delivery is complete. Reuse the same idempotency key if the response is lost.",
        tags: ["Broadcasts"],
        operationId: "sendBroadcast",
        security,
        parameters: [
          {
            name: "broadcast_id",
            in: "path",
            required: true,
            description: "The broadcast identifier.",
            schema: { type: "string" },
          },
          {
            name: "Idempotency-Key",
            in: "header",
            description: "Optional idempotency key to make retries safe.",
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  preflight_proof: {
                    type: "string",
                    description:
                      "Optional unchanged short-lived send_proof returned by a recent diagnostic preflight. A valid proof can seed its checked estimate. If it is omitted, expired, or no longer matches, Mailrith still creates the run immediately and calculates the exact total during durable preparation.",
                  },
                },
              },
            },
          },
        },
        responses: {
          "202": {
            description:
              "Broadcast send started or is waiting for an earlier active Broadcast to finish",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["data"],
                  properties: {
                    data: {
                      type: "object",
                      required: ["status", "run_id", "resource"],
                      properties: {
                        status: {
                          type: "string",
                          enum: ["running", "queued"],
                          description:
                            "Queued means Mailrith accepted the send and will start it automatically when a sending slot is available.",
                        },
                        run_id: { type: "string" },
                        resource: { $ref: "#/components/schemas/Broadcast" },
                      },
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Request is invalid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "404": {
            description: "Resource not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "409": {
            description: "Request conflicts with the current resource state",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/broadcasts/{broadcast_id}/cancel": {
      post: {
        method: "POST",
        path: "/v1/broadcasts/{broadcast_id}/cancel",
        summary: "Cancel a broadcast send",
        description:
          "Requests cancellation for delivery work that has not reached the provider. Provider-accepted emails cannot be recalled. Repeat the same request with the same idempotency key when the response is lost.",
        tags: ["Broadcasts"],
        operationId: "cancelBroadcastSend",
        security,
        parameters: [
          {
            name: "broadcast_id",
            in: "path",
            required: true,
            description: "The broadcast identifier.",
            schema: { type: "string" },
          },
          {
            name: "Idempotency-Key",
            in: "header",
            description: "Optional idempotency key to make retries safe.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "202": {
            description: "Broadcast cancellation accepted or already complete",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["data"],
                  properties: {
                    data: {
                      type: "object",
                      required: [
                        "status",
                        "run_id",
                        "changed",
                        "recovery_pending",
                        "message",
                      ],
                      properties: {
                        status: {
                          type: "string",
                          enum: ["canceling", "canceled"],
                          description:
                            "canceling while remaining work is stopping, or canceled when cancellation already finished.",
                        },
                        run_id: { type: "string" },
                        changed: { type: "boolean" },
                        recovery_pending: { type: "boolean" },
                        message: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Broadcast send not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "409": {
            description: "Broadcast send can no longer be canceled",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/broadcasts/{broadcast_id}/test": {
      post: {
        method: "POST",
        path: "/v1/broadcasts/{broadcast_id}/test",
        summary: "Send a broadcast test email",
        description:
          "Sends a test message from an existing broadcast to one recipient.",
        tags: ["Broadcasts"],
        operationId: "testBroadcast",
        security,
        parameters: [
          {
            name: "broadcast_id",
            in: "path",
            required: true,
            description: "The broadcast identifier.",
            schema: { type: "string" },
          },
          {
            name: "Idempotency-Key",
            in: "header",
            description: "Optional idempotency key to make retries safe.",
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/BroadcastTestRequest" },
            },
          },
        },
        responses: {
          "200": itemOperationResponse(
            "#/components/schemas/ActionResult",
            "Test email sent",
          ),
          "400": {
            description: "Request is invalid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "404": {
            description: "Resource not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/sequences": {
      get: {
        method: "GET",
        path: "/v1/sequences",
        summary: "List sequences",
        description: "Returns sequences in the authenticated workspace.",
        tags: ["Sequences"],
        operationId: "listSequences",
        security,
        parameters: [
          {
            name: "search",
            in: "query",
            description: "Filter sequences by ID, name, or status.",
            schema: { type: "string" },
          },
          {
            name: "limit",
            in: "query",
            description: "Maximum number of sequences to return.",
            schema: { type: "integer", minimum: 1, maximum: 100 },
          },
          {
            name: "starting_after",
            in: "query",
            description:
              "Use the opaque cursor from the previous page to request the next page.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": listOperationResponse("#/components/schemas/Sequence"),
          "401": {
            description: "Authentication is required or invalid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      post: {
        method: "POST",
        path: "/v1/sequences",
        summary: "Create a sequence",
        description: "Creates a sequence in the authenticated workspace.",
        tags: ["Sequences"],
        operationId: "createSequence",
        security,
        parameters: [
          {
            name: "Idempotency-Key",
            in: "header",
            description: "Optional idempotency key to make retries safe.",
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SequenceUpsertRequest" },
            },
          },
        },
        responses: {
          "201": itemOperationResponse(
            "#/components/schemas/Sequence",
            "Sequence created",
          ),
          "400": {
            description: "Request is invalid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/sequences/{sequence_id}": {
      get: {
        method: "GET",
        path: "/v1/sequences/{sequence_id}",
        summary: "Get a sequence",
        description: "Returns one sequence from the authenticated workspace.",
        tags: ["Sequences"],
        operationId: "getSequence",
        security,
        parameters: [
          {
            name: "sequence_id",
            in: "path",
            required: true,
            description: "The sequence identifier.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": itemOperationResponse("#/components/schemas/Sequence"),
          "404": {
            description: "Resource not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      put: {
        method: "PUT",
        path: "/v1/sequences/{sequence_id}",
        summary: "Update a sequence",
        description: "Updates an existing sequence.",
        tags: ["Sequences"],
        operationId: "updateSequence",
        security,
        parameters: [
          {
            name: "sequence_id",
            in: "path",
            required: true,
            description: "The sequence identifier.",
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SequenceUpsertRequest" },
            },
          },
        },
        responses: {
          "200": itemOperationResponse("#/components/schemas/Sequence"),
          "400": {
            description: "Request is invalid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "404": {
            description: "Resource not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      delete: {
        method: "DELETE",
        path: "/v1/sequences/{sequence_id}",
        summary: "Delete a sequence",
        description:
          "Deletes an existing sequence from the authenticated workspace.",
        tags: ["Sequences"],
        operationId: "deleteSequence",
        security,
        parameters: [
          {
            name: "sequence_id",
            in: "path",
            required: true,
            description: "The sequence identifier.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "204": {
            description: "Sequence was deleted",
          },
          "404": {
            description: "Resource not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/sequences/{sequence_id}/status": {
      put: {
        method: "PUT",
        path: "/v1/sequences/{sequence_id}/status",
        summary: "Activate or pause a sequence",
        description:
          "Starts or pauses one Sequence without changing its content or delivery settings.",
        tags: ["Sequences"],
        operationId: "updateSequenceStatus",
        security,
        parameters: [
          {
            name: "sequence_id",
            in: "path",
            required: true,
            description: "The Sequence identifier.",
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SequenceStatusRequest" },
            },
          },
        },
        responses: {
          "200": itemOperationResponse("#/components/schemas/Sequence"),
          "400": {
            description: "Request is invalid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "404": {
            description: "Sequence not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/automations": {
      get: {
        method: "GET",
        path: "/v1/automations",
        summary: "List automations",
        description: "Returns automations in the authenticated workspace.",
        tags: ["Automations"],
        operationId: "listAutomations",
        security,
        parameters: [
          {
            name: "limit",
            in: "query",
            description: "Maximum number of automations to return.",
            schema: { type: "integer", minimum: 1, maximum: 100 },
          },
          {
            name: "starting_after",
            in: "query",
            description:
              "Use the opaque cursor from the previous page to request the next page.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": listOperationResponse("#/components/schemas/Automation"),
          "401": {
            description: "Authentication is required or invalid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      post: {
        method: "POST",
        path: "/v1/automations",
        summary: "Create an automation",
        description: "Creates an automation in the authenticated workspace.",
        tags: ["Automations"],
        operationId: "createAutomation",
        security,
        parameters: [
          {
            name: "Idempotency-Key",
            in: "header",
            description: "Optional idempotency key to make retries safe.",
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AutomationUpsertRequest" },
            },
          },
        },
        responses: {
          "201": itemOperationResponse(
            "#/components/schemas/Automation",
            "Automation created",
          ),
          "400": {
            description: "Request is invalid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/automations/{automation_id}": {
      get: {
        method: "GET",
        path: "/v1/automations/{automation_id}",
        summary: "Get an automation",
        description: "Returns one automation from the authenticated workspace.",
        tags: ["Automations"],
        operationId: "getAutomation",
        security,
        parameters: [
          {
            name: "automation_id",
            in: "path",
            required: true,
            description: "The automation identifier.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": itemOperationResponse("#/components/schemas/Automation"),
          "404": {
            description: "Resource not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      put: {
        method: "PUT",
        path: "/v1/automations/{automation_id}",
        summary: "Update an automation",
        description: "Updates an existing automation.",
        tags: ["Automations"],
        operationId: "updateAutomation",
        security,
        parameters: [
          {
            name: "automation_id",
            in: "path",
            required: true,
            description: "The automation identifier.",
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AutomationUpsertRequest" },
            },
          },
        },
        responses: {
          "200": itemOperationResponse("#/components/schemas/Automation"),
          "400": {
            description: "Request is invalid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "404": {
            description: "Resource not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      delete: {
        method: "DELETE",
        path: "/v1/automations/{automation_id}",
        summary: "Delete an automation",
        description: "Deletes an automation from the authenticated workspace.",
        tags: ["Automations"],
        operationId: "deleteAutomation",
        security,
        parameters: [
          {
            name: "automation_id",
            in: "path",
            required: true,
            description: "The automation identifier.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "204": {
            description: "Automation was deleted",
          },
          "404": {
            description: "Resource not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/automations/{automation_id}/status": {
      put: {
        method: "PUT",
        path: "/v1/automations/{automation_id}/status",
        summary: "Activate or pause an automation",
        description:
          "Starts or pauses one Automation without changing its definition.",
        tags: ["Automations"],
        operationId: "updateAutomationStatus",
        security,
        parameters: [
          {
            name: "automation_id",
            in: "path",
            required: true,
            description: "The Automation identifier.",
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AutomationStatusRequest" },
            },
          },
        },
        responses: {
          "200": itemOperationResponse("#/components/schemas/Automation"),
          "400": {
            description: "Request is invalid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "404": {
            description: "Automation not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/magic-links": {
      get: {
        method: "GET",
        path: "/v1/magic-links",
        summary: "List magic links",
        description: "Returns magic links in the authenticated workspace.",
        tags: ["Magic Links"],
        operationId: "listMagicLinks",
        security,
        parameters: [
          {
            name: "limit",
            in: "query",
            description: "Maximum number of magic links to return.",
            schema: { type: "integer", minimum: 1, maximum: 100 },
          },
          {
            name: "starting_after",
            in: "query",
            description:
              "Use the opaque cursor from the previous page to request the next page.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": listOperationResponse("#/components/schemas/MagicLink"),
          "401": {
            description: "Authentication is required or invalid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      post: {
        method: "POST",
        path: "/v1/magic-links",
        summary: "Create a magic link",
        description: "Creates a magic link in the authenticated workspace.",
        tags: ["Magic Links"],
        operationId: "createMagicLink",
        security,
        parameters: [
          {
            name: "Idempotency-Key",
            in: "header",
            description: "Optional idempotency key to make retries safe.",
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/MagicLinkUpsertRequest" },
            },
          },
        },
        responses: {
          "201": itemOperationResponse(
            "#/components/schemas/MagicLink",
            "Magic link created",
          ),
          "400": {
            description: "Request is invalid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "409": {
            description:
              "Request conflicts with an existing resource or current state",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/magic-links/{magic_link_id}": {
      get: {
        method: "GET",
        path: "/v1/magic-links/{magic_link_id}",
        summary: "Get a magic link",
        description: "Returns one magic link from the authenticated workspace.",
        tags: ["Magic Links"],
        operationId: "getMagicLink",
        security,
        parameters: [
          {
            name: "magic_link_id",
            in: "path",
            required: true,
            description: "The magic link identifier.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": itemOperationResponse("#/components/schemas/MagicLink"),
          "404": {
            description: "Resource not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      put: {
        method: "PUT",
        path: "/v1/magic-links/{magic_link_id}",
        summary: "Update a magic link",
        description: "Updates an existing magic link.",
        tags: ["Magic Links"],
        operationId: "updateMagicLink",
        security,
        parameters: [
          {
            name: "magic_link_id",
            in: "path",
            required: true,
            description: "The magic link identifier.",
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/MagicLinkUpsertRequest" },
            },
          },
        },
        responses: {
          "200": itemOperationResponse("#/components/schemas/MagicLink"),
          "400": {
            description: "Request is invalid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "404": {
            description: "Resource not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "409": {
            description:
              "Request conflicts with an existing resource or current state",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      delete: {
        method: "DELETE",
        path: "/v1/magic-links/{magic_link_id}",
        summary: "Delete a magic link",
        description: "Deletes a magic link from the authenticated workspace.",
        tags: ["Magic Links"],
        operationId: "deleteMagicLink",
        security,
        parameters: [
          {
            name: "magic_link_id",
            in: "path",
            required: true,
            description: "The magic link identifier.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "204": {
            description: "Magic link was deleted",
          },
          "404": {
            description: "Resource not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/subscribers": {
      get: {
        method: "GET",
        path: "/v1/subscribers",
        summary: "List subscribers",
        description:
          "Returns subscribers in the authenticated workspace, sorted from newest to oldest.",
        tags: ["Subscribers"],
        operationId: "listSubscribers",
        security,
        parameters: [
          {
            name: "search",
            in: "query",
            description: "Filter subscribers by name, email, or status.",
            schema: { type: "string" },
          },
          {
            name: "email",
            in: "query",
            description:
              "Filter subscribers by an exact subscriber email address.",
            schema: { type: "string", format: "email" },
          },
          {
            name: "status",
            in: "query",
            description: "Filter subscribers by subscriber status.",
            schema: {
              type: "string",
              enum: [
                "Active",
                "Unconfirmed",
                "Unsubscribed",
                "Complained",
                "Bounced",
                "Blocked",
              ],
            },
          },
          {
            name: "cold_only",
            in: "query",
            description: "When `true`, return only cold subscribers.",
            schema: { type: "boolean" },
          },
          {
            name: "tag_id",
            in: "query",
            description:
              "Return subscribers that currently have this tag ID. Repeat `tag_id` or use `tag_ids` to match any of several tags.",
            schema: { type: "string" },
          },
          {
            name: "tag_ids",
            in: "query",
            description:
              "Comma-separated tag IDs. By default, the API returns subscribers who have any listed tag.",
            schema: { type: "string" },
          },
          {
            name: "tag_operator",
            in: "query",
            description:
              "Controls how tag filters are applied. Defaults to `has_any_of`.",
            schema: {
              type: "string",
              enum: ["has_any_of", "has_none_of"],
              default: "has_any_of",
            },
          },
          {
            name: "sequence_id",
            in: "query",
            description:
              "Return subscribers that match this sequence ID. Repeat `sequence_id` or use `sequence_ids` to match any of several sequences.",
            schema: { type: "string" },
          },
          {
            name: "sequence_ids",
            in: "query",
            description:
              "Comma-separated sequence IDs. By default, the API returns only subscribers who are active in any listed sequence.",
            schema: { type: "string" },
          },
          {
            name: "sequence_operator",
            in: "query",
            description:
              "Controls how sequence filters are applied. Defaults to `is_active_in_any_of`.",
            schema: {
              type: "string",
              enum: [
                "is_active_in_any_of",
                "is_not_active_in_any_of",
                "has_completed_any_of",
                "has_not_completed_any_of",
                "has_ever_been_in_any_of",
                "has_never_been_in_any_of",
              ],
              default: "is_active_in_any_of",
            },
          },
          {
            name: "limit",
            in: "query",
            description:
              "Maximum number of subscribers to return. Defaults to 25 and is capped at 100.",
            schema: { type: "integer", minimum: 1, maximum: 100 },
          },
          {
            name: "starting_after",
            in: "query",
            description:
              "Use the opaque cursor from the previous page to request the next page.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": listOperationResponse("#/components/schemas/Subscriber"),
          "401": {
            description: "Authentication is required or invalid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      post: {
        method: "POST",
        path: "/v1/subscribers",
        summary: "Create or upsert a subscriber",
        description:
          "Creates a new subscriber when the email does not exist in the workspace. If the email already exists, the API updates the existing subscriber unless create_only is true.",
        tags: ["Subscribers"],
        operationId: "upsertSubscriber",
        "x-mailrith-payload-field-scopes":
          publicApiSubscriberPayloadFieldScopeRequirements.requiredScopesByField,
        security,
        parameters: [idempotencyKeyParameter],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SubscriberUpsertRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Existing subscriber was updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["data"],
                  properties: {
                    data: { $ref: "#/components/schemas/Subscriber" },
                  },
                },
              },
            },
          },
          "201": {
            description: "Subscriber was created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["data"],
                  properties: {
                    data: { $ref: "#/components/schemas/Subscriber" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Request is invalid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "401": {
            description: "Authentication is required or invalid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "409": {
            description:
              "Request conflicts with an existing resource or current state",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/subscribers/{subscriber_id}": {
      patch: {
        method: "PATCH",
        path: "/v1/subscribers/{subscriber_id}",
        summary: "Update a subscriber",
        description:
          "Updates profile fields, status, custom fields, tags, or sequence assignments for one subscriber. Fields omitted from the request stay unchanged. Blank optional custom field values also leave saved values unchanged, and filled-in invalid values are rejected.",
        tags: ["Subscribers"],
        operationId: "updateSubscriber",
        "x-mailrith-payload-field-scopes":
          publicApiSubscriberPayloadFieldScopeRequirements.requiredScopesByField,
        security,
        parameters: [
          {
            name: "subscriber_id",
            in: "path",
            required: true,
            description: "The subscriber identifier.",
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SubscriberUpdateRequest" },
            },
          },
        },
        responses: {
          "200": itemOperationResponse("#/components/schemas/Subscriber"),
          "400": {
            description: "Request is invalid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "401": {
            description: "Authentication is required or invalid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "404": {
            description: "Resource not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "409": {
            description:
              "Request conflicts with an existing resource or current state",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/subscribers/{subscriber_id}/status": {
      put: {
        method: "PUT",
        path: "/v1/subscribers/{subscriber_id}/status",
        summary: "Change Subscriber sending eligibility",
        description:
          "Changes the delivery status for one Subscriber without changing profile, targeting, or Sequence enrollment fields.",
        tags: ["Subscribers"],
        operationId: "updateSubscriberStatus",
        security,
        parameters: [
          {
            name: "subscriber_id",
            in: "path",
            required: true,
            description: "The Subscriber identifier.",
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SubscriberStatusRequest" },
            },
          },
        },
        responses: {
          "200": itemOperationResponse("#/components/schemas/Subscriber"),
          "400": {
            description: "Request is invalid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "404": {
            description: "Subscriber not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/subscribers/{subscriber_id}/tags/{tag_id}": {
      put: {
        method: "PUT",
        path: "/v1/subscribers/{subscriber_id}/tags/{tag_id}",
        summary: "Add a Tag to a Subscriber",
        description:
          "Adds the selected Tag to a Subscriber. If the Subscriber already has the Tag, the API returns the Subscriber unchanged.",
        tags: ["Subscribers"],
        operationId: "addSubscriberTag",
        security,
        parameters: [
          {
            name: "subscriber_id",
            in: "path",
            required: true,
            description: "The Subscriber identifier.",
            schema: { type: "string" },
          },
          {
            name: "tag_id",
            in: "path",
            required: true,
            description: "The Tag identifier.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": itemOperationResponse("#/components/schemas/Subscriber"),
          "400": {
            description: "Request is invalid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "401": {
            description: "Authentication is required or invalid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "404": {
            description: "Resource not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      delete: {
        method: "DELETE",
        path: "/v1/subscribers/{subscriber_id}/tags/{tag_id}",
        summary: "Remove a tag from a subscriber",
        description:
          "Removes the selected tag from a subscriber. If the subscriber does not have the tag, the API returns the subscriber unchanged.",
        tags: ["Subscribers"],
        operationId: "removeSubscriberTag",
        security,
        parameters: [
          {
            name: "subscriber_id",
            in: "path",
            required: true,
            description: "The subscriber identifier.",
            schema: { type: "string" },
          },
          {
            name: "tag_id",
            in: "path",
            required: true,
            description: "The tag identifier.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": itemOperationResponse("#/components/schemas/Subscriber"),
          "400": {
            description: "Request is invalid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "401": {
            description: "Authentication is required or invalid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "404": {
            description: "Resource not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/subscribers/{subscriber_id}/sequences/{sequence_id}": {
      put: {
        method: "PUT",
        path: "/v1/subscribers/{subscriber_id}/sequences/{sequence_id}",
        summary: "Add a subscriber to a sequence",
        description:
          "Adds the selected subscriber to the selected sequence. If the subscriber is already in the sequence, the API returns the subscriber unchanged.",
        tags: ["Subscribers"],
        operationId: "addSubscriberSequence",
        security,
        parameters: [
          {
            name: "subscriber_id",
            in: "path",
            required: true,
            description: "The subscriber identifier.",
            schema: { type: "string" },
          },
          {
            name: "sequence_id",
            in: "path",
            required: true,
            description: "The sequence identifier.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": itemOperationResponse("#/components/schemas/Subscriber"),
          "400": {
            description: "Request is invalid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "401": {
            description: "Authentication is required or invalid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "403": {
            description: "Access is forbidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "404": {
            description: "Resource not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      delete: {
        method: "DELETE",
        path: "/v1/subscribers/{subscriber_id}/sequences/{sequence_id}",
        summary: "Remove a subscriber from a sequence",
        description:
          "Removes the selected subscriber from the selected sequence. If the subscriber is not in the sequence, the API returns the subscriber unchanged.",
        tags: ["Subscribers"],
        operationId: "removeSubscriberSequence",
        security,
        parameters: [
          {
            name: "subscriber_id",
            in: "path",
            required: true,
            description: "The subscriber identifier.",
            schema: { type: "string" },
          },
          {
            name: "sequence_id",
            in: "path",
            required: true,
            description: "The sequence identifier.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": itemOperationResponse("#/components/schemas/Subscriber"),
          "400": {
            description: "Request is invalid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "401": {
            description: "Authentication is required or invalid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "404": {
            description: "Resource not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/tags": {
      get: {
        method: "GET",
        path: "/v1/tags",
        summary: "List tags",
        description: "Returns tags in the authenticated workspace.",
        tags: ["Tags"],
        operationId: "listTags",
        security,
        parameters: [
          {
            name: "search",
            in: "query",
            description: "Filter tags by ID, name, or description.",
            schema: { type: "string" },
          },
          {
            name: "limit",
            in: "query",
            description: "Maximum number of tags to return.",
            schema: { type: "integer", minimum: 1, maximum: 100 },
          },
          {
            name: "starting_after",
            in: "query",
            description:
              "Use the opaque cursor from the previous page to request the next page.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": listOperationResponse("#/components/schemas/Tag"),
          "401": {
            description: "Authentication is required or invalid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      post: {
        method: "POST",
        path: "/v1/tags",
        summary: "Create a tag",
        description:
          "Creates a new tag in the authenticated workspace. The GDPR consent tag names can be created and applied like other tags when you need to apply consent collected outside Mailrith. Tag-level double opt-in fields are no longer accepted; configure double opt-in on forms and landing pages instead.",
        tags: ["Tags"],
        operationId: "createTag",
        security,
        parameters: [idempotencyKeyParameter],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TagCreateRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Tag was created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["data"],
                  properties: {
                    data: { $ref: "#/components/schemas/Tag" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Request is invalid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "409": {
            description:
              "Request conflicts with an existing resource or current state",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/custom-fields": {
      get: {
        method: "GET",
        path: "/v1/custom-fields",
        summary: "List custom fields",
        description: "Returns custom fields in the authenticated workspace.",
        tags: ["Custom Fields"],
        operationId: "listCustomFields",
        security,
        parameters: [
          {
            name: "limit",
            in: "query",
            description: "Maximum number of custom fields to return.",
            schema: { type: "integer", minimum: 1, maximum: 100 },
          },
          {
            name: "starting_after",
            in: "query",
            description:
              "Use the opaque cursor from the previous page to request the next page.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": listOperationResponse("#/components/schemas/CustomField"),
          "401": {
            description: "Authentication is required or invalid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      post: {
        method: "POST",
        path: "/v1/custom-fields",
        summary: "Create a custom field",
        description: "Creates a workspace-scoped custom-field definition.",
        tags: ["Custom Fields"],
        operationId: "createCustomField",
        security,
        parameters: [
          {
            name: "Idempotency-Key",
            in: "header",
            description: "Optional idempotency key to make retries safe.",
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CustomFieldUpsertRequest" },
            },
          },
        },
        responses: {
          "201": itemOperationResponse(
            "#/components/schemas/CustomField",
            "Custom field created",
          ),
          "400": {
            description: "Request is invalid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/custom-fields/{custom_field_id}": {
      get: {
        method: "GET",
        path: "/v1/custom-fields/{custom_field_id}",
        summary: "Get a custom field",
        description:
          "Returns one custom field from the authenticated workspace.",
        tags: ["Custom Fields"],
        operationId: "getCustomField",
        security,
        parameters: [
          {
            name: "custom_field_id",
            in: "path",
            required: true,
            description: "The custom field identifier.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": itemOperationResponse("#/components/schemas/CustomField"),
          "404": {
            description: "Resource not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      put: {
        method: "PUT",
        path: "/v1/custom-fields/{custom_field_id}",
        summary: "Update a custom field",
        description:
          "Updates a custom-field definition for the authenticated workspace.",
        tags: ["Custom Fields"],
        operationId: "updateCustomField",
        security,
        parameters: [
          {
            name: "custom_field_id",
            in: "path",
            required: true,
            description: "The identifier of the custom field to update.",
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CustomFieldUpsertRequest" },
            },
          },
        },
        responses: {
          "200": itemOperationResponse("#/components/schemas/CustomField"),
          "400": {
            description: "The request is invalid.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "404": {
            description: "The custom field was not found.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "409": {
            description:
              "The request conflicts with the current custom field state.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      delete: {
        method: "DELETE",
        path: "/v1/custom-fields/{custom_field_id}",
        summary: "Delete a custom field",
        description:
          "Deletes a custom-field definition from the authenticated workspace.",
        tags: ["Custom Fields"],
        operationId: "deleteCustomField",
        security,
        parameters: [
          {
            name: "custom_field_id",
            in: "path",
            required: true,
            description: "The identifier of the custom field to delete.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "204": {
            description: "The custom field was deleted.",
          },
          "404": {
            description: "The custom field was not found.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "409": {
            description:
              "The request conflicts with the current custom field state.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/forms": {
      get: {
        method: "GET",
        path: "/v1/forms",
        summary: "List forms",
        description: "Returns forms from the authenticated workspace.",
        tags: ["Forms"],
        operationId: "listForms",
        security,
        parameters: [
          {
            name: "search",
            in: "query",
            description: "Filter forms by ID, name, or public URL token.",
            schema: { type: "string" },
          },
          {
            name: "limit",
            in: "query",
            description: "The maximum number of forms to return.",
            schema: { type: "integer", minimum: 1, maximum: 100 },
          },
          {
            name: "starting_after",
            in: "query",
            description: "The opaque cursor from the previous page of forms.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": listOperationResponse("#/components/schemas/Form"),
          "401": {
            description: "The request is not authorized.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      post: {
        method: "POST",
        path: "/v1/forms",
        summary: "Create a form",
        description: "Creates a form in the authenticated workspace.",
        tags: ["Forms"],
        operationId: "createForm",
        security,
        parameters: [
          {
            name: "Idempotency-Key",
            in: "header",
            description:
              "Optional idempotency key to retry the request safely.",
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/FormUpsertRequest" },
            },
          },
        },
        responses: {
          "201": itemOperationResponse(
            "#/components/schemas/Form",
            "Form created",
          ),
          "400": {
            description: "The request is invalid.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/forms/{form_id}": {
      get: {
        method: "GET",
        path: "/v1/forms/{form_id}",
        summary: "Get a form",
        description: "Returns a form from the authenticated workspace.",
        tags: ["Forms"],
        operationId: "getForm",
        security,
        parameters: [
          {
            name: "form_id",
            in: "path",
            required: true,
            description: "The identifier of the form to return.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": itemOperationResponse("#/components/schemas/Form"),
          "404": {
            description: "The form was not found.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      put: {
        method: "PUT",
        path: "/v1/forms/{form_id}",
        summary: "Update a form",
        description: "Updates an existing form without creating a new form.",
        tags: ["Forms"],
        operationId: "updateForm",
        security,
        parameters: [
          {
            name: "form_id",
            in: "path",
            required: true,
            description: "The identifier of the form to update.",
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/FormUpsertRequest" },
            },
          },
        },
        responses: {
          "200": itemOperationResponse("#/components/schemas/Form"),
          "400": {
            description: "The request is invalid.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "404": {
            description: "The form was not found.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      delete: {
        method: "DELETE",
        path: "/v1/forms/{form_id}",
        summary: "Delete a form",
        description: "Deletes a form from the authenticated workspace.",
        tags: ["Forms"],
        operationId: "deleteForm",
        security,
        parameters: [
          {
            name: "form_id",
            in: "path",
            required: true,
            description: "The identifier of the form to delete.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "204": {
            description: "The form was deleted.",
          },
          "404": {
            description: "The form was not found.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/forms/{form_id}/submissions": {
      get: {
        method: "GET",
        path: "/v1/forms/{form_id}/submissions",
        summary: "List form submissions",
        description:
          "Returns recent real submissions for one form, including the subscriber who submitted the form. Requires both `forms:read` and `subscribers:read`.",
        tags: ["Forms"],
        operationId: "listFormSubmissions",
        security,
        parameters: [
          {
            name: "form_id",
            in: "path",
            required: true,
            description:
              "The identifier of the form whose submissions you want to list.",
            schema: { type: "string" },
          },
          {
            name: "limit",
            in: "query",
            description:
              "The maximum number of submissions to return. Defaults to 25 and is capped at 100.",
            schema: { type: "integer", minimum: 1, maximum: 100 },
          },
          {
            name: "starting_after",
            in: "query",
            description:
              "The opaque cursor from the previous page of form submissions.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": listOperationResponse("#/components/schemas/FormSubmission"),
          "404": {
            description: "The form was not found.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/landing-pages": {
      get: {
        method: "GET",
        path: "/v1/landing-pages",
        summary: "List landing pages",
        description: "Returns landing pages from the authenticated workspace.",
        tags: ["Landing Pages"],
        operationId: "listLandingPages",
        security,
        parameters: [
          {
            name: "search",
            in: "query",
            description:
              "Filter landing pages by ID, name, slug, custom path, or public URL token.",
            schema: { type: "string" },
          },
          {
            name: "limit",
            in: "query",
            description: "The maximum number of landing pages to return.",
            schema: { type: "integer", minimum: 1, maximum: 100 },
          },
          {
            name: "starting_after",
            in: "query",
            description:
              "The opaque cursor from the previous page of landing pages.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": listOperationResponse("#/components/schemas/LandingPage"),
          "401": {
            description: "The request is not authorized.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      post: {
        method: "POST",
        path: "/v1/landing-pages",
        summary: "Create a landing page",
        description:
          "Creates a hosted landing page in the authenticated workspace.",
        tags: ["Landing Pages"],
        operationId: "createLandingPage",
        security,
        parameters: [
          {
            name: "Idempotency-Key",
            in: "header",
            description:
              "Optional idempotency key to retry the request safely.",
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LandingPageUpsertRequest" },
            },
          },
        },
        responses: {
          "201": itemOperationResponse(
            "#/components/schemas/LandingPage",
            "Landing page created",
          ),
          "400": {
            description: "The request is invalid.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "409": {
            description:
              "The request conflicts with the current landing page state.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/landing-pages/{landing_page_id}": {
      get: {
        method: "GET",
        path: "/v1/landing-pages/{landing_page_id}",
        summary: "Get a landing page",
        description: "Returns a landing page from the authenticated workspace.",
        tags: ["Landing Pages"],
        operationId: "getLandingPage",
        security,
        parameters: [
          {
            name: "landing_page_id",
            in: "path",
            required: true,
            description: "The identifier of the landing page to return.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": itemOperationResponse("#/components/schemas/LandingPage"),
          "404": {
            description: "The landing page was not found.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      put: {
        method: "PUT",
        path: "/v1/landing-pages/{landing_page_id}",
        summary: "Update a landing page",
        description:
          "Updates an existing hosted landing page without creating a new landing page.",
        tags: ["Landing Pages"],
        operationId: "updateLandingPage",
        security,
        parameters: [
          {
            name: "landing_page_id",
            in: "path",
            required: true,
            description: "The identifier of the landing page to update.",
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LandingPageUpsertRequest" },
            },
          },
        },
        responses: {
          "200": itemOperationResponse("#/components/schemas/LandingPage"),
          "400": {
            description: "The request is invalid.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "404": {
            description: "The landing page was not found.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "409": {
            description:
              "The request conflicts with the current landing page state.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      delete: {
        method: "DELETE",
        path: "/v1/landing-pages/{landing_page_id}",
        summary: "Delete a landing page",
        description: "Deletes a landing page from the authenticated workspace.",
        tags: ["Landing Pages"],
        operationId: "deleteLandingPage",
        security,
        parameters: [
          {
            name: "landing_page_id",
            in: "path",
            required: true,
            description: "The identifier of the landing page to delete.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "204": {
            description: "The landing page was deleted.",
          },
          "404": {
            description: "The landing page was not found.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/landing-pages/{landing_page_id}/submissions": {
      get: {
        method: "GET",
        path: "/v1/landing-pages/{landing_page_id}/submissions",
        summary: "List landing page submissions",
        description:
          "Returns recent real submissions for one landing page, including the subscriber who submitted the landing page. Requires both `landing_pages:read` and `subscribers:read`.",
        tags: ["Landing Pages"],
        operationId: "listLandingPageSubmissions",
        security,
        parameters: [
          {
            name: "landing_page_id",
            in: "path",
            required: true,
            description:
              "The identifier of the landing page whose submissions you want to list.",
            schema: { type: "string" },
          },
          {
            name: "limit",
            in: "query",
            description:
              "The maximum number of submissions to return. Defaults to 25 and is capped at 100.",
            schema: { type: "integer", minimum: 1, maximum: 100 },
          },
          {
            name: "starting_after",
            in: "query",
            description:
              "The opaque cursor from the previous page of landing page submissions.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": listOperationResponse(
            "#/components/schemas/LandingPageSubmission",
          ),
          "404": {
            description: "The landing page was not found.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/segments": {
      get: {
        method: "GET",
        path: "/v1/segments",
        summary: "List segments",
        description: "Returns saved segments from the authenticated workspace.",
        tags: ["Segments"],
        operationId: "listSegments",
        security,
        parameters: [
          {
            name: "limit",
            in: "query",
            description: "The maximum number of segments to return.",
            schema: { type: "integer", minimum: 1, maximum: 100 },
          },
          {
            name: "starting_after",
            in: "query",
            description:
              "The opaque cursor from the previous page of saved segments.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": listOperationResponse("#/components/schemas/Segment"),
          "401": {
            description: "The request is not authorized.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      post: {
        method: "POST",
        path: "/v1/segments",
        summary: "Create a segment",
        description: "Creates a saved segment in the authenticated workspace.",
        tags: ["Segments"],
        operationId: "createSegment",
        security,
        parameters: [
          {
            name: "Idempotency-Key",
            in: "header",
            description:
              "Optional idempotency key to retry the request safely.",
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SegmentUpsertRequest" },
            },
          },
        },
        responses: {
          "201": itemOperationResponse(
            "#/components/schemas/Segment",
            "Segment created",
          ),
          "400": {
            description: "The request is invalid.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "409": {
            description:
              "The request conflicts with the current segment state.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/segments/{segment_id}": {
      get: {
        method: "GET",
        path: "/v1/segments/{segment_id}",
        summary: "Get a segment",
        description:
          "Returns one saved segment from the authenticated workspace.",
        tags: ["Segments"],
        operationId: "getSegment",
        security,
        parameters: [
          {
            name: "segment_id",
            in: "path",
            required: true,
            description: "The identifier of the segment to return.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": itemOperationResponse("#/components/schemas/Segment"),
          "404": {
            description: "The segment was not found.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      put: {
        method: "PUT",
        path: "/v1/segments/{segment_id}",
        summary: "Update a segment",
        description: "Updates a saved segment in the authenticated workspace.",
        tags: ["Segments"],
        operationId: "updateSegment",
        security,
        parameters: [
          {
            name: "segment_id",
            in: "path",
            required: true,
            description: "The identifier of the segment to update.",
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SegmentUpsertRequest" },
            },
          },
        },
        responses: {
          "200": itemOperationResponse("#/components/schemas/Segment"),
          "400": {
            description: "The request is invalid.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "404": {
            description: "The segment was not found.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "409": {
            description:
              "The request conflicts with the current segment state.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      delete: {
        method: "DELETE",
        path: "/v1/segments/{segment_id}",
        summary: "Delete a segment",
        description:
          "Deletes a saved segment from the authenticated workspace.",
        tags: ["Segments"],
        operationId: "deleteSegment",
        security,
        parameters: [
          {
            name: "segment_id",
            in: "path",
            required: true,
            description: "The identifier of the segment to delete.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "204": {
            description: "The segment was deleted.",
          },
          "404": {
            description: "The segment was not found.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "409": {
            description:
              "The request conflicts with the current segment state.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/segments/preview": {
      post: {
        method: "POST",
        path: "/v1/segments/preview",
        summary: "Preview a segment definition",
        description:
          "Returns subscriber counts for an unsaved segment definition. Include `current_segment_id` when previewing edits to an existing segment so circular segment references are rejected before saving.",
        tags: ["Segments"],
        operationId: "previewSegment",
        security,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SegmentPreviewRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "The preview counts were returned.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["data"],
                  properties: {
                    data: { $ref: "#/components/schemas/SegmentPreview" },
                  },
                },
              },
            },
          },
          "400": {
            description: "The request is invalid.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/jobs/subscriber-imports": {
      post: {
        method: "POST",
        path: "/v1/jobs/subscriber-imports",
        summary: "Create a subscriber import job",
        description:
          "Queues an asynchronous import job that creates or updates subscribers from CSV text.",
        tags: ["Jobs"],
        operationId: "createSubscriberImportJob",
        security,
        parameters: [
          {
            name: "Idempotency-Key",
            in: "header",
            description:
              "Optional idempotency key to retry the request safely.",
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SubscriberImportJobCreateRequest",
              },
            },
          },
        },
        responses: {
          "202": {
            description: "The import job was queued.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["data"],
                  properties: {
                    data: { $ref: "#/components/schemas/SubscriberImportJob" },
                  },
                },
              },
            },
          },
          "400": {
            description: "The request is invalid.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/jobs/subscriber-imports/{job_id}": {
      get: {
        method: "GET",
        path: "/v1/jobs/subscriber-imports/{job_id}",
        summary: "Get a subscriber import job",
        description:
          "Returns the current state of a previously created import job.",
        tags: ["Jobs"],
        operationId: "getSubscriberImportJob",
        security,
        parameters: [
          {
            name: "job_id",
            in: "path",
            required: true,
            description: "The identifier of the import job to return.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "The import job was returned.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["data"],
                  properties: {
                    data: { $ref: "#/components/schemas/SubscriberImportJob" },
                  },
                },
              },
            },
          },
          "404": {
            description: "The import job was not found.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/jobs/subscriber-exports": {
      post: {
        method: "POST",
        path: "/v1/jobs/subscriber-exports",
        summary: "Create a subscriber export job",
        description:
          "Queues an asynchronous Subscriber export for the authenticated workspace. Requires `subscribers:bulk_export` because the finished file contains bulk Subscriber data.",
        tags: ["Jobs"],
        operationId: "createSubscriberExportJob",
        security,
        parameters: [
          {
            name: "Idempotency-Key",
            in: "header",
            description:
              "Optional idempotency key to retry the request safely.",
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SubscriberExportJobCreateRequest",
              },
            },
          },
        },
        responses: {
          "202": {
            description: "The export job was queued.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["data"],
                  properties: {
                    data: { $ref: "#/components/schemas/SubscriberExportJob" },
                  },
                },
              },
            },
          },
          "400": {
            description: "The request is invalid.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/jobs/subscriber-exports/{job_id}": {
      get: {
        method: "GET",
        path: "/v1/jobs/subscriber-exports/{job_id}",
        summary: "Get a subscriber export job",
        description:
          "Returns the current state of a previously created export job. Requires `subscribers:bulk_export` because completed jobs include a Subscriber CSV download URL.",
        tags: ["Jobs"],
        operationId: "getSubscriberExportJob",
        security,
        parameters: [
          {
            name: "job_id",
            in: "path",
            required: true,
            description: "The identifier of the export job to return.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "The export job was returned.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["data"],
                  properties: {
                    data: { $ref: "#/components/schemas/SubscriberExportJob" },
                  },
                },
              },
            },
          },
          "404": {
            description: "The export job was not found.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
  },
};

const agentPlanResponse = {
  description:
    "The mutation was planned. Review the bounded preview and complete the approval flow before execution.",
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/AgentActionResponse" },
    },
  },
};

const addAgentActionControlsToMutationContracts = () => {
  for (const pathItem of Object.values(publicApiSpec.paths)) {
    for (const operation of Object.values(pathItem)) {
      const risk = getPublicApiAgentOperationRisk(operation.operationId);
      if (!risk || risk.risk === "read" || risk.resourceKey === "agent_actions") {
        continue;
      }

      operation.parameters = [
        ...(operation.parameters ?? []),
        {
          name: "mode",
          in: "query",
          description:
            "Use `plan` to create a bounded, non-executing action preview.",
          schema: { type: "string", enum: ["plan"] },
        },
        {
          name: "X-Mailrith-Action-Id",
          in: "header",
          description:
            "The approved action identifier returned by the planning request.",
          schema: { type: "string" },
        },
        {
          name: "X-Mailrith-Approval-Token",
          in: "header",
          description:
            "The short-lived, single-use token claimed after approval.",
          schema: { type: "string" },
        },
        {
          name: "X-Mailrith-Approval-Return-Url",
          in: "header",
          description:
            "Optional HTTPS or localhost URL shown to the approver after a decision. Secrets must not be included.",
          schema: { type: "string", format: "uri" },
        },
      ];

      const existingAcceptedSchema =
        operation.responses["202"]?.content?.["application/json"]?.schema;
      operation.responses["202"] = existingAcceptedSchema
        ? {
            ...operation.responses["202"],
            description: `${operation.responses["202"].description} When mode is plan, the response contains the action preview instead.`,
            content: {
              "application/json": {
                schema: {
                  anyOf: [
                    existingAcceptedSchema,
                    { $ref: "#/components/schemas/AgentActionResponse" },
                  ],
                },
              },
            },
          }
        : agentPlanResponse;
    }
  }
};

addAgentActionControlsToMutationContracts();

export type PublicApiSdkOperation = {
  namespace:
    | "discovery"
    | "workspace"
    | "subscribers"
    | "tags"
    | "customFields"
    | "emailTemplates"
    | "forms"
    | "landingPages"
    | "sequences"
    | "automations"
    | "magicLinks"
    | "broadcasts"
    | "segments"
    | "webhookSubscriptions"
    | "jobs"
    | "agentActions"
    | "agentActivity"
    | "analytics"
    | "diagnostics"
    | "consent"
    | "recommendations"
    | "experiments";
  methodName: string;
  operationId: string;
  method: string;
  path: string;
  summary: string;
  description: string;
  authRequired: boolean;
  requiredScopes: string[];
  mcpToolName: string;
  risk: PublicApiAgentRiskClass;
  externalSideEffect: boolean;
  sideEffectClass: PublicApiAgentSideEffectClass;
  retryMode: PublicApiAgentRetryMode;
  idempotencyPolicy: PublicApiAgentIdempotencyPolicy;
  approvalPolicy: PublicApiAgentApprovalPolicy;
  toolsets: PublicApiMcpToolsetKey[];
  annotations: PublicApiMcpToolAnnotations;
  riskRationale: string;
  pathParams: string[];
  queryParams: string[];
  headerParams: string[];
  hasRequestBody: boolean;
  requestBodyRequired: boolean;
  eventPatternScopeRequirements?: PublicApiWebhookEventPatternScopeRequirements;
  payloadFieldScopeRequirements?: PublicApiPayloadFieldScopeRequirements;
};

export type PublicApiSdkResource = {
  namespace: PublicApiSdkOperation["namespace"];
  name: string;
  description: string;
  operations: PublicApiSdkOperation[];
};

const getSpecOperation = (path: string, method: string) =>
  publicApiSpec.paths[path]?.[method.toLowerCase()];

const toSnakeCase = (value: string) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();

const createSdkOperation = (
  namespace: PublicApiSdkOperation["namespace"],
  methodName: string,
  method: string,
  path: string,
  requiredScopes: string[] = [],
  eventPatternScopeRequirements?: PublicApiWebhookEventPatternScopeRequirements,
  payloadFieldScopeRequirements?: PublicApiPayloadFieldScopeRequirements,
): PublicApiSdkOperation => {
  const operation = getSpecOperation(path, method);
  if (!operation) {
    throw new Error(`Public API operation ${method} ${path} is not defined.`);
  }

  const risk = getPublicApiAgentOperationRisk(operation.operationId);
  if (!risk) {
    throw new Error(
      `Public API operation ${operation.operationId} has no agent risk definition.`,
    );
  }

  const parameters = operation.parameters ?? [];
  const toolsets = resolvePublicApiMcpToolsets(requiredScopes);

  return {
    namespace,
    methodName,
    operationId: operation.operationId,
    method,
    path,
    summary: operation.summary,
    description: operation.description,
    authRequired:
      Array.isArray(operation.security) && operation.security.length > 0,
    requiredScopes,
    mcpToolName: `${toSnakeCase(namespace)}_${toSnakeCase(methodName)}`,
    risk: risk.risk,
    externalSideEffect: risk.externalSideEffect,
    sideEffectClass: risk.sideEffectClass,
    retryMode: risk.retryMode,
    idempotencyPolicy: risk.idempotencyPolicy,
    approvalPolicy: risk.approvalPolicy,
    toolsets,
    annotations: createPublicApiMcpToolAnnotations(risk),
    riskRationale: risk.rationale,
    pathParams: parameters
      .filter((parameter) => parameter.in === "path")
      .map((parameter) => parameter.name),
    queryParams: parameters
      .filter((parameter) => parameter.in === "query")
      .map((parameter) => parameter.name),
    headerParams: parameters
      .filter((parameter) => parameter.in === "header")
      .map((parameter) => parameter.name),
    hasRequestBody: Boolean(operation.requestBody),
    requestBodyRequired: operation.requestBody?.required === true,
    ...(eventPatternScopeRequirements ? { eventPatternScopeRequirements } : {}),
    ...(payloadFieldScopeRequirements
      ? { payloadFieldScopeRequirements }
      : {}),
  };
};

const getCapabilityResourceByKey = (resourceKey: string) =>
  publicApiCapabilityResources.find((resource) => resource.key === resourceKey);

const createSdkResource = (
  namespace: PublicApiSdkOperation["namespace"],
  resourceKey: string,
  methodNames: Record<string, string>,
): PublicApiSdkResource => {
  const resource = getCapabilityResourceByKey(resourceKey);
  if (!resource) {
    throw new Error(
      `Public API capability resource ${resourceKey} is not defined.`,
    );
  }

  return {
    namespace,
    name: resource.name,
    description: resource.description,
    operations: resource.operations.map((operation) =>
      createSdkOperation(
        namespace,
        methodNames[operation.operationId] ?? operation.operationId,
        operation.method,
        operation.path,
        [...operation.requiredScopes],
        operation.eventPatternScopeRequirements,
        operation.payloadFieldScopeRequirements,
      ),
    ),
  };
};

export const publicApiSdkResources: PublicApiSdkResource[] = [
  {
    namespace: "discovery",
    name: "Discovery",
    description:
      "Resolve Mailrith metadata, OpenAPI, and authenticated capabilities before calling workspace-scoped resources.",
    operations: [
      createSdkOperation("discovery", "getMetadata", "GET", "/v1"),
      createSdkOperation(
        "discovery",
        "getCapabilities",
        "GET",
        "/v1/capabilities",
      ),
      createSdkOperation(
        "discovery",
        "getOpenApiDocument",
        "GET",
        "/v1/openapi.json",
      ),
    ],
  },
  createSdkResource("workspace", "workspace", {
    getWorkspace: "get",
  }),
  createSdkResource("agentActions", "agent_actions", {
    getAgentAction: "get",
    issueAgentApprovalToken: "issueApprovalToken",
  }),
  createSdkResource("agentActivity", "agent_activity", {
    listAgentActivity: "list",
    getAgentActivity: "get",
  }),
  createSdkResource("analytics", "analytics", {
    createAnalyticsReport: "createReport",
    getAnalyticsReport: "getReport",
  }),
  createSdkResource("diagnostics", "diagnostics", {
    listAutomationRunDiagnostics: "listAutomationRuns",
    getAutomationRunDiagnostics: "getAutomationRun",
    getSequenceDiagnostics: "getSequence",
    getBroadcastDiagnostics: "getBroadcast",
    getSubscriberActivityDiagnostics: "getSubscriber",
  }),
  createSdkResource("consent", "consent", {
    recordSubscriberComplianceEvent: "recordEvent",
  }),
  createSdkResource("recommendations", "recommendations", {
    listRecommendations: "list",
    createRecommendation: "create",
    getRecommendation: "get",
    planRecommendation: "plan",
  }),
  createSdkResource("experiments", "experiments", {
    listExperiments: "list",
    createExperiment: "create",
    getExperiment: "get",
    recordExperimentDecision: "recordDecision",
  }),
  createSdkResource("subscribers", "subscribers", {
    listSubscribers: "list",
    upsertSubscriber: "upsert",
    updateSubscriber: "update",
    updateSubscriberStatus: "updateStatus",
    addSubscriberTag: "addTag",
    removeSubscriberTag: "removeTag",
    addSubscriberSequence: "addToSequence",
    removeSubscriberSequence: "removeFromSequence",
  }),
  createSdkResource("tags", "tags", {
    listTags: "list",
    createTag: "create",
  }),
  createSdkResource("customFields", "custom_fields", {
    listCustomFields: "list",
    createCustomField: "create",
    getCustomField: "get",
    updateCustomField: "update",
    deleteCustomField: "delete",
  }),
  createSdkResource("emailTemplates", "email_templates", {
    listEmailTemplates: "list",
    createEmailTemplate: "create",
    getEmailTemplate: "get",
    updateEmailTemplate: "update",
    deleteEmailTemplate: "delete",
  }),
  createSdkResource("forms", "forms", {
    listForms: "list",
    createForm: "create",
    getForm: "get",
    listFormSubmissions: "listSubmissions",
    updateForm: "update",
    deleteForm: "delete",
  }),
  createSdkResource("landingPages", "landing_pages", {
    listLandingPages: "list",
    createLandingPage: "create",
    getLandingPage: "get",
    listLandingPageSubmissions: "listSubmissions",
    updateLandingPage: "update",
    deleteLandingPage: "delete",
  }),
  createSdkResource("sequences", "sequences", {
    listSequences: "list",
    createSequence: "create",
    getSequence: "get",
    updateSequence: "update",
    updateSequenceStatus: "updateStatus",
    deleteSequence: "delete",
  }),
  createSdkResource("automations", "automations", {
    listAutomations: "list",
    createAutomation: "create",
    getAutomation: "get",
    updateAutomation: "update",
    updateAutomationStatus: "updateStatus",
    deleteAutomation: "delete",
  }),
  createSdkResource("magicLinks", "magic_links", {
    listMagicLinks: "list",
    createMagicLink: "create",
    getMagicLink: "get",
    updateMagicLink: "update",
    deleteMagicLink: "delete",
  }),
  createSdkResource("broadcasts", "broadcasts", {
    listBroadcasts: "list",
    createBroadcast: "create",
    getBroadcastSendProgress: "getSendProgress",
    listBroadcastDeliveryErrors: "listDeliveryErrors",
    getBroadcast: "get",
    updateBroadcast: "update",
    deleteBroadcast: "delete",
    preflightBroadcast: "preflight",
    sendBroadcast: "send",
    cancelBroadcastSend: "cancel",
    testBroadcast: "sendTest",
  }),
  createSdkResource("segments", "segments", {
    listSegments: "list",
    createSegment: "create",
    getSegment: "get",
    updateSegment: "update",
    deleteSegment: "delete",
    previewSegment: "preview",
  }),
  createSdkResource("webhookSubscriptions", "webhook_subscriptions", {
    listWebhookSubscriptions: "list",
    createWebhookSubscription: "create",
    getWebhookSubscription: "get",
    updateWebhookSubscription: "update",
    deleteWebhookSubscription: "delete",
    rotateWebhookSubscriptionSecret: "rotateSecret",
  }),
  createSdkResource("jobs", "jobs", {
    createSubscriberImportJob: "createImport",
    getSubscriberImportJob: "getImport",
    createSubscriberExportJob: "createExport",
    getSubscriberExportJob: "getExport",
  }),
];

export const publicApiMcpOperationContracts = publicApiSdkResources.flatMap(
  (resource) =>
    resource.operations.map((operation) => {
      const specOperation = getSpecOperation(operation.path, operation.method);
      if (!specOperation) {
        throw new Error(
          `Public API operation ${operation.method} ${operation.path} is not defined.`,
        );
      }
      return createPublicApiMcpOperationContract(
        specOperation,
        publicApiSpec.components.schemas,
      );
    }),
);

export const publicApiMcpOperationContractMap = new Map(
  publicApiMcpOperationContracts.map((contract) => [
    contract.operationId,
    contract,
  ]),
);

export const publicApiSdkResourceMap = Object.fromEntries(
  publicApiSdkResources.map((resource) => [resource.namespace, resource]),
) as Record<PublicApiSdkOperation["namespace"], PublicApiSdkResource>;

export const publicApiQuickstart = {
  headers: baseHeadersSchema,
  request: `curl -X POST https://api.mailrith.com/v1/subscribers \\
  -H "Authorization: Bearer mrk_example_secret_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "ada@example.com",
    "name": "Ada Lovelace",
    "status": "Active",
    "custom_fields": {
      "company": "Analytical Engines"
    }
  }'`,
  response: `{
  "data": {
    "id": "subscriber_123",
    "email": "ada@example.com",
    "name": "Ada Lovelace",
    "status": "Active",
    "country": null,
    "subscribed_at": "2026-04-11T12:00:00.000Z",
    "last_opened_at": null,
    "tags": [
      { "id": "tag_website_signup", "name": "Website Signup" }
    ],
    "sequence_ids": [],
    "custom_fields": {
      "company": "Analytical Engines"
    },
    "created_at": "2026-04-11T12:00:00.000Z",
    "updated_at": "2026-04-11T12:00:00.000Z"
  }
}`,
};

export const getPublicApiOperations = () =>
  Object.values(publicApiSpec.paths)
    .flatMap((methods) => Object.values(methods))
    .sort((left, right) =>
      `${left.tags[0]} ${left.path}`.localeCompare(
        `${right.tags[0]} ${right.path}`,
      ),
    );

export const getPublicApiOperationsByTag = () => {
  const operations = getPublicApiOperations();
  return publicApiTags.map((tag) => ({
    ...tag,
    operations: operations.filter((operation) =>
      operation.tags.includes(tag.name),
    ),
  }));
};
