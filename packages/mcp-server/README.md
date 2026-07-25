# Mailrith MCP Server

Official MCP server for Mailrith.

The server uses the stable `@modelcontextprotocol/sdk` package for hosted and
stdio transports while preserving Mailrith's generated operation schemas.

Use the remote MCP endpoint at `https://api.mailrith.com/mcp` for hosted agent
integrations, or run the local server from this repo for stdio or self-hosted HTTP use.
Claude Desktop and other user-connected remote MCP clients authenticate through
Mailrith OAuth. Code-first clients that can safely store credentials may send a
workspace API key or OAuth access token as `Authorization: Bearer <credential>`.

The hosted server requests **Full Email Marketing Access** by default for a
general-purpose agent. It covers every public email-marketing operation in the
selected workspace, but not billing, team, account-security,
credential-reading, or internal administration. A client can deliberately
select a focused Work Profile or read-only mode for a narrower connection.

```bash
MAILRITH_API_KEY="<secret>" pnpm --filter @mailrith/mcp-server exec tsx src/cli.ts --transport stdio
```

The server exposes seven stable tools:

- `mailrith_check_connection`
- `mailrith_search_operations`
- `mailrith_get_operation`
- `mailrith_read`
- `mailrith_write`
- `mailrith_delete`
- `mailrith_live`

Search first, load one exact operation schema, then use the matching execution
tool. This keeps the initial agent context small while every operation remains
validated against the generated public contract. Search understands common
product wording, singular and plural resource names, and normal action words.
When several operations are equally plausible, the result is marked as
ambiguous so the agent can narrow the request before it executes anything.

Availability is based on the authenticated workspace's effective capability
response, not permissions alone. Search, exact schema lookup, and connection
diagnosis report when the current plan, workspace limit, email delivery
connection, active toolset, read-only setting, or rollout state prevents an
otherwise permitted operation. Operations outside the active Work Profile or a
read-only connection remain searchable so an agent can explain the missing
access, but execution stays blocked. Actionable setup links are returned when
the capability response provides one.

`mailrith_get_operation` returns the exact input schema by default. Set
`include_output_schema` to `true` for the one operation whose result contract
the agent needs; this avoids loading every output schema into context.

Permanent deletion always uses `mailrith_delete`. A delete may still require
Perform Live Actions access when it removes a public or externally connected
resource; the operation schema lists every required permission.
