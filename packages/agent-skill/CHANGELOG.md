# Changelog

## Unreleased

## 1.1.1 - 2026-08-27

- Include the official Mailrith trademark and unofficial-fork policy in the
  published Agent Skill and its connector packages.

## 1.1.0 - 2026-08-17

- Enable `tags_create`, `custom_fields_list`, and `custom_fields_get` in the
  Claude, OpenAI, and Codex connector templates.
- Teach agents to create a missing Tag before applying it and to copy the exact
  Custom Field personalization token returned by Mailrith.
- Keep personalization guidance shared across Templates, Broadcasts,
  Sequences, Automations, Forms, and Landing Pages.

## 1.0.2 - 2026-08-14

- Preserve scheduled Broadcast times and previously running Sequence or
  Automation states when agents make an update.
- Keep reconciliation checks bounded and use direct item reads by ID.

## 1.0.1 - 2026-07-31

- Republish the Agent Skill as part of the coordinated npm patch release.

## 1.0.0 - 2026-07-26

- Replace the seven compact routing tools with the fixed submitted catalog of focused Mailrith tools.
- Keep Broadcast scheduling, sending, tests, cancellation, Sequence and Automation activation, and individual Subscriber targeting available as normal scoped workflows.
- Ask OpenAI API clients to approve non-read-only tools and rely on each host's confirmation behavior for consequential actions.
- Keep credentials and bulk import or export work in secure browser, CLI, SDK, or API workflows instead of passing sensitive files or secrets through agent context.

## 0.2.0 - 2026-07-24

- Teach agents that resource write permissions cover the complete public resource lifecycle and that client tool limits narrow preparation-only workflows.
- Use the final 10 Work Profiles, with Full Email Marketing Access as the general-purpose default, plus direct stable-ID retrieval, self links, and compact job lists.
- Enable all seven stable MCP tools in the OpenAI, Claude, and Codex general-purpose templates; keep the explicitly read-only n8n and Pipedream examples narrow.
- Use the seven-tool compact MCP workflow, loading one exact operation schema only when needed.
- Update OpenAI, Claude, and Codex starter templates to the seven-tool contract and keep their initial access read-only.
- Teach agents to narrow ambiguous operation matches before executing anything.
- Use secure browser-completed Subscriber import uploads and actionable missing-permission guidance.
- Add Sender Identity discovery and Broadcast scheduling guidance.
- Use one standard hosted MCP connection with OAuth Work Profile selection, actionable reconnect guidance, and secure browser-based email delivery setup guidance.
- Teach agents to use effective capabilities, actionable delivery prerequisites, provider verification, and a real test email before creating email-dependent resources.
- Teach agents to select a saved Subscriber for previews and tests, inspect eligibility and Automation branches, and fetch full objects only after compact discovery.
- Replace Agent Sandbox guidance with a dedicated test-workspace workflow.

## 0.1.2 - 2026-07-24

- Republish the Agent Skill with coordinated package version reporting and registry verification.

## 0.1.1 - 2026-07-24

- Point hosted MCP discovery to the public Mailrith server card instead of a missing API-origin document.

## 0.1.0 - 2026-07-24

- Keep the read-only Codex and Claude starters within the default OAuth permissions and explain that read-only connections do not change workspace resources.
- Align workflows with resource-bound diagnostics, Subscriber subscription permissions, and Webhooks Read or Write.
- Add the first installable Mailrith email marketing skill.
- Add safe Subscriber, draft, preflight, scoped execution, progress, and diagnostic workflows.
- Add current connector templates for OpenAI, Claude, Codex, n8n, and Pipedream.
