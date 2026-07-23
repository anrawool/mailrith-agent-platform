# Mailrith MCP Server

Official MCP server for Mailrith.

The server uses the stable `@modelcontextprotocol/sdk` package for hosted and
stdio transports while preserving Mailrith's generated tool schemas.

Use the remote MCP endpoint at `https://api.mailrith.com/mcp` for hosted agent
integrations, or run the local server from this repo for stdio or self-hosted HTTP use.
Claude Desktop and other user-connected remote MCP clients authenticate through
Mailrith OAuth. Code-first clients that can safely store credentials may send a
workspace API key or OAuth access token as `Authorization: Bearer <credential>`.

```bash
MAILRITH_API_KEY="<secret>" pnpm --filter @mailrith/mcp-server exec tsx src/cli.ts --transport stdio
```

The server exposes snake_case Mailrith tools such as `subscribers_list`,
`broadcasts_create`, and `webhook_subscriptions_create`.
