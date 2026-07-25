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
  requiresLiveAction: boolean;
  sideEffectClass: PublicApiAgentSideEffectClass;
  retryMode: PublicApiAgentRetryMode;
  idempotencyPolicy: PublicApiAgentIdempotencyPolicy;
  dataScope: PublicApiAgentDataScope;
  rationale: string;
};

const read = (
  operationId: string,
  resourceKey: string,
  dataScope: PublicApiAgentDataScope,
  rationale: string,
): PublicApiAgentOperationRisk => ({
  operationId,
  resourceKey,
  risk: "read",
  externalSideEffect: false,
  requiresLiveAction: false,
  sideEffectClass: "none",
  retryMode: "safe",
  idempotencyPolicy: "safe-read",
  dataScope,
  rationale,
});

const change = (
  operationId: string,
  resourceKey: string,
  risk: Exclude<PublicApiAgentRiskClass, "read">,
  options: {
    externalSideEffect?: boolean;
    requiresLiveAction?: boolean;
    sideEffectClass?: Exclude<PublicApiAgentSideEffectClass, "none">;
    retryMode?: Exclude<PublicApiAgentRetryMode, "safe">;
    dataScope?: Exclude<PublicApiAgentDataScope, "public">;
    rationale: string;
  },
): PublicApiAgentOperationRisk => {
  const retryMode = options.retryMode ?? "idempotency-key";
  const externalSideEffect = options.externalSideEffect ?? false;
  const requiresLiveAction =
    options.requiresLiveAction ??
    (risk === "execute" || risk === "test");
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
    requiresLiveAction,
    sideEffectClass,
    retryMode,
    idempotencyPolicy:
      retryMode === "resource-state" ? "resource-state" : "idempotency-key",
    dataScope: options.dataScope ?? "workspace",
    rationale: options.rationale,
  };
};

export const publicApiAgentOperationRiskCatalog = [
  read(
    "getPublicApiMeta",
    "discovery",
    "public",
    "Returns public version and discovery metadata.",
  ),
  read(
    "getPublicApiCapabilities",
    "discovery",
    "workspace",
    "Returns the authenticated credential and workspace capability boundary.",
  ),
  read(
    "getPublicApiOpenApiDocument",
    "discovery",
    "public",
    "Returns the public API contract without reading workspace data.",
  ),
  read(
    "getWorkspace",
    "workspace",
    "workspace",
    "Reads one authenticated workspace profile.",
  ),
  read(
    "listSenderIdentities",
    "sender_identities",
    "workspace",
    "Reads a bounded page of enabled sender metadata without provider credentials.",
  ),
  read(
    "getSenderIdentity",
    "sender_identities",
    "workspace",
    "Reads one enabled sender identity without provider credentials.",
  ),
  read(
    "listEmailDeliveryConnections",
    "email_delivery_connections",
    "workspace",
    "Reads a bounded page of secret-free delivery connection metadata.",
  ),
  change(
    "startEmailDeliveryConnectionSetup",
    "email_delivery_connections",
    "admin",
    {
      sideEffectClass: "secret-change",
      retryMode: "resource-state",
      rationale:
        "Creates a short-lived browser handoff so provider credentials never pass through the agent API.",
    },
  ),
  read(
    "getEmailDeliveryConnectionSetup",
    "email_delivery_connections",
    "workspace",
    "Reads the bounded status of one short-lived secure setup session.",
  ),
  change(
    "renewEmailDeliveryConnectionSetup",
    "email_delivery_connections",
    "admin",
    {
      sideEffectClass: "secret-change",
      retryMode: "resource-state",
      rationale:
        "Reissues a short-lived browser handoff from bounded non-secret setup context.",
    },
  ),
  read(
    "listEmailStartingPoints",
    "starting_points",
    "workspace",
    "Reads compact metadata for the canonical email starting points shared with the Mailrith UI.",
  ),
  read(
    "getEmailStartingPoint",
    "starting_points",
    "workspace",
    "Reads one canonical email starting point on demand.",
  ),
  read(
    "listFormStartingPoints",
    "starting_points",
    "workspace",
    "Reads compact metadata for the canonical Form starting points shared with the Mailrith UI.",
  ),
  read(
    "getFormStartingPoint",
    "starting_points",
    "workspace",
    "Reads one canonical Form starting point on demand.",
  ),
  read(
    "listLandingPageStartingPoints",
    "starting_points",
    "workspace",
    "Reads compact metadata for the canonical Landing Page starting points shared with the Mailrith UI.",
  ),
  read(
    "getLandingPageStartingPoint",
    "starting_points",
    "workspace",
    "Reads one canonical Landing Page starting point on demand.",
  ),
  read(
    "getEmailDeliveryConnection",
    "email_delivery_connections",
    "workspace",
    "Reads one secret-free delivery connection linked to the workspace.",
  ),
  change(
    "updateEmailDeliveryConnection",
    "email_delivery_connections",
    "admin",
    {
      retryMode: "resource-state",
      rationale:
        "Changes non-secret sender settings for one workspace-only connection.",
    },
  ),
  change(
    "updateEmailDeliveryConnectionStatus",
    "email_delivery_connections",
    "admin",
    {
      retryMode: "resource-state",
      rationale:
        "Enables or disables a delivery connection and can change whether workspace resources may be created or sent.",
    },
  ),
  read(
    "verifyEmailDeliveryConnection",
    "email_delivery_connections",
    "workspace",
    "Checks the saved provider credential and sender without storing a verification history.",
  ),
  change(
    "testEmailDeliveryConnection",
    "email_delivery_connections",
    "test",
    {
      externalSideEffect: true,
      sideEffectClass: "external-email",
      rationale: "Sends one real test email to a controlled recipient.",
    },
  ),
  change(
    "deleteEmailDeliveryConnection",
    "email_delivery_connections",
    "delete",
    {
      retryMode: "resource-state",
      rationale:
        "Deletes one eligible workspace-only delivery connection and its saved provider credentials.",
    },
  ),
  read(
    "createAnalyticsReport",
    "analytics",
    "workspace",
    "Creates or reuses one bounded, expiring aggregate report from compact rollups.",
  ),
  read(
    "getAnalyticsReport",
    "analytics",
    "workspace",
    "Reads one bounded, expiring aggregate report.",
  ),
  read(
    "listAutomationRunDiagnostics",
    "diagnostics",
    "workspace",
    "Reads a bounded page of redacted Automation run diagnostics.",
  ),
  read(
    "getAutomationRunDiagnostics",
    "diagnostics",
    "workspace",
    "Reads one redacted Automation run and its bounded step diagnostics.",
  ),
  read(
    "getSequenceDiagnostics",
    "diagnostics",
    "workspace",
    "Reads bounded Sequence failure and retry diagnostics.",
  ),
  read(
    "getBroadcastDiagnostics",
    "diagnostics",
    "workspace",
    "Reads bounded Broadcast selection, provider readiness, and delivery reasons.",
  ),
  read(
    "getSubscriberActivityDiagnostics",
    "diagnostics",
    "subscriber",
    "Reads one privacy-conscious Subscriber activity and subscription summary without an email address.",
  ),
  read(
    "listSubscribers",
    "subscribers",
    "subscriber",
    "Reads a bounded, cursor-paginated page of Subscribers.",
  ),
  read(
    "getSubscriber",
    "subscribers",
    "subscriber",
    "Reads one Subscriber by its stable identifier.",
  ),
  change("upsertSubscriber", "subscribers", "execute", {
    dataScope: "subscriber",
    rationale:
      "Creates or changes one Subscriber and can change sending eligibility.",
  }),
  change("updateSubscriber", "subscribers", "draft", {
    retryMode: "resource-state",
    dataScope: "subscriber",
    rationale:
      "Changes one Subscriber profile or custom-field values without changing sending eligibility.",
  }),
  change("deleteSubscriber", "subscribers", "delete", {
    retryMode: "resource-state",
    dataScope: "subscriber",
    rationale:
      "Permanently removes one Subscriber and their Mailrith activity history.",
  }),
  change(
    "updateSubscriberStatus",
    "subscribers",
    "execute",
    {
      retryMode: "resource-state",
      dataScope: "subscriber",
      rationale: "Changes whether one Subscriber can receive email.",
    },
  ),
  change(
    "addSubscriberTag",
    "subscribers",
    "execute",
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
    {
      externalSideEffect: true,
      sideEffectClass: "external-email",
      retryMode: "resource-state",
      dataScope: "subscriber",
      rationale:
        "Enrollment can cause a running Sequence to send email to the Subscriber.",
    },
  ),
  change(
    "removeSubscriberSequence",
    "subscribers",
    "execute",
    {
      retryMode: "resource-state",
      dataScope: "subscriber",
      rationale: "Removes one Subscriber from a lifecycle workflow.",
    },
  ),
  read("listTags", "tags", "workspace", "Reads the bounded Tag catalog."),
  change("createTag", "tags", "draft", {
    rationale: "Creates targeting metadata without contacting Subscribers.",
  }),
  read("getTag", "tags", "workspace", "Reads one Tag definition."),
  change("updateTag", "tags", "draft", {
    retryMode: "resource-state",
    rationale: "Changes targeting metadata without contacting Subscribers.",
  }),
  change("deleteTag", "tags", "delete", {
    retryMode: "resource-state",
    rationale:
      "Permanently removes targeting metadata when no saved resource references it.",
  }),
  read(
    "listCustomFields",
    "custom_fields",
    "workspace",
    "Reads the bounded custom-field schema.",
  ),
  change(
    "createCustomField",
    "custom_fields",
    "draft",
    { rationale: "Creates a custom-field definition." },
  ),
  read(
    "getCustomField",
    "custom_fields",
    "workspace",
    "Reads one custom-field definition.",
  ),
  change(
    "updateCustomField",
    "custom_fields",
    "draft",
    {
      retryMode: "resource-state",
      rationale: "Changes a custom-field definition used by Subscriber data.",
    },
  ),
  change(
    "deleteCustomField",
    "custom_fields",
    "delete",
    {
      retryMode: "resource-state",
      rationale: "Permanently removes a field definition and associated values.",
    },
  ),
  read(
    "listEmailTemplates",
    "email_templates",
    "workspace",
    "Reads a bounded page of reusable email templates.",
  ),
  change(
    "createEmailTemplate",
    "email_templates",
    "draft",
    { rationale: "Creates reusable draft content without sending email." },
  ),
  read(
    "getEmailTemplate",
    "email_templates",
    "workspace",
    "Reads one reusable email template.",
  ),
  read(
    "previewEmailTemplate",
    "email_templates",
    "subscriber",
    "Renders one reusable email template with one saved Subscriber without sending or saving anything.",
  ),
  change(
    "updateEmailTemplate",
    "email_templates",
    "draft",
    {
      retryMode: "resource-state",
      rationale: "Changes reusable draft content without sending email.",
    },
  ),
  change(
    "deleteEmailTemplate",
    "email_templates",
    "delete",
    {
      retryMode: "resource-state",
      rationale: "Permanently removes reusable email content.",
    },
  ),
  read("listForms", "forms", "workspace", "Reads a bounded page of Forms."),
  change("createForm", "forms", "draft", {
    externalSideEffect: true,
    requiresLiveAction: true,
    rationale: "Creates a publicly reachable Subscriber capture surface.",
  }),
  read("getForm", "forms", "workspace", "Reads one Form definition."),
  read(
    "listFormSubmissions",
    "forms",
    "subscriber",
    "Reads a bounded page of Form submissions and Subscriber data.",
  ),
  read(
    "getFormSubmission",
    "forms",
    "subscriber",
    "Reads one retained Form submission by stable identifier.",
  ),
  read(
    "previewFormDoubleOptIn",
    "forms",
    "subscriber",
    "Renders one Form confirmation email with one saved Subscriber without sending or saving anything.",
  ),
  change("updateForm", "forms", "draft", {
    externalSideEffect: true,
    requiresLiveAction: true,
    retryMode: "resource-state",
    rationale: "Changes a publicly reachable Subscriber capture surface.",
  }),
  change("deleteForm", "forms", "delete", {
    externalSideEffect: true,
    requiresLiveAction: true,
    retryMode: "resource-state",
    rationale: "Removes a public Subscriber capture surface.",
  }),
  read(
    "listLandingPages",
    "landing_pages",
    "workspace",
    "Reads a bounded page of Landing Pages.",
  ),
  change(
    "createLandingPage",
    "landing_pages",
    "draft",
    {
      externalSideEffect: true,
      requiresLiveAction: true,
      rationale: "Creates a publicly reachable hosted page.",
    },
  ),
  read(
    "getLandingPage",
    "landing_pages",
    "workspace",
    "Reads one Landing Page definition.",
  ),
  read(
    "listLandingPageSubmissions",
    "landing_pages",
    "subscriber",
    "Reads a bounded page of Landing Page submissions and Subscriber data.",
  ),
  read(
    "getLandingPageSubmission",
    "landing_pages",
    "subscriber",
    "Reads one retained Landing Page submission by stable identifier.",
  ),
  read(
    "previewLandingPageDoubleOptIn",
    "landing_pages",
    "subscriber",
    "Renders one Landing Page confirmation email with one saved Subscriber without sending or saving anything.",
  ),
  change(
    "updateLandingPage",
    "landing_pages",
    "draft",
    {
      externalSideEffect: true,
      requiresLiveAction: true,
      retryMode: "resource-state",
      rationale: "Changes a publicly reachable hosted page.",
    },
  ),
  change(
    "deleteLandingPage",
    "landing_pages",
    "delete",
    {
      externalSideEffect: true,
      requiresLiveAction: true,
      retryMode: "resource-state",
      rationale: "Removes a public hosted page.",
    },
  ),
  read(
    "listSequences",
    "sequences",
    "workspace",
    "Reads a bounded page of Sequences and aggregate results.",
  ),
  change("createSequence", "sequences", "draft", {
    rationale: "Creates a paused Sequence without starting delivery.",
  }),
  read(
    "getSequence",
    "sequences",
    "workspace",
    "Reads one Sequence definition and aggregate results.",
  ),
  read(
    "preflightSequence",
    "sequences",
    "workspace",
    "Runs bounded Sequence readiness checks without changing the Sequence.",
  ),
  read(
    "previewSequenceJourney",
    "sequences",
    "workspace",
    "Returns a bounded, side-effect-free timeline of the Sequence emails.",
  ),
  change("testSequence", "sequences", "test", {
    externalSideEffect: true,
    sideEffectClass: "external-email",
    rationale:
      "Sends at most five selected Sequence messages to one explicit test address without enrolling Subscribers.",
  }),
  change("updateSequence", "sequences", "draft", {
    retryMode: "resource-state",
    rationale: "Changes a paused Sequence without starting delivery.",
  }),
  change("updateSequenceStatus", "sequences", "execute", {
    externalSideEffect: true,
    sideEffectClass: "external-email",
    retryMode: "resource-state",
    rationale: "Starts or pauses a Sequence that can send email.",
  }),
  change("deleteSequence", "sequences", "delete", {
    retryMode: "resource-state",
    rationale: "Permanently removes a lifecycle workflow.",
  }),
  read(
    "listAutomations",
    "automations",
    "workspace",
    "Reads a bounded page of Automation definitions and states.",
  ),
  change(
    "createAutomation",
    "automations",
    "draft",
    {
      rationale: "Creates an inactive Automation without running actions.",
    },
  ),
  read(
    "getAutomation",
    "automations",
    "workspace",
    "Reads one Automation definition and state.",
  ),
  read(
    "preflightAutomation",
    "automations",
    "workspace",
    "Runs bounded Automation readiness checks without running any actions.",
  ),
  read(
    "previewAutomationJourney",
    "automations",
    "workspace",
    "Returns a bounded, side-effect-free view of Automation triggers, steps, and branches.",
  ),
  change("testAutomation", "automations", "test", {
    externalSideEffect: true,
    sideEffectClass: "external-email",
    rationale:
      "Sends at most five selected Automation email steps to one explicit test address without running actions.",
  }),
  change(
    "updateAutomation",
    "automations",
    "draft",
    {
      retryMode: "resource-state",
      rationale: "Changes an inactive Automation without running actions.",
    },
  ),
  change(
    "updateAutomationStatus",
    "automations",
    "execute",
    {
      externalSideEffect: true,
      sideEffectClass: "external-email",
      retryMode: "resource-state",
      rationale: "Starts or pauses an Automation that can run external actions.",
    },
  ),
  change(
    "deleteAutomation",
    "automations",
    "delete",
    {
      retryMode: "resource-state",
      rationale: "Permanently removes an Automation workflow.",
    },
  ),
  read(
    "listMagicLinks",
    "magic_links",
    "workspace",
    "Reads a bounded page of Magic Links.",
  ),
  change("createMagicLink", "magic_links", "execute", {
    externalSideEffect: true,
    rationale:
      "Creates a public link that can change Subscriber state when used.",
  }),
  read(
    "getMagicLink",
    "magic_links",
    "workspace",
    "Reads one Magic Link definition.",
  ),
  change("updateMagicLink", "magic_links", "execute", {
    externalSideEffect: true,
    retryMode: "resource-state",
    rationale:
      "Changes a public link that can change Subscriber state when used.",
  }),
  change("deleteMagicLink", "magic_links", "delete", {
    externalSideEffect: true,
    requiresLiveAction: true,
    retryMode: "resource-state",
    rationale: "Removes a public link and its configured action.",
  }),
  read(
    "listBroadcasts",
    "broadcasts",
    "workspace",
    "Reads a bounded page of Broadcasts and aggregate results.",
  ),
  change("createBroadcast", "broadcasts", "draft", {
    rationale: "Creates a Broadcast draft without scheduling or sending it.",
  }),
  read(
    "getBroadcastSendProgress",
    "broadcasts",
    "workspace",
    "Reads bounded progress aggregates without scanning recipient delivery rows.",
  ),
  read(
    "listBroadcastDeliveryErrors",
    "broadcasts",
    "subscriber",
    "Reads a bounded, keyset-paginated page of delivery failures.",
  ),
  read(
    "getBroadcast",
    "broadcasts",
    "workspace",
    "Reads one Broadcast and aggregate results.",
  ),
  change("updateBroadcast", "broadcasts", "draft", {
    retryMode: "resource-state",
    rationale: "Changes a Broadcast draft without scheduling or sending it.",
  }),
  change("deleteBroadcast", "broadcasts", "delete", {
    retryMode: "resource-state",
    rationale: "Permanently removes an eligible Broadcast.",
  }),
  read(
    "preflightBroadcast",
    "broadcasts",
    "workspace",
    "Runs bounded readiness checks and returns counts rather than Subscriber rows.",
  ),
  change("scheduleBroadcast", "broadcasts", "execute", {
    externalSideEffect: true,
    retryMode: "resource-state",
    rationale:
      "Schedules durable delivery to real Subscribers at a future time.",
  }),
  change(
    "unscheduleBroadcast",
    "broadcasts",
    "execute",
    {
      retryMode: "resource-state",
      rationale:
        "Cancels future delivery before it starts and returns the Broadcast to draft state.",
    },
  ),
  change("sendBroadcast", "broadcasts", "execute", {
    externalSideEffect: true,
    rationale: "Starts durable delivery to real Subscribers.",
  }),
  change(
    "cancelBroadcastSend",
    "broadcasts",
    "execute",
    {
      externalSideEffect: true,
      requiresLiveAction: true,
      rationale:
        "Stops remaining delivery work and must remain available as a safety action.",
    },
  ),
  change("testBroadcast", "broadcasts", "test", {
    externalSideEffect: true,
    rationale: "Sends one real test email to a controlled recipient.",
  }),
  read(
    "listSegments",
    "segments",
    "workspace",
    "Reads a bounded page of saved Segments.",
  ),
  change("createSegment", "segments", "draft", {
    rationale: "Creates a saved Subscriber-selection definition.",
  }),
  read(
    "getSegment",
    "segments",
    "workspace",
    "Reads one saved Segment definition.",
  ),
  change("updateSegment", "segments", "draft", {
    retryMode: "resource-state",
    rationale: "Changes a saved Subscriber-selection definition.",
  }),
  change("deleteSegment", "segments", "delete", {
    retryMode: "resource-state",
    rationale: "Permanently removes a saved Subscriber-selection definition.",
  }),
  read(
    "previewSegment",
    "segments",
    "subscriber",
    "Returns bounded aggregate counts for an unsaved Segment definition.",
  ),
  read(
    "listWebhookSubscriptions",
    "webhook_subscriptions",
    "workspace",
    "Reads a bounded page of webhook destinations and delivery health.",
  ),
  change(
    "createWebhookSubscription",
    "webhook_subscriptions",
    "admin",
    {
      externalSideEffect: true,
      requiresLiveAction: true,
      rationale:
        "Creates an outbound data destination and returns new secret material once.",
    },
  ),
  read(
    "getWebhookSubscription",
    "webhook_subscriptions",
    "workspace",
    "Reads one webhook destination and delivery health record.",
  ),
  change(
    "updateWebhookSubscription",
    "webhook_subscriptions",
    "admin",
    {
      externalSideEffect: true,
      requiresLiveAction: true,
      retryMode: "resource-state",
      rationale: "Changes an outbound data destination or subscribed events.",
    },
  ),
  change(
    "deleteWebhookSubscription",
    "webhook_subscriptions",
    "delete",
    {
      externalSideEffect: true,
      requiresLiveAction: true,
      retryMode: "resource-state",
      rationale: "Removes an outbound event destination.",
    },
  ),
  change(
    "rotateWebhookSubscriptionSecret",
    "webhook_subscriptions",
    "admin",
    {
      externalSideEffect: true,
      requiresLiveAction: true,
      sideEffectClass: "secret-change",
      retryMode: "resource-state",
      rationale: "Invalidates the old webhook secret and reveals a replacement once.",
    },
  ),
  read(
    "listSubscriberImportJobs",
    "jobs",
    "bulk-subscribers",
    "Reads a bounded page of recent Subscriber import job summaries.",
  ),
  change(
    "startSubscriberImportUpload",
    "jobs",
    "draft",
    {
      retryMode: "resource-state",
      dataScope: "bulk-subscribers",
      rationale:
        "Creates a short-lived browser handoff without importing or storing Subscriber rows.",
    },
  ),
  read(
    "getSubscriberImportUpload",
    "jobs",
    "workspace",
    "Reads bounded status and CSV column metadata for one short-lived upload.",
  ),
  change(
    "createSubscriberImportJob",
    "jobs",
    "bulk",
    {
      externalSideEffect: true,
      requiresLiveAction: true,
      dataScope: "bulk-subscribers",
      rationale:
        "Changes many Subscribers and can enroll them in running Sequences.",
    },
  ),
  read(
    "getSubscriberImportJob",
    "jobs",
    "workspace",
    "Reads one bounded import summary.",
  ),
  read(
    "listSubscriberExportJobs",
    "jobs",
    "bulk-subscribers",
    "Reads a bounded page of recent Subscriber export job summaries.",
  ),
  change(
    "createSubscriberExportJob",
    "jobs",
    "bulk",
    {
      dataScope: "bulk-subscribers",
      rationale: "Creates an export containing bulk Subscriber data.",
    },
  ),
  read(
    "getSubscriberExportJob",
    "jobs",
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

export const requiresPublicApiLiveActionPermission = (
  operationId: string,
) =>
  publicApiAgentOperationRiskMap.get(operationId)?.requiresLiveAction === true;
