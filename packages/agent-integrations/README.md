# Mailrith Agent Integrations

This folder contains the local submission packages for:

- ChatGPT and Codex
- Claude
- Cursor

Every package connects to the same remote MCP server:
`https://api.mailrith.com/mcp`.

Run `pnpm generate:agent-integrations` after changing the submitted tool
profile or Agent Skill. The generator copies the canonical skill, freezes the
shared contract digest, and refreshes the OpenAI submission file. Run the
package tests before sharing or submitting an artifact.

No package may contain an API key, OAuth token, reviewer password, delivery
credential, or real customer data.
