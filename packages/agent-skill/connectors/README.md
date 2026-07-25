# Mailrith Connector Templates

These templates were reviewed on July 22, 2026 against the current OpenAI Responses API, Claude MCP connector `mcp-client-2025-11-20`, Codex Streamable HTTP MCP configuration, n8n HTTP Request node `4.3`, and Pipedream Node.js component format.

## OpenAI

Resolve `${MAILRITH_ACCESS_TOKEN}` in server-side code before sending the request. The general-purpose template exposes all seven stable Mailrith MCP tools and uses the connection's approved Work Profile as the permission boundary.

## Claude

Resolve `${MAILRITH_ACCESS_TOKEN}` immediately before the Messages API request. The template enables all seven stable Mailrith MCP tools explicitly. Keep the current `mcp_toolset` structure; `tool_configuration` on the server is deprecated.

## Codex

Merge `codex-config.toml` into the user's Codex `config.toml`, then run `codex mcp login mailrith`. For non-interactive use, configure `bearer_token_env_var` instead of saving a token in the file.
The template enables all seven stable Mailrith MCP tools. OAuth uses Full Email Marketing Access by default; choose a focused Work Profile when this Codex connection has a deliberately narrower job.

## n8n

Import the workflow, create an **HTTP Header Auth** credential named **Mailrith Bearer Token**, set the header name to `Authorization`, and set its value to `Bearer <credential>`. Replace `CONFIGURE_AFTER_IMPORT` by selecting that credential in the node. The starter workflow is read-only and inactive.

## Pipedream

Create a Node.js code step from `pipedream-read-capabilities.mjs`. Save the Mailrith credential in the step's secret property. The starter component performs one bounded read and has no write side effect.

Do not commit resolved credentials or exported platform configurations that contain secrets.
