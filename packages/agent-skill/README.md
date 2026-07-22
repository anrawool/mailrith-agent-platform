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
