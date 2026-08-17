import { createHash } from "node:crypto";
import {
  cp,
  mkdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  publicApiSubmittedMcpOperationIds,
  publicApiSubmittedMcpProfile,
} from "@mailrith/public-api";
import { generatedMailrithMcpToolManifest } from "@mailrith/mcp-server";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const integrationsRoot = path.join(
  repositoryRoot,
  "packages",
  "agent-integrations",
);
const canonicalSkillDirectory = path.join(
  repositoryRoot,
  "packages",
  "agent-skill",
  "mailrith-email-marketing",
);
const canonicalLicensePath = path.join(
  repositoryRoot,
  "packages",
  "agent-skill",
  "LICENSE",
);
const canonicalLogoPath = path.join(
  integrationsRoot,
  "assets",
  "mailrith-logo.svg",
);
const pluginRoots = [
  path.join(integrationsRoot, "openai", "mailrith"),
  path.join(integrationsRoot, "cursor", "mailrith"),
  path.join(integrationsRoot, "claude", "mailrith"),
];
const geminiSkillRoot = path.join(
  repositoryRoot,
  "skills",
  "mailrith-email-marketing",
);
const microsoftToolsPath = path.join(
  integrationsRoot,
  "microsoft",
  "mcptools.json",
);
const microsoftColorIconPath = path.join(
  integrationsRoot,
  "microsoft",
  "assets",
  "Color.svg",
);
const clineLogoPath = path.join(
  integrationsRoot,
  "cline",
  "mailrith-logo.svg",
);

const canonicalizeJson = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(canonicalizeJson);
  }
  if (value === null || typeof value !== "object") {
    return value;
  }
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => [key, canonicalizeJson(item)]),
  );
};

const toolByOperationId = new Map(
  generatedMailrithMcpToolManifest.tools.map((tool) => [
    tool.operationId,
    tool,
  ]),
);

const submittedTools = publicApiSubmittedMcpOperationIds.map((operationId) => {
  const tool = toolByOperationId.get(operationId);
  if (!tool) {
    throw new Error(
      `Submitted MCP operation ${operationId} is missing from the generated manifest.`,
    );
  }
  return {
    operation_id: tool.operationId,
    name: tool.name,
    summary: String(tool.summary),
    risk_rationale: String(tool.riskRationale),
    required_scopes: tool.requiredScopes,
    annotations: tool.annotations,
    input_schema: tool.inputSchema,
    output_schema: tool.outputSchema,
  };
});

const submittedSchemaDigest = `sha256:${createHash("sha256")
  .update(JSON.stringify(canonicalizeJson(submittedTools)))
  .digest("hex")}`;

const submittedProfileManifest = {
  schema_version: 1,
  profile: publicApiSubmittedMcpProfile.key,
  contract_version: publicApiSubmittedMcpProfile.contractVersion,
  source_contract_version: generatedMailrithMcpToolManifest.contractVersion,
  source_schema_digest: generatedMailrithMcpToolManifest.schemaDigest,
  submitted_schema_digest: submittedSchemaDigest,
  mcp_server_url: "https://api.mailrith.com/mcp",
  tool_count: submittedTools.length,
  tools: submittedTools.map((tool) => ({
    operation_id: tool.operation_id,
    name: tool.name,
    required_scopes: tool.required_scopes,
    annotations: tool.annotations,
  })),
};

const microsoftToolsDescription = {
  tools: submittedTools.map((tool) => ({
    name: tool.name,
    title: tool.annotations.title,
    description: tool.summary,
    inputSchema: tool.input_schema,
    outputSchema: tool.output_schema,
    annotations: tool.annotations,
  })),
};

const withoutTrailingPeriod = (value: string) =>
  value.trim().replace(/[.\s]+$/, "");

const createSubmissionJustifications = (
  tool: (typeof submittedTools)[number],
) => {
  const behavior = withoutTrailingPeriod(tool.risk_rationale);
  return {
    read_only_justification: tool.annotations.readOnlyHint
      ? `${behavior}; it does not change Mailrith or an external system.`
      : `${behavior}; it changes Mailrith state or starts work.`,
    open_world_justification: tool.annotations.openWorldHint
      ? `${behavior}; it can affect email delivery outside Mailrith.`
      : `${behavior}; it does not change public internet or third-party state.`,
    destructive_justification: tool.annotations.destructiveHint
      ? `${behavior}; the action can overwrite, remove, cancel, activate, or send something consequential.`
      : `${behavior}; it does not permanently delete, irreversibly send, revoke access, or destructively replace something.`,
  };
};

const chatGptAppSubmission = {
  $schema:
    "https://developers.openai.com/apps-sdk/schemas/chatgpt-app-submission.v1.json",
  schema_version: 1,
  app_info: {
    display_name: "Mailrith",
    subtitle: "Manage email marketing",
    description:
      "Mailrith helps users review Subscribers and email results, prepare and deliver Broadcasts, and manage Sequences, Automations, targeting, and email Templates in one connected workspace.",
    category: "BUSINESS",
  },
  tools: Object.fromEntries(
    submittedTools.map((tool) => [
      tool.name,
      {
        annotations: {
          readOnlyHint: tool.annotations.readOnlyHint,
          openWorldHint: tool.annotations.openWorldHint,
          destructiveHint: tool.annotations.destructiveHint,
        },
        justifications: createSubmissionJustifications(tool),
      },
    ]),
  ),
  test_cases: [
    {
      description: "Confirm the connected workspace and available permissions.",
      user_prompt:
        "Which Mailrith workspace is connected, and what can this connection do?",
      file_attachment_urls: null,
      tools_triggered: "discovery_get_capabilities, workspace_get",
      expected_output:
        "Names the connected workspace and summarizes the current permissions and limitations.",
      expected_output_url: null,
    },
    {
      description: "Find one Subscriber and apply an existing Tag.",
      user_prompt:
        "Find ada.reviewer@example.com and add the Customer Tag after showing me the matching Subscriber.",
      file_attachment_urls: null,
      tools_triggered:
        "subscribers_list, tags_list, subscribers_add_tag",
      expected_output:
        "Shows the matching synthetic Subscriber and, after approval, confirms the Tag change.",
      expected_output_url: null,
    },
    {
      description: "Prepare and preflight a Broadcast draft.",
      user_prompt:
        "Create a draft Broadcast from the Reviewer Welcome Template for the Reviewer Customers Segment, then run preflight without sending it.",
      file_attachment_urls: null,
      tools_triggered:
        "sender_identities_list, segments_list, email_templates_list, email_templates_get, broadcasts_create, broadcasts_preflight",
      expected_output:
        "Creates only a draft and reports the bounded preflight checks, recipient count, and any blockers.",
      expected_output_url: null,
    },
    {
      description: "Schedule a reviewed Broadcast.",
      user_prompt:
        "Preflight the Reviewer July Update Broadcast and schedule it for 10:00 AM tomorrow in my workspace timezone.",
      file_attachment_urls: null,
      tools_triggered:
        "broadcasts_list, broadcasts_preflight, broadcasts_schedule",
      expected_output:
        "Shows the preflight result and, after approval, confirms the exact scheduled time and Broadcast state.",
      expected_output_url: null,
    },
    {
      description: "Review and activate an Automation.",
      user_prompt:
        "Show the Reviewer Welcome Automation journey, run preflight, and activate it if there are no blockers.",
      file_attachment_urls: null,
      tools_triggered:
        "automations_list, automations_preview_journey, automations_preflight, automations_update_status",
      expected_output:
        "Shows the journey and readiness result and, after approval, reports the final Automation state.",
      expected_output_url: null,
    },
  ],
  negative_test_cases: [
    {
      description: "Do not trigger for an unrelated calendar request.",
      user_prompt: "What meetings do I have tomorrow?",
      file_attachment_urls: null,
      tools_triggered: null,
      expected_output:
        "Mailrith should not be invoked because it does not manage calendars.",
      expected_output_url: null,
    },
    {
      description: "Do not trigger for email inbox management.",
      user_prompt: "Find unread messages in my inbox and archive newsletters.",
      file_attachment_urls: null,
      tools_triggered: null,
      expected_output:
        "Mailrith should not be invoked because it does not read or organize a personal inbox.",
      expected_output_url: null,
    },
    {
      description: "Do not accept credentials through a tool.",
      user_prompt:
        "Save this SMTP password in Mailrith for me: not-a-real-password.",
      file_attachment_urls: null,
      tools_triggered: null,
      expected_output:
        "Explains that delivery credentials must be entered through Mailrith's secure browser setup and does not call a Mailrith tool.",
      expected_output_url: null,
    },
  ],
};

const writeJson = (filePath: string, value: unknown) =>
  writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");

const main = async () => {
  const license = await readFile(canonicalLicensePath, "utf8");
  for (const pluginRoot of pluginRoots) {
    const skillTarget = path.join(
      pluginRoot,
      "skills",
      "mailrith-email-marketing",
    );
    await rm(skillTarget, { recursive: true, force: true });
    await mkdir(path.dirname(skillTarget), { recursive: true });
    await cp(canonicalSkillDirectory, skillTarget, { recursive: true });
    await writeFile(path.join(pluginRoot, "LICENSE"), license, "utf8");
    await mkdir(path.join(pluginRoot, "assets"), { recursive: true });
    await cp(
      canonicalLogoPath,
      path.join(pluginRoot, "assets", "logo.svg"),
    );
    await writeJson(
      path.join(pluginRoot, "mailrith-mcp-contract.json"),
      submittedProfileManifest,
    );
  }
  await rm(geminiSkillRoot, { recursive: true, force: true });
  await mkdir(path.dirname(geminiSkillRoot), { recursive: true });
  await cp(canonicalSkillDirectory, geminiSkillRoot, { recursive: true });
  await mkdir(path.dirname(microsoftToolsPath), { recursive: true });
  await writeJson(microsoftToolsPath, microsoftToolsDescription);
  await mkdir(path.dirname(microsoftColorIconPath), { recursive: true });
  await cp(canonicalLogoPath, microsoftColorIconPath);
  await mkdir(path.dirname(clineLogoPath), { recursive: true });
  await cp(canonicalLogoPath, clineLogoPath);
  await writeJson(
    path.join(integrationsRoot, "submitted-profile.json"),
    submittedProfileManifest,
  );
  await writeJson(
    path.join(repositoryRoot, "chatgpt-app-submission.json"),
    chatGptAppSubmission,
  );
};

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
