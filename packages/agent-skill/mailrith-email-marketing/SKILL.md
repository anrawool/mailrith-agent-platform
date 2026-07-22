---
name: mailrith-email-marketing
description: Plan and run safe Mailrith email marketing workflows through the Mailrith MCP server or CLI. Use for Mailrith subscriber sync, segmentation, campaign drafting, previews, approval-gated sends, automation changes, send-progress checks, activity review, permission diagnosis, and retry decisions.
---

# Mailrith Email Marketing

Use Mailrith's discovery contract before choosing tools, request only the permissions the task needs, and keep people in control of high-impact work.

## Start Every Workflow

1. Read discovery and capabilities before assuming an operation exists.
2. Confirm the selected workspace, credential identity, granted scopes, and sandbox state.
3. Convert the user's request into the smallest sequence of Mailrith operations.
4. Prefer reads and drafts first. Preview any operation that can send, publish, bulk-change, delete, or alter eligibility.
5. Present the preview's affected resources, warnings, approval state, and expiration. Never treat silence as approval.
6. Execute only after Mailrith reports approval and the user asked to proceed.
7. Return the request ID, action ID, resource IDs, current status, and a clear next step.

Read [references/workflows.md](references/workflows.md) for exact subscriber, campaign, approval, monitoring, and diagnostic recipes. Read [references/connections.md](references/connections.md) when connecting an agent client. Read [references/safety.md](references/safety.md) before retrying a mutation or handling an uncertain outcome.

## Choose The Interface

- Prefer the hosted MCP server when the client supports Streamable HTTP and OAuth.
- Prefer the CLI for shell-based agents, CI, or deterministic JSON pipelines.
- Prefer the TypeScript or Python SDK when building an application.
- Use raw HTTP only when the runtime cannot use an official client.

Run `mailrith capabilities --json` or the MCP capability tool after authentication. Do not hard-code undocumented paths, scopes, tool names, enum values, or retry rules.

## Preserve Human Control

- Never request an approval token through a generic tool or display, log, persist, or summarize its value.
- Never approve an action on the user's behalf. The Mailrith credential that requests work cannot grant its own approval.
- Never add `--yes` or execute a plan unless the user explicitly authorized execution.
- Never infer permission to send because the user allowed drafting.
- Stop when the plan changes, expires, conflicts with current resource state, or Mailrith returns an uncertain outcome.
- Use idempotency keys exactly as documented and reuse one only for the same canonical input.

## Keep Data Bounded

- Use cursor pagination and conservative limits. Do not fetch all Subscribers or activity unless the task requires it.
- Keep local logs redacted and short. Store IDs and status, not Subscriber profiles or message bodies.
- Do not poll faster than the server guidance. Use send-progress and activity endpoints instead of replaying mutations.
- For bulk work, prefer Mailrith's bounded import/export jobs over loading entire datasets into agent context.

## Report Results

State what changed, what did not change, which approval was used, and whether any result is uncertain. Include request IDs for support and activity-trail lookup. For failures, explain whether the safe next step is retry, inspect status, request a narrower permission, or ask a person to review the plan.
