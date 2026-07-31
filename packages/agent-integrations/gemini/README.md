# Mailrith For Gemini CLI

The Mailrith Gemini CLI extension connects to the official remote MCP server
at `https://api.mailrith.com/mcp` and includes the Mailrith Agent Skill.

## Install The Extension

```bash
gemini extensions install https://github.com/anrawool/mailrith-agent-platform
```

Restart Gemini CLI after installation. When Mailrith first needs access, sign
in, choose one workspace, review the permissions, and select
**Allow Access**.

Use `/mcp list` to confirm that **mailrith** is connected. The extension
contains no API key, access token, or workspace identifier.

## Update The Extension

```bash
gemini extensions update mailrith
```

The public repository contains `gemini-extension.json` at its root and uses
the `gemini-cli-extension` GitHub topic so Gemini CLI's gallery crawler can
discover it.
