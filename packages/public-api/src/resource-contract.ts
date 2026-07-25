import { requiresPublicApiLiveActionPermission } from "./agent-risk.js";

export type PublicApiScopeAction = "read" | "write" | "import" | "export";

export type PublicApiScopeDefinition = {
  key: string;
  resourceKey: string;
  action: PublicApiScopeAction;
  label: string;
  description: string;
};

export type PublicApiResourceArchetype =
  | "singleton"
  | "primary_collection"
  | "supporting_catalog"
  | "nested_record"
  | "durable_job"
  | "ephemeral_handle"
  | "derived_view";

export type PublicApiResourceContract = {
  key: string;
  name: string;
  description: string;
  archetype: PublicApiResourceArchetype;
  collectionPaths?: readonly string[];
  itemPaths?: readonly string[];
  exactNaturalKeys: readonly string[];
  scopeKeys: readonly string[];
  scopeResourceKey?: string;
};

const scope = <
  Key extends string,
  ResourceKey extends string,
  Action extends PublicApiScopeAction,
>(
  key: Key,
  resourceKey: ResourceKey,
  action: Action,
  label: string,
  description: string,
) => ({ key, resourceKey, action, label, description }) as const;

const publicApiScopeDefinitionCatalog = [
  scope(
    "workspace:read",
    "workspace",
    "read",
    "View Workspace",
    "View the selected workspace name, settings, sender identities, and current API context.",
  ),
  scope(
    "analytics:read",
    "analytics",
    "read",
    "View Analytics",
    "Run bounded aggregate reports from compact delivery and engagement rollups.",
  ),
  scope(
    "live_actions:write",
    "live_actions",
    "write",
    "Perform Live Actions",
    "Send email, activate or change running workflows, change Subscriber delivery or targeting status, publish public capture surfaces, and configure outbound event delivery.",
  ),
  scope(
    "subscribers:read",
    "subscribers",
    "read",
    "View Subscribers",
    "View bounded pages of Subscribers, profiles, status, Tags, Sequence enrollment, and compact consent details.",
  ),
  scope(
    "subscribers:write",
    "subscribers",
    "write",
    "Manage Subscribers",
    "Create, change, subscribe, unsubscribe, organize, enroll, and delete individual Subscribers.",
  ),
  scope(
    "subscribers:import",
    "subscribers",
    "import",
    "Import Subscribers",
    "Start bounded bulk imports that can create or change Subscribers.",
  ),
  scope(
    "subscribers:export",
    "subscribers",
    "export",
    "Export Subscribers",
    "Create and download bounded exports containing Subscriber data.",
  ),
  scope("segments:read", "segments", "read", "View Segments", "View saved Segment definitions and bounded preview counts."),
  scope(
    "segments:write",
    "segments",
    "write",
    "Manage Segments",
    "Create, change, preview, and delete saved Subscriber-selection definitions.",
  ),
  scope("tags:read", "tags", "read", "View Tags", "View the workspace Tag catalog."),
  scope(
    "tags:write",
    "tags",
    "write",
    "Manage Tags",
    "Create, change, and delete Tags used to organize Subscribers and target email.",
  ),
  scope("forms:read", "forms", "read", "View Forms", "View Form definitions and settings."),
  scope(
    "forms:write",
    "forms",
    "write",
    "Manage Forms",
    "Create, change, preview, and delete publicly reachable Subscriber capture Forms.",
  ),
  scope(
    "form_submissions:read",
    "form_submissions",
    "read",
    "View Form Submissions",
    "View bounded pages of Form submissions and the Subscriber data they contain.",
  ),
  scope(
    "landing_pages:read",
    "landing_pages",
    "read",
    "View Landing Pages",
    "View hosted Landing Page definitions and settings.",
  ),
  scope(
    "landing_pages:write",
    "landing_pages",
    "write",
    "Manage Landing Pages",
    "Create, change, preview, and delete publicly reachable hosted Landing Pages.",
  ),
  scope(
    "landing_page_submissions:read",
    "landing_page_submissions",
    "read",
    "View Landing Page Submissions",
    "View bounded pages of Landing Page submissions and the Subscriber data they contain.",
  ),
  scope(
    "broadcasts:read",
    "broadcasts",
    "read",
    "View Broadcasts",
    "View Broadcast drafts, readiness, send progress, delivery errors, and aggregate results.",
  ),
  scope(
    "broadcasts:write",
    "broadcasts",
    "write",
    "Manage Broadcasts",
    "Create, change, test, schedule, send, stop, and delete Broadcasts.",
  ),
  scope(
    "sequences:read",
    "sequences",
    "read",
    "View Sequences",
    "View Sequence definitions, readiness, journeys, status, and aggregate results.",
  ),
  scope(
    "sequences:write",
    "sequences",
    "write",
    "Manage Sequences",
    "Create, change, test, start, pause, and delete Sequences.",
  ),
  scope(
    "magic_links:read",
    "magic_links",
    "read",
    "View Magic Links",
    "View Magic Link destinations and configured Subscriber actions.",
  ),
  scope(
    "magic_links:write",
    "magic_links",
    "write",
    "Manage Magic Links",
    "Create, change, and delete public Magic Links and their Subscriber actions.",
  ),
  scope(
    "automations:read",
    "automations",
    "read",
    "View Automations",
    "View Automation definitions, readiness, journeys, runs, status, and aggregate results.",
  ),
  scope(
    "automations:write",
    "automations",
    "write",
    "Manage Automations",
    "Create, change, test, start, pause, return to draft, and delete Automations.",
  ),
  scope(
    "email_delivery_connections:read",
    "email_delivery_connections",
    "read",
    "View Email Delivery Connections",
    "View connection names, providers, sender identities, readiness, and secret-free configuration.",
  ),
  scope(
    "email_delivery_connections:write",
    "email_delivery_connections",
    "write",
    "Manage Email Delivery Connections",
    "Create, change, verify, test, enable, disable, and delete connections. Saved credentials are never returned.",
  ),
  scope(
    "email_templates:read",
    "email_templates",
    "read",
    "View Email Templates",
    "View reusable email template content and settings.",
  ),
  scope(
    "email_templates:write",
    "email_templates",
    "write",
    "Manage Email Templates",
    "Create, change, preview, and delete reusable email content.",
  ),
  scope(
    "custom_fields:read",
    "custom_fields",
    "read",
    "View Custom Fields",
    "View the workspace custom-field schema.",
  ),
  scope(
    "custom_fields:write",
    "custom_fields",
    "write",
    "Manage Custom Fields",
    "Create, change, and delete custom-field definitions used by Subscriber data.",
  ),
  scope(
    "webhooks:read",
    "webhooks",
    "read",
    "View Outbound Webhooks",
    "View outbound webhook destinations, selected events, and delivery health.",
  ),
  scope(
    "webhooks:write",
    "webhooks",
    "write",
    "Manage Outbound Webhooks",
    "Create, change, delete, and rotate signing secrets for outbound webhook destinations.",
  ),
] as const satisfies readonly PublicApiScopeDefinition[];

export type PublicApiScopeKey =
  (typeof publicApiScopeDefinitionCatalog)[number]["key"];

const resourceContract = (
  contract: Omit<PublicApiResourceContract, "scopeKeys"> & {
    scopeKeys?: readonly PublicApiScopeKey[];
  },
): PublicApiResourceContract => ({
  ...contract,
  scopeKeys: contract.scopeKeys ?? [],
});

export const publicApiResourceContracts = [
  resourceContract({
    key: "analytics",
    name: "Analytics",
    description: "Bounded aggregate delivery and engagement reports.",
    archetype: "derived_view",
    collectionPaths: ["/v1/analytics/reports"],
    itemPaths: ["/v1/analytics/reports/{report_id}"],
    exactNaturalKeys: [],
    scopeKeys: ["analytics:read"],
  }),
  resourceContract({
    key: "live_actions",
    name: "Live Actions",
    description:
      "Operations that immediately affect Subscribers or external systems.",
    archetype: "derived_view",
    exactNaturalKeys: [],
    scopeKeys: ["live_actions:write"],
  }),
  resourceContract({
    key: "subscribers",
    name: "Subscribers",
    description: "Subscriber profiles, status, Tags, and Sequence enrollment.",
    archetype: "primary_collection",
    collectionPaths: ["/v1/subscribers"],
    itemPaths: ["/v1/subscribers/{subscriber_id}"],
    exactNaturalKeys: ["email"],
    scopeKeys: [
      "subscribers:read",
      "subscribers:write",
      "subscribers:import",
      "subscribers:export",
    ],
  }),
  resourceContract({
    key: "segments",
    name: "Segments",
    description: "Saved Subscriber-selection definitions.",
    archetype: "primary_collection",
    collectionPaths: ["/v1/segments"],
    itemPaths: ["/v1/segments/{segment_id}"],
    exactNaturalKeys: [],
    scopeKeys: ["segments:read", "segments:write"],
  }),
  resourceContract({
    key: "tags",
    name: "Tags",
    description: "The workspace Tag catalog.",
    archetype: "supporting_catalog",
    collectionPaths: ["/v1/tags"],
    itemPaths: ["/v1/tags/{tag_id}"],
    exactNaturalKeys: [],
    scopeKeys: ["tags:read", "tags:write"],
  }),
  resourceContract({
    key: "forms",
    name: "Forms",
    description: "Subscriber capture Forms.",
    archetype: "primary_collection",
    collectionPaths: ["/v1/forms"],
    itemPaths: ["/v1/forms/{form_id}"],
    exactNaturalKeys: [],
    scopeKeys: ["forms:read", "forms:write"],
  }),
  resourceContract({
    key: "form_submissions",
    name: "Form Submissions",
    description: "Bounded Form submission records.",
    archetype: "nested_record",
    collectionPaths: ["/v1/forms/{form_id}/submissions"],
    itemPaths: ["/v1/forms/{form_id}/submissions/{submission_id}"],
    exactNaturalKeys: [],
    scopeKeys: ["form_submissions:read"],
  }),
  resourceContract({
    key: "landing_pages",
    name: "Landing Pages",
    description: "Hosted Subscriber capture pages.",
    archetype: "primary_collection",
    collectionPaths: ["/v1/landing-pages"],
    itemPaths: ["/v1/landing-pages/{landing_page_id}"],
    exactNaturalKeys: [],
    scopeKeys: ["landing_pages:read", "landing_pages:write"],
  }),
  resourceContract({
    key: "landing_page_submissions",
    name: "Landing Page Submissions",
    description: "Bounded Landing Page submission records.",
    archetype: "nested_record",
    collectionPaths: ["/v1/landing-pages/{landing_page_id}/submissions"],
    itemPaths: [
      "/v1/landing-pages/{landing_page_id}/submissions/{submission_id}",
    ],
    exactNaturalKeys: [],
    scopeKeys: ["landing_page_submissions:read"],
  }),
  resourceContract({
    key: "broadcasts",
    name: "Broadcasts",
    description: "One-time email messages and their delivery state.",
    archetype: "primary_collection",
    collectionPaths: ["/v1/broadcasts"],
    itemPaths: ["/v1/broadcasts/{broadcast_id}"],
    exactNaturalKeys: [],
    scopeKeys: ["broadcasts:read", "broadcasts:write"],
  }),
  resourceContract({
    key: "sequences",
    name: "Sequences",
    description: "Ordered lifecycle email series.",
    archetype: "primary_collection",
    collectionPaths: ["/v1/sequences"],
    itemPaths: ["/v1/sequences/{sequence_id}"],
    exactNaturalKeys: [],
    scopeKeys: ["sequences:read", "sequences:write"],
  }),
  resourceContract({
    key: "magic_links",
    name: "Magic Links",
    description: "Links that apply configured Subscriber actions.",
    archetype: "primary_collection",
    collectionPaths: ["/v1/magic-links"],
    itemPaths: ["/v1/magic-links/{magic_link_id}"],
    exactNaturalKeys: [],
    scopeKeys: ["magic_links:read", "magic_links:write"],
  }),
  resourceContract({
    key: "automations",
    name: "Automations",
    description: "Event-driven email and Subscriber workflows.",
    archetype: "primary_collection",
    collectionPaths: ["/v1/automations"],
    itemPaths: ["/v1/automations/{automation_id}"],
    exactNaturalKeys: [],
    scopeKeys: ["automations:read", "automations:write"],
  }),
  resourceContract({
    key: "workspace",
    name: "Workspace",
    description: "The authenticated workspace context.",
    archetype: "singleton",
    itemPaths: ["/v1/workspace"],
    exactNaturalKeys: [],
    scopeKeys: ["workspace:read"],
  }),
  resourceContract({
    key: "sender_identities",
    name: "Sender Identities",
    description: "Verified sender identities in the workspace.",
    archetype: "supporting_catalog",
    collectionPaths: ["/v1/sender-identities"],
    itemPaths: ["/v1/sender-identities/{sender_identity_id}"],
    exactNaturalKeys: [],
  }),
  resourceContract({
    key: "email_delivery_connections",
    name: "Email Delivery Connections",
    description: "Secret-safe email provider connections.",
    archetype: "primary_collection",
    collectionPaths: ["/v1/email-delivery-connections"],
    itemPaths: ["/v1/email-delivery-connections/{connection_id}"],
    exactNaturalKeys: [],
    scopeKeys: [
      "email_delivery_connections:read",
      "email_delivery_connections:write",
    ],
  }),
  resourceContract({
    key: "email_delivery_connection_setup_sessions",
    name: "Email Delivery Connection Setup Sessions",
    description: "Short-lived browser handoffs for connection setup.",
    archetype: "ephemeral_handle",
    collectionPaths: ["/v1/email-delivery-connection-setup-sessions"],
    itemPaths: [
      "/v1/email-delivery-connection-setup-sessions/{setup_session_id}",
      "/v1/email-delivery-connection-setup-sessions/{setup_session_id}/renew",
    ],
    exactNaturalKeys: [],
  }),
  resourceContract({
    key: "starting_points",
    name: "Starting Points",
    description:
      "Canonical email, Form, and Landing Page starting points shared with the Mailrith UI.",
    archetype: "supporting_catalog",
    collectionPaths: [
      "/v1/starting-points/email-templates",
      "/v1/starting-points/forms",
      "/v1/starting-points/landing-pages",
    ],
    itemPaths: [
      "/v1/starting-points/email-templates/{starting_point_id}",
      "/v1/starting-points/forms/{starting_point_id}",
      "/v1/starting-points/landing-pages/{starting_point_id}",
    ],
    exactNaturalKeys: [],
  }),
  resourceContract({
    key: "email_templates",
    name: "Email Templates",
    description: "Reusable email content.",
    archetype: "supporting_catalog",
    collectionPaths: ["/v1/email-templates"],
    itemPaths: ["/v1/email-templates/{template_id}"],
    exactNaturalKeys: [],
    scopeKeys: ["email_templates:read", "email_templates:write"],
  }),
  resourceContract({
    key: "custom_fields",
    name: "Custom Fields",
    description: "The workspace Subscriber field schema.",
    archetype: "supporting_catalog",
    collectionPaths: ["/v1/custom-fields"],
    itemPaths: ["/v1/custom-fields/{custom_field_id}"],
    exactNaturalKeys: [],
    scopeKeys: ["custom_fields:read", "custom_fields:write"],
  }),
  resourceContract({
    key: "webhook_subscriptions",
    name: "Outbound Webhooks",
    description: "Signed event delivery destinations.",
    archetype: "primary_collection",
    collectionPaths: ["/v1/webhook-subscriptions"],
    itemPaths: [
      "/v1/webhook-subscriptions/{webhook_subscription_id}",
    ],
    exactNaturalKeys: [],
    scopeKeys: ["webhooks:read", "webhooks:write"],
    scopeResourceKey: "webhooks",
  }),
  resourceContract({
    key: "jobs",
    name: "Subscriber Jobs",
    description: "Durable Subscriber import and export jobs.",
    archetype: "durable_job",
    collectionPaths: [
      "/v1/jobs/subscriber-import-uploads",
      "/v1/jobs/subscriber-imports",
      "/v1/jobs/subscriber-exports",
    ],
    itemPaths: [
      "/v1/jobs/subscriber-import-uploads/{upload_id}",
      "/v1/jobs/subscriber-imports/{job_id}",
      "/v1/jobs/subscriber-exports/{job_id}",
    ],
    exactNaturalKeys: [],
  }),
  resourceContract({
    key: "diagnostics",
    name: "Diagnostics",
    description: "Bounded operational views of existing resources.",
    archetype: "derived_view",
    exactNaturalKeys: [],
  }),
] as const satisfies readonly PublicApiResourceContract[];

export const publicApiResourceContractByKey = new Map(
  publicApiResourceContracts.map((contract) => [contract.key, contract]),
);

export const publicApiScopeDisplaySections = [
  {
    key: "overview",
    label: "Overview",
    resources: [
      { label: "Dashboard", resourceKeys: ["analytics"] },
      { label: "Live Actions", resourceKeys: ["live_actions"] },
    ],
  },
  {
    key: "subscribers",
    label: "Subscribers",
    resources: [
      { label: "Subscribers", resourceKeys: ["subscribers"] },
      { label: "Segments", resourceKeys: ["segments"] },
      { label: "Tags", resourceKeys: ["tags"] },
      {
        label: "Forms",
        resourceKeys: ["forms", "form_submissions"],
      },
      {
        label: "Landing Pages",
        resourceKeys: ["landing_pages", "landing_page_submissions"],
      },
    ],
  },
  {
    key: "campaigns",
    label: "Campaigns",
    resources: [
      { label: "Broadcasts", resourceKeys: ["broadcasts"] },
      { label: "Sequences", resourceKeys: ["sequences"] },
      { label: "Magic Links", resourceKeys: ["magic_links"] },
      { label: "Automations", resourceKeys: ["automations"] },
    ],
  },
  {
    key: "account",
    label: "Account",
    resources: [
      { label: "Workspaces", resourceKeys: ["workspace"] },
      {
        label: "Email Delivery Connections",
        resourceKeys: ["email_delivery_connections"],
      },
      { label: "Email Templates", resourceKeys: ["email_templates"] },
      { label: "Custom Fields", resourceKeys: ["custom_fields"] },
      { label: "Integrations", resourceKeys: ["webhooks"] },
    ],
  },
] as const;

export const publicApiScopeResourceOrder =
  publicApiScopeDisplaySections.flatMap((section) =>
    section.resources.flatMap((resource) => resource.resourceKeys),
  );

const publicApiScopeResourceOrderByKey = new Map<string, number>(
  publicApiScopeResourceOrder.map((resourceKey, index) => [resourceKey, index]),
);

export const publicApiScopeDefinitions = [
  ...publicApiScopeDefinitionCatalog,
].sort(
  (left, right) =>
    (publicApiScopeResourceOrderByKey.get(left.resourceKey) ??
      Number.MAX_SAFE_INTEGER) -
    (publicApiScopeResourceOrderByKey.get(right.resourceKey) ??
      Number.MAX_SAFE_INTEGER),
);

export const publicApiScopeDefinitionByKey = new Map(
  publicApiScopeDefinitions.map((definition) => [definition.key, definition]),
);

export const publicApiScopeKeys = publicApiScopeDefinitions.map(
  (definition) => definition.key,
) as PublicApiScopeKey[];

export const publicApiReadScopeKeys = publicApiScopeDefinitions
  .filter((definition) => definition.action === "read")
  .map((definition) => definition.key) as PublicApiScopeKey[];

export type PublicApiWorkProfileKey =
  | "full_email_marketing_access"
  | "reporting"
  | "subscriber_management"
  | "content_and_capture"
  | "broadcasts"
  | "sequences"
  | "automations"
  | "email_delivery_setup"
  | "subscriber_import_export"
  | "outbound_webhooks";

export type PublicApiWorkProfile = {
  key: PublicApiWorkProfileKey;
  label: string;
  description: string;
  scopeKeys: readonly PublicApiScopeKey[];
};

const orderedScopes = (
  scopeKeys: readonly PublicApiScopeKey[],
): PublicApiScopeKey[] => {
  const selected = new Set(scopeKeys);
  return publicApiScopeKeys.filter((scopeKey) => selected.has(scopeKey));
};

const workProfile = (
  key: PublicApiWorkProfileKey,
  label: string,
  description: string,
  scopeKeys: readonly PublicApiScopeKey[],
): PublicApiWorkProfile => ({
  key,
  label,
  description,
  scopeKeys: orderedScopes(scopeKeys),
});

export const publicApiDefaultWorkProfileKey =
  "full_email_marketing_access" as const satisfies PublicApiWorkProfileKey;

export const publicApiWorkProfiles = [
  workProfile(
    "full_email_marketing_access",
    "Full Email Marketing Access",
    "Create, view, change, send, import, export, and manage every public email-marketing resource in the selected workspace. This does not grant billing, team, account-security, credential-reading, or internal administration access.",
    publicApiScopeKeys,
  ),
  workProfile(
    "reporting",
    "Reporting",
    "View workspace, Subscriber, content, workflow, and delivery information without changing anything.",
    publicApiReadScopeKeys.filter((scopeKey) => scopeKey !== "webhooks:read"),
  ),
  workProfile(
    "subscriber_management",
    "Subscriber Management",
    "Manage individual Subscribers, Tags, custom fields, Segments, status, and Sequence enrollment.",
    [
      "workspace:read",
      "live_actions:write",
      "subscribers:read",
      "subscribers:write",
      "segments:read",
      "segments:write",
      "tags:read",
      "tags:write",
      "custom_fields:read",
      "custom_fields:write",
      "sequences:read",
    ],
  ),
  workProfile(
    "content_and_capture",
    "Content And Capture",
    "Manage Templates, Forms, Landing Pages, Magic Links, Tags, fields, Segments, and captured submissions.",
    [
      "workspace:read",
      "live_actions:write",
      "subscribers:read",
      "segments:read",
      "segments:write",
      "tags:read",
      "tags:write",
      "forms:read",
      "forms:write",
      "form_submissions:read",
      "landing_pages:read",
      "landing_pages:write",
      "landing_page_submissions:read",
      "magic_links:read",
      "magic_links:write",
      "email_templates:read",
      "email_templates:write",
      "custom_fields:read",
      "custom_fields:write",
    ],
  ),
  workProfile(
    "broadcasts",
    "Broadcasts",
    "Create, review, test, schedule, send, stop, delete, and report on Broadcasts.",
    [
      "workspace:read",
      "live_actions:write",
      "analytics:read",
      "subscribers:read",
      "segments:read",
      "segments:write",
      "tags:read",
      "broadcasts:read",
      "broadcasts:write",
      "email_delivery_connections:read",
      "email_templates:read",
      "custom_fields:read",
    ],
  ),
  workProfile(
    "sequences",
    "Sequences",
    "Create, review, test, start, pause, delete, and report on Sequences, including Subscriber enrollment.",
    [
      "workspace:read",
      "live_actions:write",
      "analytics:read",
      "subscribers:read",
      "subscribers:write",
      "tags:read",
      "sequences:read",
      "sequences:write",
      "email_delivery_connections:read",
      "email_templates:read",
      "custom_fields:read",
    ],
  ),
  workProfile(
    "automations",
    "Automations",
    "Create, review, test, start, pause, return to draft, delete, and report on Automations.",
    [
      "workspace:read",
      "live_actions:write",
      "analytics:read",
      "subscribers:read",
      "tags:read",
      "automations:read",
      "automations:write",
      "email_delivery_connections:read",
      "email_templates:read",
      "custom_fields:read",
    ],
  ),
  workProfile(
    "email_delivery_setup",
    "Email Delivery Setup",
    "View and manage email delivery connections without exposing saved provider credentials.",
    [
      "workspace:read",
      "live_actions:write",
      "email_delivery_connections:read",
      "email_delivery_connections:write",
    ],
  ),
  workProfile(
    "subscriber_import_export",
    "Subscriber Import And Export",
    "Import, export, and monitor bounded Subscriber transfer jobs.",
    [
      "workspace:read",
      "live_actions:write",
      "subscribers:read",
      "subscribers:import",
      "subscribers:export",
      "tags:read",
      "custom_fields:read",
    ],
  ),
  workProfile(
    "outbound_webhooks",
    "Outbound Webhooks",
    "View and manage signed outbound webhook destinations.",
    [
      "workspace:read",
      "live_actions:write",
      "webhooks:read",
      "webhooks:write",
    ],
  ),
] as const satisfies readonly PublicApiWorkProfile[];

export const publicApiWorkProfileDisplaySections = [
  {
    key: "recommended",
    label: "Recommended",
    profileKeys: ["full_email_marketing_access", "reporting"],
  },
  {
    key: "focused",
    label: "Focused Work",
    profileKeys: [
      "subscriber_management",
      "content_and_capture",
      "broadcasts",
      "sequences",
      "automations",
      "subscriber_import_export",
    ],
  },
  {
    key: "connections",
    label: "Connections",
    profileKeys: ["email_delivery_setup", "outbound_webhooks"],
  },
] as const satisfies readonly {
  key: string;
  label: string;
  profileKeys: readonly PublicApiWorkProfileKey[];
}[];

export const publicApiWorkProfileByKey = new Map(
  publicApiWorkProfiles.map((definition) => [definition.key, definition]),
);

export const publicApiDefaultScopeKeys = [
  ...publicApiWorkProfileByKey.get(publicApiDefaultWorkProfileKey)!.scopeKeys,
];

export const publicApiAgentReadQuickstartScopeKeys = [
  "workspace:read",
  "subscribers:read",
] as const satisfies readonly PublicApiScopeKey[];

export const isPublicApiScopeKey = (
  value: string,
): value is PublicApiScopeKey =>
  publicApiScopeDefinitionByKey.has(value as PublicApiScopeKey);

export const normalizePublicApiScopeKeys = (
  scopeKeys: Iterable<string>,
): PublicApiScopeKey[] => {
  const selected = new Set<PublicApiScopeKey>();
  for (const scopeKey of scopeKeys) {
    if (isPublicApiScopeKey(scopeKey)) {
      selected.add(scopeKey);
    }
  }
  return publicApiScopeKeys.filter((scopeKey) => selected.has(scopeKey));
};

export const validatePublicApiScopeKeys = (
  scopeKeys: Iterable<string>,
):
  | { ok: true; value: PublicApiScopeKey[] }
  | { ok: false; unsupportedScopeKeys: string[] } => {
  const requestedScopeKeys = Array.from(scopeKeys);
  const unsupportedScopeKeys = Array.from(
    new Set(
      requestedScopeKeys.filter((scopeKey) => !isPublicApiScopeKey(scopeKey)),
    ),
  );
  if (unsupportedScopeKeys.length > 0) {
    return { ok: false, unsupportedScopeKeys };
  }
  return {
    ok: true,
    value: normalizePublicApiScopeKeys(requestedScopeKeys),
  };
};

const explicitOperationScopes = {
  listSenderIdentities: ["workspace:read"],
  getSenderIdentity: ["workspace:read"],
  startEmailDeliveryConnectionSetup: ["email_delivery_connections:write"],
  getEmailDeliveryConnectionSetup: ["email_delivery_connections:write"],
  renewEmailDeliveryConnectionSetup: ["email_delivery_connections:write"],
  listEmailStartingPoints: ["email_templates:read"],
  getEmailStartingPoint: ["email_templates:read"],
  listFormStartingPoints: ["forms:read"],
  getFormStartingPoint: ["forms:read"],
  listLandingPageStartingPoints: ["landing_pages:read"],
  getLandingPageStartingPoint: ["landing_pages:read"],
  createAnalyticsReport: ["analytics:read"],
  listAutomationRunDiagnostics: ["automations:read"],
  getAutomationRunDiagnostics: ["automations:read"],
  getSequenceDiagnostics: ["sequences:read"],
  getBroadcastDiagnostics: ["broadcasts:read"],
  getSubscriberActivityDiagnostics: ["subscribers:read"],
  listFormSubmissions: ["form_submissions:read"],
  getFormSubmission: ["form_submissions:read"],
  listLandingPageSubmissions: ["landing_page_submissions:read"],
  getLandingPageSubmission: ["landing_page_submissions:read"],
  previewEmailTemplate: ["email_templates:read", "subscribers:read"],
  previewFormDoubleOptIn: ["forms:read", "subscribers:read"],
  previewLandingPageDoubleOptIn: ["landing_pages:read", "subscribers:read"],
  preflightSequence: ["sequences:read"],
  previewSequenceJourney: ["sequences:read", "subscribers:read"],
  testSequence: ["sequences:write", "subscribers:read"],
  preflightAutomation: ["automations:read"],
  previewAutomationJourney: ["automations:read", "subscribers:read"],
  testAutomation: ["automations:write", "subscribers:read"],
  getBroadcastSendProgress: ["broadcasts:read"],
  listBroadcastDeliveryErrors: ["broadcasts:read"],
  preflightBroadcast: ["broadcasts:read"],
  testBroadcast: ["broadcasts:write", "subscribers:read"],
  previewSegment: ["segments:read"],
  startSubscriberImportUpload: ["subscribers:import"],
  getSubscriberImportUpload: ["subscribers:import"],
  createSubscriberImportJob: ["subscribers:import"],
  listSubscriberImportJobs: ["subscribers:import"],
  getSubscriberImportJob: ["subscribers:import"],
  createSubscriberExportJob: ["subscribers:export"],
  listSubscriberExportJobs: ["subscribers:export"],
  getSubscriberExportJob: ["subscribers:export"],
} as const satisfies Record<string, readonly PublicApiScopeKey[]>;

export const resolvePublicApiOperationRequiredScopes = (params: {
  resourceKey: string;
  operationId: string;
  method: string;
}): PublicApiScopeKey[] => {
  const withLiveActionScope = (
    scopeKeys: readonly PublicApiScopeKey[],
  ): PublicApiScopeKey[] =>
    requiresPublicApiLiveActionPermission(params.operationId)
      ? normalizePublicApiScopeKeys([
          ...scopeKeys,
          "live_actions:write",
        ])
      : normalizePublicApiScopeKeys(scopeKeys);
  const explicit =
    explicitOperationScopes[
      params.operationId as keyof typeof explicitOperationScopes
    ];
  if (explicit) {
    return withLiveActionScope(explicit);
  }

  const resource = publicApiResourceContractByKey.get(params.resourceKey);
  if (!resource) {
    throw new Error(
      `Public API resource contract ${params.resourceKey} is not defined.`,
    );
  }
  const action: PublicApiScopeAction =
    params.method.toUpperCase() === "GET" ? "read" : "write";
  const matchingScope = publicApiScopeDefinitions.find(
    (definition) =>
      definition.resourceKey === (resource.scopeResourceKey ?? resource.key) &&
      definition.action === action,
  );
  if (!matchingScope) {
    throw new Error(
      `Public API operation ${params.operationId} has no ${action} permission in resource contract ${params.resourceKey}.`,
    );
  }
  return withLiveActionScope([matchingScope.key]);
};
