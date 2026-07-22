# Mailrith CLI

Use Mailrith from a terminal or non-interactive agent runtime without building raw HTTP requests.

```bash
npx @mailrith/cli auth login
npx @mailrith/cli capabilities --json
npx @mailrith/cli activity list --json
```

The CLI is generated-SDK based. It keeps saved credentials in a mode-`0600` configuration file, never prints API keys, refresh tokens, access tokens, or approval tokens, and bounds automatic pagination.

See [Mailrith Developer Docs](https://mailrith.com/developers) for OAuth, safety, workflow, and configuration guidance.
