# Mailrith Plugin

The Mailrith plugin adds the official Mailrith Agent Skill and connects Claude
Code or GitHub Copilot CLI to `https://api.mailrith.com/mcp`.

## Install In Claude Code

Install directly from the public repository:

```text
/plugin marketplace add anrawool/mailrith-agent-platform
/plugin install mailrith@mailrith-plugins
```

Then open `/mcp`, choose **mailrith**, and complete the Mailrith sign-in flow.
Choose one workspace, review the permissions, and select **Allow Access**.

## Install In GitHub Copilot CLI

Install the plugin directly from its public repository folder:

```bash
copilot plugin install anrawool/mailrith-agent-platform:packages/agent-integrations/claude/mailrith
```

Then run `copilot mcp get mailrith` to check the connection. Complete OAuth
when Copilot asks you to sign in to Mailrith.

## Manage Access

The plugin contains no API key, access token, or workspace identifier. Change
or revoke the connection in Mailrith under
**Integrations → Authorized Apps**.
