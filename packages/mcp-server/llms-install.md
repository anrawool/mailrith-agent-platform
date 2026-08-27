# Install Mailrith In Cline

After this prepared version is published, use the pinned Mailrith MCP server
over stdio. Do not clone or build the repository.

## Before Installation

Ask the user to create a Mailrith workspace API key under
**Settings → API Keys**. The user must keep the key in local Cline settings or
an environment variable and must never commit it to a repository.

## Add The Server

Add this entry under `mcpServers` in Cline's MCP settings:

```json
{
  "mailrith": {
    "command": "npx",
    "args": [
      "-y",
      "@mailrith/mcp-server@1.1.1",
      "--transport",
      "stdio"
    ],
    "env": {
      "MAILRITH_API_KEY": "<MAILRITH_API_KEY>"
    },
    "disabled": false,
    "autoApprove": []
  }
}
```

Replace `<MAILRITH_API_KEY>` only in the user's local Cline configuration.
Keep `autoApprove` empty so Cline asks before using Mailrith tools.

## Verify The Installation

1. Restart the **mailrith** MCP server in Cline.
2. Confirm that the server is enabled and connected.
3. Ask Cline: `Which Mailrith workspace is connected, and what permissions are available?`
4. Confirm that Cline calls `discovery_get_capabilities` and reports the
   expected workspace.
5. Do not create, change, schedule, send, activate, or delete anything during
   this check.

If the server reports a credential error, replace the local key or confirm
that the key still belongs to the intended workspace.
