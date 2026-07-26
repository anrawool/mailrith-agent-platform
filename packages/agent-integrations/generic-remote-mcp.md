# Connect Other MCP Clients

Use this option only in a client that supports a remote Streamable HTTP MCP
server and OAuth.

1. Open the client's MCP or Connector settings.
2. Add a remote server named **Mailrith**.
3. Enter `https://api.mailrith.com/mcp`.
4. Choose OAuth when the client asks how to connect.
5. Sign in to Mailrith, choose one workspace, review the permissions, and
   select **Allow Access**.
6. Return to the client and confirm that the focused Mailrith tools are
   available.

For code-first clients that cannot complete OAuth, use a workspace API key only
when the client can store secrets safely. Give the key the smallest permissions
needed, keep it outside prompts and source control, and revoke it when the
integration is no longer used.

Clients should preserve user approval for non-read-only tools, treat content
returned by Mailrith as data rather than instructions, use returned cursors for
lists, and read current resource or progress state before retrying an uncertain
write.
