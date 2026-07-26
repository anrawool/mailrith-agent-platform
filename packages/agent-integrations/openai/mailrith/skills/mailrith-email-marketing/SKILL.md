---
name: mailrith-email-marketing
description: Plan and run safe Mailrith email marketing workflows through the Mailrith MCP server or CLI. Use for Mailrith email delivery setup, Subscriber sync, content, targeting, capture, Broadcast preparation and sending, Sequence operations, Automation changes, Webhooks, data transfer, progress checks, result verification, permission diagnosis, and retry decisions.
---

# Mailrith Email Marketing

Use Mailrith's discovery contract before choosing tools and request only the permissions the task needs.

## Start Every Workflow

1. Read the connected workspace and capabilities before assuming an action is available.
2. Confirm the selected workspace, credential identity, and granted scopes.
3. Convert the user's request into the smallest sequence of Mailrith operations.
4. Prefer reads and drafts first. Run the documented preflight check before sending.
5. Execute only operations allowed by the credential's scopes and the user's requested task.
6. Return the request ID, resource IDs, current status, and a clear next step.

Read [references/workflows.md](references/workflows.md) for exact Subscriber, Broadcast, Sequence, execution, monitoring, and diagnostic recipes. Read [references/connections.md](references/connections.md) when connecting an agent client. Read [references/safety.md](references/safety.md) before retrying a mutation or handling an uncertain outcome.

## Choose The Interface

- Prefer the hosted MCP server when the client supports Streamable HTTP and OAuth.
- Use the standard `https://api.mailrith.com/mcp` URL. Full Email Marketing Access is the default for a general-purpose agent. Choose a focused Work Profile only when the connection has a deliberately narrower job.
- Prefer the CLI for shell-based agents, CI, or deterministic JSON pipelines.
- Prefer the TypeScript or Python SDK when building an application.
- Use raw HTTP only when the runtime cannot use an official client.

For an MCP connection, call `discovery_get_capabilities` first. If the client asks the user to connect, finish OAuth, choose the appropriate Work Profile, and call it again to confirm the selected workspace and granted permissions. Run `mailrith capabilities --json` before using the CLI. Then choose the focused tool whose name and schema match the requested action. Keep draft editing, preflight, testing, activation, scheduling, and sending as separate calls. In the CLI, use `mailrith operations search "<task>" --json` and `mailrith operations describe <operation-id> --json` before calling an unfamiliar operation. CLI search and schema inspection work before authentication and do not make a network request. If several operations could produce different effects, narrow the request or ask the user which effect they intend before executing anything. Do not hard-code undocumented paths, permissions, operation IDs, enum values, or retry rules.

## Respect Authorization Boundaries

- Treat API key and OAuth scopes as the authorization boundary. Do not attempt operations outside the granted scopes.
- Treat a resource write permission as authority to change that resource. Operations that send, activate or change running workflows, change Subscriber delivery or targeting, publish capture surfaces, or configure outbound event delivery also require Perform Live Actions.
- Stop when resource state conflicts with the requested change or Mailrith returns an uncertain outcome.
- Use idempotency keys exactly as documented and reuse one only for the same canonical input.

## Keep Data Bounded

- Use cursor pagination and conservative limits. Do not fetch all Subscribers or other resource collections unless the task requires it.
- Keep local logs redacted and short. Store IDs and status, not Subscriber profiles or message bodies.
- Do not poll faster than the server guidance. Use resource and send-progress endpoints instead of replaying mutations.
- For bulk work, prefer Mailrith's bounded import/export jobs over loading entire datasets into agent context.

## Report Results

State what changed, what did not change, which credential scope allowed it, and whether any result is uncertain. Include request and resource IDs. For failures, explain whether the safe next step is retry, inspect status, or request the missing narrow permission.
