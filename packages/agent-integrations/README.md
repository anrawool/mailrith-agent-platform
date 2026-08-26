# Mailrith Agent Integrations

This folder contains the local submission packages for:

- ChatGPT and Codex
- Claude Connector and the complementary Claude Code plugin
- Cursor
- Gemini CLI
- GitHub Copilot CLI
- Microsoft MCP server certification
- Cline

Every package connects to the same remote MCP server:
`https://api.mailrith.com/mcp`.

Run `pnpm generate:agent-integrations` after changing the submitted tool
profile or Agent Skill. The generator copies the canonical skill, freezes the
shared contract digest, refreshes the OpenAI submission file, updates the
Gemini skill, and writes Microsoft's static tool-description file. Run the
package tests before sharing or submitting an artifact.

No package may contain an API key, OAuth token, reviewer password, delivery
credential, or real customer data.

## Official Builds And Forks

Modified public versions must use distinct plugin, connector, marketplace, and
service names and clearly say that they are unofficial. See the
[Mailrith Trademark And Unofficial Fork Policy](https://github.com/anrawool/mailrith-agent-platform/blob/main/TRADEMARKS.md).
