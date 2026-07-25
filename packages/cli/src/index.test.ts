import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  mailrithCliDefaultOAuthScopes,
  mailrithCliDefaultOAuthProfile,
  mailrithCliExitCodes,
  mailrithCliOAuthProfiles,
  resolveMailrithCliOAuthScopes,
  runMailrithCli,
} from "./index.js";
import { mailrithWorkProfiles } from "@mailrith/sdk";

const temporaryDirectories: string[] = [];

const createTemporaryConfigPath = async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "mailrith-cli-test-"));
  temporaryDirectories.push(directory);
  return path.join(directory, "mailrith", "config.json");
};

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
});

describe("Mailrith CLI", () => {
  it("uses Full Email Marketing Access by default and preserves narrower overrides", () => {
    expect(mailrithCliDefaultOAuthProfile).toBe("full_email_marketing_access");
    expect(mailrithCliDefaultOAuthScopes).toEqual(
      mailrithCliOAuthProfiles.full_email_marketing_access,
    );
    expect(mailrithCliDefaultOAuthScopes).toEqual(
      expect.arrayContaining([
        "workspace:read",
        "subscribers:read",
        "subscribers:write",
        "broadcasts:read",
        "broadcasts:write",
        "email_delivery_connections:write",
        "subscribers:import",
        "subscribers:export",
        "webhooks:write",
      ]),
    );
    expect(mailrithCliDefaultOAuthScopes).toEqual(
      mailrithWorkProfiles.find(
        (profile) => profile.key === mailrithCliDefaultOAuthProfile,
      )?.scopeKeys,
    );
    expect(Object.keys(mailrithCliOAuthProfiles)).toEqual(
      mailrithWorkProfiles.map((profile) => profile.key),
    );
    expect(resolveMailrithCliOAuthScopes({ profile: "email_delivery_setup" })).toEqual(
      mailrithCliOAuthProfiles.email_delivery_setup,
    );
    expect(resolveMailrithCliOAuthScopes({ profile: "reporting" })).toEqual(
      mailrithCliOAuthProfiles.reporting,
    );
    expect(
      resolveMailrithCliOAuthScopes({
        profile: "reporting",
        scopes: ["workspace:read", "subscribers:read", "workspace:read"],
      }),
    ).toEqual(["workspace:read", "subscribers:read"]);
    expect(() =>
      resolveMailrithCliOAuthScopes({ profile: "unknown" }),
    ).toThrow("--profile must be");
  });

  it("searches operations without requiring a credential or network request", async () => {
    const stdout: string[] = [];
    const fetchMock = vi.fn();
    const exitCode = await runMailrithCli(
      [
        "operations",
        "search",
        "cancel",
        "the",
        "scheduled",
        "newsletter",
        "--json",
      ],
      {
        environment: {},
        fetch: fetchMock as typeof fetch,
        stdout: (line) => stdout.push(line),
      },
    );

    expect(exitCode).toBe(mailrithCliExitCodes.success);
    expect(fetchMock).not.toHaveBeenCalled();
    const payload = JSON.parse(stdout[0] ?? "{}") as {
      data?: {
        data?: Array<Record<string, unknown>>;
        selection?: Record<string, unknown>;
      };
    };
    expect(payload).toMatchObject({
      ok: true,
      event: "operation_search",
      data: {
        selection: {
          status: "recommended",
          recommended_operation_id: "unscheduleBroadcast",
        },
      },
    });
    expect(payload.data?.data?.[0]).toMatchObject({
      operation_id: "unscheduleBroadcast",
      category: "live",
      method_name: "unschedule",
      cli_command: "mailrith operations run unscheduleBroadcast",
      mcp_execution_tool: "mailrith_live",
    });
  });

  it("describes one exact operation schema without requiring a credential", async () => {
    const stdout: string[] = [];
    const fetchMock = vi.fn();
    const exitCode = await runMailrithCli(
      ["operations", "describe", "scheduleBroadcast", "--json"],
      {
        environment: {},
        fetch: fetchMock as typeof fetch,
        stdout: (line) => stdout.push(line),
      },
    );

    expect(exitCode).toBe(mailrithCliExitCodes.success);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
      ok: true,
      event: "operation_schema",
      data: {
        operation_id: "scheduleBroadcast",
        method: "PUT",
        path: "/v1/broadcasts/{broadcast_id}/schedule",
        category: "live",
        method_name: "schedule",
        cli_command: "mailrith operations run scheduleBroadcast",
        input_schema: {
          type: "object",
          required: expect.arrayContaining(["broadcast_id", "body"]),
        },
      },
    });
    expect(
      (JSON.parse(stdout[0] ?? "{}") as { data?: Record<string, unknown> })
        .data,
    ).not.toHaveProperty("output_schema");
  });

  it("runs a discovered operation by operation id", async () => {
    const configPath = await createTemporaryConfigPath();
    const stdout: string[] = [];
    const requests: Request[] = [];
    const exitCode = await runMailrithCli(
      [
        "operations",
        "run",
        "getBroadcast",
        "--path",
        "broadcast_id=broadcast-1",
        "--json",
      ],
      {
        environment: {
          MAILRITH_API_KEY: "mrk_test",
          MAILRITH_CONFIG_FILE: configPath,
        },
        fetch: vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
          requests.push(new Request(input, init));
          return Response.json({ data: { id: "broadcast-1" } });
        }) as typeof fetch,
        stdout: (line) => stdout.push(line),
      },
    );

    expect(exitCode).toBe(mailrithCliExitCodes.success);
    expect(requests).toHaveLength(1);
    expect(requests[0]?.url).toBe(
      "https://api.mailrith.com/v1/broadcasts/broadcast-1",
    );
    expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
      ok: true,
      data: { id: "broadcast-1" },
    });
  });

  it("stores API keys in a private config file without printing the secret", async () => {
    const configPath = await createTemporaryConfigPath();
    const stdout: string[] = [];
    const secret = "mailrith_test_secret";

    const exitCode = await runMailrithCli(["auth", "set-key", "--json"], {
      environment: {
        MAILRITH_API_KEY: secret,
        MAILRITH_CONFIG_FILE: configPath,
      },
      stdout: (line) => stdout.push(line),
    });

    expect(exitCode).toBe(mailrithCliExitCodes.success);
    expect(stdout.join("\n")).not.toContain(secret);
    expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
      ok: true,
      data: { configured: true, kind: "api_key" },
    });
    expect(JSON.parse(await readFile(configPath, "utf8"))).toMatchObject({
      credential: { kind: "api_key", token: secret },
    });
    expect((await stat(configPath)).mode & 0o777).toBe(0o600);
  });

  it("emits structured capabilities output with the server request ID", async () => {
    const requests: Request[] = [];
    const stdout: string[] = [];
    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const request = new Request(input, init);
      requests.push(request);
      return Response.json(
        { data: { contract_version: "2026-07-21" } },
        { headers: { "x-mailrith-request-id": "req_server_123" } },
      );
    });

    const exitCode = await runMailrithCli(["capabilities", "--json"], {
      environment: {
        MAILRITH_API_KEY: "mailrith_test_secret",
        MAILRITH_API_BASE_URL: "https://api.mailrith.test",
      },
      fetch: fetchMock as typeof fetch,
      stdout: (line) => stdout.push(line),
    });

    expect(exitCode).toBe(mailrithCliExitCodes.success);
    expect(requests).toHaveLength(1);
    expect(requests[0]?.url).toBe("https://api.mailrith.test/v1/capabilities");
    expect(requests[0]?.headers.get("authorization")).toBe(
      "Bearer mailrith_test_secret",
    );
    expect(requests[0]?.headers.get("x-mailrith-client")).toBe(
      "cli/0.2.0",
    );
    expect(stdout.join("\n")).not.toContain("mailrith_test_secret");
    expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
      ok: true,
      request_id: "req_server_123",
      status: 200,
    });
  });

  it("stops cursor pagination at the configured bounded page count", async () => {
    const requestedUrls: string[] = [];
    const stderr: string[] = [];
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const request = new Request(input);
      requestedUrls.push(request.url);
      const page = requestedUrls.length;
      return Response.json({
        data: [{ id: `subscriber_${page}` }],
        pagination: { has_more: true, next_cursor: `cursor_${page}` },
      });
    });

    const exitCode = await runMailrithCli(
      [
        "call",
        "subscribers",
        "list",
        "--all",
        "--max-pages",
        "2",
        "--json",
      ],
      {
        environment: {
          MAILRITH_API_KEY: "mailrith_test_secret",
          MAILRITH_API_BASE_URL: "https://api.mailrith.test",
        },
        fetch: fetchMock as typeof fetch,
        stdout: () => undefined,
        stderr: (line) => stderr.push(line),
      },
    );

    expect(exitCode).toBe(mailrithCliExitCodes.usage);
    expect(requestedUrls).toHaveLength(2);
    expect(requestedUrls[1]).toContain("cursor=cursor_1");
    expect(requestedUrls[1]).toContain("starting_after=cursor_1");
    expect(JSON.parse(stderr[0] ?? "{}")).toMatchObject({
      ok: false,
      error: { code: "invalid_usage" },
    });
  });

  it("returns one bounded page successfully with continuation metadata", async () => {
    const stdout: string[] = [];
    const exitCode = await runMailrithCli(
      ["call", "subscribers", "list", "--json"],
      {
        environment: {
          MAILRITH_API_KEY: "mailrith_test_secret",
          MAILRITH_API_BASE_URL: "https://api.mailrith.test",
        },
        fetch: vi.fn(async () =>
          Response.json({
            data: [{ id: "subscriber_1" }],
            pagination: {
              has_more: true,
              next_cursor: "cursor_1",
            },
          }),
        ) as typeof fetch,
        stdout: (line) => stdout.push(line),
      },
    );

    expect(exitCode).toBe(mailrithCliExitCodes.success);
    expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
      ok: true,
      data: [{ id: "subscriber_1" }],
      pagination: { has_more: true, next_cursor: "cursor_1" },
    });
  });

  it("maps API permission failures to a stable exit and request ID", async () => {
    const stderr: string[] = [];
    const exitCode = await runMailrithCli(["capabilities", "--json"], {
      environment: {
        MAILRITH_API_KEY: "mailrith_test_secret",
        MAILRITH_API_BASE_URL: "https://api.mailrith.test",
      },
      fetch: vi.fn(async () =>
        Response.json(
          { error: { code: "insufficient_scope", message: "Not allowed." } },
          {
            status: 403,
            headers: { "x-mailrith-request-id": "req_denied_123" },
          },
        ),
      ) as typeof fetch,
      stderr: (line) => stderr.push(line),
    });

    expect(exitCode).toBe(mailrithCliExitCodes.permission);
    expect(JSON.parse(stderr[0] ?? "{}")).toMatchObject({
      ok: false,
      error: {
        code: "insufficient_scope",
        request_id: "req_denied_123",
      },
    });
  });

  it("prints the credential-specific recovery step for permission failures", async () => {
    const stderr: string[] = [];
    const exitCode = await runMailrithCli(["capabilities"], {
      environment: {
        MAILRITH_API_KEY: "mailrith_test_secret",
        MAILRITH_API_BASE_URL: "https://api.mailrith.test",
      },
      fetch: vi.fn(async () =>
        Response.json(
          {
            error: {
              code: "insufficient_scope",
              message: "Missing broadcasts:write.",
              credential_type: "workspace_api_key",
              missing_scopes: ["broadcasts:write"],
              recovery: {
                action: "replace_api_key",
                message:
                  "Create and install a replacement API key with the missing permission.",
                access_update_url:
                  "https://app.mailrith.test/settings?tab=api-keys",
              },
            },
          },
          { status: 403 },
        ),
      ) as typeof fetch,
      stderr: (line) => stderr.push(line),
    });

    expect(exitCode).toBe(mailrithCliExitCodes.permission);
    expect(stderr).toContain(
      "Next step: Create and install a replacement API key with the missing permission.",
    );
    expect(stderr).toContain(
      "Update access: https://app.mailrith.test/settings?tab=api-keys",
    );
  });

  it("executes an authorized Broadcast send without a second CLI confirmation", async () => {
    const requests: Request[] = [];
    const fetchMock = vi.fn(
      async (input: string | URL | Request, init?: RequestInit) => {
        const request = new Request(input, init);
        requests.push(request);
        return Response.json({
          data: { status: "completed", resource: { id: "broadcast_123" } },
        });
      },
    );

    const exitCode = await runMailrithCli(
      [
        "call",
        "broadcasts",
        "send",
        "--path",
        "broadcast_id=broadcast_123",
        "--idempotency-key",
        "broadcast-send-123",
        "--json",
      ],
      {
        environment: {
          MAILRITH_API_KEY: "mailrith_test_secret",
          MAILRITH_API_BASE_URL: "https://api.mailrith.test",
        },
        fetch: fetchMock as typeof fetch,
        stdout: () => undefined,
      },
    );

    expect(exitCode).toBe(mailrithCliExitCodes.success);
    expect(requests).toHaveLength(1);
    expect(requests[0]?.method).toBe("POST");
    expect(requests[0]?.url).toBe(
      "https://api.mailrith.test/v1/broadcasts/broadcast_123/send",
    );
    expect(requests[0]?.headers.get("idempotency-key")).toBe(
      "broadcast-send-123",
    );
  });
});
