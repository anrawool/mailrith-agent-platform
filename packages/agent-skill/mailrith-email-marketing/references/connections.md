# Mailrith Connection Guidance

## Hosted MCP

- Server URL: `https://api.mailrith.com/mcp`
- Transport: Streamable HTTP
- Authentication: OAuth for interactive agent clients; bearer API key or OAuth access token only in runtimes that can protect secrets
- Discovery: `https://mailrith.com/.well-known/mcp/server-card.json`

Use the reviewed templates shipped with `@mailrith/agent-skill` for OpenAI, Claude, Codex, n8n, and Pipedream. Client fields change over time, so confirm the client version against the Mailrith compatibility page before installation.

## CLI

Run `mailrith auth login` for interactive OAuth or set `MAILRITH_API_KEY` in a secret manager. Then run `mailrith doctor --json` and `mailrith capabilities --json`.

Do not put credentials in command history, skill files, source control, connector JSON, or prompts.

## Local MCP

Use `npx @mailrith/mcp-server --transport stdio` only when the client requires stdio. Pass credentials through an environment variable managed by the client, not as a visible command argument.
