export const publicApiAgentRiskClasses = [
  "read",
  "draft",
  "test",
  "execute",
  "bulk",
  "delete",
  "admin",
] as const;

export type PublicApiAgentRiskClass =
  (typeof publicApiAgentRiskClasses)[number];

export const publicApiAgentRetryModes = [
  "safe",
  "resource-state",
  "idempotency-key",
] as const;

export type PublicApiAgentRetryMode =
  (typeof publicApiAgentRetryModes)[number];

export const publicApiAgentIdempotencyPolicies = [
  "safe-read",
  "resource-state",
  "idempotency-key",
] as const;

export type PublicApiAgentIdempotencyPolicy =
  (typeof publicApiAgentIdempotencyPolicies)[number];

export const publicApiAgentSideEffectClasses = [
  "none",
  "workspace-change",
  "subscriber-change",
  "external-email",
  "external-webhook",
  "public-resource",
  "bulk-data",
  "secret-change",
  "deletion",
] as const;

export type PublicApiAgentSideEffectClass =
  (typeof publicApiAgentSideEffectClasses)[number];

export const publicApiAgentApprovalPolicies = [
  "none",
  "policy",
  "required",
] as const;

export type PublicApiAgentApprovalPolicy =
  (typeof publicApiAgentApprovalPolicies)[number];

export const publicApiAgentDataScopes = [
  "public",
  "workspace",
  "subscriber",
  "bulk-subscribers",
] as const;

export type PublicApiAgentDataScope =
  (typeof publicApiAgentDataScopes)[number];

export type PublicApiAgentOperationRisk = {
  operationId: string;
  resourceKey: string;
  risk: PublicApiAgentRiskClass;
  externalSideEffect: boolean;
  sideEffectClass: PublicApiAgentSideEffectClass;
  retryMode: PublicApiAgentRetryMode;
  idempotencyPolicy: PublicApiAgentIdempotencyPolicy;
  approvalPolicy: PublicApiAgentApprovalPolicy;
  minimumPermission: string;
  dataScope: PublicApiAgentDataScope;
  rationale: string;
};

const read = (
  operationId: string,
  resourceKey: string,
  minimumPermission: string,
  dataScope: PublicApiAgentDataScope,
  rationale: string,
): PublicApiAgentOperationRisk => ({
  operationId,
  resourceKey,
  risk: "read",
  externalSideEffect: false,
  sideEffectClass: "none",
  retryMode: "safe",
  idempotencyPolicy: "safe-read",
  approvalPolicy: "none",
  minimumPermission,
  dataScope,
  rationale,
});

const change = (
  operationId: string,
  resourceKey: string,
  risk: Exclude<PublicApiAgentRiskClass, "read">,
  minimumPermission: string,
  options: {
    externalSideEffect?: boolean;
    sideEffectClass?: Exclude<PublicApiAgentSideEffectClass, "none">;
    retryMode?: Exclude<PublicApiAgentRetryMode, "safe">;
    approvalPolicy?: Exclude<PublicApiAgentApprovalPolicy, "none"> | "none";
    dataScope?: Exclude<PublicApiAgentDataScope, "public">;
    rationale: string;
  },
): PublicApiAgentOperationRisk => {
  const retryMode = options.retryMode ?? "idempotency-key";
  const externalSideEffect = options.externalSideEffect ?? false;
  const sideEffectClass =
    options.sideEffectClass ??
    (risk === "delete"
      ? "deletion"
      : risk === "bulk"
        ? "bulk-data"
        : externalSideEffect && resourceKey === "broadcasts"
          ? "external-email"
          : externalSideEffect && resourceKey === "webhook_subscriptions"
            ? "external-webhook"
            : externalSideEffect && resourceKey === "magic_links"
              ? "public-resource"
              : resourceKey === "subscribers"
                ? "subscriber-change"
                : "workspace-change");

  return {
    operationId,
    resourceKey,
    risk,
    externalSideEffect,
    sideEffectClass,
    retryMode,
    idempotencyPolicy:
      retryMode === "resource-state" ? "resource-state" : "idempotency-key",
    approvalPolicy: options.approvalPolicy ?? "policy",
    minimumPermission,
    dataScope: options.dataScope ?? "workspace",
    rationale: options.rationale,
  };
};

export const publicApiAgentOperationRiskCatalog = [
  read(
    "getPublicApiMeta",
    "discovery",
    "public",
    "public",
    "Returns public version and discovery metadata.",
  ),
  read(
    "getPublicApiCapabilities",
    "discovery",
    "workspace:read",
    "workspace",
    "Returns the authenticated credential and workspace capability boundary.",
  ),
  read(
    "getPublicApiOpenApiDocument",
    "discovery",
    "public",
    "public",
    "Returns the public API contract without reading workspace data.",
  ),
  read(
    "getWorkspace",
    "workspace",
    "workspace:read",
    "workspace",
    "Reads one authenticated workspace profile.",
  ),
  read(
    "getAgentAction",
    "agent_actions",
    "approvals:read",
    "workspace",
    "Reads one compact action plan bound to the current credential or OAuth authorization.",
  ),
  read(
    "listAgentActivity",
    "agent_activity",
    "activity:read",
    "workspace",
    "Reads a bounded, redacted page of agent-originated workspace mutations.",
  ),
  read(
    "getAgentActivity",
    "agent_activity",
    "activity:read",
    "workspace",
    "Reads one redacted agent mutation trail by its stable action identifier.",
  ),
  read(
    "createAnalyticsReport",
    "analytics",
    "analytics:read",
    "workspace",
    "Creates or reuses one bounded, expiring aggregate report from compact rollups.",
  ),
  read(
    "getAnalyticsReport",
    "analytics",
    "analytics:read",
    "workspace",
    "Reads one bounded, expiring aggregate report.",
  ),
  read(
    "listAutomationRunDiagnostics",
    "diagnostics",
    "diagnostics:read",
    "workspace",
    "Reads a bounded page of redacted Automation run diagnostics.",
  ),
  read(
    "getAutomationRunDiagnostics",
    "diagnostics",
    "diagnostics:read",
    "workspace",
    "Reads one redacted Automation run and its bounded step diagnostics.",
  ),
  read(
    "getSequenceDiagnostics",
    "diagnostics",
    "diagnostics:read",
    "workspace",
    "Reads bounded Sequence failure and retry diagnostics.",
  ),
  read(
    "getBroadcastDiagnostics",
    "diagnostics",
    "diagnostics:read",
    "workspace",
    "Reads bounded Broadcast selection, provider readiness, and delivery reasons.",
  ),
  read(
    "getSubscriberActivityDiagnostics",
    "diagnostics",
    "diagnostics:read",
    "subscriber",
    "Reads one privacy-conscious Subscriber activity and compliance summary without an email address.",
  ),
  change(
    "recordSubscriberComplianceEvent",
    "consent",
    "execute",
    "consent:write",
    {
      retryMode: "resource-state",
      approvalPolicy: "required",
      dataScope: "subscriber",
      rationale:
        "Records a legal or privacy state event that can require suppression or deletion handling.",
    },
  ),
  read(
    "listRecommendations",
    "recommendations",
    "recommendations:read",
    "workspace",
    "Reads the current credential's bounded, expiring recommendations.",
  ),
  read(
    "getRecommendation",
    "recommendations",
    "recommendations:read",
    "workspace",
    "Reads one bounded recommendation created by the current credential.",
  ),
  change(
    "createRecommendation",
    "recommendations",
    "draft",
    "recommendations:draft",
    {
      sideEffectClass: "workspace-change",
      rationale:
        "Stores non-executing advice with bounded evidence and no automatic action.",
    },
  ),
  read(
    "planRecommendation",
    "recommendations",
    "recommendations:draft",
    "workspace",
    "Creates the normal policy-checked preview for a recommendation; it cannot approve or execute it.",
  ),
  read(
    "listExperiments",
    "experiments",
    "experiments:read",
    "workspace",
    "Reads bounded reference-only experiments.",
  ),
  read(
    "getExperiment",
    "experiments",
    "experiments:read",
    "workspace",
    "Reads one reference-only experiment and aggregate decision evidence.",
  ),
  change(
    "createExperiment",
    "experiments",
    "draft",
    "experiments:draft",
    {
      sideEffectClass: "workspace-change",
      rationale:
        "Stores a recommendation-only experiment definition without per-Subscriber assignments or automatic execution.",
    },
  ),
  change(
    "recordExperimentDecision",
    "experiments",
    "draft",
    "experiments:draft",
    {
      retryMode: "resource-state",
      sideEffectClass: "workspace-change",
      rationale:
        "Records an aggregate winner decision but never changes a campaign automatically.",
    },
  ),
  change(
    "issueAgentApprovalToken",
    "agent_actions",
    "admin",
    "approvals:write",
    {
      retryMode: "resource-state",
      approvalPolicy: "none",
      sideEffectClass: "secret-change",
      rationale:
        "Issues one short-lived token only after the workspace owner or trusted policy approved the bound action.",
    },
  ),
  read(
    "listSubscribers",
    "subscribers",
    "subscribers:read",
    "subscriber",
    "Reads a bounded, cursor-paginated page of Subscribers.",
  ),
  change("upsertSubscriber", "subscribers", "execute", "subscribers:profile", {
    dataScope: "subscriber",
    rationale:
      "Creates or changes one Subscriber and can change sending eligibility.",
  }),
  change("updateSubscriber", "subscribers", "draft", "subscribers:profile", {
    retryMode: "resource-state",
    dataScope: "subscriber",
    rationale:
      "Changes one Subscriber profile or custom-field values without changing sending eligibility.",
  }),
  change(
    "updateSubscriberStatus",
    "subscribers",
    "execute",
    "subscribers:eligibility",
    {
      retryMode: "resource-state",
      approvalPolicy: "required",
      dataScope: "subscriber",
      rationale: "Changes whether one Subscriber can receive email.",
    },
  ),
  change(
    "addSubscriberTag",
    "subscribers",
    "execute",
    "subscribers:targeting",
    {
      retryMode: "resource-state",
      dataScope: "subscriber",
      rationale:
        "Changes one Subscriber's targeting and Automation eligibility.",
    },
  ),
  change(
    "removeSubscriberTag",
    "subscribers",
    "execute",
    "subscribers:targeting",
    {
      retryMode: "resource-state",
      dataScope: "subscriber",
      rationale:
        "Changes one Subscriber's targeting and automation eligibility.",
    },
  ),
  change(
    "addSubscriberSequence",
    "subscribers",
    "execute",
    "subscribers:sequence_enroll",
    {
      externalSideEffect: true,
      sideEffectClass: "external-email",
      retryMode: "resource-state",
      approvalPolicy: "required",
      dataScope: "subscriber",
      rationale:
        "Enrollment can cause a running Sequence to send email to the Subscriber.",
    },
  ),
  change(
    "removeSubscriberSequence",
    "subscribers",
    "execute",
    "subscribers:sequence_enroll",
    {
      retryMode: "resource-state",
      dataScope: "subscriber",
      rationale: "Removes one Subscriber from a lifecycle workflow.",
    },
  ),
  read("listTags", "tags", "tags:read", "workspace", "Reads the bounded Tag catalog."),
  change("createTag", "tags", "draft", "tags:configure", {
    rationale: "Creates targeting metadata without contacting Subscribers.",
  }),
  read(
    "listCustomFields",
    "custom_fields",
    "custom_fields:read",
    "workspace",
    "Reads the bounded custom-field schema.",
  ),
  change(
    "createCustomField",
    "custom_fields",
    "draft",
    "custom_fields:configure",
    { rationale: "Creates a custom-field definition." },
  ),
  read(
    "getCustomField",
    "custom_fields",
    "custom_fields:read",
    "workspace",
    "Reads one custom-field definition.",
  ),
  change(
    "updateCustomField",
    "custom_fields",
    "draft",
    "custom_fields:configure",
    {
      retryMode: "resource-state",
      rationale: "Changes a custom-field definition used by Subscriber data.",
    },
  ),
  change(
    "deleteCustomField",
    "custom_fields",
    "delete",
    "custom_fields:delete",
    {
      retryMode: "resource-state",
      approvalPolicy: "required",
      rationale: "Permanently removes a field definition and associated values.",
    },
  ),
  read(
    "listEmailTemplates",
    "email_templates",
    "email_templates:read",
    "workspace",
    "Reads a bounded page of reusable email templates.",
  ),
  change(
    "createEmailTemplate",
    "email_templates",
    "draft",
    "email_templates:draft",
    { rationale: "Creates reusable draft content without sending email." },
  ),
  read(
    "getEmailTemplate",
    "email_templates",
    "email_templates:read",
    "workspace",
    "Reads one reusable email template.",
  ),
  change(
    "updateEmailTemplate",
    "email_templates",
    "draft",
    "email_templates:draft",
    {
      retryMode: "resource-state",
      rationale: "Changes reusable draft content without sending email.",
    },
  ),
  change(
    "deleteEmailTemplate",
    "email_templates",
    "delete",
    "email_templates:delete",
    {
      retryMode: "resource-state",
      approvalPolicy: "required",
      rationale: "Permanently removes reusable email content.",
    },
  ),
  read("listForms", "forms", "forms:read", "workspace", "Reads a bounded page of Forms."),
  change("createForm", "forms", "draft", "forms:configure", {
    externalSideEffect: true,
    rationale: "Creates a publicly reachable Subscriber capture surface.",
  }),
  read("getForm", "forms", "forms:read", "workspace", "Reads one Form definition."),
  read(
    "listFormSubmissions",
    "forms",
    "forms:submissions_read",
    "subscriber",
    "Reads a bounded page of Form submissions and Subscriber data.",
  ),
  change("updateForm", "forms", "draft", "forms:configure", {
    externalSideEffect: true,
    retryMode: "resource-state",
    rationale: "Changes a publicly reachable Subscriber capture surface.",
  }),
  change("deleteForm", "forms", "delete", "forms:delete", {
    externalSideEffect: true,
    retryMode: "resource-state",
    approvalPolicy: "required",
    rationale: "Removes a public Subscriber capture surface.",
  }),
  read(
    "listLandingPages",
    "landing_pages",
    "landing_pages:read",
    "workspace",
    "Reads a bounded page of Landing Pages.",
  ),
  change(
    "createLandingPage",
    "landing_pages",
    "draft",
    "landing_pages:configure",
    {
      externalSideEffect: true,
      rationale: "Creates a publicly reachable hosted page.",
    },
  ),
  read(
    "getLandingPage",
    "landing_pages",
    "landing_pages:read",
    "workspace",
    "Reads one Landing Page definition.",
  ),
  read(
    "listLandingPageSubmissions",
    "landing_pages",
    "landing_pages:submissions_read",
    "subscriber",
    "Reads a bounded page of Landing Page submissions and Subscriber data.",
  ),
  change(
    "updateLandingPage",
    "landing_pages",
    "draft",
    "landing_pages:configure",
    {
      externalSideEffect: true,
      retryMode: "resource-state",
      rationale: "Changes a publicly reachable hosted page.",
    },
  ),
  change(
    "deleteLandingPage",
    "landing_pages",
    "delete",
    "landing_pages:delete",
    {
      externalSideEffect: true,
      retryMode: "resource-state",
      approvalPolicy: "required",
      rationale: "Removes a public hosted page.",
    },
  ),
  read(
    "listSequences",
    "sequences",
    "sequences:read",
    "workspace",
    "Reads a bounded page of Sequences and aggregate results.",
  ),
  change("createSequence", "sequences", "draft", "sequences:draft", {
    rationale: "Creates a paused Sequence without starting delivery.",
  }),
  read(
    "getSequence",
    "sequences",
    "sequences:read",
    "workspace",
    "Reads one Sequence definition and aggregate results.",
  ),
  change("updateSequence", "sequences", "draft", "sequences:draft", {
    retryMode: "resource-state",
    rationale: "Changes a paused Sequence without starting delivery.",
  }),
  change("updateSequenceStatus", "sequences", "execute", "sequences:activate", {
    externalSideEffect: true,
    sideEffectClass: "external-email",
    retryMode: "resource-state",
    approvalPolicy: "required",
    rationale: "Starts or pauses a Sequence that can send email.",
  }),
  change("deleteSequence", "sequences", "delete", "sequences:delete", {
    retryMode: "resource-state",
    approvalPolicy: "required",
    rationale: "Permanently removes a lifecycle workflow.",
  }),
  read(
    "listAutomations",
    "automations",
    "automations:read",
    "workspace",
    "Reads a bounded page of Automation definitions and states.",
  ),
  change(
    "createAutomation",
    "automations",
    "draft",
    "automations:draft",
    {
      rationale: "Creates an inactive Automation without running actions.",
    },
  ),
  read(
    "getAutomation",
    "automations",
    "automations:read",
    "workspace",
    "Reads one Automation definition and state.",
  ),
  change(
    "updateAutomation",
    "automations",
    "draft",
    "automations:draft",
    {
      retryMode: "resource-state",
      rationale: "Changes an inactive Automation without running actions.",
    },
  ),
  change(
    "updateAutomationStatus",
    "automations",
    "execute",
    "automations:activate",
    {
      externalSideEffect: true,
      sideEffectClass: "external-email",
      retryMode: "resource-state",
      approvalPolicy: "required",
      rationale: "Starts or pauses an Automation that can run external actions.",
    },
  ),
  change(
    "deleteAutomation",
    "automations",
    "delete",
    "automations:delete",
    {
      retryMode: "resource-state",
      approvalPolicy: "required",
      rationale: "Permanently removes an Automation workflow.",
    },
  ),
  read(
    "listMagicLinks",
    "magic_links",
    "magic_links:read",
    "workspace",
    "Reads a bounded page of Magic Links.",
  ),
  change("createMagicLink", "magic_links", "execute", "magic_links:configure", {
    externalSideEffect: true,
    approvalPolicy: "required",
    rationale:
      "Creates a public link that can change Subscriber state when used.",
  }),
  read(
    "getMagicLink",
    "magic_links",
    "magic_links:read",
    "workspace",
    "Reads one Magic Link definition.",
  ),
  change("updateMagicLink", "magic_links", "execute", "magic_links:configure", {
    externalSideEffect: true,
    retryMode: "resource-state",
    approvalPolicy: "required",
    rationale:
      "Changes a public link that can change Subscriber state when used.",
  }),
  change("deleteMagicLink", "magic_links", "delete", "magic_links:delete", {
    externalSideEffect: true,
    retryMode: "resource-state",
    approvalPolicy: "required",
    rationale: "Removes a public link and its configured action.",
  }),
  read(
    "listBroadcasts",
    "broadcasts",
    "broadcasts:read",
    "workspace",
    "Reads a bounded page of Broadcasts and aggregate results.",
  ),
  change("createBroadcast", "broadcasts", "draft", "broadcasts:draft", {
    rationale: "Creates a Broadcast draft without scheduling or sending it.",
  }),
  read(
    "getBroadcastSendProgress",
    "broadcasts",
    "broadcasts:read",
    "workspace",
    "Reads bounded progress aggregates without scanning recipient delivery rows.",
  ),
  read(
    "listBroadcastDeliveryErrors",
    "broadcasts",
    "broadcasts:read",
    "subscriber",
    "Reads a bounded, keyset-paginated page of delivery failures.",
  ),
  read(
    "getBroadcast",
    "broadcasts",
    "broadcasts:read",
    "workspace",
    "Reads one Broadcast and aggregate results.",
  ),
  change("updateBroadcast", "broadcasts", "draft", "broadcasts:draft", {
    retryMode: "resource-state",
    rationale: "Changes a Broadcast draft without scheduling or sending it.",
  }),
  change("deleteBroadcast", "broadcasts", "delete", "broadcasts:delete", {
    retryMode: "resource-state",
    approvalPolicy: "required",
    rationale: "Permanently removes an eligible Broadcast.",
  }),
  read(
    "preflightBroadcast",
    "broadcasts",
    "broadcasts:preflight",
    "workspace",
    "Runs bounded readiness checks and returns counts rather than Subscriber rows.",
  ),
  change("sendBroadcast", "broadcasts", "execute", "broadcasts:send", {
    externalSideEffect: true,
    approvalPolicy: "required",
    rationale: "Starts durable delivery to real Subscribers.",
  }),
  change(
    "cancelBroadcastSend",
    "broadcasts",
    "execute",
    "broadcasts:cancel",
    {
      externalSideEffect: true,
      approvalPolicy: "none",
      rationale:
        "Stops remaining delivery work and must remain available as a safety action.",
    },
  ),
  change("testBroadcast", "broadcasts", "test", "broadcasts:test", {
    externalSideEffect: true,
    approvalPolicy: "policy",
    rationale: "Sends one real test email to a controlled recipient.",
  }),
  read(
    "listSegments",
    "segments",
    "segments:read",
    "workspace",
    "Reads a bounded page of saved Segments.",
  ),
  change("createSegment", "segments", "draft", "segments:configure", {
    rationale: "Creates a saved Subscriber-selection definition.",
  }),
  read(
    "getSegment",
    "segments",
    "segments:read",
    "workspace",
    "Reads one saved Segment definition.",
  ),
  change("updateSegment", "segments", "draft", "segments:configure", {
    retryMode: "resource-state",
    rationale: "Changes a saved Subscriber-selection definition.",
  }),
  change("deleteSegment", "segments", "delete", "segments:delete", {
    retryMode: "resource-state",
    approvalPolicy: "required",
    rationale: "Permanently removes a saved Subscriber-selection definition.",
  }),
  read(
    "previewSegment",
    "segments",
    "segments:read",
    "subscriber",
    "Returns bounded aggregate counts for an unsaved Segment definition.",
  ),
  read(
    "listWebhookSubscriptions",
    "webhook_subscriptions",
    "webhook_subscriptions:read",
    "workspace",
    "Reads a bounded page of webhook destinations and delivery health.",
  ),
  change(
    "createWebhookSubscription",
    "webhook_subscriptions",
    "admin",
    "webhook_subscriptions:configure",
    {
      externalSideEffect: true,
      approvalPolicy: "required",
      rationale:
        "Creates an outbound data destination and returns new secret material once.",
    },
  ),
  read(
    "getWebhookSubscription",
    "webhook_subscriptions",
    "webhook_subscriptions:read",
    "workspace",
    "Reads one webhook destination and delivery health record.",
  ),
  change(
    "updateWebhookSubscription",
    "webhook_subscriptions",
    "admin",
    "webhook_subscriptions:configure",
    {
      externalSideEffect: true,
      retryMode: "resource-state",
      approvalPolicy: "required",
      rationale: "Changes an outbound data destination or subscribed events.",
    },
  ),
  change(
    "deleteWebhookSubscription",
    "webhook_subscriptions",
    "delete",
    "webhook_subscriptions:delete",
    {
      externalSideEffect: true,
      retryMode: "resource-state",
      approvalPolicy: "required",
      rationale: "Removes an outbound event destination.",
    },
  ),
  change(
    "rotateWebhookSubscriptionSecret",
    "webhook_subscriptions",
    "admin",
    "webhook_subscriptions:secret_rotate",
    {
      externalSideEffect: true,
      sideEffectClass: "secret-change",
      retryMode: "resource-state",
      approvalPolicy: "required",
      rationale: "Invalidates the old webhook secret and reveals a replacement once.",
    },
  ),
  change(
    "createSubscriberImportJob",
    "jobs",
    "bulk",
    "subscribers:bulk_import",
    {
      externalSideEffect: true,
      approvalPolicy: "required",
      dataScope: "bulk-subscribers",
      rationale:
        "Changes many Subscribers and can enroll them in running Sequences.",
    },
  ),
  read(
    "getSubscriberImportJob",
    "jobs",
    "jobs:read",
    "workspace",
    "Reads one bounded import summary.",
  ),
  change(
    "createSubscriberExportJob",
    "jobs",
    "bulk",
    "subscribers:bulk_export",
    {
      approvalPolicy: "required",
      dataScope: "bulk-subscribers",
      rationale: "Creates an export containing bulk Subscriber data.",
    },
  ),
  read(
    "getSubscriberExportJob",
    "jobs",
    "subscribers:bulk_export",
    "bulk-subscribers",
    "Reads export status and a short-lived download location.",
  ),
] as const satisfies readonly PublicApiAgentOperationRisk[];

const publicApiAgentOperationRiskMap = new Map(
  publicApiAgentOperationRiskCatalog.map((definition) => [
    definition.operationId,
    definition,
  ]),
);

if (
  publicApiAgentOperationRiskMap.size !==
  publicApiAgentOperationRiskCatalog.length
) {
  throw new Error("Public API agent risk catalog contains duplicate operation IDs.");
}

export const getPublicApiAgentOperationRisk = (operationId: string) =>
  publicApiAgentOperationRiskMap.get(operationId) ?? null;
