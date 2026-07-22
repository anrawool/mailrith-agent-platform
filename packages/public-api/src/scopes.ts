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
  highImpact: boolean;
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
  highImpact = false,
) => ({ key, resourceKey, action, label, description, highImpact }) as const;

export const publicApiScopeDefinitions = [
  scope(
    "workspace:read",
    "workspace",
    "read",
    "View workspace",
    "View the selected workspace name, settings, and current API context.",
  ),
  scope(
    "approvals:read",
    "agent_actions",
    "read",
    "View agent action plans",
    "View bounded previews, approval state, expiration, and outcomes for this credential's agent actions.",
  ),
  scope(
    "approvals:write",
    "agent_actions",
    "admin",
    "Use approved agent actions",
    "Claim a short-lived, single-use token after a workspace owner approves an action. This permission cannot approve its own action.",
    true,
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
    "diagnostics:read",
    "diagnostics",
    "read",
    "View diagnostics",
    "Inspect bounded, privacy-conscious Broadcast, Sequence, Automation, and Subscriber diagnostics.",
  ),
  scope(
    "consent:read",
    "consent",
    "read",
    "View consent evidence",
    "View compact consent and privacy-event evidence without raw technical identifiers.",
  ),
  scope(
    "consent:write",
    "consent",
    "execute",
    "Record consent and privacy events",
    "Record consent withdrawal, restriction, objection, erasure, and privacy completion events that can change sending eligibility.",
    true,
  ),
  scope(
    "recommendations:read",
    "recommendations",
    "read",
    "View recommendations",
    "View bounded recommendations, evidence, confidence, expected effects, and linked action plans.",
  ),
  scope(
    "recommendations:draft",
    "recommendations",
    "draft",
    "Draft recommendations",
    "Create non-executing recommendations that must become a policy-checked action plan before execution.",
  ),
  scope(
    "experiments:read",
    "experiments",
    "read",
    "View experiments",
    "View reference-only experiment definitions, safeguards, aggregate evidence, and winner decisions.",
  ),
  scope(
    "experiments:draft",
    "experiments",
    "draft",
    "Draft experiments",
    "Define recommendation-only experiments and record aggregate winner evidence without automatically changing campaigns.",
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
    "subscribers:eligibility",
    "subscribers",
    "execute",
    "Change Subscriber sending eligibility",
    "Create send-eligible Subscribers or change whether an existing Subscriber can receive email.",
    true,
  ),
  scope(
    "subscribers:targeting",
    "subscribers",
    "configure",
    "Change Subscriber targeting",
    "Add or remove Tags that can change segmentation and Automation eligibility for one Subscriber.",
  ),
  scope(
    "subscribers:sequence_enroll",
    "subscribers",
    "execute",
    "Manage Sequence enrollment",
    "Add or remove one Subscriber from a Sequence. Enrollment in a running Sequence can send email.",
    true,
  ),
  scope(
    "subscribers:bulk_import",
    "subscribers",
    "bulk",
    "Import Subscribers in bulk",
    "Start bulk imports that can create or change many Subscribers, Tags, sending eligibility, and Sequence enrollment.",
    true,
  ),
  scope(
    "subscribers:bulk_export",
    "subscribers",
    "bulk",
    "Export Subscribers in bulk",
    "Create and download exports containing bulk Subscriber data.",
    true,
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
    true,
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
    true,
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
    true,
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
    true,
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
    true,
  ),
  scope(
    "sequences:delete",
    "sequences",
    "delete",
    "Delete Sequences",
    "Permanently remove lifecycle Sequences.",
    true,
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
    true,
  ),
  scope(
    "automations:delete",
    "automations",
    "delete",
    "Delete Automations",
    "Permanently remove Automation workflows.",
    true,
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
    true,
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
    true,
  ),
  scope(
    "broadcasts:send",
    "broadcasts",
    "execute",
    "Send Broadcasts",
    "Start durable delivery of a Broadcast to real Subscribers.",
    true,
  ),
  scope(
    "broadcasts:cancel",
    "broadcasts",
    "execute",
    "Cancel Broadcast sends",
    "Stop remaining delivery work for a running Broadcast. Emails already accepted by a provider cannot be recalled.",
    true,
  ),
  scope(
    "broadcasts:delete",
    "broadcasts",
    "delete",
    "Delete Broadcasts",
    "Permanently remove eligible Broadcast drafts or failed sends.",
    true,
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
    true,
  ),
  scope(
    "jobs:read",
    "jobs",
    "read",
    "View background jobs",
    "View bounded status summaries for permitted import and export jobs.",
  ),
  scope(
    "webhook_subscriptions:read",
    "webhook_subscriptions",
    "read",
    "View webhook subscriptions",
    "View webhook destinations, selected events, and delivery health.",
  ),
  scope(
    "webhook_subscriptions:configure",
    "webhook_subscriptions",
    "admin",
    "Configure webhook subscriptions",
    "Create and change outbound webhook destinations and the workspace data sent to them.",
    true,
  ),
  scope(
    "webhook_subscriptions:secret_rotate",
    "webhook_subscriptions",
    "admin",
    "Rotate webhook secrets",
    "Replace a webhook signing secret and reveal the new secret once.",
    true,
  ),
  scope(
    "webhook_subscriptions:delete",
    "webhook_subscriptions",
    "delete",
    "Delete webhook subscriptions",
    "Remove outbound webhook destinations and stop future deliveries to them.",
    true,
  ),
] as const satisfies readonly PublicApiScopeDefinition[];

export type PublicApiScopeKey =
  (typeof publicApiScopeDefinitions)[number]["key"];

export type PublicApiScopePresetKey =
  | "reporting"
  | "subscriber_sync"
  | "campaign_drafting"
  | "campaign_sending"
  | "automation_management"
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
): PublicApiScopePreset => ({ key, label, description, scopeKeys });

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
    "Sync individual Subscriber profiles, sending eligibility, targeting, and supporting field definitions.",
    [
      "workspace:read",
      "subscribers:read",
      "subscribers:profile",
      "subscribers:eligibility",
      "consent:read",
      "consent:write",
      "subscribers:targeting",
      "tags:read",
      "tags:configure",
      "custom_fields:read",
      "custom_fields:configure",
      "jobs:read",
    ],
  ),
  preset(
    "campaign_drafting",
    "Campaign Drafting",
    "Create campaign content, Segments, and Broadcast drafts without sending email.",
    [
      "workspace:read",
      "subscribers:read",
      "tags:read",
      "custom_fields:read",
      "email_templates:read",
      "email_templates:draft",
      "broadcasts:read",
      "broadcasts:draft",
      "broadcasts:preflight",
      "segments:read",
      "segments:configure",
      "analytics:read",
      "recommendations:read",
      "recommendations:draft",
      "experiments:read",
      "experiments:draft",
    ],
  ),
  preset(
    "campaign_sending",
    "Campaign Sending",
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
      "approvals:read",
      "approvals:write",
      "analytics:read",
      "diagnostics:read",
      "recommendations:read",
      "recommendations:draft",
      "experiments:read",
      "experiments:draft",
    ],
  ),
  preset(
    "automation_management",
    "Automation Management",
    "Draft, activate, and pause Sequences and Automations without deleting them or sending Broadcasts.",
    [
      "workspace:read",
      "subscribers:read",
      "tags:read",
      "email_templates:read",
      "sequences:read",
      "sequences:draft",
      "sequences:activate",
      "automations:read",
      "automations:draft",
      "automations:activate",
      "approvals:read",
      "approvals:write",
      "analytics:read",
      "diagnostics:read",
      "recommendations:read",
      "recommendations:draft",
      "experiments:read",
      "experiments:draft",
    ],
  ),
  preset(
    "full_administration",
    "Full Administration",
    "Use every current public API permission, including live actions, bulk data, deletion, and webhook administration.",
    publicApiScopeKeys,
  ),
] as const satisfies readonly PublicApiScopePreset[];

export const publicApiScopePresetByKey = new Map(
  publicApiScopePresets.map((definition) => [definition.key, definition]),
);

// Reporting is the safest useful starting point. Full access must always be an
// explicit choice in the credential or OAuth flow.
export const publicApiDefaultScopeKeys = [
  ...publicApiScopePresetByKey.get("reporting")!.scopeKeys,
];

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

export const hasHighImpactPublicApiScope = (scopeKeys: Iterable<string>) => {
  for (const scopeKey of scopeKeys) {
    if (publicApiScopeDefinitionMap.get(scopeKey as PublicApiScopeKey)?.highImpact) {
      return true;
    }
  }
  return false;
};
