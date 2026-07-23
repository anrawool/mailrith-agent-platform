---
name: mailrith-email-marketing
description: Plan and run safe Mailrith email marketing workflows through the Mailrith MCP server or CLI. Use for Mailrith Subscriber sync, content, targeting, capture, Broadcast preparation and sending, Sequence operations, Automation changes, Webhooks, data transfer, progress checks, activity review, permission diagnosis, and retry decisions.
---

# Mailrith Email Marketing

Use Mailrith's discovery contract before choosing tools and request only the permissions the task needs.

## Start Every Workflow

1. Read discovery and capabilities before assuming an operation exists.
2. Confirm the selected workspace, credential identity, granted scopes, and sandbox state.
3. Convert the user's request into the smallest sequence of Mailrith operations.
4. Prefer reads and drafts first. Run the documented preflight check before sending.
5. Execute only operations allowed by the credential's scopes and the user's requested task.
6. Return the request ID, resource IDs, current status, and a clear next step. Include an activity ID when the workflow changed workspace data.

Read [references/workflows.md](references/workflows.md) for exact Subscriber, Broadcast, Sequence, execution, monitoring, and diagnostic recipes. Read [references/connections.md](references/connections.md) when connecting an agent client. Read [references/safety.md](references/safety.md) before retrying a mutation or handling an uncertain outcome.

## Choose The Interface

- Prefer the hosted MCP server when the client supports Streamable HTTP and OAuth.
- Prefer the CLI for shell-based agents, CI, or deterministic JSON pipelines.
- Prefer the TypeScript or Python SDK when building an application.
- Use raw HTTP only when the runtime cannot use an official client.

Run `mailrith capabilities --json` or the MCP capability tool after authentication. Do not hard-code undocumented paths, scopes, tool names, enum values, or retry rules.

## Respect Authorization Boundaries

- Treat API key and OAuth scopes as the authorization boundary. Do not attempt operations outside the granted scopes.
- Never infer permission to send from a drafting scope. Sending requires its own execute scope.
- Stop when resource state conflicts with the requested change or Mailrith returns an uncertain outcome.
- Use idempotency keys exactly as documented and reuse one only for the same canonical input.

## Keep Data Bounded

- Use cursor pagination and conservative limits. Do not fetch all Subscribers or activity unless the task requires it.
- Keep local logs redacted and short. Store IDs and status, not Subscriber profiles or message bodies.
- Do not poll faster than the server guidance. Use send-progress and activity endpoints instead of replaying mutations.
- For bulk work, prefer Mailrith's bounded import/export jobs over loading entire datasets into agent context.

## Report Results

State what changed, what did not change, which credential scope allowed it, and whether any result is uncertain. Include request IDs for every workflow and activity IDs for workspace changes. For failures, explain whether the safe next step is retry, inspect status, or request the missing narrow permission.
