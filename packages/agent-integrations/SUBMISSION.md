# Agent Integration Submission Guide

The repository work is complete when every automated gate passes. Provider
review cannot be completed by repository automation. A Mailrith owner must use
the organization account that owns each listing and must be able to make the
required identity, legal, privacy, and data-handling statements.

## Shared Pre-Submission Checks

1. Deploy the same reviewed source to the target environment.
2. Confirm `https://api.mailrith.com/mcp` serves the submitted `1.0` profile.
3. Confirm OAuth discovery, Dynamic Client Registration, PKCE, refresh,
   revocation, and resource binding against the deployed endpoint.
4. Prepare and reset the synthetic reviewer workspace using
   `reviewer/README.md`.
5. Run the repository tests, client conformance checks, MCP Inspector, and the
   current provider-specific scanner.
6. Confirm the privacy policy, terms, support URL, product name, logo, and
   descriptions match across every submission.
7. Share reviewer credentials only through an approved secret-sharing service.

## Submit ChatGPT And Codex

1. Sign in to the OpenAI Platform organization that will own Mailrith.
2. In **Organization Settings**, confirm the publisher identity is verified.
3. In **Roles**, confirm the submitter has **Apps Management: Write**. An
   organization owner already has this permission.
4. Open the **Plugin Submission** portal and create one Mailrith draft.
5. Package `openai/mailrith` from the exact reviewed commit.
6. Import `chatgpt-app-submission.json` and enter the public MCP URL,
   `https://api.mailrith.com/mcp`.
7. When the portal displays a domain-verification token, set it on the
   production API Worker as `OPENAI_APPS_CHALLENGE_TOKEN`. Confirm
   `https://api.mailrith.com/.well-known/openai-apps-challenge` returns only
   that token, then complete the portal check.
8. Use the OAuth callback URL generated for that draft. Do not reuse a callback
   URL from another plugin draft.
9. Connect Mailrith from ChatGPT developer mode using a clean reviewer session.
10. Run all five positive cases and all three negative cases.
11. Run the OpenAI production scan and correct every blocking result.
12. Review every tool annotation, justification, starter prompt, public URL,
    country selection, and policy statement.
13. Submit the plugin for review. After OpenAI approves it, return to the same
    draft and publish it to the Plugins Directory for ChatGPT and Codex.

## Submit The Claude Connector

1. Confirm the submitting account belongs to a Claude Team or Enterprise
   organization and has Owner or Directory management permission.
2. Use the listing in `claude/connector-listing.json`.
3. Register `https://claude.ai/api/mcp/auth_callback` for hosted Claude.
   Verify Claude Code separately with its documented port-agnostic localhost
   loopback callbacks.
4. Add the remote URL as a Claude Custom Connector and complete OAuth.
5. Confirm anonymous protected calls produce HTTP `401`, missing-permission
   calls produce HTTP `403`, and both include `WWW-Authenticate`.
6. Run the three listing prompts plus the prompt-injection and unrelated
   evaluation cases.
7. Test the current supported Claude web, Desktop, mobile, and Claude Code
   surfaces where available.
8. In Claude.ai, open **Admin Settings**, then **Connectors**, then
   **Submit Connector**.
9. Enter the listing, ownership, privacy, data-handling, support, and reviewer
   account details. The portal reads the live MCP tools from the server.
10. Submit the Connector. Do not make a separate Claude companion plugin a
    requirement.

For an already published Connector, deploy and verify the new tools against
the existing connection; a tool-only server update does not require a new
Connector submission. For a Connector that is still under review, confirm the
portal shows all `55` live tools before continuing the existing submission.

## Submit The Claude Community Plugin

1. Use `claude/mailrith` as the plugin root. The plugin complements the Claude
   Connector and is not required to use it.
2. Run `claude plugin validate --strict claude/mailrith` from
   `packages/agent-integrations`.
3. Load the plugin with `claude --plugin-dir claude/mailrith` from a clean
   profile.
4. Open `/mcp`, connect Mailrith through OAuth, and confirm the intended
   workspace and permissions.
5. Run the draft, preflight, prompt-injection, and unrelated evaluation cases.
6. Push the exact reviewed source to the public
   `anrawool/mailrith-agent-platform` repository.
7. Submit the public repository and plugin path through
   `https://platform.claude.com/plugins/submit`. Use the Claude organization
   form instead only when the owning Team or Enterprise organization will own
   the listing.
8. Record the submitted commit and review receipt. Approval publishes the
   plugin to Anthropic's community marketplace, not the separately curated
   official marketplace.

## Submit The Cursor Plugin

1. Validate `cursor/mailrith` against Cursor's current plugin schema. The
   validator receives the schema URL; do not add an undeclared `$schema`
   property to the plugin manifest.
2. Install the plugin from a clean local or public-source checkout.
3. Complete OAuth and confirm the exact submitted tool catalog is available.
4. Run the draft, preflight, test, schedule, and activation evaluation cases.
5. Complete the Cursor publisher application and Marketplace terms.
6. Submit the reviewed package and request re-indexing only when needed.

## List The Gemini CLI Extension

1. Confirm `gemini-extension.json` is at the absolute root of the public
   `anrawool/mailrith-agent-platform` repository.
2. Confirm the root `GEMINI.md` and `skills/mailrith-email-marketing` copy
   match the reviewed extension.
3. Install the extension from a clean profile with
   `gemini extensions install https://github.com/anrawool/mailrith-agent-platform`.
4. Restart Gemini CLI, complete OAuth, and confirm **mailrith** is connected
   with `/mcp list`.
5. Run the read-only connection check plus the draft, preflight,
   prompt-injection, and unrelated evaluation cases.
6. Add the `gemini-cli-extension` GitHub topic to the public repository.
7. Confirm the repository is public and the default branch is the stable
   release. Gemini's gallery crawler checks qualifying repositories daily; no
   separate submission form is required.

## Submit The GitHub Copilot Plugin

1. Use `claude/mailrith` as the shared Claude Code and GitHub Copilot plugin
   root.
2. Install it from a clean profile with
   `copilot plugin install anrawool/mailrith-agent-platform:packages/agent-integrations/claude/mailrith`.
3. Confirm `copilot mcp get mailrith` reports the remote HTTP server and its
   tools after OAuth.
4. Run the draft, preflight, prompt-injection, and unrelated evaluation cases.
5. Create an immutable public release tag and record its full commit SHA.
6. Submit the external plugin through the `github/awesome-copilot` issue form
   with the public repository, plugin path, semantic version, MIT license,
   immutable tag, and full SHA.
7. Confirm the automated `vally lint` and Copilot CLI install smoke tests pass
   before maintainer review.

## Prepare Microsoft MCP Certification

1. Follow `microsoft/README.md` to complete Partner Center verification,
   Microsoft 365 and Copilot enrollment, Azure Key Vault setup, and the fixed
   OAuth client registration.
2. Replace the two placeholders in `microsoft/manifest.template.json` and save
   the rendered file as `manifest.json` outside the repository.
3. Package `manifest.json`, `mcptools.json`, `intro.md`, `Color.png`, and
   `Outline.png` at the archive root.
4. Validate the package in the Microsoft 365 Developer Portal.
5. Use a synthetic reviewer workspace and run the shared functional and
   safety evaluation cases.
6. In Partner Center, update the existing **Apps and Agents for M365 and
   Copilot** offer when one exists. Create a new offer only for the first
   submission. Upload the validated package and complete the legal, support,
   privacy, and certification fields.

## Submit To Cline

1. Give a clean Cline profile only `packages/mcp-server/README.md` and
   `packages/mcp-server/llms-install.md`.
2. After publishing, confirm Cline installs `@mailrith/mcp-server@1.1.0`
   without cloning or building the monorepo.
3. Use a synthetic workspace API key and run only
   `discovery_get_capabilities`. Keep `autoApprove` empty.
4. Open a submission issue in `cline/mcp-marketplace` with the nested public
   repository URL, `cline/mailrith-logo-400.png`, the reason in
   `cline/README.md`, and the clean-install confirmation.

## Roll Back A Bad Release

1. Stop marketplace promotion and notify support.
2. Disable the affected agent rollout using Mailrith's existing rollout
   controls if tool execution is unsafe.
3. Revoke affected OAuth authorizations when credentials may be exposed or
   mis-scoped.
4. Restore the last reviewed server and package artifacts.
5. Re-run authorization, tool-catalog, and consequential-action checks before
   reopening access.
6. Record the incident using request IDs and existing operational logs; do not
   add raw Subscriber payloads or tokens to the incident record.

Product Engineering owns the MCP server and package rollback. Security owns
credential or authorization incidents. Support owns reviewer and marketplace
communications. An authorized Mailrith owner owns final marketplace actions.
