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
credential-reading, or internal administration. The
`discovery_get_capabilities` connection check requests the complete public
permission catalog so Mailrith can show every Work Profile and default to Full
Email Marketing Access. The user can choose Reporting, another focused Work
Profile, or custom permissions instead. OAuth stores only the permissions the
user approves, and every tool checks those permissions again when it runs.

```bash
MAILRITH_API_KEY="<secret>" pnpm --filter @mailrith/mcp-server exec tsx src/cli.ts --transport stdio
```

Local stdio and self-hosted HTTP use `MAILRITH_API_KEY` automatically. An
explicit `--api-key` value takes precedence. Keep either value in the client
secret store or process environment; never put it in a committed configuration
file. Local stdio stops with a clear setup error when neither value is present
because it has no browser-based OAuth flow.

The default `submitted` profile exposes a fixed reviewed catalog of focused
tools such as:

- `subscribers_list`
- `broadcasts_create`
- `broadcasts_preflight`
- `broadcasts_schedule`
- `broadcasts_send`
- `sequences_update_status`
- `automations_update_status`

Every submitted tool has a human-readable title, a narrow description, exact
input and output schemas, explicit safety annotations, and machine-readable
operation permissions. Tools other than the connection check advertise their
exact OAuth permissions. The connection check advertises the complete
permission catalog so OAuth can offer every Work Profile; its result still
reports the exact permissions granted to the connection. The catalog stays the
same for every user so clients can review and select tools reliably. Workspace
role, plan, product readiness, and granted permissions are enforced when a tool
runs.

Anonymous clients may initialize and list this static catalog so ChatGPT and
other hosts can start OAuth linking. Anonymous tool calls never reach the
Mailrith product API and return HTTP `401` with a standards-based
`WWW-Authenticate` challenge instead. Authenticated calls that need more
permissions return HTTP `403` with the complete replacement permission set.
Single-tool responses also include MCP's tool-level OAuth challenge metadata
for clients that use it when linking or reconnecting an account.
Each anonymous HTTP request accepts one JSON-RPC message. Authenticated
requests may batch up to 25 messages. These limits keep discovery and tool
responses predictable for every connected workspace.

Automation reads never return saved webhook bearer tokens or custom header
values. They return only whether each value is configured. If a client reads
an Automation and sends the redacted definition back during an update,
Mailrith preserves the existing values unless the client explicitly replaces
or removes them. Changing the webhook destination requires new credential
values so an old secret cannot be carried to another service.

The package also preserves two explicit compatibility profiles:

- `compact` exposes the earlier seven discovery and routing tools.
- `custom` exposes generated focused tools with caller-selected Work Profile,
  permission, and read-only filters.

Use these profiles only for local or purpose-built clients. Public ChatGPT,
Codex, Claude, and Cursor packages use the fixed `submitted` profile at the
single `/mcp` endpoint.
