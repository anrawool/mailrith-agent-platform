# Mailrith CLI

Use Mailrith from a terminal or non-interactive agent runtime without building raw HTTP requests.

```bash
npx @mailrith/cli auth login
npx @mailrith/cli capabilities --json
npx @mailrith/cli operations search "schedule the newsletter" --json
npx @mailrith/cli operations describe scheduleBroadcast --json
npx @mailrith/cli call subscribers list --query limit=10 --json
```

`auth login` uses the **Full Email Marketing Access** profile by default, so the
CLI can use every public email-marketing operation in the selected workspace
after the user approves access. This includes secure email delivery setup,
Subscriber imports and exports, and Outbound Webhooks. It does not grant
billing, team, account-security, credential-reading, or internal
administration access.

Use a view-only connection when the workflow only needs reporting:

```bash
npx @mailrith/cli auth login --profile reporting
```

Repeat `--scope` to request an exact custom permission set. Explicit scopes
take precedence over `--profile`.

Every Work Profile shown by Mailrith OAuth is accepted by `--profile`; run
`npx @mailrith/cli --help` to list their stable keys.

The CLI is generated-SDK based. It keeps saved credentials in a mode-`0600` configuration file, never prints API keys, refresh tokens, or access tokens, and bounds automatic pagination.

A saved credential stays bound to the Mailrith API URL selected during login or
API-key setup. To use another API URL, save a credential for that URL or provide
a credential through the process environment. This prevents an accidental URL
override from sending a saved credential to another service.

Operation search and schema inspection do not require a credential or a
network request. Search uses the same bounded, in-memory intent catalog as the
MCP server. `operations describe` returns only the selected operation's exact
input schema and loads the larger contract only for that
explicit command; add `--include-output-schema` only when the response
contract is also needed.

See [Mailrith Developer Docs](https://mailrith.com/developers) for OAuth, safety, workflow, and configuration guidance.

## Official Builds And Forks

Modified public versions must use distinct package and service names and
clearly say that they are unofficial. See the
[Mailrith Trademark And Unofficial Fork Policy](https://github.com/anrawool/mailrith-agent-platform/blob/main/TRADEMARKS.md).
