export type PublicApiScopeAction =
  | "read"
  | "draft"
  | "configure"
  | "execute"
  | "test"
  | "bulk"
  | "delete"
  | "admin";

export type PublicApiScopeDefinition = {
  key: string;
  resourceKey: string;
  action: PublicApiScopeAction;
  label: string;
  description: string;
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
    "View workspace",
    "View the selected workspace name, settings, and current API context.",
  ),
  scope(
    "activity:read",
    "agent_activity",
    "read",
    "View agent activity",
    "View the bounded, redacted activity trail for agent-originated workspace changes.",
  ),
  scope(
    "analytics:read",
    "analytics",
    "read",
    "View analytics",
    "Run bounded aggregate reports from compact delivery and engagement rollups.",
  ),
  scope(
    "subscribers:read",
    "subscribers",
    "read",
    "View Subscribers",
    "View bounded pages of Subscribers and their saved profile data.",
  ),
  scope(
    "subscribers:profile",
    "subscribers",
    "configure",
    "Change Subscriber profiles",
    "Create Subscriber records and change names, email addresses, countries, subscription dates, and custom-field values. This cannot change sending eligibility.",
  ),
  scope(
    "subscriptions:read",
    "subscriptions",
    "read",
    "View Subscriber Status",
    "View email subscription status, sending eligibility, suppression details, and compact consent evidence.",
  ),
  scope(
    "subscriptions:write",
    "subscriptions",
    "execute",
    "Manage Subscriber Status",
    "Subscribe or unsubscribe Subscribers, manage sending eligibility, and record the compact consent evidence required for those changes.",
  ),
  scope(
    "subscribers:targeting",
    "subscribers",
    "configure",
    "Manage Subscriber Tags",
    "Add or remove Tags that can change segmentation and Automation eligibility for one Subscriber.",
  ),
  scope(
    "subscribers:sequence_enroll",
    "subscribers",
    "execute",
    "Manage Sequence enrollment",
    "Add or remove one Subscriber from a Sequence. Enrollment in a running Sequence can send email.",
  ),
  scope(
    "subscribers:delete",
    "subscribers",
    "delete",
    "Delete Subscribers",
    "Permanently remove individual Subscribers and their Mailrith activity history.",
  ),
  scope(
    "subscribers:bulk_import",
    "subscribers",
    "bulk",
    "Import Subscribers in bulk",
    "Start bulk imports that can create or change many Subscribers, Tags, sending eligibility, and Sequence enrollment.",
  ),
  scope(
    "subscribers:bulk_export",
    "subscribers",
    "bulk",
    "Export Subscribers in bulk",
    "Create and download exports containing bulk Subscriber data.",
  ),
  scope("tags:read", "tags", "read", "View Tags", "View the workspace Tag catalog."),
  scope(
    "tags:configure",
    "tags",
    "configure",
    "Configure Tags",
    "Create Tags used for Subscriber organization, targeting, and preferences.",
  ),
  scope(
    "tags:delete",
    "tags",
    "delete",
    "Delete Tags",
    "Permanently remove Tags that are not referenced by another Mailrith resource.",
  ),
  scope(
    "custom_fields:read",
    "custom_fields",
    "read",
    "View custom fields",
    "View the workspace custom-field schema.",
  ),
  scope(
    "custom_fields:configure",
    "custom_fields",
    "configure",
    "Configure custom fields",
    "Create and change custom-field definitions used by Subscriber data.",
  ),
  scope(
    "custom_fields:delete",
    "custom_fields",
    "delete",
    "Delete custom fields",
    "Permanently remove custom-field definitions and their saved Subscriber values.",
  ),
  scope(
    "email_templates:read",
    "email_templates",
    "read",
    "View email templates",
    "View reusable email template content and settings.",
  ),
  scope(
    "email_templates:draft",
    "email_templates",
    "draft",
    "Draft email templates",
    "Create and change reusable email content without sending email.",
  ),
  scope(
    "email_templates:delete",
    "email_templates",
    "delete",
    "Delete email templates",
    "Permanently remove reusable email template content.",
  ),
  scope("forms:read", "forms", "read", "View Forms", "View Form definitions and settings."),
  scope(
    "forms:submissions_read",
    "forms",
    "read",
    "View Form submissions",
    "View bounded pages of Form submissions and the Subscriber data they contain.",
  ),
  scope(
    "forms:configure",
    "forms",
    "configure",
    "Configure Forms",
    "Create and change publicly reachable Subscriber capture Forms.",
  ),
  scope(
    "forms:delete",
    "forms",
    "delete",
    "Delete Forms",
    "Remove publicly reachable Subscriber capture Forms.",
  ),
  scope(
    "landing_pages:read",
    "landing_pages",
    "read",
    "View Landing Pages",
    "View hosted Landing Page definitions and settings.",
  ),
  scope(
    "landing_pages:submissions_read",
    "landing_pages",
    "read",
    "View Landing Page submissions",
    "View bounded pages of Landing Page submissions and the Subscriber data they contain.",
  ),
  scope(
    "landing_pages:configure",
    "landing_pages",
    "configure",
    "Configure Landing Pages",
    "Create and change publicly reachable hosted Landing Pages.",
  ),
  scope(
    "landing_pages:delete",
    "landing_pages",
    "delete",
    "Delete Landing Pages",
    "Remove publicly reachable hosted Landing Pages.",
  ),
  scope(
    "sequences:read",
    "sequences",
    "read",
    "View Sequences",
    "View Sequence definitions, status, and aggregate delivery results.",
  ),
  scope(
    "sequences:draft",
    "sequences",
    "draft",
    "Draft Sequences",
    "Create paused Sequences and change paused Sequence content without starting delivery.",
  ),
  scope(
    "sequences:activate",
    "sequences",
    "execute",
    "Activate or pause Sequences",
    "Start or pause Sequences. Starting a Sequence can send email to enrolled Subscribers.",
  ),
  scope(
    "sequences:delete",
    "sequences",
    "delete",
    "Delete Sequences",
    "Permanently remove lifecycle Sequences.",
  ),
  scope(
    "automations:read",
    "automations",
    "read",
    "View Automations",
    "View Automation definitions, status, and aggregate results.",
  ),
  scope(
    "automations:draft",
    "automations",
    "draft",
    "Draft Automations",
    "Create inactive Automations and change inactive Automation definitions.",
  ),
  scope(
    "automations:activate",
    "automations",
    "execute",
    "Activate or pause Automations",
    "Start or pause Automations. Starting an Automation can run actions for matching Subscribers.",
  ),
  scope(
    "automations:delete",
    "automations",
    "delete",
    "Delete Automations",
    "Permanently remove Automation workflows.",
  ),
  scope(
    "magic_links:read",
    "magic_links",
    "read",
    "View Magic Links",
    "View Magic Link destinations and configured Subscriber actions.",
  ),
  scope(
    "magic_links:configure",
    "magic_links",
    "configure",
    "Configure Magic Links",
    "Create and change public Magic Links that can change Subscriber Tags or Sequence enrollment when clicked.",
  ),
  scope(
    "magic_links:delete",
    "magic_links",
    "delete",
    "Delete Magic Links",
    "Remove public Magic Links and their configured actions.",
  ),
  scope(
    "broadcasts:read",
    "broadcasts",
    "read",
    "View Broadcasts",
    "View Broadcast drafts, send status, and aggregate delivery results.",
  ),
  scope(
    "broadcasts:draft",
    "broadcasts",
    "draft",
    "Draft Broadcasts",
    "Create and change Broadcast drafts without scheduling or sending them.",
  ),
  scope(
    "broadcasts:preflight",
    "broadcasts",
    "read",
    "Check Broadcast readiness",
    "Run bounded readiness checks and view estimated recipient counts before a send.",
  ),
  scope(
    "broadcasts:test",
    "broadcasts",
    "test",
    "Send Broadcast tests",
    "Send a real test email from a Broadcast to one chosen recipient.",
  ),
  scope(
    "broadcasts:send",
    "broadcasts",
    "execute",
    "Send Broadcasts",
    "Start durable delivery of a Broadcast to real Subscribers.",
  ),
  scope(
    "broadcasts:cancel",
    "broadcasts",
    "execute",
    "Cancel Broadcast sends",
    "Stop remaining delivery work for a running Broadcast. Emails already accepted by a provider cannot be recalled.",
  ),
  scope(
    "broadcasts:delete",
    "broadcasts",
    "delete",
    "Delete Broadcasts",
    "Permanently remove eligible Broadcast drafts or failed sends.",
  ),
  scope(
    "segments:read",
    "segments",
    "read",
    "View Segments",
    "View saved Segment definitions and bounded preview counts.",
  ),
  scope(
    "segments:configure",
    "segments",
    "configure",
    "Configure Segments",
    "Create and change saved Subscriber-selection definitions.",
  ),
  scope(
    "segments:delete",
    "segments",
    "delete",
    "Delete Segments",
    "Permanently remove saved Subscriber-selection definitions.",
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
    "admin",
    "Configure Outbound Webhooks",
    "Create, change, delete, and rotate signing secrets for outbound webhook destinations.",
  ),
] as const satisfies readonly PublicApiScopeDefinition[];

export type PublicApiScopeKey =
  (typeof publicApiScopeDefinitionCatalog)[number]["key"];

// Keep displayed permissions in the same sections and resource order people
// already learn from the app sidebar. API-only resources stay beside their
// nearest visible page.
export const publicApiScopeDisplaySections = [
  {
    key: "overview",
    label: "Overview",
    resources: [
      {
        label: "Dashboard",
        resourceKeys: ["analytics"],
      },
    ],
  },
  {
    key: "subscribers",
    label: "Subscribers",
    resources: [
      {
        label: "Subscribers",
        resourceKeys: ["subscribers", "subscriptions"],
      },
      { label: "Segments", resourceKeys: ["segments"] },
      { label: "Tags", resourceKeys: ["tags"] },
      { label: "Forms", resourceKeys: ["forms"] },
      { label: "Landing Pages", resourceKeys: ["landing_pages"] },
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
      { label: "Email Templates", resourceKeys: ["email_templates"] },
      { label: "Custom Fields", resourceKeys: ["custom_fields"] },
      {
        label: "Integrations",
        resourceKeys: ["agent_activity", "webhooks"],
      },
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

export type PublicApiScopePresetKey =
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
  | "full_administration";

export type PublicApiScopePreset = {
  key: PublicApiScopePresetKey;
  label: string;
  description: string;
  scopeKeys: readonly PublicApiScopeKey[];
};

const publicApiScopeDefinitionMap = new Map(
  publicApiScopeDefinitions.map((definition) => [definition.key, definition]),
);

export const publicApiScopeDefinitionByKey = publicApiScopeDefinitionMap;

export const publicApiScopeKeys = publicApiScopeDefinitions.map(
  (definition) => definition.key,
) as PublicApiScopeKey[];

export const publicApiReadScopeKeys = publicApiScopeDefinitions
  .filter((definition) => definition.action === "read")
  .map((definition) => definition.key) as PublicApiScopeKey[];

const preset = (
  key: PublicApiScopePresetKey,
  label: string,
  description: string,
  scopeKeys: readonly PublicApiScopeKey[],
): PublicApiScopePreset => {
  const selectedScopeKeys = new Set(scopeKeys);
  return {
    key,
    label,
    description,
    scopeKeys: publicApiScopeKeys.filter((scopeKey) =>
      selectedScopeKeys.has(scopeKey),
    ),
  };
};

export const publicApiScopePresets = [
  preset(
    "reporting",
    "Reporting",
    "View workspace, Subscriber, content, workflow, and delivery information without changing anything.",
    publicApiReadScopeKeys,
  ),
  preset(
    "subscriber_sync",
    "Subscriber Sync",
    "Manage individual Subscriber profiles, status, Tags, deletion, and supporting field definitions.",
    [
      "workspace:read",
      "subscribers:read",
      "subscribers:profile",
      "subscriptions:read",
      "subscriptions:write",
      "subscribers:targeting",
      "subscribers:delete",
      "tags:read",
      "tags:configure",
      "custom_fields:read",
      "custom_fields:configure",
    ],
  ),
  preset(
    "data_transfer",
    "Subscriber Import & Export",
    "Run bounded Subscriber imports and exports and monitor their jobs.",
    [
      "workspace:read",
      "subscribers:read",
      "subscribers:bulk_import",
      "subscribers:bulk_export",
      "tags:read",
      "custom_fields:read",
    ],
  ),
  preset(
    "content_and_targeting",
    "Templates, Tags, Fields & Segments",
    "Manage reusable email content, Tags, custom fields, and Segments without sending email.",
    [
      "workspace:read",
      "subscribers:read",
      "tags:read",
      "tags:configure",
      "tags:delete",
      "custom_fields:read",
      "custom_fields:configure",
      "custom_fields:delete",
      "email_templates:read",
      "email_templates:draft",
      "email_templates:delete",
      "segments:read",
      "segments:configure",
      "segments:delete",
      "analytics:read",
    ],
  ),
  preset(
    "capture_management",
    "Forms, Landing Pages & Magic Links",
    "Manage Forms, Landing Pages, Magic Links, and their Subscriber capture data.",
    [
      "workspace:read",
      "subscribers:read",
      "tags:read",
      "custom_fields:read",
      "forms:read",
      "forms:submissions_read",
      "forms:configure",
      "forms:delete",
      "landing_pages:read",
      "landing_pages:submissions_read",
      "landing_pages:configure",
      "landing_pages:delete",
      "magic_links:read",
      "magic_links:configure",
      "magic_links:delete",
    ],
  ),
  preset(
    "broadcast_preparation",
    "Broadcast Preparation",
    "Create, change, check, and delete Broadcast drafts without sending email.",
    [
      "workspace:read",
      "subscribers:read",
      "tags:read",
      "custom_fields:read",
      "email_templates:read",
      "broadcasts:read",
      "broadcasts:draft",
      "broadcasts:preflight",
      "broadcasts:delete",
      "segments:read",
      "segments:configure",
      "analytics:read",
    ],
  ),
  preset(
    "broadcast_sending",
    "Broadcast Sending",
    "Review, test, send, and stop Broadcasts without changing Automation definitions.",
    [
      "workspace:read",
      "subscribers:read",
      "broadcasts:read",
      "broadcasts:preflight",
      "broadcasts:test",
      "broadcasts:send",
      "broadcasts:cancel",
      "segments:read",
      "analytics:read",
    ],
  ),
  preset(
    "sequence_preparation",
    "Sequence Preparation",
    "Create, change, and delete paused Sequences without activating them or enrolling Subscribers.",
    [
      "workspace:read",
      "subscribers:read",
      "tags:read",
      "email_templates:read",
      "sequences:read",
      "sequences:draft",
      "sequences:delete",
      "analytics:read",
    ],
  ),
  preset(
    "sequence_operations",
    "Sequence Operations",
    "Activate or pause Sequences and add or remove individual Subscribers.",
    [
      "workspace:read",
      "subscribers:read",
      "subscribers:sequence_enroll",
      "sequences:read",
      "sequences:activate",
      "analytics:read",
    ],
  ),
  preset(
    "automation_management",
    "Automation Management",
    "Create, change, activate, pause, and delete Automations without sending Broadcasts.",
    [
      "workspace:read",
      "subscribers:read",
      "tags:read",
      "email_templates:read",
      "automations:read",
      "automations:draft",
      "automations:activate",
      "automations:delete",
      "analytics:read",
    ],
  ),
  preset(
    "webhook_management",
    "Outbound Webhook Setup",
    "View and configure outbound webhook event delivery.",
    ["workspace:read", "webhooks:read", "webhooks:write"],
  ),
  preset(
    "full_administration",
    "Full Administration",
    "Use every current public API permission, including live actions, bulk data, deletion, and webhook administration.",
    publicApiScopeKeys,
  ),
] as const satisfies readonly PublicApiScopePreset[];

export const publicApiScopePresetDisplaySections = [
  {
    key: "overview",
    label: "Overview",
    presetKeys: ["reporting"],
  },
  {
    key: "subscribers",
    label: "Subscribers",
    presetKeys: [
      "subscriber_sync",
      "data_transfer",
      "content_and_targeting",
      "capture_management",
    ],
  },
  {
    key: "campaigns",
    label: "Campaigns",
    presetKeys: [
      "broadcast_preparation",
      "broadcast_sending",
      "sequence_preparation",
      "sequence_operations",
      "automation_management",
    ],
  },
  {
    key: "account",
    label: "Account",
    presetKeys: ["webhook_management", "full_administration"],
  },
] as const satisfies readonly {
  key: string;
  label: string;
  presetKeys: readonly PublicApiScopePresetKey[];
}[];

export const publicApiScopePresetByKey = new Map(
  publicApiScopePresets.map((definition) => [definition.key, definition]),
);

// Reporting is the safest useful starting point. Full access must always be an
// explicit choice in the credential or OAuth flow.
export const publicApiDefaultScopeKeys = [
  ...publicApiScopePresetByKey.get("reporting")!.scopeKeys,
];

// The interactive read-only starter deliberately exposes only workspace
// context and bounded Subscriber reads. Keep this compact list separate from
// the broader Reporting preset so a first OAuth connection does not gain
// unrelated analytics, content, workflow, or delivery access.
export const publicApiAgentReadQuickstartScopeKeys = [
  "workspace:read",
  "subscribers:read",
] as const satisfies readonly PublicApiScopeKey[];

export const isPublicApiScopeKey = (
  value: string,
): value is PublicApiScopeKey =>
  publicApiScopeDefinitionMap.has(value as PublicApiScopeKey);

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
