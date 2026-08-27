# Mailrith For Cline

Mailrith connects to Cline through the versioned `@mailrith/mcp-server`
package.

## Marketplace Source

- Repository:
  `https://github.com/anrawool/mailrith-agent-platform/tree/main/packages/mcp-server`
- Installation guide:
  `https://github.com/anrawool/mailrith-agent-platform/blob/main/packages/mcp-server/llms-install.md`
- Marketplace logo: `mailrith-logo-400.png`

Cline should install the pinned npm package instead of building the monorepo.
The local stdio server reads `MAILRITH_API_KEY` from Cline's local MCP
configuration. The package contains no credential.

## Submission Draft

**GitHub repository URL**

`https://github.com/anrawool/mailrith-agent-platform/tree/main/packages/mcp-server`

**Reason for addition**

Mailrith gives Cline permission-scoped tools for reviewing Subscribers and
email results, preparing and delivering Broadcasts, and managing Sequences,
Automations, targeting, and email Templates. The release process publishes the
server to npm with provenance, documents a bounded read-only verification
step, and keeps live actions behind the user's Mailrith permissions and Cline's
tool approval.

**Installation confirmation**

After publishing, confirm from a clean Cline profile that giving Cline only the
package README and `llms-install.md` is enough to install
`@mailrith/mcp-server@1.1.1`, connect with a synthetic workspace API key, and
run only `discovery_get_capabilities`.
