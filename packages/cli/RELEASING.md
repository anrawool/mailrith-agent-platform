# Releasing The CLI

CLI `1.1.2` was published to npm on September 4, 2026. It adds clearer API errors,
missing-ID guidance, and request-file errors. The public contract, SDK, MCP
server, Agent Skill, Python SDK, and prepared marketplace packages remain at
`1.1.1`. Microsoft's review package remains `1.1.1`.

## CLI 1.1.2 Publication

The [publication workflow](https://github.com/anrawool/mailrith-agent-platform/actions/runs/33892905851)
passed preparation, checksum verification, npm publishing with provenance, and
a clean installation from the public registries. npm marks `1.1.2` as `latest`.
The published CLI archive SHA-256 is
`1afbdfa357b5e15b7c00fbe039d1631a1388336f20b9361fc71f2fe5e4ccc44b`.

## Independent CLI Versions

In `packages/agent-release-config.json`, `cli_release_version` owns the CLI
version and `cli_release_status` records whether it has been published.
`release_version` continues to own the other npm packages. The CLI package
version and reported runtime version must match `cli_release_version`.

The CLI keeps its compatible public-contract and SDK dependencies. A CLI
patch does not require publishing those dependencies again or changing a
marketplace submission. The release verifier checks each version separately.

## Prepare And Publish

1. Review and commit the CLI source, tests, version config, generated release
   manifest, and release workflow in the public `mailrith-agent-platform`
   repository. Keep private application changes out of that repository.
2. In GitHub Actions, open **Release Agent Packages**. Select **Run workflow**,
   choose the reviewed branch, and set **publish_target** to **prepare-cli**.
   This runs the release checks and builds a checksummed CLI archive without
   publishing or rebuilding the Python and marketplace archives.
3. Review the successful run and its `mailrith-agent-packages` artifact. Its
   npm folder should contain only `mailrith-cli-1.1.2.tgz`.
4. Merge the reviewed source into **main** after its required checks pass.
   The production environment permits publication from **main**. Run the
   workflow on **main** with **publish_target** set to **cli**. Complete the existing
   `agent-packages-production` environment approval. This publishes only the
   CLI, with provenance, and verifies a fresh installation alongside the
   existing versions of the other packages. The installed CLI must report
   `1.1.2`.
5. After the clean-install job succeeds, change `cli_release_status` to
   `published`, run `pnpm agent:release:manifest`, and commit the release record.

Use **verify** to repeat the public-registry checks after publication without
publishing again. Do not use **npm**, **all**, or an `agent-v*` tag push for this
CLI-only patch: those select a coordinated release and would try to republish
the existing packages. Never move the existing `agent-v1.1.1` tag or overwrite
its archives. A CLI-only release does not require an `agent-v1.1.2` tag.

For a future coordinated release, update both the coordinated version and the
CLI version explicitly, along with the existing Python and marketplace version
fields as appropriate.
