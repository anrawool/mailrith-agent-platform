import { generatedMailrithSdkResources } from "./generated.js";

type GeneratedMailrithSdkResource =
  (typeof generatedMailrithSdkResources)[number];

export type MailrithDiscoverableOperation =
  GeneratedMailrithSdkResource["operations"][number];

export type MailrithOperationCategory =
  | "read"
  | "write"
  | "delete"
  | "live";

export type MailrithOperationSearchParams = {
  query?: string;
  resource?: string;
  category?: MailrithOperationCategory;
};

export type MailrithOperationSearchMatch = {
  operation: MailrithDiscoverableOperation;
  score: number;
  catalogOrder: number;
  exactOperationId: boolean;
  exactIntent: boolean;
  intentSpecificity: number;
};

export type MailrithOperationSearchSelection =
  | {
      status: "browse";
      requires_clarification: false;
      message: string;
    }
  | {
      status: "no_match";
      requires_clarification: true;
      message: string;
    }
  | {
      status: "recommended";
      requires_clarification: false;
      recommended_operation_id: string;
      message: string;
    }
  | {
      status: "ambiguous";
      requires_clarification: true;
      candidate_operation_ids: string[];
      message: string;
    };

export const mailrithOperationResourceAliases: Record<
  string,
  readonly string[]
> = {
  workspace: ["account", "workspace", "profile"],
  senderIdentities: ["from address", "from email", "sender", "identity"],
  emailDeliveryConnections: [
    "email provider",
    "delivery provider",
    "sending provider",
    "smtp",
    "credentials",
    "sender connection",
    "amazon ses",
    "postmark",
    "sendgrid",
    "mailgun",
    "resend",
    "brevo",
  ],
  subscribers: [
    "contact",
    "contacts",
    "people",
    "person",
    "recipient",
    "recipients",
    "member",
    "members",
    "email list",
    "subscription status",
  ],
  tags: ["label", "labels", "organize subscribers"],
  customFields: ["subscriber field", "profile field", "attribute"],
  emailTemplates: [
    "email starting point",
    "email design",
    "reusable email",
    "email content",
  ],
  startingPoints: [
    "template gallery",
    "starting point",
    "starter",
    "example",
    "design",
  ],
  forms: ["signup form", "subscribe form", "capture form", "opt in form"],
  landingPages: ["landing page", "signup page", "capture page"],
  sequences: [
    "drip",
    "nurture",
    "lifecycle",
    "autoresponder",
    "email series",
  ],
  automations: ["workflow", "trigger", "journey", "automated email"],
  magicLinks: ["tracked link", "click action", "smart link"],
  broadcasts: [
    "campaign",
    "newsletter",
    "email blast",
    "one off email",
    "bulk email",
  ],
  segments: ["filter", "group", "targeting", "cohort", "saved filter"],
  webhookSubscriptions: [
    "webhook",
    "outbound event",
    "event notification",
    "callback",
  ],
  jobs: [
    "import",
    "export",
    "csv",
    "bulk transfer",
    "background task",
    "progress",
  ],
  analytics: [
    "metrics",
    "report",
    "performance",
    "results",
    "statistics",
  ],
  diagnostics: [
    "troubleshoot",
    "failure",
    "error",
    "why",
    "delivery problem",
    "activity",
  ],
};

export const mailrithOperationActionAliases: Record<
  string,
  readonly string[]
> = {
  list: ["find", "search", "show", "view", "browse", "which", "who"],
  get: ["find", "show", "view", "inspect", "read", "review", "details"],
  create: ["new", "add", "make", "build", "draft", "publish"],
  upsert: ["create", "update", "add", "sync"],
  start: ["begin", "create", "open", "launch", "connect", "set up", "upload"],
  update: ["change", "edit", "modify", "set", "replace"],
  delete: ["remove", "erase"],
  send: ["deliver", "launch"],
  test: ["preview", "try"],
  preview: ["test", "check", "inspect"],
  schedule: ["plan", "queue", "reschedule"],
  unschedule: ["return to draft", "cancel scheduled delivery"],
  cancel: ["stop", "abort"],
  verify: ["check", "validate"],
  preflight: ["check", "inspect", "review", "validate", "ready", "readiness"],
  status: [
    "activate",
    "pause",
    "enable",
    "disable",
    "start",
    "stop",
    "turn on",
    "turn off",
    "subscribe",
    "unsubscribe",
    "resubscribe",
    "block",
    "unblock",
  ],
  publish: ["enable", "launch", "make live"],
  duplicate: ["copy", "clone"],
  export: ["download", "transfer out"],
  import: ["upload", "transfer in"],
  enroll: ["add", "join"],
  unenroll: ["remove", "leave"],
  activate: ["enable", "start", "turn on"],
  pause: ["disable", "stop", "turn off"],
  add: ["attach", "assign", "enroll"],
  remove: ["detach", "unassign", "unenroll"],
  rotate: ["replace", "renew"],
  renew: ["refresh", "extend", "restart"],
};

// These phrases represent common user outcomes whose words alone are too
// ambiguous to distinguish neighboring operations. They stay deliberately
// bounded and in memory; no query text is persisted.
export const mailrithOperationIntentAliases: Record<
  string,
  readonly string[]
> = {
  upsertSubscriber: [
    "add subscriber",
    "add contact",
    "create subscriber",
    "create contact",
    "new subscriber",
    "new contact",
    "sync subscriber",
    "sync contact",
  ],
  updateSubscriber: [
    "update subscriber",
    "update contact",
    "change subscriber profile",
    "change contact profile",
    "update subscriber custom fields",
    "update contact custom fields",
    "update subscriber profile fields",
    "update contact profile fields",
    "update subscriber attributes",
    "update contact attributes",
  ],
  addSubscriberTag: [
    "add tag to subscriber",
    "add tag to contact",
    "attach tag to subscriber",
    "attach tag to contact",
    "assign tag to subscriber",
    "assign tag to contact",
    "label subscriber",
    "label contact",
  ],
  removeSubscriberTag: [
    "remove tag from subscriber",
    "remove tag from contact",
    "detach tag from subscriber",
    "detach tag from contact",
    "unassign tag from subscriber",
    "unassign tag from contact",
    "unlabel subscriber",
    "unlabel contact",
  ],
  addSubscriberSequence: [
    "add subscriber to sequence",
    "add contact to sequence",
    "enroll subscriber in sequence",
    "enroll contact in sequence",
    "join subscriber to sequence",
    "join contact to sequence",
  ],
  removeSubscriberSequence: [
    "remove subscriber from sequence",
    "remove contact from sequence",
    "unenroll subscriber from sequence",
    "unenroll contact from sequence",
    "unsubscribe subscriber from sequence",
    "unsubscribe contact from sequence",
    "leave subscriber sequence",
    "leave contact sequence",
  ],
  updateEmailDeliveryConnectionStatus: [
    "enable email delivery connection",
    "disable email delivery connection",
    "enable sending provider connection",
    "disable sending provider connection",
    "turn on email delivery connection",
    "turn off email delivery connection",
  ],
  updateSubscriberStatus: [
    "unsubscribe subscriber",
    "unsubscribe contact",
    "resubscribe subscriber",
    "resubscribe contact",
    "subscribe subscriber",
    "subscribe contact",
    "block subscriber",
    "block contact",
    "unblock subscriber",
    "unblock contact",
    "change subscriber status",
    "change contact status",
    "stop email for contact",
    "allow email for contact",
  ],
  startEmailDeliveryConnectionSetup: [
    "connect email provider",
    "connect sending provider",
    "connect smtp",
    "connect amazon ses",
    "connect postmark",
    "connect sendgrid",
    "connect mailgun",
    "connect resend",
    "connect brevo",
    "set up email delivery",
    "replace email provider credentials",
    "replace sending provider credentials",
    "replace smtp credentials",
    "replace smtp password",
    "replace postmark credentials",
    "replace mailgun credentials",
    "replace resend credentials",
    "change provider api key",
  ],
  createBroadcast: [
    "draft broadcast",
    "draft newsletter",
    "draft newsletter campaign",
    "create broadcast",
    "create newsletter",
    "create campaign",
    "write newsletter",
  ],
  scheduleBroadcast: [
    "schedule broadcast",
    "schedule newsletter",
    "schedule campaign",
    "reschedule broadcast",
    "reschedule newsletter",
    "reschedule campaign",
    "change newsletter send time",
  ],
  unscheduleBroadcast: [
    "unschedule broadcast",
    "unschedule newsletter",
    "unschedule campaign",
    "cancel scheduled broadcast",
    "cancel scheduled newsletter",
    "cancel scheduled campaign",
    "return scheduled newsletter to draft",
  ],
  testBroadcast: [
    "test broadcast",
    "test newsletter",
    "test campaign",
    "send test broadcast",
    "send test newsletter",
    "send test campaign",
    "send preview email",
  ],
  getBroadcastSendProgress: [
    "broadcast progress",
    "newsletter progress",
    "campaign progress",
    "broadcast send progress",
    "newsletter send progress",
    "campaign send progress",
    "check newsletter status",
    "is newsletter done",
    "monitor broadcast",
  ],
  cancelBroadcastSend: [
    "cancel broadcast send",
    "cancel newsletter send",
    "stop sending broadcast",
    "stop sending newsletter",
    "stop active broadcast",
  ],
  startSubscriberImportUpload: [
    "import subscribers from csv",
    "import contacts from csv",
    "upload subscriber csv",
    "upload contact csv",
    "choose csv for subscriber import",
  ],
  createSubscriberImportJob: [
    "start subscriber import",
    "start contact import",
    "queue subscriber import",
    "run subscriber import",
  ],
  getSubscriberImportJob: [
    "csv import progress",
    "subscriber import progress",
    "contact import progress",
    "check subscriber import",
    "check contact import",
  ],
  createSubscriberExportJob: [
    "export subscribers to csv",
    "export contacts to csv",
    "download subscribers csv",
    "download contacts csv",
    "start subscriber export",
  ],
  getSubscriberExportJob: [
    "csv export progress",
    "subscriber export progress",
    "contact export progress",
    "check subscriber export",
    "get subscriber export download",
  ],
  createAnalyticsReport: [
    "show email performance",
    "show newsletter performance",
    "show campaign performance",
    "show sequence performance",
    "show automation performance",
    "view email analytics",
    "view newsletter analytics",
    "view campaign analytics",
    "view sequence analytics",
    "view automation analytics",
    "analyze email results",
    "report email metrics",
  ],
  createForm: [
    "publish signup form",
    "publish subscribe form",
    "make signup form live",
    "create public signup form",
  ],
  createLandingPage: [
    "publish landing page",
    "make landing page live",
    "create public landing page",
    "launch signup page",
  ],
  createSequence: [
    "create sequence",
    "make new sequence",
    "build email series",
    "build nurture series",
    "draft sequence",
  ],
  createAutomation: [
    "create automation",
    "create workflow",
    "build customer journey",
    "build automated workflow",
    "draft automation",
  ],
  updateSequenceStatus: [
    "activate sequence",
    "pause sequence",
    "enable sequence",
    "disable sequence",
    "start sequence",
    "stop sequence",
    "turn on sequence",
    "turn off sequence",
  ],
  updateAutomationStatus: [
    "activate automation",
    "pause automation",
    "make automation inactive",
    "return automation to draft",
    "retire automation",
    "enable automation",
    "disable automation",
    "start automation",
    "stop automation",
    "turn on automation",
    "turn off automation",
    "activate workflow",
    "pause workflow",
  ],
};

const normalizeSearchText = (value: string) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase();

export const mailrithOperationSearchStopWords = [
  "a",
  "an",
  "and",
  "can",
  "do",
  "for",
  "from",
  "i",
  "in",
  "is",
  "me",
  "my",
  "of",
  "on",
  "please",
  "the",
  "to",
  "want",
  "with",
  "yesterday",
] as const;

const resourceAliases = mailrithOperationResourceAliases;
const actionAliases = mailrithOperationActionAliases;
const operationIntentAliases = mailrithOperationIntentAliases;
const searchStopWords = new Set<string>(mailrithOperationSearchStopWords);

type SearchTerm = {
  source: string;
  variants: readonly string[];
};

const searchTokenVariants = (value: string) => {
  const variants = new Set([value]);
  if (value === "series") return [...variants];
  if (value.length > 4 && value.endsWith("ies")) {
    variants.add(`${value.slice(0, -3)}y`);
  } else if (value.length > 4 && /(sses|shes|ches|xes|zes)$/.test(value)) {
    variants.add(value.slice(0, -2));
  } else if (value === "statuses") {
    variants.add("status");
  } else if (
    value.length > 3 &&
    value.endsWith("s") &&
    !/(ss|us|is)$/.test(value)
  ) {
    variants.add(value.slice(0, -1));
  }
  return [...variants];
};

const tokenizeSearchTerms = (value: string): SearchTerm[] =>
  normalizeSearchText(value)
    .split(" ")
    .filter((token) => token && !searchStopWords.has(token))
    .map((source) => ({
      source,
      variants: searchTokenVariants(source),
    }));

const tokenizeSearchText = (value: string) => [
  ...new Set(tokenizeSearchTerms(value).flatMap((term) => term.variants)),
];

const normalizeIntentText = (value: string) =>
  tokenizeSearchTerms(value)
    .map((term) => term.source)
    .join(" ");

const termMatches = (term: SearchTerm, tokens: ReadonlySet<string>) =>
  term.variants.some((variant) => tokens.has(variant));

const actionSearchTokens = new Set(
  tokenizeSearchText(
    Object.entries(actionAliases)
      .flatMap(([action, aliases]) => [action, ...aliases])
      .join(" "),
  ),
);

type OperationSearchEntry = {
  operation: MailrithDiscoverableOperation;
  normalizedText: string;
  intentPhraseTokens: readonly (readonly string[])[];
  tokens: ReadonlySet<string>;
  actionTokens: ReadonlySet<string>;
  namespaceTokens: ReadonlySet<string>;
  resourceTokens: ReadonlySet<string>;
};

export const getMailrithOperationCategory = (
  operation: MailrithDiscoverableOperation,
): MailrithOperationCategory => {
  if (operation.risk === "read") return "read";
  if (operation.risk === "delete") return "delete";
  if (operation.requiresLiveAction) return "live";
  return "write";
};

const buildSearchIndex = (
  operations: readonly MailrithDiscoverableOperation[],
) => {
  const entries: OperationSearchEntry[] = operations.map((operation) => {
    const operationWords = normalizeSearchText(operation.operationId).split(" ");
    const primaryAction = operationWords.find((word) =>
      Object.prototype.hasOwnProperty.call(actionAliases, word),
    );
    const operationActionWords = primaryAction ? [primaryAction] : [];
    const aliases = primaryAction ? actionAliases[primaryAction] ?? [] : [];
    const resources = resourceAliases[operation.namespace] ?? [];
    const intents = operationIntentAliases[operation.operationId] ?? [];
    const intentPhraseTokens = intents.map((intent) =>
      normalizeIntentText(intent).split(" ").filter(Boolean),
    );
    const normalizedText = normalizeSearchText(
      [
        operation.operationId,
        operation.namespace,
        operation.summary,
        operation.description,
        operation.path,
        ...aliases,
        ...resources,
        ...intents,
      ].join(" "),
    );
    return {
      operation,
      normalizedText,
      intentPhraseTokens,
      tokens: new Set(tokenizeSearchText(normalizedText)),
      actionTokens: new Set(
        tokenizeSearchText([...operationActionWords, ...aliases].join(" ")),
      ),
      namespaceTokens: new Set(
        tokenizeSearchText([operation.namespace, ...resources].join(" ")),
      ),
      resourceTokens: new Set(
        tokenizeSearchText(
          [operation.namespace, operation.path, ...resources].join(" "),
        ),
      ),
    };
  });
  return {
    entries,
    resourceTokens: new Set(
      entries.flatMap((entry) => [...entry.resourceTokens]),
    ),
  };
};

const getIntentSpecificity = (
  queryTokens: ReadonlySet<string>,
  intentPhrases: readonly (readonly string[])[],
) => {
  if (queryTokens.size === 0) return 0;
  return intentPhrases.reduce(
    (specificity, phraseTokens) =>
      phraseTokens.length >= 2 &&
      phraseTokens.every((token) => queryTokens.has(token))
        ? Math.max(specificity, phraseTokens.length)
        : specificity,
    0,
  );
};

const searchIndex = (
  index: readonly OperationSearchEntry[],
  catalogResourceTokens: ReadonlySet<string>,
  params: MailrithOperationSearchParams,
): MailrithOperationSearchMatch[] => {
  const normalizedQuery = normalizeSearchText(params.query ?? "");
  const intentQueryTokens = new Set(
    normalizeIntentText(normalizedQuery).split(" ").filter(Boolean),
  );
  const queryTerms = tokenizeSearchTerms(normalizedQuery);
  const requestedActionTerms = queryTerms.filter((term) =>
    termMatches(term, actionSearchTokens),
  );
  const requestedResourceTerms = queryTerms.filter((term) =>
    termMatches(term, catalogResourceTokens),
  );
  const resourceTerms = tokenizeSearchTerms(params.resource ?? "");

  return index
    .map((entry, catalogOrder): MailrithOperationSearchMatch | null => {
      const category = getMailrithOperationCategory(entry.operation);
      if (params.category && params.category !== category) return null;
      if (
        resourceTerms.length > 0 &&
        !resourceTerms.every((term) => termMatches(term, entry.resourceTokens))
      ) {
        return null;
      }
      if (queryTerms.length === 0) {
        return {
          operation: entry.operation,
          score: 0,
          catalogOrder,
          exactOperationId: false,
          exactIntent: false,
          intentSpecificity: 0,
        };
      }

      const intentSpecificity = getIntentSpecificity(
        intentQueryTokens,
        entry.intentPhraseTokens,
      );
      const exactIntent = intentSpecificity > 0;
      const exactPhrase =
        normalizedQuery.length > 2 &&
        entry.normalizedText.includes(normalizedQuery);
      const matchedTerms = queryTerms.filter((term) =>
        termMatches(term, entry.tokens),
      );
      if (matchedTerms.length === 0) return null;
      const actionMatchCount = matchedTerms.filter((term) =>
        termMatches(term, entry.actionTokens),
      ).length;
      if (
        !exactIntent &&
        !exactPhrase &&
        requestedActionTerms.length > 0 &&
        actionMatchCount === 0
      ) {
        return null;
      }
      const resourceMatchCount = matchedTerms.filter((term) =>
        termMatches(term, entry.resourceTokens),
      ).length;
      if (
        !exactIntent &&
        !exactPhrase &&
        requestedResourceTerms.length > 0 &&
        resourceMatchCount === 0
      ) {
        return null;
      }
      const coverage = matchedTerms.length / queryTerms.length;
      const namespaceMatchCount = matchedTerms.filter((term) =>
        termMatches(term, entry.namespaceTokens),
      ).length;
      const exactOperationId =
        normalizedQuery === normalizeSearchText(entry.operation.operationId);
      const score =
        matchedTerms.length * 12 +
        coverage * 20 +
        actionMatchCount * 36 +
        resourceMatchCount * 44 +
        namespaceMatchCount * 28 +
        (exactPhrase ? 50 : 0) +
        (exactIntent ? 240 + intentSpecificity * 40 : 0) +
        (exactOperationId ? 400 : 0);
      return {
        operation: entry.operation,
        score,
        catalogOrder,
        exactOperationId,
        exactIntent,
        intentSpecificity,
      };
    })
    .filter((match): match is MailrithOperationSearchMatch => match !== null)
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.catalogOrder - right.catalogOrder,
    );
};

const describeSelection = (
  matches: readonly MailrithOperationSearchMatch[],
  hasQuery: boolean,
): MailrithOperationSearchSelection => {
  if (!hasQuery) {
    return {
      status: "browse",
      requires_clarification: false,
      message:
        "Browse the bounded results or add a task, resource, or effect to narrow them.",
    };
  }
  const first = matches[0];
  if (!first) {
    return {
      status: "no_match",
      requires_clarification: true,
      message:
        "No operation matched. Rephrase the task or add a resource and effect.",
    };
  }
  const second = matches[1];
  const minimumClearLead = Math.max(24, first.score * 0.12);
  const isClearMatch =
    first.exactOperationId ||
    first.exactIntent ||
    !second ||
    first.score - second.score >= minimumClearLead;
  if (isClearMatch) {
    return {
      status: "recommended",
      requires_clarification: false,
      recommended_operation_id: first.operation.operationId,
      message:
        "Load the recommended operation schema before calling its execution tool.",
    };
  }
  return {
    status: "ambiguous",
    requires_clarification: true,
    candidate_operation_ids: matches
      .slice(0, 3)
      .map((match) => match.operation.operationId),
    message:
      "Several operations match. Narrow the task or ask the user which effect they intend before executing one.",
  };
};

const generatedMailrithOperations =
  generatedMailrithSdkResources.flatMap(
    (resource) => [...resource.operations],
  ) as readonly MailrithDiscoverableOperation[];

export const createMailrithOperationDiscovery = (
  operations: readonly MailrithDiscoverableOperation[] =
    generatedMailrithOperations,
) => {
  const index = buildSearchIndex(operations);
  const operationById = new Map<string, MailrithDiscoverableOperation>(
    operations.map((operation) => [operation.operationId, operation] as const),
  );
  return {
    operations,
    getOperation: (operationId: string) => operationById.get(operationId) ?? null,
    search: (params: MailrithOperationSearchParams) => {
      const matches = searchIndex(
        index.entries,
        index.resourceTokens,
        params,
      );
      return {
        matches,
        selection: describeSelection(matches, Boolean(params.query?.trim())),
      };
    },
  };
};

export const mailrithOperationDiscovery =
  createMailrithOperationDiscovery();
