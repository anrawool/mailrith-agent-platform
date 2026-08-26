# Mailrith Agent Skill

Install the Mailrith email marketing skill for Codex:

```bash
npx @mailrith/agent-skill install --agent codex
```

Install it for Claude:

```bash
npx @mailrith/agent-skill install --agent claude
```

Use `--target <directory>` for another skill directory. Existing installations are preserved as timestamped backups. Pass `--dry-run` to inspect the destination without changing files.

The package also includes reviewed connection templates in `connectors/`. Credentials are intentionally represented only by environment-variable placeholders.

## Official Builds And Forks

Modified public versions must use distinct package and plugin names and clearly
say that they are unofficial. See the
[Mailrith Trademark And Unofficial Fork Policy](https://github.com/anrawool/mailrith-agent-platform/blob/main/TRADEMARKS.md).
