# Mailrith Agent Platform

This public repository contains the versioned developer surfaces for building safe AI agent email marketing workflows with [Mailrith](https://mailrith.com):

- The public API, OAuth, scope, risk, and MCP contract
- The official TypeScript and Python SDKs
- The local and self-hosted MCP server
- The Mailrith CLI
- The installable Mailrith Agent Skill and supported-client connection templates
- The installable ChatGPT/Codex, Claude Code, GitHub Copilot CLI, and Cursor
  plugin packages
- The Gemini CLI extension
- The Claude Connector listing, Microsoft certification package, Cline
  installation guide, and shared submission materials

The hosted Mailrith application and its private infrastructure remain in a separate private repository. This repository intentionally contains no application source, database migrations, deployment credentials, customer data, or private operational configuration.

## Development

Requirements: Node.js 20 or newer, pnpm 11.7.0, and Python 3.10 or newer.

```bash
pnpm install --frozen-lockfile
pnpm validate
```

Generated SDK and MCP files come from `packages/public-api`. Change the public contract first, then run:

```bash
pnpm generate:agent-artifacts
pnpm generate:agent-integrations
pnpm agent:release:manifest
```

Commit the contract and every regenerated artifact in the same change.

## Releases

The `Release Agent Packages` workflow prepares checksummed npm, Python, and
platform packages on every manual run. Publishing requires the protected
`agent-packages-production` environment and trusted publishing configured for
npm and PyPI. A matching `agent-v<version>` tag or an explicitly approved
publish run starts publication.

The npm, Python, and marketplace submission versions advance independently
through the coordinated workflow. This keeps already-submitted marketplace
archives unchanged while another package channel receives a compatible
patch release. The release manifest records each version, the contract digest,
package digests, and public-registry status.

The platform archives are submission-ready files for OpenAI, Claude, Cursor,
Gemini CLI, GitHub Copilot CLI, Microsoft, and Cline. Provider review and
public directory approval are separate from npm and PyPI publication.

## Security

Do not report security vulnerabilities in public issues. Follow [SECURITY.md](SECURITY.md).

## Official Builds And Forks

Forking the code is allowed. Modified public versions must use distinct names
and clearly say that they are unofficial and not affiliated with Mailrith. See
the [Mailrith Trademark And Unofficial Fork Policy](TRADEMARKS.md).

## License

The code is available under the MIT License. Mailrith brand identifiers are not
licensed with the code.
