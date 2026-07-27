import { resolvePublicApiOperationRequiredScopes } from "./resource-contract.js";
import { getPublicApiAgentOperationRisk } from "./agent-risk.js";
import {
  createPublicApiMcpOperationContract,
  createPublicApiMcpToolAnnotations,
  resolvePublicApiMcpToolsets,
} from "./mcp-contract.js";
import type {
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
  publicApiAgentDataScopes,
  publicApiAgentIdempotencyPolicies,
  publicApiAgentOperationRiskCatalog,
  publicApiAgentRetryModes,
  publicApiAgentRiskClasses,
  publicApiAgentSideEffectClasses,
  requiresPublicApiLiveActionPermission,
} from "./agent-risk.js";
export type {
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

export {
  publicApiSubmittedMcpOperationIds,
  publicApiSubmittedMcpProfile,
} from "./mcp-submitted-profile.js";
export type {
  PublicApiSubmittedMcpOperationId,
} from "./mcp-submitted-profile.js";
export type {
  PublicApiMcpErrorCategory,
  PublicApiMcpOperationContract,
  PublicApiMcpToolAnnotations,
  PublicApiMcpToolset,
  PublicApiMcpToolsetKey,
} from "./mcp-contract.js";

export {
  isPublicApiScopeKey,
  normalizePublicApiScopeKeys,
  validatePublicApiScopeKeys,
  publicApiAgentReadQuickstartScopeKeys,
  publicApiDefaultWorkProfileKey,
  publicApiDefaultScopeKeys,
  publicApiReadScopeKeys,
  publicApiScopeDefinitionByKey,
  publicApiScopeDefinitions,
  publicApiScopeDisplaySections,
  publicApiScopeKeys,
  publicApiResourceContractByKey,
  publicApiResourceContracts,
  publicApiWorkProfileByKey,
  publicApiWorkProfileDisplaySections,
  publicApiWorkProfiles,
  publicApiScopeResourceOrder,
  resolvePublicApiOperationRequiredScopes,
} from "./resource-contract.js";
export type {
  PublicApiResourceArchetype,
  PublicApiResourceContract,
  PublicApiScopeAction,
  PublicApiScopeDefinition,
  PublicApiScopeKey,
  PublicApiWorkProfile,
  PublicApiWorkProfileKey,
} from "./resource-contract.js";

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
};

export type PublicApiCapabilityResource = {
  key: string;
  name: string;
  description: string;
  operations: PublicApiCapabilityOperation[];
};

type PublicApiCapabilityOperationDefinition = Omit<
  PublicApiCapabilityOperation,
  "requiredScopes"
>;

type PublicApiCapabilityResourceDefinition = Omit<
  PublicApiCapabilityResource,
  "operations"
> & {
  operations: PublicApiCapabilityOperationDefinition[];
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

const formDefinitionSchema = {
  $ref: "#/components/schemas/FormDefinition",
};

const formUpsertDefinitionSchema = {
  allOf: [formDefinitionSchema],
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
      "Subscriber lifecycle payloads contain stable IDs and compact references, not email addresses or raw technical evidence.",
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
    name: "Analytics",
    description: "Run bounded aggregate delivery and engagement reports.",
  },
  {
    name: "Diagnostics",
    description: "Inspect bounded workflow and delivery diagnostics.",
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
    name: "Sender Identities",
    description:
      "Read enabled sender names and email addresses without exposing provider credentials.",
  },
  {
    name: "Email Delivery Connections",
    description:
      "Create and manage the selected workspace's email delivery service connection without returning saved credentials.",
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

const publicApiCapabilityResourceDefinitions: PublicApiCapabilityResourceDefinition[] = [
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
      },
    ],
  },
  {
    key: "sender_identities",
    name: "Sender Identities",
    description:
      "Discover enabled sender names, addresses, and provider types that can be selected for Broadcasts and Sequences. Provider credentials are never returned.",
    operations: [
      {
        method: "GET",
        path: "/v1/sender-identities",
        operationId: "listSenderIdentities",
        summary: "List sender identities",
      },
      {
        method: "GET",
        path: "/v1/sender-identities/{sender_identity_id}",
        operationId: "getSenderIdentity",
        summary: "Get a sender identity",
      },
    ],
  },
  {
    key: "email_delivery_connections",
    name: "Email Delivery Connections",
    description:
      "Set up and manage email delivery connections for the authenticated workspace. Provider credentials are entered only in Mailrith's secure browser flow and are never accepted or returned by the agent API.",
    operations: [
      {
        method: "GET",
        path: "/v1/email-delivery-connections",
        operationId: "listEmailDeliveryConnections",
        summary: "List email delivery connections",
      },
      {
        method: "POST",
        path: "/v1/email-delivery-connection-setup-sessions",
        operationId: "startEmailDeliveryConnectionSetup",
        summary: "Start secure email delivery connection setup",
      },
      {
        method: "GET",
        path: "/v1/email-delivery-connection-setup-sessions/{setup_session_id}",
        operationId: "getEmailDeliveryConnectionSetup",
        summary: "Get secure setup status",
      },
      {
        method: "POST",
        path:
          "/v1/email-delivery-connection-setup-sessions/{setup_session_id}/renew",
        operationId: "renewEmailDeliveryConnectionSetup",
        summary: "Renew secure setup",
      },
      {
        method: "GET",
        path: "/v1/email-delivery-connections/{connection_id}",
        operationId: "getEmailDeliveryConnection",
        summary: "Get an email delivery connection",
      },
      {
        method: "PATCH",
        path: "/v1/email-delivery-connections/{connection_id}",
        operationId: "updateEmailDeliveryConnection",
        summary: "Update an email delivery connection",
      },
      {
        method: "PUT",
        path: "/v1/email-delivery-connections/{connection_id}/status",
        operationId: "updateEmailDeliveryConnectionStatus",
        summary: "Enable or disable an email delivery connection",
      },
      {
        method: "POST",
        path: "/v1/email-delivery-connections/{connection_id}/verify",
        operationId: "verifyEmailDeliveryConnection",
        summary: "Verify an email delivery connection",
      },
      {
        method: "POST",
        path: "/v1/email-delivery-connections/{connection_id}/test",
        operationId: "testEmailDeliveryConnection",
        summary: "Send an email delivery connection test",
      },
      {
        method: "DELETE",
        path: "/v1/email-delivery-connections/{connection_id}",
        operationId: "deleteEmailDeliveryConnection",
        summary: "Delete an email delivery connection",
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
      },
      {
        method: "GET",
        path: "/v1/analytics/reports/{report_id}",
        operationId: "getAnalyticsReport",
        summary: "Get an analytics report",
        description: "Returns one unexpired bounded analytics report by identifier.",
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
      },
      {
        method: "GET",
        path: "/v1/diagnostics/automations/{automation_id}/runs/{run_id}",
        operationId: "getAutomationRunDiagnostics",
        summary: "Get Automation run diagnostics",
        description:
          "Returns one Automation run with status, timing, retries, outcomes, and redacted step failures.",
      },
      {
        method: "GET",
        path: "/v1/diagnostics/sequences/{sequence_id}",
        operationId: "getSequenceDiagnostics",
        summary: "Get Sequence diagnostics",
        description:
          "Returns bounded Sequence failure, retry, status, and message outcome details.",
      },
      {
        method: "GET",
        path: "/v1/diagnostics/broadcasts/{broadcast_id}",
        operationId: "getBroadcastDiagnostics",
        summary: "Get Broadcast diagnostics",
        description:
          "Returns selection totals, provider readiness, and the 20 most common structured delivery reasons.",
      },
      {
        method: "GET",
        path: "/v1/diagnostics/subscribers/{subscriber_id}",
        operationId: "getSubscriberActivityDiagnostics",
        summary: "Get privacy-conscious Subscriber diagnostics",
        description:
          "Returns a 90-day, bounded activity view without exposing the Subscriber email address.",
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
      },
      {
        method: "GET",
        path: "/v1/subscribers/{subscriber_id}",
        operationId: "getSubscriber",
        summary: "Get a subscriber",
      },
      {
        method: "POST",
        path: "/v1/subscribers",
        operationId: "upsertSubscriber",
        summary: "Create or upsert a subscriber",
      },
      {
        method: "PATCH",
        path: "/v1/subscribers/{subscriber_id}",
        operationId: "updateSubscriber",
        summary: "Update a subscriber",
      },
      {
        method: "DELETE",
        path: "/v1/subscribers/{subscriber_id}",
        operationId: "deleteSubscriber",
        summary: "Delete a subscriber",
      },
      {
        method: "PUT",
        path: "/v1/subscribers/{subscriber_id}/status",
        operationId: "updateSubscriberStatus",
        summary: "Change Subscriber sending eligibility",
      },
      {
        method: "PUT",
        path: "/v1/subscribers/{subscriber_id}/tags/{tag_id}",
        operationId: "addSubscriberTag",
        summary: "Add a tag to a subscriber",
      },
      {
        method: "DELETE",
        path: "/v1/subscribers/{subscriber_id}/tags/{tag_id}",
        operationId: "removeSubscriberTag",
        summary: "Remove a tag from a subscriber",
      },
      {
        method: "PUT",
        path: "/v1/subscribers/{subscriber_id}/sequences/{sequence_id}",
        operationId: "addSubscriberSequence",
        summary: "Add a subscriber to a sequence",
      },
      {
        method: "DELETE",
        path: "/v1/subscribers/{subscriber_id}/sequences/{sequence_id}",
        operationId: "removeSubscriberSequence",
        summary: "Remove a subscriber from a sequence",
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
      },
      {
        method: "POST",
        path: "/v1/tags",
        operationId: "createTag",
        summary: "Create a tag",
      },
      {
        method: "GET",
        path: "/v1/tags/{tag_id}",
        operationId: "getTag",
        summary: "Get a tag",
      },
      {
        method: "PUT",
        path: "/v1/tags/{tag_id}",
        operationId: "updateTag",
        summary: "Update a tag",
      },
      {
        method: "DELETE",
        path: "/v1/tags/{tag_id}",
        operationId: "deleteTag",
        summary: "Delete a tag",
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
      },
      {
        method: "POST",
        path: "/v1/custom-fields",
        operationId: "createCustomField",
        summary: "Create a custom field",
      },
      {
        method: "GET",
        path: "/v1/custom-fields/{custom_field_id}",
        operationId: "getCustomField",
        summary: "Get a custom field",
      },
      {
        method: "PUT",
        path: "/v1/custom-fields/{custom_field_id}",
        operationId: "updateCustomField",
        summary: "Update a custom field",
      },
      {
        method: "DELETE",
        path: "/v1/custom-fields/{custom_field_id}",
        operationId: "deleteCustomField",
        summary: "Delete a custom field",
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
      },
      {
        method: "POST",
        path: "/v1/email-templates",
        operationId: "createEmailTemplate",
        summary: "Create an email template",
      },
      {
        method: "GET",
        path: "/v1/email-templates/{template_id}",
        operationId: "getEmailTemplate",
        summary: "Get an email template",
      },
      {
        method: "POST",
        path: "/v1/email-templates/{template_id}/preview",
        operationId: "previewEmailTemplate",
        summary: "Preview an email template for a Subscriber",
      },
      {
        method: "PUT",
        path: "/v1/email-templates/{template_id}",
        operationId: "updateEmailTemplate",
        summary: "Update an email template",
      },
      {
        method: "DELETE",
        path: "/v1/email-templates/{template_id}",
        operationId: "deleteEmailTemplate",
        summary: "Delete an email template",
      },
    ],
  },
  {
    key: "starting_points",
    name: "Starting Points",
    description:
      "Discover the same email, Form, and Landing Page starting points shown in the Mailrith UI. Lists return metadata only; item reads return full content on demand.",
    operations: [
      {
        method: "GET",
        path: "/v1/starting-points/email-templates",
        operationId: "listEmailStartingPoints",
        summary: "List email starting points",
      },
      {
        method: "GET",
        path: "/v1/starting-points/email-templates/{starting_point_id}",
        operationId: "getEmailStartingPoint",
        summary: "Get an email starting point",
      },
      {
        method: "GET",
        path: "/v1/starting-points/forms",
        operationId: "listFormStartingPoints",
        summary: "List Form starting points",
      },
      {
        method: "GET",
        path: "/v1/starting-points/forms/{starting_point_id}",
        operationId: "getFormStartingPoint",
        summary: "Get a Form starting point",
      },
      {
        method: "GET",
        path: "/v1/starting-points/landing-pages",
        operationId: "listLandingPageStartingPoints",
        summary: "List Landing Page starting points",
      },
      {
        method: "GET",
        path: "/v1/starting-points/landing-pages/{starting_point_id}",
        operationId: "getLandingPageStartingPoint",
        summary: "Get a Landing Page starting point",
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
      },
      {
        method: "POST",
        path: "/v1/forms",
        operationId: "createForm",
        summary: "Create a form",
      },
      {
        method: "GET",
        path: "/v1/forms/{form_id}",
        operationId: "getForm",
        summary: "Get a form",
      },
      {
        method: "GET",
        path: "/v1/forms/{form_id}/submissions",
        operationId: "listFormSubmissions",
        summary: "List form submissions",
      },
      {
        method: "GET",
        path: "/v1/forms/{form_id}/submissions/{submission_id}",
        operationId: "getFormSubmission",
        summary: "Get a form submission",
      },
      {
        method: "POST",
        path: "/v1/forms/{form_id}/double-opt-in-preview",
        operationId: "previewFormDoubleOptIn",
        summary: "Preview a form confirmation email for a Subscriber",
      },
      {
        method: "PUT",
        path: "/v1/forms/{form_id}",
        operationId: "updateForm",
        summary: "Update a form",
      },
      {
        method: "DELETE",
        path: "/v1/forms/{form_id}",
        operationId: "deleteForm",
        summary: "Delete a form",
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
      },
      {
        method: "POST",
        path: "/v1/landing-pages",
        operationId: "createLandingPage",
        summary: "Create a landing page",
      },
      {
        method: "GET",
        path: "/v1/landing-pages/{landing_page_id}",
        operationId: "getLandingPage",
        summary: "Get a landing page",
      },
      {
        method: "GET",
        path: "/v1/landing-pages/{landing_page_id}/submissions",
        operationId: "listLandingPageSubmissions",
        summary: "List landing page submissions",
      },
      {
        method: "GET",
        path:
          "/v1/landing-pages/{landing_page_id}/submissions/{submission_id}",
        operationId: "getLandingPageSubmission",
        summary: "Get a landing page submission",
      },
      {
        method: "POST",
        path: "/v1/landing-pages/{landing_page_id}/double-opt-in-preview",
        operationId: "previewLandingPageDoubleOptIn",
        summary: "Preview a landing page confirmation email for a Subscriber",
      },
      {
        method: "PUT",
        path: "/v1/landing-pages/{landing_page_id}",
        operationId: "updateLandingPage",
        summary: "Update a landing page",
      },
      {
        method: "DELETE",
        path: "/v1/landing-pages/{landing_page_id}",
        operationId: "deleteLandingPage",
        summary: "Delete a landing page",
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
      },
      {
        method: "POST",
        path: "/v1/sequences",
        operationId: "createSequence",
        summary: "Create a sequence",
      },
      {
        method: "GET",
        path: "/v1/sequences/{sequence_id}",
        operationId: "getSequence",
        summary: "Get a sequence",
      },
      {
        method: "GET",
        path: "/v1/sequences/{sequence_id}/preflight",
        operationId: "preflightSequence",
        summary: "Check sequence readiness",
      },
      {
        method: "GET",
        path: "/v1/sequences/{sequence_id}/journey-preview",
        operationId: "previewSequenceJourney",
        summary: "Preview a sequence journey",
      },
      {
        method: "POST",
        path: "/v1/sequences/{sequence_id}/test",
        operationId: "testSequence",
        summary: "Send sequence test messages",
      },
      {
        method: "PUT",
        path: "/v1/sequences/{sequence_id}",
        operationId: "updateSequence",
        summary: "Update a sequence",
      },
      {
        method: "PUT",
        path: "/v1/sequences/{sequence_id}/status",
        operationId: "updateSequenceStatus",
        summary: "Activate or pause a sequence",
      },
      {
        method: "DELETE",
        path: "/v1/sequences/{sequence_id}",
        operationId: "deleteSequence",
        summary: "Delete a sequence",
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
      },
      {
        method: "POST",
        path: "/v1/automations",
        operationId: "createAutomation",
        summary: "Create an automation",
      },
      {
        method: "GET",
        path: "/v1/automations/{automation_id}",
        operationId: "getAutomation",
        summary: "Get an automation",
      },
      {
        method: "GET",
        path: "/v1/automations/{automation_id}/preflight",
        operationId: "preflightAutomation",
        summary: "Check automation readiness",
      },
      {
        method: "GET",
        path: "/v1/automations/{automation_id}/journey-preview",
        operationId: "previewAutomationJourney",
        summary: "Preview an automation journey",
      },
      {
        method: "POST",
        path: "/v1/automations/{automation_id}/test",
        operationId: "testAutomation",
        summary: "Send automation test messages",
      },
      {
        method: "PUT",
        path: "/v1/automations/{automation_id}",
        operationId: "updateAutomation",
        summary: "Update an automation",
      },
      {
        method: "PUT",
        path: "/v1/automations/{automation_id}/status",
        operationId: "updateAutomationStatus",
        summary: "Change an automation status",
      },
      {
        method: "DELETE",
        path: "/v1/automations/{automation_id}",
        operationId: "deleteAutomation",
        summary: "Delete an automation",
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
      },
      {
        method: "POST",
        path: "/v1/magic-links",
        operationId: "createMagicLink",
        summary: "Create a magic link",
      },
      {
        method: "GET",
        path: "/v1/magic-links/{magic_link_id}",
        operationId: "getMagicLink",
        summary: "Get a magic link",
      },
      {
        method: "PUT",
        path: "/v1/magic-links/{magic_link_id}",
        operationId: "updateMagicLink",
        summary: "Update a magic link",
      },
      {
        method: "DELETE",
        path: "/v1/magic-links/{magic_link_id}",
        operationId: "deleteMagicLink",
        summary: "Delete a magic link",
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
      },
      {
        method: "POST",
        path: "/v1/broadcasts",
        operationId: "createBroadcast",
        summary: "Create a broadcast",
      },
      {
        method: "GET",
        path: "/v1/broadcasts/{broadcast_id}/progress",
        operationId: "getBroadcastSendProgress",
        summary: "Get broadcast send progress",
      },
      {
        method: "GET",
        path: "/v1/broadcasts/{broadcast_id}/delivery-errors",
        operationId: "listBroadcastDeliveryErrors",
        summary: "List broadcast delivery errors",
      },
      {
        method: "GET",
        path: "/v1/broadcasts/{broadcast_id}",
        operationId: "getBroadcast",
        summary: "Get a broadcast",
      },
      {
        method: "PUT",
        path: "/v1/broadcasts/{broadcast_id}",
        operationId: "updateBroadcast",
        summary: "Update a broadcast",
      },
      {
        method: "DELETE",
        path: "/v1/broadcasts/{broadcast_id}",
        operationId: "deleteBroadcast",
        summary: "Delete a broadcast",
        description:
          "Deletes a draft, scheduled, or failed broadcast. Broadcasts cannot be deleted after they start sending.",
      },
      {
        method: "GET",
        path: "/v1/broadcasts/{broadcast_id}/preflight",
        operationId: "preflightBroadcast",
        summary: "Inspect broadcast readiness",
      },
      {
        method: "PUT",
        path: "/v1/broadcasts/{broadcast_id}/schedule",
        operationId: "scheduleBroadcast",
        summary: "Schedule or reschedule a broadcast",
        description:
          "Schedules a draft for future delivery or changes the scheduled time of an existing scheduled Broadcast.",
      },
      {
        method: "DELETE",
        path: "/v1/broadcasts/{broadcast_id}/schedule",
        operationId: "unscheduleBroadcast",
        summary: "Unschedule a broadcast",
        description:
          "Returns a scheduled Broadcast to draft state before delivery starts.",
      },
      {
        method: "POST",
        path: "/v1/broadcasts/{broadcast_id}/send",
        operationId: "sendBroadcast",
        summary: "Send a broadcast now",
      },
      {
        method: "POST",
        path: "/v1/broadcasts/{broadcast_id}/cancel",
        operationId: "cancelBroadcastSend",
        summary: "Cancel a broadcast send",
        description:
          "Requests cancellation for remaining delivery work. Emails already accepted by the provider cannot be recalled.",
      },
      {
        method: "POST",
        path: "/v1/broadcasts/{broadcast_id}/test",
        operationId: "testBroadcast",
        summary: "Send a broadcast test email",
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
      },
      {
        method: "POST",
        path: "/v1/segments",
        operationId: "createSegment",
        summary: "Create a segment",
      },
      {
        method: "GET",
        path: "/v1/segments/{segment_id}",
        operationId: "getSegment",
        summary: "Get a segment",
      },
      {
        method: "PUT",
        path: "/v1/segments/{segment_id}",
        operationId: "updateSegment",
        summary: "Update a segment",
      },
      {
        method: "DELETE",
        path: "/v1/segments/{segment_id}",
        operationId: "deleteSegment",
        summary: "Delete a segment",
      },
      {
        method: "POST",
        path: "/v1/segments/preview",
        operationId: "previewSegment",
        summary: "Preview a segment definition",
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
      },
      {
        method: "POST",
        path: "/v1/webhook-subscriptions",
        operationId: "createWebhookSubscription",
        summary: "Create a webhook subscription",
      },
      {
        method: "GET",
        path: "/v1/webhook-subscriptions/{webhook_subscription_id}",
        operationId: "getWebhookSubscription",
        summary: "Get a webhook subscription",
      },
      {
        method: "PUT",
        path: "/v1/webhook-subscriptions/{webhook_subscription_id}",
        operationId: "updateWebhookSubscription",
        summary: "Update a webhook subscription",
      },
      {
        method: "DELETE",
        path: "/v1/webhook-subscriptions/{webhook_subscription_id}",
        operationId: "deleteWebhookSubscription",
        summary: "Delete a webhook subscription",
      },
      {
        method: "POST",
        path: "/v1/webhook-subscriptions/{webhook_subscription_id}/rotate-secret",
        operationId: "rotateWebhookSubscriptionSecret",
        summary: "Rotate a webhook signing secret",
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
        path: "/v1/jobs/subscriber-import-uploads",
        operationId: "startSubscriberImportUpload",
        summary: "Start a subscriber import upload",
      },
      {
        method: "GET",
        path: "/v1/jobs/subscriber-import-uploads/{upload_id}",
        operationId: "getSubscriberImportUpload",
        summary: "Get a subscriber import upload",
      },
      {
        method: "GET",
        path: "/v1/jobs/subscriber-imports",
        operationId: "listSubscriberImportJobs",
        summary: "List subscriber import jobs",
      },
      {
        method: "POST",
        path: "/v1/jobs/subscriber-imports",
        operationId: "createSubscriberImportJob",
        summary: "Create a subscriber import job",
      },
      {
        method: "GET",
        path: "/v1/jobs/subscriber-imports/{job_id}",
        operationId: "getSubscriberImportJob",
        summary: "Get a subscriber import job",
      },
      {
        method: "GET",
        path: "/v1/jobs/subscriber-exports",
        operationId: "listSubscriberExportJobs",
        summary: "List subscriber export jobs",
      },
      {
        method: "POST",
        path: "/v1/jobs/subscriber-exports",
        operationId: "createSubscriberExportJob",
        summary: "Create a subscriber export job",
      },
      {
        method: "GET",
        path: "/v1/jobs/subscriber-exports/{job_id}",
        operationId: "getSubscriberExportJob",
        summary: "Get a subscriber export job",
      },
    ],
  },
];

export const publicApiCapabilityResources: PublicApiCapabilityResource[] =
  publicApiCapabilityResourceDefinitions.map((resource) => ({
    ...resource,
    operations: resource.operations.map((operation) => ({
      ...operation,
      requiredScopes: resolvePublicApiOperationRequiredScopes({
        resourceKey: resource.key,
        operationId: operation.operationId,
        method: operation.method,
      }),
    })),
  }));

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
          required_scopes: {
            type: "array",
            items: { type: "string" },
            description:
              "Permissions that are required to retry this request successfully.",
          },
          missing_scopes: {
            type: "array",
            items: { type: "string" },
            description:
              "Permissions the current credential is missing for this request.",
          },
          replacement_scopes: {
            type: "array",
            items: { type: "string" },
            description:
              "Complete permission set to use when replacing or reconnecting the credential without losing existing access.",
          },
          credential_type: {
            type: "string",
            enum: ["workspace_api_key", "oauth_access_token"],
            description:
              "The credential type that needs its access updated.",
          },
          recommended_work_profiles: {
            type: "array",
            items: { type: "string" },
            description:
              "Work Profiles that include every permission required by this request.",
          },
          access_update_url: {
            type: "string",
            format: "uri",
            description:
              "The Mailrith page where a user can update this credential's access.",
          },
          reconnect_required: {
            type: "boolean",
            description:
              "Whether an OAuth app must reconnect to request the missing permissions.",
          },
          permissions_help_url: {
            type: "string",
            format: "uri",
            description:
              "Instructions for granting the required permissions.",
          },
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
                items: { type: "string" },
              },
              access_update_url: { type: "string", format: "uri" },
              permissions_help_url: { type: "string", format: "uri" },
            },
            description:
              "Credential-specific next step that can be shown directly to the user.",
          },
          prerequisite: {
            type: "object",
            description:
              "A workspace prerequisite that must be completed before retrying.",
            properties: {
              resource: { type: "string" },
              state: { type: "string", enum: ["missing", "disabled"] },
              required_scopes: {
                type: "array",
                items: { type: "string" },
              },
              work_profile: { type: "string" },
              setup_url: { type: "string", format: "uri" },
            },
          },
          retry: {
            type: "object",
            properties: {
              safe: { type: "boolean" },
              guidance: { type: "string" },
            },
          },
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
      "capability_mode",
      "limitations",
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
      capability_mode: {
        type: "string",
        enum: ["effective"],
        description:
          "Resources contain only operations currently available to this credential, plan, workspace state, and rollout state.",
      },
      limitations: {
        type: "array",
        description:
          "Current plan or workspace prerequisites that caused otherwise supported operations to be omitted.",
        items: {
          type: "object",
          required: ["code", "message", "affected_operation_ids"],
          properties: {
            code: { type: "string" },
            message: { type: "string" },
            affected_operation_ids: {
              type: "array",
              items: { type: "string" },
              description:
                "Exact operation IDs omitted because of this limitation.",
            },
            setup_url: { type: "string", format: "uri" },
          },
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
      active_toolsets: {
        type: "array",
        nullable: true,
        description:
          "Toolsets selected for this MCP request. Omitted for direct REST requests.",
        items: { type: "string" },
      },
      read_only: {
        type: "boolean",
        description:
          "True when this MCP request is restricted to read-only operations.",
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
      signing: {
        $ref: "#/components/schemas/WebhookSigning",
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
          "Whether Mailrith currently delivers matching events to this destination.",
        enum: ["active", "disabled"],
      },
      event_patterns: {
        type: "array",
        description:
          "Events or wildcard patterns to deliver through this outbound webhook destination.",
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
          "Events or wildcard patterns to deliver through this outbound webhook destination.",
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
  SenderIdentity: {
    type: "object",
    additionalProperties: false,
    required: [
      "id",
      "name",
      "provider",
      "from_name",
      "from_email",
      "ready_for_selection",
      "created_at",
      "updated_at",
    ],
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      provider: {
        type: "string",
        description:
          "The configured email delivery provider. No provider credentials or configuration are returned.",
      },
      from_name: { type: "string" },
      from_email: { type: "string", format: "email" },
      ready_for_selection: {
        type: "boolean",
        enum: [true],
        description:
          "True because this read returns only enabled sender identities linked to the current workspace.",
      },
      created_at: dateTimeSchema,
      updated_at: dateTimeSchema,
    },
  },
  EmailDeliveryProviderPublicConfig: {
    type: "object",
    additionalProperties: false,
    properties: {
      region: { type: "string" },
      access_key_id: { type: "string" },
      has_secret_access_key: { type: "boolean" },
      has_server_token: { type: "boolean" },
      has_account_token: { type: "boolean" },
      message_stream: { type: "string", nullable: true },
      has_api_key: { type: "boolean" },
      domain: { type: "string" },
      host: { type: "string" },
      port: { type: "integer" },
      secure_mode: {
        type: "string",
        enum: ["starttls", "tls", "none"],
      },
      username: { type: "string" },
      has_password: { type: "boolean" },
    },
    description:
      "Secret-free provider settings. Boolean fields only indicate whether a saved credential exists.",
  },
  EmailDeliveryConnection: {
    type: "object",
    additionalProperties: false,
    required: [
      "id",
      "name",
      "provider",
      "from_email",
      "from_name",
      "enabled",
      "provider_config",
      "created_at",
      "updated_at",
    ],
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      provider: {
        type: "string",
        enum: [
          "amazon-ses",
          "postmark",
          "sendgrid",
          "mailgun",
          "resend",
          "brevo",
          "custom-smtp",
        ],
      },
      from_email: { type: "string", format: "email" },
      from_name: { type: "string" },
      enabled: { type: "boolean" },
      provider_config: {
        anyOf: [
          { $ref: "#/components/schemas/EmailDeliveryProviderPublicConfig" },
          { type: "null" },
        ],
      },
      created_at: dateTimeSchema,
      updated_at: dateTimeSchema,
    },
  },
  EmailDeliveryConnectionSetupRequest: {
    type: "object",
    additionalProperties: false,
    properties: {
      purpose: {
        type: "string",
        enum: ["create", "replace_credentials"],
        default: "create",
      },
      connection_id: {
        type: "string",
        description:
          "Required only when purpose is replace_credentials.",
      },
      name: { type: "string" },
      provider: {
        type: "string",
        enum: [
          "amazon-ses",
          "postmark",
          "sendgrid",
          "mailgun",
          "resend",
          "brevo",
          "custom-smtp",
        ],
      },
      from_email: { type: "string", format: "email" },
      from_name: { type: "string" },
    },
    description:
      "Non-secret defaults for a short-lived setup session. For create, include name, provider, from_email, and from_name. For replace_credentials, include connection_id. Provider credentials must never be sent to this API.",
  },
  EmailDeliveryConnectionSetupSession: {
    type: "object",
    additionalProperties: false,
    required: ["id", "purpose", "status", "expires_at"],
    properties: {
      id: { type: "string" },
      purpose: {
        type: "string",
        enum: ["create", "replace_credentials"],
      },
      status: {
        type: "string",
        enum: ["pending", "completed", "failed", "expired"],
      },
      setup_url: {
        type: "string",
        format: "uri",
        description:
          "Returned only when the session is created. Open this short-lived link in a browser to enter provider credentials directly in Mailrith.",
      },
      connection_id: { type: "string", nullable: true },
      expires_at: dateTimeSchema,
      completed_at: nullableDateTimeSchema,
      failed_at: nullableDateTimeSchema,
      failure_code: {
        type: "string",
        nullable: true,
        enum: ["setup_action_failed", null],
        description:
          "Generic failure code. Provider error details and credentials are never stored in the session.",
      },
    },
  },
  EmailDeliveryConnectionUpdateRequest: {
    type: "object",
    additionalProperties: false,
    minProperties: 1,
    properties: {
      name: { type: "string" },
      from_email: { type: "string", format: "email" },
      from_name: { type: "string" },
    },
    description:
      "Updates non-secret connection details. Use a secure setup session to replace provider credentials.",
  },
  EmailDeliveryConnectionStatusRequest: {
    type: "object",
    additionalProperties: false,
    required: ["enabled"],
    properties: {
      enabled: { type: "boolean" },
    },
  },
  EmailDeliveryConnectionTestRequest: {
    type: "object",
    additionalProperties: false,
    required: ["to"],
    properties: {
      to: { type: "string", format: "email" },
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
    additionalProperties: false,
    properties: {
      name: {
        type: "string",
        description:
          "Tag name to create. You can also create the GDPR consent tag names when you need to apply consent collected outside Mailrith.",
      },
      description: { type: "string", nullable: true },
    },
  },
  TagUpdateRequest: {
    type: "object",
    minProperties: 1,
    additionalProperties: false,
    properties: {
      name: { type: "string" },
      description: { type: "string", nullable: true },
    },
  },
  AudienceCondition: {
    type: "object",
    additionalProperties: false,
    required: ["id", "field", "operator"],
    properties: {
      id: { type: "string" },
      field: {
        type: "string",
        enum: [
          "subscriber_status",
          "country",
          "segment",
          "tag",
          "sequence",
          "form",
          "custom_field",
          "email_opened",
          "email_unsubscribed",
          "magic_link_clicked",
        ],
      },
      operator: {
        type: "string",
        enum: [
          "is",
          "is_not",
          "has_any_of",
          "has_none_of",
          "is_active_in_any_of",
          "is_not_active_in_any_of",
          "has_completed_any_of",
          "has_not_completed_any_of",
          "has_ever_been_in_any_of",
          "has_never_been_in_any_of",
          "contains",
          "does_not_contain",
          "is_empty",
          "is_not_empty",
          "before",
          "after",
          "on",
          "in_last_days",
          "greater_than",
          "less_than",
          "in_region",
          "not_in_region",
        ],
      },
      value: {
        oneOf: [
          { type: "string" },
          { type: "number" },
          { type: "boolean" },
          { type: "array", items: { type: "string" } },
          { type: "null" },
        ],
      },
      customFieldId: { type: ["string", "null"] },
    },
  },
  AudienceConditionGroup: {
    type: "object",
    additionalProperties: false,
    required: ["id", "match", "conditions"],
    properties: {
      id: { type: "string" },
      match: { type: "string", enum: ["all", "any"] },
      conditions: {
        type: "array",
        minItems: 1,
        items: { $ref: "#/components/schemas/AudienceCondition" },
      },
    },
  },
  AudienceDefinition: {
    type: "object",
    additionalProperties: false,
    required: ["match", "groups"],
    properties: {
      match: { type: "string", enum: ["all", "any"] },
      groups: {
        type: "array",
        items: { $ref: "#/components/schemas/AudienceConditionGroup" },
      },
    },
    example: {
      match: "all",
      groups: [
        {
          id: "active-subscribers",
          match: "all",
          conditions: [
            {
              id: "active-status",
              field: "subscriber_status",
              operator: "is",
              value: ["Active"],
            },
          ],
        },
      ],
    },
  },
  BroadcastEmailMark: {
    type: "object",
    additionalProperties: false,
    required: ["type"],
    properties: {
      type: {
        type: "string",
        enum: [
          "bold",
          "italic",
          "strike",
          "underline",
          "link",
          "textStyle",
          "highlight",
        ],
      },
      attrs: {
        type: "object",
        additionalProperties: false,
        properties: {
          href: { type: "string" },
          color: { type: "string" },
          fontSize: { type: "string" },
        },
      },
    },
  },
  BroadcastEmailNode: {
    type: "object",
    additionalProperties: false,
    required: ["type"],
    properties: {
      type: {
        type: "string",
        enum: [
          "doc",
          "paragraph",
          "heading",
          "text",
          "hardBreak",
          "bulletList",
          "orderedList",
          "listItem",
          "blockquote",
          "emailSection",
          "emailSectionColumn",
          "emailButton",
          "image",
          "horizontalRule",
        ],
      },
      attrs: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string" },
          level: { type: "integer", enum: [1, 2, 3] },
          textAlign: {
            type: "string",
            enum: ["left", "center", "right", "justify"],
          },
          columns: { type: "integer", enum: [1, 2, 3] },
          width: { type: "string", enum: ["default", "large", "full", "fit"] },
          backgroundColor: { type: "string" },
          blockquoteBorderColor: { type: "string" },
          linkColor: { type: "string" },
          layoutAlignment: {
            type: "string",
            enum: ["left", "center"],
          },
          backgroundImageUrl: { type: "string" },
          margin: { type: "string", enum: ["none", "normal", "large"] },
          padding: { type: "string", enum: ["none", "normal", "large"] },
          borderColor: { type: "string" },
          borderWidth: { type: "string", enum: ["none", "normal", "large"] },
          borderRadius: {
            type: "string",
            enum: ["none", "normal", "small", "large", "full"],
          },
          verticalAlign: {
            type: "string",
            enum: ["top", "middle", "bottom"],
          },
          href: { type: "string" },
          textColor: { type: "string" },
          size: { type: "string", enum: ["small", "medium", "large"] },
          align: { type: "string", enum: ["left", "center", "right"] },
          label: { type: "string" },
          src: { type: "string" },
          alt: { type: "string" },
          title: { type: "string" },
          caption: { type: "string" },
          source: { type: "string", enum: ["unsplash"] },
          unsplash: {
            type: "object",
            additionalProperties: false,
            required: ["photographerName"],
            properties: {
              photoId: { type: "string" },
              photographerName: { type: "string" },
              photographerUsername: { type: "string" },
              photographerUrl: { type: "string" },
              unsplashUrl: { type: "string" },
            },
          },
          widthPercent: { type: "number", minimum: 1, maximum: 100 },
          crop: {
            type: "string",
            enum: ["none", "square", "circle"],
          },
          fillColumn: { type: "boolean" },
        },
      },
      content: {
        type: "array",
        items: { $ref: "#/components/schemas/BroadcastEmailNode" },
      },
      text: { type: "string" },
      marks: {
        type: "array",
        items: { $ref: "#/components/schemas/BroadcastEmailMark" },
      },
    },
  },
  BroadcastEmailDocument: {
    allOf: [{ $ref: "#/components/schemas/BroadcastEmailNode" }],
    description:
      "A structured email document. The root node must use type `doc` and contain supported block nodes.",
    example: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Hello from Mailrith." }],
        },
      ],
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
    additionalProperties: false,
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
        additionalProperties: false,
      },
    },
  },
  CustomFieldUpdateRequest: {
    type: "object",
    minProperties: 1,
    additionalProperties: false,
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
        additionalProperties: false,
        properties: {
          options: stringArraySchema,
        },
      },
    },
  },
  FormField: {
    oneOf: [
      {
        type: "object",
        additionalProperties: false,
        required: ["id", "type", "label", "placeholder", "required"],
        properties: {
          id: { type: "string" },
          type: { type: "string", enum: ["email"] },
          label: { type: "string" },
          placeholder: { type: "string" },
          required: { type: "boolean", enum: [true] },
        },
      },
      {
        type: "object",
        additionalProperties: false,
        required: ["id", "type", "textVariant", "content"],
        properties: {
          id: { type: "string" },
          type: { type: "string", enum: ["text"] },
          textVariant: {
            type: "string",
            enum: ["heading", "subheading", "paragraph"],
          },
          content: { type: "string" },
        },
      },
      {
        type: "object",
        additionalProperties: false,
        required: [
          "id",
          "type",
          "customFieldId",
          "label",
          "customFieldType",
          "required",
          "placeholder",
        ],
        properties: {
          id: { type: "string" },
          type: { type: "string", enum: ["custom-field"] },
          customFieldId: { type: "string" },
          label: { type: "string" },
          customFieldType: {
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
          required: { type: "boolean" },
          placeholder: { type: ["string", "null"] },
        },
      },
    ],
  },
  FormDisplaySettings: {
    type: "object",
    additionalProperties: false,
    properties: {
      format: {
        type: "string",
        enum: ["inline", "modal", "slide_in", "sticky_bar", "full_page"],
      },
      triggerType: {
        type: ["string", "null"],
        enum: [
          "exit_intent",
          "scroll_percentage",
          "timing_seconds",
          "click_trigger",
          null,
        ],
      },
      scrollPercentage: { type: ["integer", "null"], minimum: 0, maximum: 100 },
      timingSeconds: { type: ["integer", "null"], minimum: 0 },
      triggerClassName: { type: "string" },
      triggerId: { type: "string" },
      stickyBarPosition: {
        type: ["string", "null"],
        enum: ["top", "bottom", null],
      },
      slideInPosition: {
        type: ["string", "null"],
        enum: ["left", "right", null],
      },
    },
  },
  FormStyles: {
    type: "object",
    additionalProperties: false,
    properties: {
      formBackgroundColor: { type: "string" },
      textColor: { type: "string" },
      accentColor: { type: "string" },
      fieldBackgroundColor: { type: "string" },
      fieldBorderColor: { type: "string" },
      fieldTextColor: { type: "string" },
      errorTextColor: { type: "string" },
      formBorderColor: { type: "string" },
      buttonTextColor: { type: "string" },
      rowGap: { type: "number" },
      columnGap: { type: "number" },
      formBorderWidthMode: {
        type: "string",
        enum: ["none", "normal", "large", "custom"],
      },
      formBorderWidthCustom: {
        anyOf: [
          { $ref: "#/components/schemas/LandingPageBoxEdges" },
          { type: "null" },
        ],
      },
      fieldBorderWidthMode: {
        type: "string",
        enum: ["none", "normal", "large", "custom"],
      },
      fieldBorderWidthCustom: {
        anyOf: [
          { $ref: "#/components/schemas/LandingPageBoxEdges" },
          { type: "null" },
        ],
      },
      formBorderRadiusMode: {
        type: "string",
        enum: ["none", "normal", "large", "custom"],
      },
      formBorderRadiusCustom: {
        anyOf: [
          { $ref: "#/components/schemas/LandingPageBoxCorners" },
          { type: "null" },
        ],
      },
      fieldBorderRadiusMode: {
        type: "string",
        enum: ["none", "normal", "large", "custom"],
      },
      fieldBorderRadiusCustom: {
        anyOf: [
          { $ref: "#/components/schemas/LandingPageBoxCorners" },
          { type: "null" },
        ],
      },
      buttonBorderRadiusMode: {
        type: "string",
        enum: ["none", "normal", "large", "custom"],
      },
      buttonBorderRadiusCustom: {
        anyOf: [
          { $ref: "#/components/schemas/LandingPageBoxCorners" },
          { type: "null" },
        ],
      },
      submitButtonLabel: { type: "string" },
      submitBehavior: { type: "string", enum: ["message", "redirect"] },
      redirectUrl: { type: "string" },
      forwardSubscriberData: { type: "boolean" },
      forwardedSubscriberFields: {
        type: "array",
        items: { type: "string", enum: ["email", "name"] },
      },
      tagIds: stringArraySchema,
      doubleOptIn: { $ref: "#/components/schemas/DoubleOptInSettings" },
    },
  },
  DoubleOptInSettings: {
    type: "object",
    additionalProperties: false,
    properties: {
      enabled: { type: "boolean" },
      confirmationEmailSubject: { type: ["string", "null"] },
      confirmationEmailBodyDocument: {
        anyOf: [
          { $ref: "#/components/schemas/BroadcastEmailDocument" },
          { type: "null" },
        ],
      },
      confirmationSuccessBehavior: {
        type: "string",
        enum: ["message", "redirect"],
      },
      confirmationSuccessMessage: { type: "string" },
      confirmationSuccessUrl: { type: ["string", "null"] },
    },
  },
  LandingPageBoxEdges: {
    type: "object",
    additionalProperties: false,
    required: ["top", "right", "bottom", "left"],
    properties: {
      top: { type: "number" },
      right: { type: "number" },
      bottom: { type: "number" },
      left: { type: "number" },
    },
  },
  LandingPageBoxCorners: {
    type: "object",
    additionalProperties: false,
    required: ["topLeft", "topRight", "bottomRight", "bottomLeft"],
    properties: {
      topLeft: { type: "number" },
      topRight: { type: "number" },
      bottomRight: { type: "number" },
      bottomLeft: { type: "number" },
    },
  },
  LandingPageVisibility: {
    type: "object",
    additionalProperties: false,
    required: ["desktop", "tablet", "mobile"],
    properties: {
      desktop: { type: "boolean" },
      tablet: { type: "boolean" },
      mobile: { type: "boolean" },
    },
  },
  LandingPageLogo: {
    type: "object",
    additionalProperties: false,
    required: ["id", "name", "imageUrl", "altText"],
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      imageUrl: { type: "string" },
      altText: { type: "string" },
      href: { type: "string" },
    },
  },
  LandingPageFaqItem: {
    type: "object",
    additionalProperties: false,
    required: ["id", "question", "answer"],
    properties: {
      id: { type: "string" },
      question: { type: "string" },
      answer: { type: "string" },
    },
  },
  LandingPageColumn: {
    type: "object",
    additionalProperties: false,
    required: [
      "id",
      "blocks",
      "backgroundColor",
      "textColor",
      "backgroundImageUrl",
      "margin",
      "padding",
      "verticalAlign",
      "borderColor",
      "borderWidth",
      "borderRadius",
    ],
    properties: {
      id: { type: "string" },
      blocks: {
        type: "array",
        items: { $ref: "#/components/schemas/LandingPageBlock" },
      },
      backgroundColor: { type: ["string", "null"] },
      textColor: { type: ["string", "null"] },
      backgroundImageUrl: { type: ["string", "null"] },
      backgroundImageOverlayOpacity: { type: "number", minimum: 0, maximum: 1 },
      margin: {
        type: "string",
        enum: ["none", "normal", "large", "custom"],
      },
      padding: {
        type: "string",
        enum: ["none", "normal", "large", "custom"],
      },
      customMargin: {
        anyOf: [
          { $ref: "#/components/schemas/LandingPageBoxEdges" },
          { type: "null" },
        ],
      },
      customPadding: {
        anyOf: [
          { $ref: "#/components/schemas/LandingPageBoxEdges" },
          { type: "null" },
        ],
      },
      verticalAlign: {
        type: "string",
        enum: ["top", "middle", "bottom"],
      },
      borderColor: { type: "string" },
      borderWidth: {
        type: "string",
        enum: ["none", "normal", "large", "custom"],
      },
      borderRadius: {
        type: "string",
        enum: ["none", "normal", "large", "custom"],
      },
      customBorderWidth: {
        anyOf: [
          { $ref: "#/components/schemas/LandingPageBoxEdges" },
          { type: "null" },
        ],
      },
      customBorderRadius: {
        anyOf: [
          { $ref: "#/components/schemas/LandingPageBoxCorners" },
          { type: "null" },
        ],
      },
      visibility: { $ref: "#/components/schemas/LandingPageVisibility" },
    },
  },
  LandingPageBlock: {
    type: "object",
    additionalProperties: false,
    required: ["id", "type"],
    properties: {
      id: { type: "string" },
      type: {
        type: "string",
        enum: [
          "section",
          "heading",
          "paragraph",
          "blockquote",
          "image",
          "video",
          "countdown",
          "testimonial",
          "logo-strip",
          "faq",
          "divider",
          "icon",
          "button",
          "form",
        ],
      },
      content: { type: "string" },
      level: { type: "integer", enum: [1, 2, 3] },
      textAlign: {
        type: ["string", "null"],
        enum: ["left", "center", "right", "justify", null],
      },
      highlightColor: { type: ["string", "null"] },
      citation: { type: "string" },
      borderColor: { type: ["string", "null"] },
      backgroundColor: { type: ["string", "null"] },
      textColor: { type: ["string", "null"] },
      src: { type: "string" },
      altText: { type: "string" },
      caption: { type: "string" },
      href: { type: "string" },
      borderRadius: {
        type: "string",
        enum: ["none", "normal", "large", "custom"],
      },
      customBorderRadius: {
        anyOf: [
          { $ref: "#/components/schemas/LandingPageBoxCorners" },
          { type: "null" },
        ],
      },
      title: { type: "string" },
      aspectRatio: { type: "string", enum: ["16:9", "4:3", "1:1", "9:16"] },
      targetDate: { type: "string", format: "date-time" },
      label: { type: "string" },
      expiredMessage: { type: "string" },
      design: {
        type: "string",
        enum: [
          "cards",
          "minimal",
          "inline",
          "card",
          "quote",
          "row",
          "grid",
          "bordered",
        ],
      },
      accentColor: { type: ["string", "null"] },
      align: { type: "string", enum: ["left", "center", "right"] },
      quote: { type: "string" },
      name: { type: "string" },
      avatarUrl: { type: "string" },
      avatarAlt: { type: "string" },
      rating: { type: "number", minimum: 0, maximum: 5 },
      heading: { type: "string" },
      logos: {
        type: "array",
        items: { $ref: "#/components/schemas/LandingPageLogo" },
      },
      logoHeight: { type: "number" },
      items: {
        type: "array",
        items: { $ref: "#/components/schemas/LandingPageFaqItem" },
      },
      defaultOpenFirst: { type: "boolean" },
      iconPosition: { type: "string", enum: ["start", "end"] },
      color: { type: ["string", "null"] },
      thickness: { type: "number" },
      style: { type: "string", enum: ["solid", "dashed", "dotted"] },
      iconName: { type: "string" },
      size: {
        oneOf: [
          { type: "number" },
          { type: "string", enum: ["small", "medium", "large"] },
        ],
      },
      cssClass: { type: "string" },
      cssId: { type: "string" },
      buttonTextColor: { type: "string" },
      borderWidth: {
        type: "string",
        enum: ["none", "normal", "large", "custom"],
      },
      customBorderWidth: {
        anyOf: [
          { $ref: "#/components/schemas/LandingPageBoxEdges" },
          { type: "null" },
        ],
      },
      width: { type: "string", enum: ["default", "large", "full", "fit"] },
      openInNewTab: { type: "boolean" },
      fields: {
        type: "array",
        items: { $ref: "#/components/schemas/FormField" },
      },
      disclaimerText: { type: "string" },
      fieldLayout: {
        type: "string",
        enum: ["one-column", "two-column"],
      },
      submitLayout: {
        type: "string",
        enum: ["stacked", "inline-email"],
      },
      styles: { $ref: "#/components/schemas/FormStyles" },
      columns: {
        type: "array",
        minItems: 1,
        maxItems: 3,
        items: { $ref: "#/components/schemas/LandingPageColumn" },
      },
      backgroundImageUrl: { type: ["string", "null"] },
      backgroundImageOverlayOpacity: { type: "number", minimum: 0, maximum: 1 },
      coverViewport: { type: "boolean" },
      margin: {
        type: "string",
        enum: ["none", "normal", "large", "custom"],
      },
      padding: {
        type: "string",
        enum: ["none", "normal", "large", "custom"],
      },
      customMargin: {
        anyOf: [
          { $ref: "#/components/schemas/LandingPageBoxEdges" },
          { type: "null" },
        ],
      },
      customPadding: {
        anyOf: [
          { $ref: "#/components/schemas/LandingPageBoxEdges" },
          { type: "null" },
        ],
      },
      visibility: { $ref: "#/components/schemas/LandingPageVisibility" },
    },
  },
  LandingPageDefinition: {
    type: "object",
    additionalProperties: false,
    required: ["blocks"],
    properties: {
      blocks: {
        type: "array",
        items: { $ref: "#/components/schemas/LandingPageBlock" },
      },
      successBlocks: {
        type: "array",
        items: { $ref: "#/components/schemas/LandingPageBlock" },
      },
      customCss: { type: "string" },
    },
    example: {
      blocks: [
        {
          id: "intro",
          type: "heading",
          content: "Join the newsletter",
          level: 1,
        },
      ],
      successBlocks: [
        {
          id: "success",
          type: "paragraph",
          content: "Thanks for subscribing.",
        },
      ],
    },
  },
  LandingPageStyles: {
    type: "object",
    additionalProperties: false,
    properties: {
      headingFontFamily: { type: "string" },
      fontFamily: { type: "string" },
      fontSize: { type: "number" },
      backgroundColor: { type: "string" },
      textColor: { type: "string" },
      accentColor: { type: "string" },
    },
  },
  LandingPageSettings: {
    type: "object",
    additionalProperties: false,
    properties: {
      seo: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          description: { type: "string" },
        },
      },
      social: {
        type: "object",
        additionalProperties: false,
        properties: {
          imageAssetId: { type: ["string", "null"] },
          imageUrl: { type: "string" },
          altText: { type: "string" },
        },
      },
      analytics: {
        type: "object",
        additionalProperties: false,
        properties: {
          trackingCode: { type: "string" },
        },
      },
      form: { $ref: "#/components/schemas/FormStyles" },
      display: { $ref: "#/components/schemas/FormDisplaySettings" },
    },
  },
  FormDefinition: {
    type: "object",
    additionalProperties: false,
    required: ["builder"],
    properties: {
      display: { $ref: "#/components/schemas/FormDisplaySettings" },
      builder: {
        type: "object",
        additionalProperties: false,
        required: ["definition", "styles", "settings"],
        properties: {
          definition: { $ref: "#/components/schemas/LandingPageDefinition" },
          styles: { $ref: "#/components/schemas/LandingPageStyles" },
          settings: { $ref: "#/components/schemas/LandingPageSettings" },
        },
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
  FormSummary: {
    type: "object",
    additionalProperties: false,
    required: [
      "id",
      "name",
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
    required: ["name"],
    anyOf: [
      { required: ["definition"] },
      { required: ["starting_point_id"] },
    ],
    properties: {
      name: { type: "string" },
      definition: formUpsertDefinitionSchema,
      starting_point_id: {
        type: "string",
        description:
          "Creates the Form from this canonical starting point. Do not also provide definition.",
      },
    },
    additionalProperties: false,
  },
  FormUpdateRequest: {
    type: "object",
    minProperties: 1,
    additionalProperties: false,
    properties: {
      name: { type: "string" },
      definition: formUpsertDefinitionSchema,
    },
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
        $ref: "#/components/schemas/LandingPageDefinition",
      },
      styles: {
        $ref: "#/components/schemas/LandingPageStyles",
      },
      settings: {
        $ref: "#/components/schemas/LandingPageSettings",
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
  LandingPageSummary: {
    type: "object",
    additionalProperties: false,
    required: [
      "id",
      "name",
      "slug",
      "custom_path",
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
      custom_path: { type: "string", nullable: true },
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
    required: ["name", "slug"],
    anyOf: [
      { required: ["definition"] },
      { required: ["starting_point_id"] },
    ],
    properties: {
      name: { type: "string" },
      slug: { type: "string" },
      starting_point_id: {
        type: "string",
        description:
          "Creates the Landing Page from this canonical starting point. Do not also provide definition, styles, or settings.",
      },
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
        $ref: "#/components/schemas/LandingPageDefinition",
      },
      styles: {
        $ref: "#/components/schemas/LandingPageStyles",
      },
      settings: {
        $ref: "#/components/schemas/LandingPageSettings",
      },
    },
    additionalProperties: false,
  },
  LandingPageUpdateRequest: {
    type: "object",
    minProperties: 1,
    additionalProperties: false,
    properties: {
      name: { type: "string" },
      slug: { type: "string" },
      custom_path: {
        type: "string",
        nullable: true,
        description:
          "Optional Pro custom slug. Omit this field to keep the existing custom slug.",
      },
      customPath: {
        type: "string",
        nullable: true,
        description:
          "Camel-case alias for custom_path. Omit this field to keep the existing custom slug.",
      },
      definition: { $ref: "#/components/schemas/LandingPageDefinition" },
      styles: { $ref: "#/components/schemas/LandingPageStyles" },
      settings: { $ref: "#/components/schemas/LandingPageSettings" },
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
        description: `Structured email editor content. The serialized document must be ${emailTemplateBodyDocumentMaxBytes} bytes or less.`,
        allOf: [{ $ref: "#/components/schemas/BroadcastEmailDocument" }],
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
  EmailTemplateSummary: {
    type: "object",
    additionalProperties: false,
    required: [
      "id",
      "name",
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
      enabled: { type: "boolean" },
      workspaces: {
        type: "array",
        items: { $ref: "#/components/schemas/WorkspaceReference" },
      },
      created_at: dateTimeSchema,
      updated_at: dateTimeSchema,
    },
  },
  SubscriberPreviewRequest: {
    type: "object",
    additionalProperties: false,
    required: ["subscriber_id"],
    properties: {
      subscriber_id: {
        type: "string",
        description:
          "The saved Subscriber whose name, email, and custom fields should be used for personalization.",
      },
    },
  },
  EmailTemplatePreview: {
    type: "object",
    additionalProperties: false,
    required: ["template_id", "subscriber_id", "html", "text"],
    properties: {
      template_id: { type: "string" },
      subscriber_id: { type: "string" },
      html: { type: "string" },
      text: { type: "string" },
    },
  },
  DoubleOptInEmailPreview: {
    type: "object",
    additionalProperties: false,
    required: ["subscriber_id", "subject", "html", "text"],
    properties: {
      form_id: { type: "string" },
      landing_page_id: { type: "string" },
      subscriber_id: { type: "string" },
      subject: { type: "string" },
      html: { type: "string" },
      text: { type: "string" },
    },
  },
  EmailTemplateUpsertRequest: {
    type: "object",
    required: ["name"],
    anyOf: [
      { required: ["body_document"] },
      { required: ["starting_point_id"] },
    ],
    properties: {
      name: {
        type: "string",
        maxLength: emailTemplateNameMaxLength,
      },
      body_document: {
        description: `Structured email editor content. The serialized document must be ${emailTemplateBodyDocumentMaxBytes} bytes or less.`,
        allOf: [{ $ref: "#/components/schemas/BroadcastEmailDocument" }],
      },
      starting_point_id: {
        type: "string",
        description:
          "Creates the email template from this canonical starting point. Do not also provide body_document.",
      },
      enabled: { type: "boolean" },
    },
    additionalProperties: false,
  },
  StartingPointMetadata: {
    type: "object",
    additionalProperties: false,
    required: ["id", "kind", "name", "display_order", "updated_at"],
    properties: {
      id: { type: "string" },
      kind: {
        type: "string",
        enum: ["email_template", "form", "landing_page"],
      },
      name: { type: "string" },
      description: { type: "string" },
      display_format: { type: "string" },
      display_order: { type: "integer" },
      updated_at: dateTimeSchema,
    },
  },
  EmailStartingPoint: {
    allOf: [
      { $ref: "#/components/schemas/StartingPointMetadata" },
      {
        type: "object",
        required: ["body_document"],
        properties: {
          body_document: {
            $ref: "#/components/schemas/BroadcastEmailDocument",
          },
        },
      },
    ],
  },
  FormStartingPoint: {
    allOf: [
      { $ref: "#/components/schemas/StartingPointMetadata" },
      {
        type: "object",
        required: ["definition", "styles", "settings"],
        properties: {
          definition: { type: "object", additionalProperties: true },
          styles: { type: "object", additionalProperties: true },
          settings: { type: "object", additionalProperties: true },
        },
      },
    ],
  },
  LandingPageStartingPoint: {
    allOf: [
      { $ref: "#/components/schemas/StartingPointMetadata" },
      {
        type: "object",
        required: ["definition", "styles", "settings"],
        properties: {
          definition: {
            $ref: "#/components/schemas/LandingPageDefinition",
          },
          styles: { $ref: "#/components/schemas/LandingPageStyles" },
          settings: { $ref: "#/components/schemas/LandingPageSettings" },
        },
      },
    ],
  },
  EmailTemplateUpdateRequest: {
    type: "object",
    minProperties: 1,
    properties: {
      name: {
        type: "string",
        maxLength: emailTemplateNameMaxLength,
      },
      body_document: {
        description: `Structured email editor content. The serialized document must be ${emailTemplateBodyDocumentMaxBytes} bytes or less.`,
        allOf: [{ $ref: "#/components/schemas/BroadcastEmailDocument" }],
      },
      enabled: { type: "boolean" },
    },
    additionalProperties: false,
  },
  EmailEngagementStats: {
    type: "object",
    additionalProperties: false,
    required: [
      "recipientCount",
      "openedCount",
      "clickedCount",
      "unsubscribedCount",
    ],
    properties: {
      recipientCount: { type: "integer", minimum: 0 },
      engagedCount: { type: "integer", minimum: 0 },
      openedCount: { type: "integer", minimum: 0 },
      clickedCount: { type: "integer", minimum: 0 },
      clickedSubscriberCount: { type: "integer", minimum: 0 },
      unsubscribedCount: { type: "integer", minimum: 0 },
      bouncedCount: { type: "integer", minimum: 0 },
      complainedCount: { type: "integer", minimum: 0 },
      sentCountsByDay: {
        type: "object",
        additionalProperties: { type: "integer", minimum: 0 },
      },
    },
  },
  SequenceEmail: {
    type: "object",
    additionalProperties: false,
    required: [
      "id",
      "subject",
      "previewText",
      "bodyDocument",
      "status",
      "delayValue",
      "delayUnit",
      "sendOnWeekdays",
    ],
    properties: {
      id: { type: "string" },
      subject: { type: "string" },
      previewText: { type: ["string", "null"] },
      body: {
        type: "string",
        readOnly: true,
        description:
          "Rendered HTML returned by Mailrith. Agents should send bodyDocument when creating or updating a Sequence.",
      },
      bodyDocument: { $ref: "#/components/schemas/BroadcastEmailDocument" },
      status: { type: "string", enum: ["Draft", "Published"] },
      delayValue: { type: "number", minimum: 0 },
      delayUnit: { type: "string", enum: ["minute", "hour", "day"] },
      sendOnWeekdays: {
        type: "array",
        uniqueItems: true,
        items: {
          type: "string",
          enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        },
      },
      audienceMode: {
        type: "string",
        enum: ["all", "include", "exclude"],
      },
      audienceDefinition: {
        anyOf: [
          { $ref: "#/components/schemas/AudienceDefinition" },
          { type: "null" },
        ],
      },
      stats: { $ref: "#/components/schemas/EmailEngagementStats" },
    },
  },
  SequenceDefinition: {
    type: "object",
    additionalProperties: false,
    required: ["emails"],
    properties: {
      emails: {
        type: "array",
        items: { $ref: "#/components/schemas/SequenceEmail" },
      },
      defaultTemplateId: { type: ["string", "null"] },
      sendOnWeekdays: {
        type: "array",
        uniqueItems: true,
        items: {
          type: "string",
          enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        },
      },
      excludeAudienceDefinition: {
        anyOf: [
          { $ref: "#/components/schemas/AudienceDefinition" },
          { type: "null" },
        ],
      },
      restartSequenceForCompletedSubscribers: { type: "boolean" },
      sendNewEmailsToCompletedSubscribers: { type: "boolean" },
    },
    example: {
      emails: [
        {
          id: "welcome",
          subject: "Welcome",
          previewText: "Thanks for joining",
          bodyDocument: {
            type: "doc",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Welcome to the newsletter." }],
              },
            ],
          },
          status: "Published",
          delayValue: 0,
          delayUnit: "day",
          sendOnWeekdays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
          audienceMode: "all",
          audienceDefinition: null,
        },
      ],
    },
  },
  AutomationTrigger: {
    type: "object",
    additionalProperties: false,
    required: ["type"],
    properties: {
      type: {
        type: "string",
        enum: [
          "tag_added",
          "tag_removed",
          "magic_link_clicked",
          "subscriber_status",
        ],
      },
      tagId: { type: ["string", "null"] },
      tagIds: stringArraySchema,
      magicLinkId: { type: ["string", "null"] },
      magicLinkIds: stringArraySchema,
      operator: { type: "string", enum: ["is", "is_not"] },
      statuses: {
        type: "array",
        items: {
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
    },
  },
  AutomationStepConfig: {
    type: "object",
    additionalProperties: false,
    properties: {
      tagId: { type: "string" },
      sequenceId: { type: "string" },
      magicLinkId: { type: "string" },
      customFieldId: { type: "string" },
      automationId: { type: "string" },
      emailId: { type: "string" },
      status: { type: "string" },
      statuses: stringArraySchema,
      operation: {
        type: "string",
        enum: [
          "set",
          "clear",
          "increment",
          "decrement",
          "set_today",
          "add_choices",
          "remove_choices",
          "set_true",
          "set_false",
          "toggle",
        ],
      },
      operator: {
        type: "string",
        enum: [
          "equals",
          "not_equals",
          "contains",
          "not_contains",
          "starts_with",
          "ends_with",
          "exists",
          "missing",
          "greater_than",
          "greater_than_or_equal",
          "less_than",
          "less_than_or_equal",
          "on",
          "not_on",
          "before",
          "on_or_before",
          "after",
          "on_or_after",
          "contains_any",
          "contains_all",
          "does_not_contain_any",
          "is_checked",
          "is_not_checked",
        ],
      },
      value: {
        oneOf: [
          { type: "string" },
          { type: "number" },
          { type: "boolean" },
          { type: "array", items: { type: "string" } },
          { type: "null" },
        ],
      },
      mode: {
        type: "string",
        enum: ["duration", "until_custom_date", "until_custom_field_date"],
      },
      waitMode: { type: "string", enum: ["duration", "custom_date"] },
      dateSource: {
        type: "string",
        enum: ["custom_field", "fixed_date"],
      },
      date: { type: "string", format: "date" },
      timeOfDay: {
        type: "string",
        pattern: "^([01]\\d|2[0-3]):[0-5]\\d$",
      },
      durationValue: { type: "number", minimum: 0 },
      durationUnit: {
        type: "string",
        enum: ["minute", "hour", "day", "week"],
      },
      waitForCompletion: { type: "boolean" },
      waitUntilComplete: { type: "boolean" },
      exitNextStepId: { type: ["string", "null"] },
      lookbackDays: { type: "integer", minimum: 1 },
      recipientEmail: { type: "string", format: "email" },
      subject: { type: "string" },
      previewText: { type: "string" },
      bodyDocument: { $ref: "#/components/schemas/BroadcastEmailDocument" },
      replyToEmail: { type: "string" },
      trackOpens: { type: "boolean" },
      trackClicks: { type: "boolean" },
      utmSource: { type: "string" },
      utmMedium: { type: "string" },
      utmCampaign: { type: "string" },
      utmTerm: { type: "string" },
      utmContent: { type: "string" },
      url: { type: "string", format: "uri" },
      method: { type: "string", enum: ["POST", "PUT", "PATCH"] },
      authType: { type: "string", enum: ["none", "bearer"] },
      bearerToken: { type: "string", writeOnly: true },
      bearerTokenConfigured: {
        type: "boolean",
        description:
          "True when Mailrith has a saved webhook bearer token. Send this unchanged during an update to preserve the saved value. The token value is never returned.",
      },
      headers: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["key"],
          properties: {
            key: { type: "string" },
            value: {
              type: "string",
              writeOnly: true,
              description:
                "A secret header value accepted on writes and never returned.",
            },
            configured: {
              type: "boolean",
              description:
                "True when Mailrith has a saved value for this header. Send this unchanged during an update to preserve the saved value.",
            },
          },
        },
      },
      includeSubscriber: { type: "boolean" },
      includeTags: { type: "boolean" },
      includeCustomFields: { type: "boolean" },
    },
  },
  AutomationPath: {
    type: "object",
    additionalProperties: false,
    required: ["id", "label"],
    properties: {
      id: { type: "string" },
      label: { type: "string" },
      nextStepId: { type: ["string", "null"] },
      weight: { type: ["number", "null"] },
    },
  },
  AutomationStep: {
    type: "object",
    additionalProperties: false,
    required: ["id", "kind", "type"],
    properties: {
      id: { type: "string" },
      kind: { type: "string", enum: ["event", "action", "condition"] },
      type: {
        type: "string",
        enum: [
          "tag_added",
          "tag_removed",
          "magic_link_clicked",
          "sequence_completed",
          "add_tag",
          "remove_tag",
          "add_to_sequence",
          "remove_from_sequence",
          "change_subscriber_status",
          "wait",
          "update_custom_field",
          "send_email",
          "send_internal_notification",
          "start_automation",
          "remove_from_automation",
          "webhook",
          "end_automation",
          "has_tag",
          "custom_field_match",
          "sequence_membership",
          "subscriber_status",
          "email_opened",
          "email_clicked",
        ],
      },
      config: { $ref: "#/components/schemas/AutomationStepConfig" },
      stats: { $ref: "#/components/schemas/EmailEngagementStats" },
      note: { type: ["string", "null"] },
      nextStepId: { type: ["string", "null"] },
      branches: {
        type: "object",
        additionalProperties: { type: ["string", "null"] },
      },
      paths: {
        type: "array",
        items: { $ref: "#/components/schemas/AutomationPath" },
      },
    },
  },
  AutomationEntryPoint: {
    type: "object",
    additionalProperties: false,
    required: ["id", "trigger"],
    properties: {
      id: { type: "string" },
      trigger: { $ref: "#/components/schemas/AutomationTrigger" },
      name: { type: ["string", "null"] },
      description: { type: ["string", "null"] },
    },
  },
  AutomationDefinition: {
    type: "object",
    additionalProperties: false,
    required: ["steps"],
    properties: {
      version: { type: "integer", enum: [2] },
      trigger: {
        anyOf: [
          { $ref: "#/components/schemas/AutomationTrigger" },
          { type: "null" },
        ],
      },
      triggers: {
        type: "array",
        items: { $ref: "#/components/schemas/AutomationTrigger" },
      },
      entryPoints: {
        type: "array",
        items: { $ref: "#/components/schemas/AutomationEntryPoint" },
      },
      steps: {
        type: "array",
        maxItems: 256,
        items: { $ref: "#/components/schemas/AutomationStep" },
      },
    },
    example: {
      version: 2,
      trigger: {
        type: "tag_added",
        tagIds: ["tag_welcome"],
      },
      steps: [
        {
          id: "send-welcome-email",
          kind: "action",
          type: "send_email",
          config: {
            subject: "Welcome",
            previewText: "Thanks for joining",
            bodyDocument: {
              type: "doc",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Welcome to Mailrith." }],
                },
              ],
            },
            replyToEmail: "",
            trackOpens: true,
            trackClicks: true,
            utmSource: "",
            utmMedium: "",
            utmCampaign: "",
            utmTerm: "",
            utmContent: "",
          },
        },
      ],
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
        $ref: "#/components/schemas/SequenceDefinition",
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
  SequenceSummary: {
    type: "object",
    additionalProperties: false,
    required: [
      "id",
      "name",
      "status",
      "is_updating",
      "email_count",
      "subscriber_count",
      "open_rate",
      "click_rate",
      "unsubscribed_count",
      "created_at",
      "updated_at",
    ],
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      status: { type: "string", enum: ["running", "paused"] },
      is_updating: { type: "boolean" },
      email_count: { type: "integer", minimum: 0 },
      subscriber_count: { type: "integer", minimum: 0 },
      open_rate: { type: "integer", minimum: 0 },
      click_rate: { type: "integer", minimum: 0 },
      unsubscribed_count: { type: "integer", minimum: 0 },
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
  WorkflowReadinessCheck: {
    type: "object",
    required: ["key", "status", "message"],
    additionalProperties: false,
    properties: {
      key: { type: "string" },
      status: { type: "string", enum: ["passed", "blocking"] },
      message: { type: "string" },
    },
  },
  SequencePreflight: {
    type: "object",
    required: [
      "sequence_id",
      "ready",
      "email_count",
      "published_email_count",
      "checks",
      "checked_at",
    ],
    additionalProperties: false,
    properties: {
      sequence_id: { type: "string" },
      ready: { type: "boolean" },
      email_count: { type: "integer", minimum: 0 },
      published_email_count: { type: "integer", minimum: 0 },
      checks: {
        type: "array",
        items: { $ref: "#/components/schemas/WorkflowReadinessCheck" },
      },
      checked_at: dateTimeSchema,
    },
  },
  SequenceJourneyPreview: {
    type: "object",
    required: [
      "sequence_id",
      "subscriber_id",
      "subscriber_eligible",
      "side_effect_free",
      "emails",
    ],
    additionalProperties: false,
    properties: {
      sequence_id: { type: "string" },
      subscriber_id: { type: "string" },
      subscriber_eligible: { type: "boolean" },
      side_effect_free: { type: "boolean", enum: [true] },
      emails: {
        type: "array",
        maxItems: 100,
        items: {
          type: "object",
          required: [
            "position",
            "email_id",
            "subject",
            "status",
            "eligible",
            "delay_value",
            "delay_unit",
            "send_on_weekdays",
            "audience_mode",
          ],
          additionalProperties: false,
          properties: {
            position: { type: "integer", minimum: 1 },
            email_id: { type: "string" },
            subject: { type: "string" },
            status: { type: "string", enum: ["Draft", "Published"] },
            eligible: { type: "boolean" },
            delay_value: { type: "integer", minimum: 0 },
            delay_unit: { type: "string", enum: ["minute", "hour", "day"] },
            send_on_weekdays: {
              type: "array",
              items: { type: "string" },
            },
            audience_mode: {
              type: "string",
              enum: ["all", "include", "exclude"],
            },
          },
        },
      },
    },
  },
  WorkflowTestRequest: {
    type: "object",
    required: ["recipient", "subscriber_id"],
    additionalProperties: false,
    properties: {
      recipient: { type: "string", format: "email" },
      subscriber_id: {
        type: "string",
        description:
          "The saved Subscriber whose personalization should be rendered in every test message.",
      },
      message_ids: {
        type: "array",
        maxItems: 5,
        uniqueItems: true,
        items: { type: "string" },
        description:
          "Optional Sequence email IDs or Automation step IDs. Omit to test the first five available messages.",
      },
    },
  },
  WorkflowTestResult: {
    type: "object",
    required: ["status", "sent_count", "message_ids", "subscriber_id"],
    additionalProperties: false,
    properties: {
      status: { type: "string", enum: ["completed"] },
      subscriber_id: { type: "string" },
      sent_count: { type: "integer", minimum: 1, maximum: 5 },
      message_ids: {
        type: "array",
        maxItems: 5,
        items: { type: "string" },
      },
    },
  },
  SequenceUpsertRequest: {
    type: "object",
    required: ["name", "definition"],
    additionalProperties: false,
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
        $ref: "#/components/schemas/SequenceDefinition",
      },
    },
  },
  SequenceUpdateRequest: {
    type: "object",
    minProperties: 1,
    additionalProperties: false,
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
      definition: { $ref: "#/components/schemas/SequenceDefinition" },
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
        $ref: "#/components/schemas/AutomationDefinition",
      },
      subscriber_count: { type: "integer" },
      created_at: dateTimeSchema,
      updated_at: dateTimeSchema,
    },
  },
  AutomationSummary: {
    type: "object",
    additionalProperties: false,
    required: [
      "id",
      "name",
      "status",
      "is_updating",
      "subscriber_count",
      "created_at",
      "updated_at",
    ],
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      status: { type: "string", enum: ["draft", "running", "paused"] },
      is_updating: { type: "boolean" },
      subscriber_count: { type: "integer", minimum: 0 },
      created_at: dateTimeSchema,
      updated_at: dateTimeSchema,
    },
  },
  AutomationUpsertRequest: {
    type: "object",
    required: ["name", "definition"],
    additionalProperties: false,
    properties: {
      name: { type: "string" },
      definition: {
        $ref: "#/components/schemas/AutomationDefinition",
      },
    },
  },
  AutomationUpdateRequest: {
    type: "object",
    minProperties: 1,
    additionalProperties: false,
    properties: {
      name: { type: "string" },
      definition: { $ref: "#/components/schemas/AutomationDefinition" },
    },
  },
  AutomationStatusRequest: {
    type: "object",
    required: ["status"],
    properties: {
      status: { type: "string", enum: ["draft", "running", "paused"] },
    },
  },
  AutomationPreflight: {
    type: "object",
    required: [
      "automation_id",
      "ready",
      "step_count",
      "email_step_count",
      "checks",
      "checked_at",
    ],
    additionalProperties: false,
    properties: {
      automation_id: { type: "string" },
      ready: { type: "boolean" },
      step_count: { type: "integer", minimum: 0 },
      email_step_count: { type: "integer", minimum: 0 },
      checks: {
        type: "array",
        items: { $ref: "#/components/schemas/WorkflowReadinessCheck" },
      },
      checked_at: dateTimeSchema,
    },
  },
  AutomationJourneyPreview: {
    type: "object",
    required: [
      "automation_id",
      "subscriber_id",
      "side_effect_free",
      "evaluation_basis",
      "triggers",
      "ended",
      "cycle_detected",
      "steps",
    ],
    additionalProperties: false,
    properties: {
      automation_id: { type: "string" },
      subscriber_id: { type: "string" },
      side_effect_free: { type: "boolean", enum: [true] },
      evaluation_basis: {
        type: "string",
        enum: ["current_saved_subscriber_state"],
      },
      ended: { type: "boolean" },
      cycle_detected: { type: "boolean" },
      triggers: {
        type: "array",
        maxItems: 50,
        items: {
          type: "object",
          required: ["type"],
          additionalProperties: false,
          properties: {
            type: { type: "string" },
          },
        },
      },
      steps: {
        type: "array",
        maxItems: 256,
        items: {
          type: "object",
          required: [
            "position",
            "step_id",
            "kind",
            "type",
            "condition_matched",
            "selected_branch",
            "next_step_id",
          ],
          additionalProperties: false,
          properties: {
            position: { type: "integer", minimum: 1 },
            step_id: { type: "string" },
            kind: { type: "string", enum: ["event", "action", "condition"] },
            type: { type: "string" },
            condition_matched: { type: "boolean", nullable: true },
            selected_branch: {
              type: "string",
              enum: ["yes", "no"],
              nullable: true,
            },
            next_step_id: { type: "string", nullable: true },
          },
        },
      },
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
  MagicLinkSummary: {
    type: "object",
    additionalProperties: false,
    required: [
      "id",
      "name",
      "target_type",
      "redirect_url",
      "success_message",
      "click_count",
      "public_url",
      "created_at",
      "updated_at",
    ],
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      target_type: { type: "string", enum: ["redirect", "message"] },
      redirect_url: { type: "string", nullable: true },
      success_message: { type: "string", nullable: true },
      click_count: { type: "integer", minimum: 0 },
      public_url: { type: "string" },
      created_at: dateTimeSchema,
      updated_at: dateTimeSchema,
    },
  },
  MagicLinkUpsertRequest: {
    type: "object",
    required: ["name", "target_type"],
    additionalProperties: false,
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
  MagicLinkUpdateRequest: {
    type: "object",
    minProperties: 1,
    additionalProperties: false,
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
        $ref: "#/components/schemas/BroadcastEmailDocument",
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
        anyOf: [
          { $ref: "#/components/schemas/AudienceDefinition" },
          { type: "null" },
        ],
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
  BroadcastSummary: {
    type: "object",
    additionalProperties: false,
    required: [
      "id",
      "subject",
      "preview_text",
      "status",
      "scheduled_at",
      "completed_at",
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
      status: {
        type: "string",
        enum: ["draft", "scheduled", "running", "completed", "failed"],
      },
      scheduled_at: nullableDateTimeSchema,
      completed_at: nullableDateTimeSchema,
      recipient_count: { type: "integer", minimum: 0 },
      opened_count: { type: "integer", minimum: 0 },
      clicked_count: { type: "integer", minimum: 0 },
      unsubscribed_count: { type: "integer", minimum: 0 },
      bounced_count: { type: "integer", minimum: 0 },
      complained_count: { type: "integer", minimum: 0 },
      created_at: dateTimeSchema,
      updated_at: dateTimeSchema,
    },
  },
  BroadcastUpsertRequest: {
    type: "object",
    required: ["subject", "body_document"],
    additionalProperties: false,
    properties: {
      subject: { type: "string" },
      preview_text: { type: "string", nullable: true },
      body_document: {
        $ref: "#/components/schemas/BroadcastEmailDocument",
      },
      connection_id: { type: "string", nullable: true },
      reply_to_email: { type: "string", nullable: true },
      audience_definition: {
        anyOf: [
          { $ref: "#/components/schemas/AudienceDefinition" },
          { type: "null" },
        ],
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
  BroadcastUpdateRequest: {
    type: "object",
    minProperties: 1,
    additionalProperties: false,
    properties: {
      subject: { type: "string" },
      preview_text: { type: "string", nullable: true },
      body_document: {
        $ref: "#/components/schemas/BroadcastEmailDocument",
      },
      connection_id: { type: "string", nullable: true },
      reply_to_email: { type: "string", nullable: true },
      audience_definition: {
        anyOf: [
          { $ref: "#/components/schemas/AudienceDefinition" },
          { type: "null" },
        ],
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
    required: ["recipient", "subscriber_id"],
    additionalProperties: false,
    properties: {
      recipient: { type: "string", format: "email" },
      subscriber_id: {
        type: "string",
        description:
          "The saved Subscriber whose personalization should be rendered in the test message.",
      },
    },
  },
  BroadcastScheduleRequest: {
    type: "object",
    additionalProperties: false,
    required: ["scheduled_at"],
    properties: {
      scheduled_at: {
        type: "string",
        format: "date-time",
        description:
          "A future date and time. Include an explicit UTC offset or Z suffix.",
      },
    },
    example: {
      scheduled_at: "2026-08-01T09:30:00.000Z",
    },
  },
  ActionResult: {
    type: "object",
    required: ["status"],
    properties: {
      status: { type: "string", enum: ["completed"] },
    },
  },
  BroadcastTestResult: {
    type: "object",
    additionalProperties: false,
    required: ["status", "subscriber_id"],
    properties: {
      status: { type: "string", enum: ["completed"] },
      subscriber_id: { type: "string" },
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
        $ref: "#/components/schemas/AudienceDefinition",
      },
      confirmed_subscriber_count: { type: "integer" },
      total_subscriber_count: { type: "integer" },
      created_at: dateTimeSchema,
      updated_at: dateTimeSchema,
    },
  },
  SegmentSummary: {
    type: "object",
    additionalProperties: false,
    required: [
      "id",
      "name",
      "description",
      "confirmed_subscriber_count",
      "total_subscriber_count",
      "created_at",
      "updated_at",
    ],
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      description: { type: "string", nullable: true },
      confirmed_subscriber_count: { type: "integer", minimum: 0 },
      total_subscriber_count: { type: "integer", minimum: 0 },
      created_at: dateTimeSchema,
      updated_at: dateTimeSchema,
    },
  },
  SegmentUpsertRequest: {
    type: "object",
    required: ["name", "definition"],
    additionalProperties: false,
    properties: {
      name: { type: "string" },
      description: { type: "string", nullable: true },
      definition: {
        description: "The segment filters. Include at least one filter group.",
        allOf: [{ $ref: "#/components/schemas/AudienceDefinition" }],
      },
    },
  },
  SegmentUpdateRequest: {
    type: "object",
    minProperties: 1,
    additionalProperties: false,
    properties: {
      name: { type: "string" },
      description: { type: "string", nullable: true },
      definition: {
        description: "The segment filters. Include at least one filter group.",
        allOf: [{ $ref: "#/components/schemas/AudienceDefinition" }],
      },
    },
  },
  SegmentPreviewRequest: {
    type: "object",
    required: ["definition"],
    properties: {
      definition: {
        description:
          "The segment filters to preview. Include at least one filter group.",
        allOf: [{ $ref: "#/components/schemas/AudienceDefinition" }],
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
  SubscriberImportJobSummary: {
    type: "object",
    required: [
      "id",
      "status",
      "imported_count",
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
      started_at: nullableDateTimeSchema,
      completed_at: nullableDateTimeSchema,
      created_at: dateTimeSchema,
      updated_at: dateTimeSchema,
    },
  },
  SubscriberImportUpload: {
    type: "object",
    required: [
      "id",
      "status",
      "upload_url",
      "file_name",
      "size_bytes",
      "headers",
      "row_count",
      "import_job_id",
      "expires_at",
      "uploaded_at",
      "queued_at",
    ],
    properties: {
      id: { type: "string" },
      status: {
        type: "string",
        enum: ["Pending", "Ready", "Queued"],
      },
      upload_url: {
        type: "string",
        format: "uri",
        nullable: true,
        description:
          "The short-lived browser handoff URL. It is returned only when the upload starts.",
      },
      file_name: { type: "string", nullable: true },
      size_bytes: { type: "integer", nullable: true },
      headers: {
        type: "array",
        maxItems: 250,
        description:
          "Bounded CSV column names. Each name is at most 200 characters and the combined encoded metadata is at most 12 KiB.",
        items: { type: "string", maxLength: 200 },
      },
      row_count: { type: "integer", nullable: true },
      import_job_id: { type: "string", nullable: true },
      expires_at: dateTimeSchema,
      uploaded_at: nullableDateTimeSchema,
      queued_at: nullableDateTimeSchema,
    },
  },
  SubscriberImportJobCreateRequest: {
    type: "object",
    required: ["upload_id", "mappings"],
    properties: {
      upload_id: {
        type: "string",
        description:
          "The ready upload returned by startSubscriberImportUpload. CSV contents are never sent through the agent request.",
      },
      mappings: {
        type: "array",
        description:
          "Map each uploaded CSV column and each Mailrith field only once. Every csv_column value must exactly match a header returned by getSubscriberImportUpload.",
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
  SubscriberExportJobSummary: {
    type: "object",
    required: [
      "id",
      "status",
      "exported_count",
      "expires_at",
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
      exported_count: { type: "integer", nullable: true },
      expires_at: nullableDateTimeSchema,
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
          enum: ["source_type", "source", "message", "provider", "day"],
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
};

const selfLinkedSchemaNames = [
  "Workspace",
  "SenderIdentity",
  "EmailDeliveryConnection",
  "EmailDeliveryConnectionSetupSession",
  "WebhookSubscription",
  "Subscriber",
  "Tag",
  "CustomField",
  "EmailTemplate",
  "EmailTemplateSummary",
  "Form",
  "FormSummary",
  "FormSubmission",
  "LandingPage",
  "LandingPageSummary",
  "LandingPageSubmission",
  "Sequence",
  "SequenceSummary",
  "Automation",
  "AutomationSummary",
  "MagicLink",
  "MagicLinkSummary",
  "Broadcast",
  "BroadcastSummary",
  "Segment",
  "SegmentSummary",
  "SubscriberImportUpload",
  "SubscriberImportJob",
  "SubscriberImportJobSummary",
  "SubscriberExportJob",
  "SubscriberExportJobSummary",
  "AnalyticsReport",
] as const;

for (const schemaName of selfLinkedSchemaNames) {
  const schema = schemas[schemaName] as {
    required?: string[];
    properties?: Record<string, unknown>;
  };
  schema.required = [...(schema.required ?? []), "self"];
  schema.properties = {
    self: {
      type: "string",
      description:
        "Stable relative Public API path for retrieving this resource.",
    },
    ...(schema.properties ?? {}),
  };
}

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
    "/v1/sender-identities": {
      get: {
        method: "GET",
        path: "/v1/sender-identities",
        summary: "List sender identities",
        description:
          "Returns a bounded page of enabled sender names, addresses, and provider types that can be selected for Broadcasts and Sequences. Provider credentials and configuration are never returned.",
        tags: ["Sender Identities"],
        operationId: "listSenderIdentities",
        security,
        parameters: [
          {
            name: "limit",
            in: "query",
            description: "Maximum number of sender identities to return.",
            schema: { type: "integer", minimum: 1, maximum: 100 },
          },
          {
            name: "starting_after",
            in: "query",
            description:
              "Opaque next_cursor returned by the previous sender identity page.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": listOperationResponse(
            "#/components/schemas/SenderIdentity",
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
    },
    "/v1/sender-identities/{sender_identity_id}": {
      get: {
        method: "GET",
        path: "/v1/sender-identities/{sender_identity_id}",
        summary: "Get a sender identity",
        description:
          "Returns one enabled sender name, address, and provider type by stable identifier. Provider credentials and configuration are never returned.",
        tags: ["Sender Identities"],
        operationId: "getSenderIdentity",
        security,
        parameters: [
          {
            name: "sender_identity_id",
            in: "path",
            required: true,
            description: "The sender identity identifier.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": itemOperationResponse(
            "#/components/schemas/SenderIdentity",
          ),
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "404": {
            description: "Sender identity not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/email-delivery-connection-setup-sessions": {
      post: {
        method: "POST",
        path: "/v1/email-delivery-connection-setup-sessions",
        summary: "Start secure email delivery connection setup",
        description:
          "Creates a short-lived browser handoff containing only non-secret defaults. Open setup_url so an authorized Mailrith user can enter provider credentials directly in Mailrith.",
        tags: ["Email Delivery Connections"],
        operationId: "startEmailDeliveryConnectionSetup",
        security,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/EmailDeliveryConnectionSetupRequest",
              },
            },
          },
        },
        responses: {
          "201": itemOperationResponse(
            "#/components/schemas/EmailDeliveryConnectionSetupSession",
            "Secure setup session created",
          ),
          "400": {
            description: "The non-secret setup defaults are invalid.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/email-delivery-connection-setup-sessions/{setup_session_id}": {
      get: {
        method: "GET",
        path: "/v1/email-delivery-connection-setup-sessions/{setup_session_id}",
        summary: "Get secure setup status",
        description:
          "Returns pending or completed status for one short-lived setup session. It never returns the browser token or provider credentials.",
        tags: ["Email Delivery Connections"],
        operationId: "getEmailDeliveryConnectionSetup",
        security,
        parameters: [
          {
            name: "setup_session_id",
            in: "path",
            required: true,
            description: "The identifier returned when setup started.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": itemOperationResponse(
            "#/components/schemas/EmailDeliveryConnectionSetupSession",
          ),
          "404": {
            description: "The setup session was not found or expired.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/email-delivery-connection-setup-sessions/{setup_session_id}/renew": {
      post: {
        method: "POST",
        path:
          "/v1/email-delivery-connection-setup-sessions/{setup_session_id}/renew",
        summary: "Renew secure email delivery setup",
        description:
          "Creates a fresh short-lived browser link from the previous session's bounded non-secret defaults. Completed sessions cannot be renewed.",
        tags: ["Email Delivery Connections"],
        operationId: "renewEmailDeliveryConnectionSetup",
        security,
        parameters: [
          {
            name: "setup_session_id",
            in: "path",
            required: true,
            description: "The previous setup session identifier.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "201": itemOperationResponse(
            "#/components/schemas/EmailDeliveryConnectionSetupSession",
            "A fresh secure setup session was created.",
          ),
          "409": {
            description: "The setup session cannot be renewed.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/email-delivery-connections": {
      get: {
        method: "GET",
        path: "/v1/email-delivery-connections",
        summary: "List email delivery connections",
        description:
          "Returns a bounded page of email delivery connections linked to the authenticated workspace. Saved credentials and webhook secrets are never returned.",
        tags: ["Email Delivery Connections"],
        operationId: "listEmailDeliveryConnections",
        security,
        parameters: [
          {
            name: "limit",
            in: "query",
            description: "Maximum number of connections to return.",
            schema: { type: "integer", minimum: 1, maximum: 100 },
          },
          {
            name: "starting_after",
            in: "query",
            description:
              "Opaque next_cursor returned by the previous connection page.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": listOperationResponse(
            "#/components/schemas/EmailDeliveryConnection",
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
    },
    "/v1/email-delivery-connections/{connection_id}": {
      get: {
        method: "GET",
        path: "/v1/email-delivery-connections/{connection_id}",
        summary: "Get an email delivery connection",
        description:
          "Returns one secret-free email delivery connection linked to the authenticated workspace.",
        tags: ["Email Delivery Connections"],
        operationId: "getEmailDeliveryConnection",
        security,
        parameters: [
          {
            name: "connection_id",
            in: "path",
            required: true,
            description: "The identifier of the connection to return.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": itemOperationResponse(
            "#/components/schemas/EmailDeliveryConnection",
          ),
          "404": {
            description: "The connection was not found.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      patch: {
        method: "PATCH",
        path: "/v1/email-delivery-connections/{connection_id}",
        summary: "Update an email delivery connection",
        description:
          "Changes non-secret details for one connection linked only to the authenticated workspace. Use a secure setup session to replace provider credentials. Shared connections must be changed in the Mailrith UI.",
        tags: ["Email Delivery Connections"],
        operationId: "updateEmailDeliveryConnection",
        security,
        parameters: [
          {
            name: "connection_id",
            in: "path",
            required: true,
            description: "The identifier of the connection to update.",
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/EmailDeliveryConnectionUpdateRequest",
              },
            },
          },
        },
        responses: {
          "200": itemOperationResponse(
            "#/components/schemas/EmailDeliveryConnection",
          ),
          "400": {
            description: "The non-secret connection details are invalid.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "409": {
            description:
              "The connection is shared or currently in use and cannot be changed through a workspace-scoped credential.",
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
        path: "/v1/email-delivery-connections/{connection_id}",
        summary: "Delete an email delivery connection",
        description:
          "Deletes one connection linked only to the authenticated workspace. Shared or in-use connections are not deleted.",
        tags: ["Email Delivery Connections"],
        operationId: "deleteEmailDeliveryConnection",
        security,
        parameters: [
          {
            name: "connection_id",
            in: "path",
            required: true,
            description: "The identifier of the connection to delete.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "204": { description: "The connection was deleted." },
          "404": {
            description: "The connection was not found.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "409": {
            description:
              "The connection is shared or currently in use and cannot be deleted.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/email-delivery-connections/{connection_id}/status": {
      put: {
        method: "PUT",
        path: "/v1/email-delivery-connections/{connection_id}/status",
        summary: "Enable or disable an email delivery connection",
        description:
          "Enables or disables one connection linked only to the authenticated workspace. Shared or in-use connections remain protected.",
        tags: ["Email Delivery Connections"],
        operationId: "updateEmailDeliveryConnectionStatus",
        security,
        parameters: [
          {
            name: "connection_id",
            in: "path",
            required: true,
            description: "The identifier of the connection to change.",
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/EmailDeliveryConnectionStatusRequest",
              },
            },
          },
        },
        responses: {
          "200": itemOperationResponse(
            "#/components/schemas/EmailDeliveryConnection",
          ),
          "409": {
            description:
              "The connection is shared or currently in use and cannot be changed.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/email-delivery-connections/{connection_id}/verify": {
      post: {
        method: "POST",
        path: "/v1/email-delivery-connections/{connection_id}/verify",
        summary: "Verify an email delivery connection",
        description:
          "Checks the saved provider credential and sender without returning secrets. If the provider key allows sending but not inspection, the response clearly requires a real test email.",
        tags: ["Email Delivery Connections"],
        operationId: "verifyEmailDeliveryConnection",
        security,
        parameters: [
          {
            name: "connection_id",
            in: "path",
            required: true,
            description: "The identifier of the connection to verify.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Verification completed.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["data"],
                  properties: {
                    data: {
                      type: "object",
                      required: [
                        "connection_id",
                        "verification_status",
                        "inspection_status",
                        "message",
                        "verified_at",
                      ],
                      properties: {
                        connection_id: { type: "string" },
                        verification_status: {
                          type: "string",
                          enum: ["verified", "send_test_required"],
                        },
                        inspection_status: {
                          type: "string",
                          enum: ["available", "unavailable"],
                        },
                        message: { type: "string" },
                        verified_at: dateTimeSchema,
                      },
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "The provider or sender verification failed.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/email-delivery-connections/{connection_id}/test": {
      post: {
        method: "POST",
        path: "/v1/email-delivery-connections/{connection_id}/test",
        summary: "Send an email delivery connection test",
        description:
          "Sends one real test email through the saved connection. This is the definitive check when a send-only provider key cannot be inspected.",
        tags: ["Email Delivery Connections"],
        operationId: "testEmailDeliveryConnection",
        security,
        parameters: [
          {
            name: "connection_id",
            in: "path",
            required: true,
            description: "The identifier of the connection to test.",
            schema: { type: "string" },
          },
          {
            name: "Idempotency-Key",
            in: "header",
            required: true,
            description:
              "Prevents an automatic retry from sending a duplicate test email.",
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/EmailDeliveryConnectionTestRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Test email sent.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["data"],
                  properties: {
                    data: {
                      type: "object",
                      required: [
                        "connection_id",
                        "recipient",
                        "status",
                        "sent_at",
                      ],
                      properties: {
                        connection_id: { type: "string" },
                        recipient: { type: "string", format: "email" },
                        status: { type: "string", enum: ["sent"] },
                        sent_at: dateTimeSchema,
                      },
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "The recipient is invalid or the test send failed.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "429": {
            description: "Too many test emails were requested.",
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
          "Creates a signed outbound webhook subscription and returns the signing secret once. The caller must also have read scopes for the selected event families. A workspace can have up to 20 webhook subscriptions, including disabled subscriptions.",
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
            description:
              "The subscription name already exists or the workspace has reached its 20-subscription limit.",
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
    "/v1/starting-points/email-templates": {
      get: {
        method: "GET",
        path: "/v1/starting-points/email-templates",
        summary: "List email starting points",
        description:
          "Returns compact metadata for the same email starting points available in the Mailrith UI. Load one item only when its full content is needed.",
        tags: ["Starting Points"],
        operationId: "listEmailStartingPoints",
        security,
        responses: {
          "200": listOperationResponse(
            "#/components/schemas/StartingPointMetadata",
          ),
        },
      },
    },
    "/v1/starting-points/email-templates/{starting_point_id}": {
      get: {
        method: "GET",
        path: "/v1/starting-points/email-templates/{starting_point_id}",
        summary: "Get an email starting point",
        description:
          "Returns one email starting point with its full structured email document.",
        tags: ["Starting Points"],
        operationId: "getEmailStartingPoint",
        security,
        parameters: [
          {
            name: "starting_point_id",
            in: "path",
            required: true,
            description: "The email starting point identifier.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": itemOperationResponse(
            "#/components/schemas/EmailStartingPoint",
          ),
          "404": {
            description: "The email starting point was not found.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/starting-points/forms": {
      get: {
        method: "GET",
        path: "/v1/starting-points/forms",
        summary: "List Form starting points",
        description:
          "Returns compact metadata for the same Form starting points available in the Mailrith UI. Load one item only when its full content is needed.",
        tags: ["Starting Points"],
        operationId: "listFormStartingPoints",
        security,
        responses: {
          "200": listOperationResponse(
            "#/components/schemas/StartingPointMetadata",
          ),
        },
      },
    },
    "/v1/starting-points/forms/{starting_point_id}": {
      get: {
        method: "GET",
        path: "/v1/starting-points/forms/{starting_point_id}",
        summary: "Get a Form starting point",
        description:
          "Returns one Form starting point with its definition, styles, and settings.",
        tags: ["Starting Points"],
        operationId: "getFormStartingPoint",
        security,
        parameters: [
          {
            name: "starting_point_id",
            in: "path",
            required: true,
            description: "The Form starting point identifier.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": itemOperationResponse(
            "#/components/schemas/FormStartingPoint",
          ),
          "404": {
            description: "The Form starting point was not found.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/starting-points/landing-pages": {
      get: {
        method: "GET",
        path: "/v1/starting-points/landing-pages",
        summary: "List Landing Page starting points",
        description:
          "Returns compact metadata for the same Landing Page starting points available in the Mailrith UI. Load one item only when its full content is needed.",
        tags: ["Starting Points"],
        operationId: "listLandingPageStartingPoints",
        security,
        responses: {
          "200": listOperationResponse(
            "#/components/schemas/StartingPointMetadata",
          ),
        },
      },
    },
    "/v1/starting-points/landing-pages/{starting_point_id}": {
      get: {
        method: "GET",
        path: "/v1/starting-points/landing-pages/{starting_point_id}",
        summary: "Get a Landing Page starting point",
        description:
          "Returns one Landing Page starting point with its definition, styles, and settings.",
        tags: ["Starting Points"],
        operationId: "getLandingPageStartingPoint",
        security,
        parameters: [
          {
            name: "starting_point_id",
            in: "path",
            required: true,
            description: "The Landing Page starting point identifier.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": itemOperationResponse(
            "#/components/schemas/LandingPageStartingPoint",
          ),
          "404": {
            description: "The Landing Page starting point was not found.",
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
            name: "search",
            in: "query",
            description: "Filter email templates by name.",
            schema: { type: "string", maxLength: 200 },
          },
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
          "200": listOperationResponse(
            "#/components/schemas/EmailTemplateSummary",
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
                $ref: "#/components/schemas/EmailTemplateUpdateRequest",
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
    "/v1/email-templates/{template_id}/preview": {
      post: {
        method: "POST",
        path: "/v1/email-templates/{template_id}/preview",
        summary: "Preview an email template for a Subscriber",
        description:
          "Renders one template using a saved Subscriber's name, email, and custom fields without sending or saving anything.",
        tags: ["Email Templates"],
        operationId: "previewEmailTemplate",
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
                $ref: "#/components/schemas/SubscriberPreviewRequest",
              },
            },
          },
        },
        responses: {
          "200": itemOperationResponse(
            "#/components/schemas/EmailTemplatePreview",
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
            description: "Template or Subscriber not found",
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
            name: "search",
            in: "query",
            description:
              "Filter Broadcasts by subject, preview text, status, or sender.",
            schema: { type: "string", maxLength: 200 },
          },
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
          "200": listOperationResponse(
            "#/components/schemas/BroadcastSummary",
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
        path: "/v1/broadcasts",
        summary: "Create a broadcast",
        description: "Creates a broadcast draft in the authenticated workspace.",
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
              schema: { $ref: "#/components/schemas/BroadcastUpdateRequest" },
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
    "/v1/broadcasts/{broadcast_id}/schedule": {
      put: {
        method: "PUT",
        path: "/v1/broadcasts/{broadcast_id}/schedule",
        summary: "Schedule or reschedule a broadcast",
        description:
          "Schedules a draft for future delivery, or changes the delivery time of an existing scheduled Broadcast. This uses Mailrith's durable scheduled-send path and does not start delivery immediately.",
        tags: ["Broadcasts"],
        operationId: "scheduleBroadcast",
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
              schema: {
                $ref: "#/components/schemas/BroadcastScheduleRequest",
              },
            },
          },
        },
        responses: {
          "200": itemOperationResponse(
            "#/components/schemas/Broadcast",
            "Broadcast scheduled",
          ),
          "400": {
            description: "The schedule or sender is invalid.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "409": {
            description:
              "The Broadcast already started or cannot be scheduled in its current state.",
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
        path: "/v1/broadcasts/{broadcast_id}/schedule",
        summary: "Unschedule a broadcast",
        description:
          "Returns a scheduled Broadcast to draft state before delivery starts.",
        tags: ["Broadcasts"],
        operationId: "unscheduleBroadcast",
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
            "#/components/schemas/Broadcast",
            "Broadcast returned to draft",
          ),
          "409": {
            description:
              "The Broadcast already started or cannot be changed in its current state.",
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
            "#/components/schemas/BroadcastTestResult",
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
            description:
              "Filter sequences by name, status, or sender details. Retrieve a known Sequence ID through the item endpoint.",
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
          "200": listOperationResponse(
            "#/components/schemas/SequenceSummary",
          ),
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
              schema: { $ref: "#/components/schemas/SequenceUpdateRequest" },
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
    "/v1/sequences/{sequence_id}/preflight": {
      get: {
        method: "GET",
        path: "/v1/sequences/{sequence_id}/preflight",
        summary: "Check sequence readiness",
        description:
          "Checks the saved Sequence, its published emails, and its email delivery connection without changing data or sending email.",
        tags: ["Sequences"],
        operationId: "preflightSequence",
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
        responses: {
          "200": itemOperationResponse(
            "#/components/schemas/SequencePreflight",
            "Sequence readiness returned",
          ),
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
    "/v1/sequences/{sequence_id}/journey-preview": {
      get: {
        method: "GET",
        path: "/v1/sequences/{sequence_id}/journey-preview",
        summary: "Preview a sequence journey",
        description:
          "Returns the bounded saved email timeline and shows which messages a selected Subscriber is eligible to receive, without enrolling the Subscriber or sending email.",
        tags: ["Sequences"],
        operationId: "previewSequenceJourney",
        security,
        parameters: [
          {
            name: "sequence_id",
            in: "path",
            required: true,
            description: "The Sequence identifier.",
            schema: { type: "string" },
          },
          {
            name: "subscriber_id",
            in: "query",
            required: true,
            description:
              "The saved Subscriber whose personalization and targeting should be previewed.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": itemOperationResponse(
            "#/components/schemas/SequenceJourneyPreview",
            "Sequence journey preview returned",
          ),
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
    "/v1/sequences/{sequence_id}/test": {
      post: {
        method: "POST",
        path: "/v1/sequences/{sequence_id}/test",
        summary: "Send sequence test messages",
        description:
          "Sends up to five selected saved Sequence emails to one explicit test address. This does not enroll a Subscriber, start the Sequence, or write delivery activity.",
        tags: ["Sequences"],
        operationId: "testSequence",
        security,
        parameters: [
          {
            name: "sequence_id",
            in: "path",
            required: true,
            description: "The Sequence identifier.",
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
              schema: { $ref: "#/components/schemas/WorkflowTestRequest" },
            },
          },
        },
        responses: {
          "200": itemOperationResponse(
            "#/components/schemas/WorkflowTestResult",
            "Sequence test messages sent",
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
            description: "Sequence not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "429": {
            description: "Too many test messages were requested",
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
            name: "search",
            in: "query",
            description: "Filter Automations by name or status.",
            schema: { type: "string", maxLength: 200 },
          },
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
          "200": listOperationResponse(
            "#/components/schemas/AutomationSummary",
          ),
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
              schema: { $ref: "#/components/schemas/AutomationUpdateRequest" },
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
        summary: "Change an automation status",
        description:
          "Starts, pauses, or returns one Automation to draft without changing its definition.",
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
    "/v1/automations/{automation_id}/preflight": {
      get: {
        method: "GET",
        path: "/v1/automations/{automation_id}/preflight",
        summary: "Check automation readiness",
        description:
          "Checks the saved Automation definition and email delivery prerequisite without running any action.",
        tags: ["Automations"],
        operationId: "preflightAutomation",
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
        responses: {
          "200": itemOperationResponse(
            "#/components/schemas/AutomationPreflight",
            "Automation readiness returned",
          ),
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
    "/v1/automations/{automation_id}/journey-preview": {
      get: {
        method: "GET",
        path: "/v1/automations/{automation_id}/journey-preview",
        summary: "Preview an automation journey",
        description:
          "Shows the bounded path a selected Subscriber would take through the current saved conditions without running actions or writing history.",
        tags: ["Automations"],
        operationId: "previewAutomationJourney",
        security,
        parameters: [
          {
            name: "automation_id",
            in: "path",
            required: true,
            description: "The Automation identifier.",
            schema: { type: "string" },
          },
          {
            name: "subscriber_id",
            in: "query",
            required: true,
            description:
              "The saved Subscriber whose current state should be evaluated.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": itemOperationResponse(
            "#/components/schemas/AutomationJourneyPreview",
            "Automation journey preview returned",
          ),
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
    "/v1/automations/{automation_id}/test": {
      post: {
        method: "POST",
        path: "/v1/automations/{automation_id}/test",
        summary: "Send automation test messages",
        description:
          "Sends up to five selected saved Automation email steps to one explicit test address. This does not start the Automation or run other actions.",
        tags: ["Automations"],
        operationId: "testAutomation",
        security,
        parameters: [
          {
            name: "automation_id",
            in: "path",
            required: true,
            description: "The Automation identifier.",
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
              schema: { $ref: "#/components/schemas/WorkflowTestRequest" },
            },
          },
        },
        responses: {
          "200": itemOperationResponse(
            "#/components/schemas/WorkflowTestResult",
            "Automation test messages sent",
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
            description: "Automation not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "429": {
            description: "Too many test messages were requested",
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
            name: "search",
            in: "query",
            description:
              "Filter Magic Links by name, destination, or success message.",
            schema: { type: "string", maxLength: 200 },
          },
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
          "200": listOperationResponse(
            "#/components/schemas/MagicLinkSummary",
          ),
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
              schema: { $ref: "#/components/schemas/MagicLinkUpdateRequest" },
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
      get: {
        method: "GET",
        path: "/v1/subscribers/{subscriber_id}",
        summary: "Get a subscriber",
        description:
          "Returns one Subscriber by its stable identifier from the authenticated workspace.",
        tags: ["Subscribers"],
        operationId: "getSubscriber",
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
        responses: {
          "200": itemOperationResponse("#/components/schemas/Subscriber"),
          "401": {
            description: "Authentication is required or invalid",
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
      patch: {
        method: "PATCH",
        path: "/v1/subscribers/{subscriber_id}",
        summary: "Update a subscriber",
        description:
          "Updates profile fields, status, custom fields, tags, or sequence assignments for one subscriber. Fields omitted from the request stay unchanged. Blank optional custom field values also leave saved values unchanged, and filled-in invalid values are rejected.",
        tags: ["Subscribers"],
        operationId: "updateSubscriber",
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
      delete: {
        method: "DELETE",
        path: "/v1/subscribers/{subscriber_id}",
        summary: "Delete a subscriber",
        description:
          "Permanently removes one Subscriber and their Mailrith activity history from the authenticated workspace.",
        tags: ["Subscribers"],
        operationId: "deleteSubscriber",
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
        responses: {
          "204": { description: "Subscriber was deleted" },
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
            description:
              "Filter Tags by name or description. Retrieve a known Tag ID through the item endpoint.",
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
    "/v1/tags/{tag_id}": {
      get: {
        method: "GET",
        path: "/v1/tags/{tag_id}",
        summary: "Get a tag",
        description: "Returns one Tag from the authenticated workspace.",
        tags: ["Tags"],
        operationId: "getTag",
        security,
        parameters: [
          {
            name: "tag_id",
            in: "path",
            required: true,
            description: "The Tag identifier.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": itemOperationResponse("#/components/schemas/Tag"),
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
        path: "/v1/tags/{tag_id}",
        summary: "Update a tag",
        description:
          "Changes the name and description of one Tag in the authenticated workspace.",
        tags: ["Tags"],
        operationId: "updateTag",
        security,
        parameters: [
          {
            name: "tag_id",
            in: "path",
            required: true,
            description: "The Tag identifier.",
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TagUpdateRequest" },
            },
          },
        },
        responses: {
          "200": itemOperationResponse("#/components/schemas/Tag"),
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
        path: "/v1/tags/{tag_id}",
        summary: "Delete a tag",
        description:
          "Permanently removes one Tag when no saved Mailrith resource references it.",
        tags: ["Tags"],
        operationId: "deleteTag",
        security,
        parameters: [
          {
            name: "tag_id",
            in: "path",
            required: true,
            description: "The Tag identifier.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "204": { description: "Tag was deleted" },
          "404": {
            description: "Resource not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "409": {
            description: "Tag is still referenced by another resource",
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
            name: "search",
            in: "query",
            description: "Filter custom fields by label or type.",
            schema: { type: "string", maxLength: 200 },
          },
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
              schema: { $ref: "#/components/schemas/CustomFieldUpdateRequest" },
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
            description:
              "Filter Forms by name or public URL token. Retrieve a known Form ID through the item endpoint.",
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
          "200": listOperationResponse("#/components/schemas/FormSummary"),
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
              schema: { $ref: "#/components/schemas/FormUpdateRequest" },
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
    "/v1/forms/{form_id}/double-opt-in-preview": {
      post: {
        method: "POST",
        path: "/v1/forms/{form_id}/double-opt-in-preview",
        summary: "Preview a form confirmation email for a Subscriber",
        description:
          "Renders the configured double opt-in email for a saved Subscriber without sending or saving anything.",
        tags: ["Forms"],
        operationId: "previewFormDoubleOptIn",
        security,
        parameters: [
          {
            name: "form_id",
            in: "path",
            required: true,
            description: "The form identifier.",
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SubscriberPreviewRequest",
              },
            },
          },
        },
        responses: {
          "200": itemOperationResponse(
            "#/components/schemas/DoubleOptInEmailPreview",
          ),
          "404": {
            description: "Form or Subscriber not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "409": {
            description: "Double opt-in is disabled or incomplete",
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
          "Returns a bounded cursor page of retained submissions for one Form, including the Subscriber who submitted it.",
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
    "/v1/forms/{form_id}/submissions/{submission_id}": {
      get: {
        method: "GET",
        path: "/v1/forms/{form_id}/submissions/{submission_id}",
        summary: "Get a form submission",
        description:
          "Returns one retained Form submission by stable identifier.",
        tags: ["Forms"],
        operationId: "getFormSubmission",
        security,
        parameters: [
          {
            name: "form_id",
            in: "path",
            required: true,
            description: "The Form identifier.",
            schema: { type: "string" },
          },
          {
            name: "submission_id",
            in: "path",
            required: true,
            description: "The Form submission identifier.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": itemOperationResponse(
            "#/components/schemas/FormSubmission",
          ),
          "404": {
            description: "The Form or submission was not found.",
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
              "Filter Landing Pages by name, slug, custom path, or public URL token. Retrieve a known Landing Page ID through the item endpoint.",
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
          "200": listOperationResponse(
            "#/components/schemas/LandingPageSummary",
          ),
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
              schema: { $ref: "#/components/schemas/LandingPageUpdateRequest" },
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
    "/v1/landing-pages/{landing_page_id}/double-opt-in-preview": {
      post: {
        method: "POST",
        path: "/v1/landing-pages/{landing_page_id}/double-opt-in-preview",
        summary: "Preview a landing page confirmation email for a Subscriber",
        description:
          "Renders the configured double opt-in email for a saved Subscriber without sending or saving anything.",
        tags: ["Landing Pages"],
        operationId: "previewLandingPageDoubleOptIn",
        security,
        parameters: [
          {
            name: "landing_page_id",
            in: "path",
            required: true,
            description: "The landing page identifier.",
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SubscriberPreviewRequest",
              },
            },
          },
        },
        responses: {
          "200": itemOperationResponse(
            "#/components/schemas/DoubleOptInEmailPreview",
          ),
          "404": {
            description: "Landing page or Subscriber not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "409": {
            description: "Double opt-in is disabled or incomplete",
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
          "Returns a bounded cursor page of retained submissions for one Landing Page, including the Subscriber who submitted it.",
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
    "/v1/landing-pages/{landing_page_id}/submissions/{submission_id}": {
      get: {
        method: "GET",
        path:
          "/v1/landing-pages/{landing_page_id}/submissions/{submission_id}",
        summary: "Get a landing page submission",
        description:
          "Returns one retained Landing Page submission by stable identifier.",
        tags: ["Landing Pages"],
        operationId: "getLandingPageSubmission",
        security,
        parameters: [
          {
            name: "landing_page_id",
            in: "path",
            required: true,
            description: "The Landing Page identifier.",
            schema: { type: "string" },
          },
          {
            name: "submission_id",
            in: "path",
            required: true,
            description: "The Landing Page submission identifier.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": itemOperationResponse(
            "#/components/schemas/LandingPageSubmission",
          ),
          "404": {
            description: "The Landing Page or submission was not found.",
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
            name: "search",
            in: "query",
            description: "Filter Segments by name or description.",
            schema: { type: "string", maxLength: 200 },
          },
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
          "200": listOperationResponse("#/components/schemas/SegmentSummary"),
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
              schema: { $ref: "#/components/schemas/SegmentUpdateRequest" },
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
      get: {
        method: "GET",
        path: "/v1/jobs/subscriber-imports",
        summary: "List subscriber import jobs",
        description:
          "Returns a bounded cursor page of recent Subscriber import job summaries without loading stored CSV data or mapping payloads.",
        tags: ["Jobs"],
        operationId: "listSubscriberImportJobs",
        security,
        parameters: [
          {
            name: "limit",
            in: "query",
            description: "Maximum number of jobs to return.",
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
          "200": listOperationResponse(
            "#/components/schemas/SubscriberImportJobSummary",
          ),
        },
      },
      post: {
        method: "POST",
        path: "/v1/jobs/subscriber-imports",
        summary: "Create a subscriber import job",
        description:
          "Queues an asynchronous import job from a ready short-lived browser upload. CSV contents never pass through the agent request.",
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
    "/v1/jobs/subscriber-import-uploads": {
      post: {
        method: "POST",
        path: "/v1/jobs/subscriber-import-uploads",
        summary: "Start a subscriber import upload",
        description:
          "Creates a short-lived browser handoff where a signed-in user can choose a CSV file. Starting the handoff does not import Subscribers.",
        tags: ["Jobs"],
        operationId: "startSubscriberImportUpload",
        security,
        responses: {
          "201": itemOperationResponse(
            "#/components/schemas/SubscriberImportUpload",
          ),
        },
      },
    },
    "/v1/jobs/subscriber-import-uploads/{upload_id}": {
      get: {
        method: "GET",
        path: "/v1/jobs/subscriber-import-uploads/{upload_id}",
        summary: "Get a subscriber import upload",
        description:
          "Returns upload readiness, bounded column metadata, and the row count without returning CSV contents.",
        tags: ["Jobs"],
        operationId: "getSubscriberImportUpload",
        security,
        parameters: [
          {
            name: "upload_id",
            in: "path",
            required: true,
            description: "The short-lived upload identifier.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": itemOperationResponse(
            "#/components/schemas/SubscriberImportUpload",
          ),
          "404": {
            description: "The upload was not found or has expired.",
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
      get: {
        method: "GET",
        path: "/v1/jobs/subscriber-exports",
        summary: "List subscriber export jobs",
        description:
          "Returns a bounded cursor page of recent Subscriber export job summaries without loading selection payloads or generating download URLs.",
        tags: ["Jobs"],
        operationId: "listSubscriberExportJobs",
        security,
        parameters: [
          {
            name: "limit",
            in: "query",
            description: "Maximum number of jobs to return.",
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
          "200": listOperationResponse(
            "#/components/schemas/SubscriberExportJobSummary",
          ),
        },
      },
      post: {
        method: "POST",
        path: "/v1/jobs/subscriber-exports",
        summary: "Create a subscriber export job",
        description:
          "Queues an asynchronous Subscriber export for the authenticated workspace. Requires `subscribers:export` because the finished file contains bulk Subscriber data.",
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
          "Returns the current state of a previously created export job. Requires `subscribers:export` because completed jobs include a Subscriber CSV download URL.",
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


export type PublicApiSdkOperation = {
  namespace:
    | "discovery"
    | "workspace"
    | "senderIdentities"
    | "emailDeliveryConnections"
    | "subscribers"
    | "tags"
    | "customFields"
    | "emailTemplates"
    | "startingPoints"
    | "forms"
    | "landingPages"
    | "sequences"
    | "automations"
    | "magicLinks"
    | "broadcasts"
    | "segments"
    | "webhookSubscriptions"
    | "jobs"
    | "analytics"
    | "diagnostics";
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
  requiresLiveAction: boolean;
  sideEffectClass: PublicApiAgentSideEffectClass;
  retryMode: PublicApiAgentRetryMode;
  idempotencyPolicy: PublicApiAgentIdempotencyPolicy;
  toolsets: PublicApiMcpToolsetKey[];
  annotations: PublicApiMcpToolAnnotations;
  riskRationale: string;
  pathParams: string[];
  queryParams: string[];
  headerParams: string[];
  hasRequestBody: boolean;
  requestBodyRequired: boolean;
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

const createMcpToolTitle = (summary: string, operationId: string) => {
  const title = summary.trim();
  return title.length > 0
    ? `${title.charAt(0).toUpperCase()}${title.slice(1)}`
    : operationId;
};

const createSdkOperation = (
  namespace: PublicApiSdkOperation["namespace"],
  methodName: string,
  method: string,
  path: string,
  requiredScopes: string[] = [],
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
    requiresLiveAction: risk.requiresLiveAction,
    sideEffectClass: risk.sideEffectClass,
    retryMode: risk.retryMode,
    idempotencyPolicy: risk.idempotencyPolicy,
    toolsets,
    annotations: createPublicApiMcpToolAnnotations(
      risk,
      createMcpToolTitle(operation.summary, operation.operationId),
    ),
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
  createSdkResource("senderIdentities", "sender_identities", {
    listSenderIdentities: "list",
    getSenderIdentity: "get",
  }),
  createSdkResource(
    "emailDeliveryConnections",
    "email_delivery_connections",
    {
      listEmailDeliveryConnections: "list",
      startEmailDeliveryConnectionSetup: "startSetup",
      getEmailDeliveryConnectionSetup: "getSetup",
      renewEmailDeliveryConnectionSetup: "renewSetup",
      getEmailDeliveryConnection: "get",
      updateEmailDeliveryConnection: "update",
      updateEmailDeliveryConnectionStatus: "updateStatus",
      verifyEmailDeliveryConnection: "verify",
      testEmailDeliveryConnection: "sendTest",
      deleteEmailDeliveryConnection: "delete",
    },
  ),
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
  createSdkResource("subscribers", "subscribers", {
    listSubscribers: "list",
    getSubscriber: "get",
    upsertSubscriber: "upsert",
    updateSubscriber: "update",
    deleteSubscriber: "delete",
    updateSubscriberStatus: "updateStatus",
    addSubscriberTag: "addTag",
    removeSubscriberTag: "removeTag",
    addSubscriberSequence: "addToSequence",
    removeSubscriberSequence: "removeFromSequence",
  }),
  createSdkResource("tags", "tags", {
    listTags: "list",
    createTag: "create",
    getTag: "get",
    updateTag: "update",
    deleteTag: "delete",
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
    previewEmailTemplate: "preview",
    updateEmailTemplate: "update",
    deleteEmailTemplate: "delete",
  }),
  createSdkResource("startingPoints", "starting_points", {
    listEmailStartingPoints: "listEmailTemplates",
    getEmailStartingPoint: "getEmailTemplate",
    listFormStartingPoints: "listForms",
    getFormStartingPoint: "getForm",
    listLandingPageStartingPoints: "listLandingPages",
    getLandingPageStartingPoint: "getLandingPage",
  }),
  createSdkResource("forms", "forms", {
    listForms: "list",
    createForm: "create",
    getForm: "get",
    listFormSubmissions: "listSubmissions",
    getFormSubmission: "getSubmission",
    previewFormDoubleOptIn: "previewDoubleOptIn",
    updateForm: "update",
    deleteForm: "delete",
  }),
  createSdkResource("landingPages", "landing_pages", {
    listLandingPages: "list",
    createLandingPage: "create",
    getLandingPage: "get",
    listLandingPageSubmissions: "listSubmissions",
    getLandingPageSubmission: "getSubmission",
    previewLandingPageDoubleOptIn: "previewDoubleOptIn",
    updateLandingPage: "update",
    deleteLandingPage: "delete",
  }),
  createSdkResource("sequences", "sequences", {
    listSequences: "list",
    createSequence: "create",
    getSequence: "get",
    preflightSequence: "preflight",
    previewSequenceJourney: "previewJourney",
    testSequence: "sendTest",
    updateSequence: "update",
    updateSequenceStatus: "updateStatus",
    deleteSequence: "delete",
  }),
  createSdkResource("automations", "automations", {
    listAutomations: "list",
    createAutomation: "create",
    getAutomation: "get",
    preflightAutomation: "preflight",
    previewAutomationJourney: "previewJourney",
    testAutomation: "sendTest",
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
    scheduleBroadcast: "schedule",
    unscheduleBroadcast: "unschedule",
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
    startSubscriberImportUpload: "startImportUpload",
    getSubscriberImportUpload: "getImportUpload",
    listSubscriberImportJobs: "listImports",
    createSubscriberImportJob: "createImport",
    getSubscriberImportJob: "getImport",
    listSubscriberExportJobs: "listExports",
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

export const publicApiExamplePayloads = {
  broadcastDraft: {
    subject: "Welcome to Mailrith",
    preview_text: "A quick hello from the team",
    body_document: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Hello {{ subscriber.name }}",
            },
          ],
        },
      ],
    },
  },
  webhookSubscription: {
    name: "CRM Subscriber Updates",
    url: "https://example.com/mailrith/events",
    event_patterns: ["subscriber.created", "subscriber.updated"],
    status: "active",
  },
} as const;

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
