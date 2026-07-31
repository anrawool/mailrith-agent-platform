# Mailrith Connection Guidance

## Hosted MCP

- Server URL: `https://api.mailrith.com/mcp`
- Transport: Streamable HTTP
- Authentication: OAuth for interactive agent clients; bearer API key or OAuth access token only in runtimes that can protect secrets
- Discovery: `https://mailrith.com/.well-known/mcp/server-card.json`

Use the reviewed templates shipped with `@mailrith/agent-skill` for OpenAI, Claude, Codex, n8n, and Pipedream. Client fields change over time, so confirm the client version against the Mailrith compatibility page before installation.

Start an MCP connection with `discovery_get_capabilities`. Its OAuth prompt can show every Work Profile and defaults a general-purpose agent to Full Email Marketing Access so it can complete an email-marketing task without reconnecting for another public permission. Choose a focused Work Profile such as Reporting, Broadcasts, Sequences, or Email Delivery Setup only when the connection has a deliberately narrower job. After OAuth, call `discovery_get_capabilities` again to confirm the selected workspace and exact granted permissions. The same server URL works for every purpose. The hosted server exposes the fixed submitted catalog of focused tools. Then use the exact Subscriber, Broadcast, Sequence, Automation, reporting, sender, targeting, or Template tool that matches the task.

When Mailrith returns `insufficient_scope`, use the returned access-update link and recommended Work Profile, then reconnect from the agent client and approve the listed missing permissions. An existing OAuth token cannot gain permissions silently.

## CLI

Use `mailrith operations search "<task>" --json` to find the stable operation ID, then use `mailrith operations describe <operation-id> --json` to inspect its exact input schema. These two discovery commands work without a credential and do not call the network.

Run `mailrith auth login` for interactive OAuth or set `MAILRITH_API_KEY` in a secret manager. Then run `mailrith doctor --json` and `mailrith capabilities --json` to confirm the selected workspace's current effective operations before executing one.

Do not put credentials in command history, skill files, source control, connector JSON, or prompts.

## Local MCP

Use `npx @mailrith/mcp-server --transport stdio` only when the client requires stdio. Pass credentials through an environment variable managed by the client, not as a visible command argument.
