# Mailrith Agent Platform

This public repository contains the versioned developer surfaces for building safe AI agent email marketing workflows with [Mailrith](https://mailrith.com):

- The public API, OAuth, scope, risk, and MCP contract
- The official TypeScript and Python SDKs
- The local and self-hosted MCP server
- The Mailrith CLI
- The installable Mailrith Agent Skill and supported-client connection templates

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
pnpm agent:release:manifest
```

Commit the contract and every regenerated artifact in the same change.

## Releases

The `Release Agent Packages` workflow prepares checksummed packages on every manual run. Publishing requires the protected `agent-packages-production` environment, npm credentials, and PyPI Trusted Publishing. A matching `agent-v<version>` tag or an explicitly approved publish run starts publication.

Mailrith publishes the npm and Python packages as one coordinated stable version. The release manifest records the current version, contract digest, package digests, and public-registry status.

## Security

Do not report security vulnerabilities in public issues. Follow [SECURITY.md](SECURITY.md).

## License

MIT
