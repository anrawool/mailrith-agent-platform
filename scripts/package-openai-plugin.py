"""Build the OpenAI plugin portal ZIP from packages/agent-integrations/openai.

The portal's "Upload new version" flow expects the plugin files at the ZIP
root and a manifest whose name is the existing OpenAI app id. The source
package keeps the readable name "mailrith", so this script rewrites only that
one field in the copy it packs.

Usage: python scripts/package-openai-plugin.py OUTPUT.zip
"""

from __future__ import annotations

import json
import re
import sys
import zipfile
from pathlib import Path

REPOSITORY_ROOT = Path(__file__).resolve().parent.parent
OPENAI_ROOT = REPOSITORY_ROOT / "packages" / "agent-integrations" / "openai"
PLUGIN_ROOT = OPENAI_ROOT / "mailrith"
MANIFEST_PATH = ".codex-plugin/plugin.json"
FIXED_TIMESTAMP = (1980, 1, 1, 0, 0, 0)
SKIPPED_NAMES = {".DS_Store"}


def read_package_name() -> str:
    portal = json.loads((OPENAI_ROOT / "portal.json").read_text("utf-8"))
    package_name = portal.get("package_name", "")
    if not re.fullmatch(r"app-[0-9a-f]{32}", package_name):
        raise SystemExit(f"portal.json package_name is not an OpenAI app id: {package_name!r}")
    return package_name


def portal_manifest(package_name: str) -> bytes:
    manifest = json.loads((PLUGIN_ROOT / MANIFEST_PATH).read_text("utf-8"))
    manifest["name"] = package_name
    return (json.dumps(manifest, indent=2, ensure_ascii=False) + "\n").encode("utf-8")


def check_mcp_config() -> None:
    config = json.loads((PLUGIN_ROOT / ".mcp.json").read_text("utf-8"))
    for name, server in config.get("mcpServers", {}).items():
        overrides = {"oauth_resource", "auth", "extensions"} & set(server)
        if overrides:
            raise SystemExit(
                f".mcp.json server {name!r} sets {sorted(overrides)}; the portal reuses the "
                "existing app's authentication and rejects auth overrides."
            )


def build(output: Path) -> list[str]:
    package_name = read_package_name()
    check_mcp_config()
    files = sorted(
        path
        for path in PLUGIN_ROOT.rglob("*")
        if path.is_file() and path.name not in SKIPPED_NAMES
    )
    names: list[str] = []
    output.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for path in files:
            name = path.relative_to(PLUGIN_ROOT).as_posix()
            data = portal_manifest(package_name) if name == MANIFEST_PATH else path.read_bytes()
            info = zipfile.ZipInfo(name, date_time=FIXED_TIMESTAMP)
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(info, data)
            names.append(name)
    if MANIFEST_PATH not in names:
        raise SystemExit(f"{MANIFEST_PATH} is missing from the OpenAI plugin package.")
    return names


def main(argv: list[str]) -> None:
    if len(argv) != 2:
        raise SystemExit("Usage: python scripts/package-openai-plugin.py OUTPUT.zip")
    names = build(Path(argv[1]))
    print(f"Packed {len(names)} files into {argv[1]}")


if __name__ == "__main__":
    main(sys.argv)
