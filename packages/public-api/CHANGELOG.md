# Changelog

## Unreleased

## 1.1.1 - 2026-08-27

- Include the official Mailrith trademark and unofficial-fork policy in the
  published package without changing the public API contract.

## 1.1.0 - 2026-08-17

- Add Tag creation and bounded Custom Field listing and retrieval to the fixed
  submitted MCP tool catalog without changing existing tool names or schemas.
- Return an exact, computed `personalization_token` with every Custom Field so
  clients can use Mailrith email variables without storing duplicate data.
- Document valid Subscriber and Custom Field personalization in email subject
  and body schemas, including timestamp validation for consent evidence.

## 1.0.2 - 2026-08-14

- Describe how agents preserve the existing schedule or running status when
  changing Broadcasts, Sequences, and Automations.
- Include the same safe recovery guidance in update conflict responses.

## 1.0.1 - 2026-07-31

- Republish the unchanged public contract as part of the coordinated npm patch release.

## 1.0.0 - 2026-07-26

- Publish the fixed submitted MCP profile as a reviewed subset of the generated public operation contract.
- Add an explicit destructive-action decision to the risk catalog and conservatively classify overwrites, removals, scheduling, tests, sends, Subscriber-triggered Automations, and workflow lifecycle changes.
- Keep the REST API, SDKs, CLI, and custom MCP profiles compatible with scoped workspace API keys while submitted platforms use OAuth.

## 0.2.0 - 2026-07-24

- Replace fragmented action permissions with 33 stable resource permissions and 10 complete Work Profiles generated from one canonical resource contract, including one centrally derived Live Actions permission and one full-access default for general-purpose agents.
- Replace inline Subscriber import CSV bodies with short-lived, browser-completed upload sessions so agents receive only bounded headers and row counts.
- Publish actionable missing-permission details and compact MCP discovery metadata without loading the full operation catalog into agent context.
- Add direct stable-ID retrieval, self links, and compact import and export job lists across the public contract, SDKs, CLI, and MCP server.
- Add secret-free Sender Identity discovery and Broadcast schedule, reschedule, and unschedule operations.
- Add secure, short-lived browser handoff for email delivery connection creation and credential replacement so provider secrets never pass through agent requests.
- Add email delivery connection verification and idempotent real test-send operations.
- Make authenticated capabilities report only operations currently available to the credential, plan, workspace state, and rollout state, with actionable prerequisite details.
- Make MCP capability discovery honor internal task-focused toolsets and read-only filtering, and add bounded Sequence and Automation readiness, journey-preview, and test-message operations.
- Use one standard MCP URL with purpose-based optional OAuth permissions and actionable permission-upgrade errors.
- Require a saved Subscriber for every personalized Template, Broadcast, Sequence, Automation, Form, and Landing Page preview or test; report Subscriber eligibility and the selected Automation branch without changing saved data.
- Make large resource collections use indexed database search, keyset pagination, and compact summaries while keeping complete objects on individual GET operations.
- Require an active email delivery connection before creating Broadcasts, Sequences, Automations, Forms, or Landing Pages through any interface.
- Make public resource updates preserve every omitted field and publish exact schemas for email documents, Subscriber filters, Sequences, Automations, Forms, and Landing Pages.
- Remove the pre-launch Agent Sandbox surface.
- Remove the pre-launch Agent Activity resource and permission.

## 0.1.2 - 2026-07-24

- Republish the unchanged public contract with coordinated package version reporting and registry verification.

## 0.1.1 - 2026-07-24

- Republish the unchanged public contract as part of the coordinated Agent Skill patch release.

## 0.1.0 - 2026-07-24

- Add shared, contract-checked read-only OAuth scopes and copyable Broadcast and Webhook payloads.
- Correct the Webhook status description.
- Limit each workspace to 20 Webhook subscriptions and return `webhook_subscription_limit_exceeded` when the workspace is full.
- Replace internal diagnostics, consent, job, and per-webhook-action scopes with resource reads, Subscriber subscription permissions, bulk-operation permissions, and Webhooks Read or Write.
- Remove the pre-launch recommendation, reference-experiment, and generic compliance-event resources.
- Publish the coordinated REST, OAuth, scope, risk, MCP, and SDK contract.
- Add scoped agent operations and pre-launch test-workspace behavior.
- Add focused support for Broadcasts, Sequences, Automations, content, targeting, capture, Webhooks, and data transfer.
