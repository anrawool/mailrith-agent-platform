# Changelog

## 0.1.1 - 2026-07-24

- Republish the unchanged public contract as part of the coordinated Agent Skill patch release.

## 0.1.0 - 2026-07-24

- Add shared, contract-checked read-only OAuth scopes and copyable Broadcast and Webhook payloads.
- Correct the Webhook status description.
- Limit each workspace to 20 Webhook subscriptions and return `webhook_subscription_limit_exceeded` when the workspace is full.
- Replace internal diagnostics, consent, job, and per-webhook-action scopes with resource reads, Subscriber subscription permissions, bulk-operation permissions, and Webhooks Read or Write.
- Remove the pre-launch recommendation, reference-experiment, and generic compliance-event resources.
- Publish the coordinated REST, OAuth, scope, risk, MCP, and SDK contract.
- Add scoped agent operations, sandbox behavior, and Agent Activity operations.
- Add focused support for Broadcasts, Sequences, Automations, content, targeting, capture, Webhooks, and data transfer.
