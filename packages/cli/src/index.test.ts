import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
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
import { mailrithSdkResources, mailrithWorkProfiles } from "@mailrith/sdk";

const temporaryDirectories: string[] = [];

const createTemporaryConfigPath = async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "mailrith-cli-test-"));
  temporaryDirectories.push(directory);
  return path.join(directory, "mailrith", "config.json");
};

const writeTemporaryConfig = async (
  configPath: string,
  credential:
    | { kind: "api_key"; token: string }
    | {
        kind: "oauth";
        accessToken: string;
        refreshToken: string;
        expiresAt: string;
        clientId: string;
        tokenEndpoint: string;
        resource: string;
        redirectUri: string;
        scopes: string[];
      },
) => {
  await mkdir(path.dirname(configPath), { recursive: true });
  await writeFile(
    configPath,
    `${JSON.stringify({
      version: 1,
      baseUrl: "https://api.mailrith.com",
      credential,
    })}\n`,
  );
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
      "cli/1.1.2",
    );
    expect(stdout.join("\n")).not.toContain("mailrith_test_secret");
    expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
      ok: true,
      request_id: "req_server_123",
      status: 200,
    });
  });

  it.each([
    ["command flag", ["capabilities", "--base-url", "https://other.example", "--json"], {}],
    ["environment", ["capabilities", "--json"], { MAILRITH_API_BASE_URL: "https://other.example" }],
    ["doctor", ["doctor", "--base-url", "https://other.example", "--json"], {}],
  ])(
    "never sends a saved API key to a different API URL from the %s",
    async (_label, args, extraEnvironment) => {
      const configPath = await createTemporaryConfigPath();
      await writeTemporaryConfig(configPath, {
        kind: "api_key",
        token: "mailrith_saved_secret",
      });
      const fetchMock = vi.fn();
      const stderr: string[] = [];

      const exitCode = await runMailrithCli(args, {
        environment: {
          MAILRITH_CONFIG_FILE: configPath,
          ...extraEnvironment,
        },
        fetch: fetchMock as typeof fetch,
        stderr: (line) => stderr.push(line),
      });

      expect(exitCode).toBe(mailrithCliExitCodes.usage);
      expect(fetchMock).not.toHaveBeenCalled();
      expect(stderr.join("\n")).toContain("saved credential belongs to");
      expect(stderr.join("\n")).not.toContain("mailrith_saved_secret");
    },
  );

  it("rejects a saved OAuth URL mismatch before attempting token refresh", async () => {
    const configPath = await createTemporaryConfigPath();
    await writeTemporaryConfig(configPath, {
      kind: "oauth",
      accessToken: "expired_access_token",
      refreshToken: "saved_refresh_token",
      expiresAt: "2000-01-01T00:00:00.000Z",
      clientId: "client_123",
      tokenEndpoint: "https://api.mailrith.com/oauth/token",
      resource: "https://api.mailrith.com/v1",
      redirectUri: "http://127.0.0.1:53682/callback",
      scopes: ["workspace:read"],
    });
    const fetchMock = vi.fn();

    const exitCode = await runMailrithCli(
      ["capabilities", "--base-url", "https://other.example", "--json"],
      {
        environment: { MAILRITH_CONFIG_FILE: configPath },
        fetch: fetchMock as typeof fetch,
        stderr: () => undefined,
      },
    );

    expect(exitCode).toBe(mailrithCliExitCodes.usage);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    {
      label: "token endpoint",
      tokenEndpoint: "https://different.example/oauth/token",
      resource: "https://api.mailrith.com/v1",
    },
    {
      label: "resource",
      tokenEndpoint: "https://api.mailrith.com/oauth/token",
      resource: "https://different.example/v1",
    },
    {
      label: "token endpoint credentials",
      tokenEndpoint: "https://user:password@api.mailrith.com/oauth/token",
      resource: "https://api.mailrith.com/v1",
    },
  ])(
    "rejects a saved OAuth $label mismatch before sending a refresh token",
    async ({ tokenEndpoint, resource }) => {
      const configPath = await createTemporaryConfigPath();
      await writeTemporaryConfig(configPath, {
        kind: "oauth",
        accessToken: "expired_access_token",
        refreshToken: "saved_refresh_token",
        expiresAt: "2000-01-01T00:00:00.000Z",
        clientId: "client_123",
        tokenEndpoint,
        resource,
        redirectUri: "http://127.0.0.1:53682/callback",
        scopes: ["workspace:read"],
      });
      const fetchMock = vi.fn();

      const exitCode = await runMailrithCli(["capabilities", "--json"], {
        environment: { MAILRITH_CONFIG_FILE: configPath },
        fetch: fetchMock as typeof fetch,
        stderr: () => undefined,
      });

      expect(exitCode).toBe(mailrithCliExitCodes.usage);
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it("uses an unexpired OAuth credential created for the saved API URL", async () => {
    const configPath = await createTemporaryConfigPath();
    await writeTemporaryConfig(configPath, {
      kind: "oauth",
      accessToken: "saved_access_token",
      refreshToken: "saved_refresh_token",
      expiresAt: "2999-01-01T00:00:00.000Z",
      clientId: "client_123",
      tokenEndpoint: "https://api.mailrith.com/oauth/token",
      resource: "https://api.mailrith.com/v1",
      redirectUri: "http://127.0.0.1:53682/callback",
      scopes: ["workspace:read"],
    });
    const requests: Request[] = [];
    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      requests.push(new Request(input, init));
      return Response.json({ data: {} });
    });

    const exitCode = await runMailrithCli(["capabilities", "--json"], {
      environment: { MAILRITH_CONFIG_FILE: configPath },
      fetch: fetchMock as typeof fetch,
      stdout: () => undefined,
    });

    expect(exitCode).toBe(mailrithCliExitCodes.success);
    expect(requests).toHaveLength(1);
    expect(requests[0]?.url).toBe("https://api.mailrith.com/v1/capabilities");
    expect(requests[0]?.headers.get("authorization")).toBe(
      "Bearer saved_access_token",
    );
  });

  it("allows an equivalent saved URL and environment credentials for alternate URLs", async () => {
    const configPath = await createTemporaryConfigPath();
    await writeTemporaryConfig(configPath, {
      kind: "api_key",
      token: "mailrith_saved_secret",
    });
    const requestUrls: string[] = [];
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      requestUrls.push(new Request(input).url);
      return Response.json({ data: {} });
    });

    const savedExitCode = await runMailrithCli(
      ["capabilities", "--base-url", "https://api.mailrith.com/", "--json"],
      {
        environment: { MAILRITH_CONFIG_FILE: configPath },
        fetch: fetchMock as typeof fetch,
        stdout: () => undefined,
      },
    );
    const environmentExitCode = await runMailrithCli(
      ["capabilities", "--base-url", "https://other.example", "--json"],
      {
        environment: { MAILRITH_ACCESS_TOKEN: "environment_token" },
        fetch: fetchMock as typeof fetch,
        stdout: () => undefined,
      },
    );

    expect(savedExitCode).toBe(mailrithCliExitCodes.success);
    expect(environmentExitCode).toBe(mailrithCliExitCodes.success);
    expect(requestUrls).toEqual([
      "https://api.mailrith.com/v1/capabilities",
      "https://other.example/v1/capabilities",
    ]);
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
        request_id: expect.stringMatching(/^req_[0-9a-f-]{36}$/),
      },
    });
  });

  it.each([
    ["invalid_request", "Subscriber email must be valid."],
    ["invalid_broadcast", "Subject is required."],
    ["invalid_sequence", "Sequence name is required."],
    ["invalid_automation", "Automation name is required."],
    ["invalid_tag_name", "Tag name is required."],
    ["invalid_custom_field", "Custom field type is invalid."],
    ["invalid_template_body", "Template body is required."],
    ["invalid_form", "A published form must include an email field."],
    ["invalid_landing_page", "Landing page slug must be 2-80 URL-safe characters."],
    ["invalid_segment", "Segments cannot reference themselves or create circular references."],
    ["invalid_magic_link", "Destination URL must be a valid http or https URL."],
    ["invalid_email_delivery_connection", "From name is required."],
    ["invalid_webhook_event_patterns", "Select at least one webhook event pattern."],
    ["invalid_mappings", "Email field must be mapped to a CSV column."],
  ])("preserves safe validation guidance for %s", async (code, message) => {
    const stderr: string[] = [];
    const fetchMock = vi.fn(async () => Response.json({
      error: { code, message, details: { password: "do-not-print" } },
    }, { status: 400 }));
    const exitCode = await runMailrithCli(
      ["call", "subscribers", "list", "--json"],
      {
        environment: { MAILRITH_API_KEY: "test_key" },
        fetch: fetchMock,
        stderr: (line) => stderr.push(line),
      },
    );
    expect(exitCode).toBe(mailrithCliExitCodes.usage);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(JSON.parse(stderr[0]!)).toMatchObject({ error: {
      code, message,
      details: { help_command: "mailrith operations describe listSubscribers --json" },
    } });
    expect(stderr.join("\n")).not.toContain("do-not-print");
  });

  it.each([false, true])("explains shared-connection conflicts in JSON=%s output", async (json) => {
    const stderr: string[] = [];
    const exitCode = await runMailrithCli([
      "call", "emailDeliveryConnections", "update",
      "--path", "connection_id=connection_test", ...(json ? ["--json"] : []),
    ], {
      environment: { MAILRITH_API_KEY: "test_key" },
      fetch: vi.fn(async () => Response.json({ error: {
        code: "shared_email_delivery_connection_requires_ui",
        message: "server-secret",
      } }, { status: 409 })),
      stderr: (line) => stderr.push(line),
    });
    expect(exitCode).toBe(mailrithCliExitCodes.conflict);
    expect(stderr.join("\n")).toContain("Manage it in Mailrith.");
    expect(stderr.join("\n")).toContain("shared_email_delivery_connection_requires_ui");
    expect(stderr.join("\n")).not.toContain("server-secret");
  });

  it("reports every missing ID for every generated operation before requesting it", async () => {
    const fetchMock = vi.fn();
    let checked = 0;
    for (const resource of mailrithSdkResources) {
      for (const operation of resource.operations) {
        const fields = [...operation.path.matchAll(/\{([^}]+)\}/g)].map((match) => match[1]!);
        for (const missingField of fields) {
          const stderr: string[] = [];
          const exitCode = await runMailrithCli([
            "operations", "run", operation.operationId, "--json",
            ...fields.filter((field) => field !== missingField)
              .flatMap((field) => ["--path", `${field}=test_id`]),
          ], {
            environment: { MAILRITH_API_KEY: "test_key" },
            fetch: fetchMock,
            stderr: (line) => stderr.push(line),
          });
          expect(exitCode, operation.operationId).toBe(mailrithCliExitCodes.usage);
          expect(JSON.parse(stderr[0]!)).toMatchObject({ error: {
            code: "invalid_usage",
            message: `Provide --path ${missingField}=<value> for this operation.`,
            details: { field: missingField },
          } });
          checked += 1;
        }
      }
    }
    expect(checked).toBeGreaterThan(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([[], ["--path", "subscriber_id="], ["--path", "subscriber_id= "],
    ["--path", "subscriber_id=first", "--path", "subscriber_id=second"],
  ])("explains invalid path arguments without a request: %j", async (...pathArgs) => {
    const stderr: string[] = [];
    const fetchMock = vi.fn();
    const exitCode = await runMailrithCli([
      "call", "subscribers", "get", ...pathArgs, "--json",
    ], {
      environment: { MAILRITH_API_KEY: "test_key" },
      fetch: fetchMock,
      stderr: (line) => stderr.push(line),
    });
    expect(exitCode).toBe(mailrithCliExitCodes.usage);
    expect(stderr.join("\n")).toContain("--path subscriber_id=<value>");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("prints the input-schema help command for text validation failures", async () => {
    const stderr: string[] = [];
    const exitCode = await runMailrithCli(["subscribers", "sync"], {
      environment: { MAILRITH_API_KEY: "test_key" },
      fetch: vi.fn(async () => Response.json({ error: {
        code: "invalid_request", message: "Subscriber email must be valid.",
      } }, { status: 400 })),
      stderr: (line) => stderr.push(line),
    });
    expect(exitCode).toBe(mailrithCliExitCodes.usage);
    expect(stderr[0]).toBe("invalid_request: Subscriber email must be valid.");
    expect(stderr.join("\n")).toContain("mailrith operations describe upsertSubscriber --json");
  });

  it("keeps authentication, conflict, rate-limit and transient exits distinct", async () => {
    for (const [status, expected] of [
      [401, mailrithCliExitCodes.authentication],
      [403, mailrithCliExitCodes.permission],
      [404, mailrithCliExitCodes.notFound],
      [409, mailrithCliExitCodes.conflict],
      [429, mailrithCliExitCodes.rateLimit],
      [408, mailrithCliExitCodes.transient],
      [500, mailrithCliExitCodes.transient],
      [503, mailrithCliExitCodes.transient],
      [400, mailrithCliExitCodes.usage],
      [405, mailrithCliExitCodes.usage],
      [413, mailrithCliExitCodes.usage],
      [415, mailrithCliExitCodes.usage],
      [422, mailrithCliExitCodes.usage],
    ]) {
      const stderr: string[] = [];
      const exitCode = await runMailrithCli(["capabilities", "--json"], {
        environment: { MAILRITH_API_KEY: "test_key" },
        fetch: vi.fn(async () => Response.json({ error: {
          code: "invalid_request", message: "Subject is required.",
        } }, { status })),
        stderr: (line) => stderr.push(line),
      });
      expect(exitCode, String(status)).toBe(expected);
      if (status >= 500 || status === 408) {
        expect(stderr.join("\n")).not.toContain("Subject is required.");
      }
    }
  });

  it("identifies an invalid API URL as a usage error before requesting it", async () => {
    const stderr: string[] = [];
    const fetchMock = vi.fn();
    const exitCode = await runMailrithCli([
      "capabilities", "--base-url", "not-a-url", "--json",
    ], {
      environment: { MAILRITH_API_KEY: "test_key" },
      fetch: fetchMock,
      stderr: (line) => stderr.push(line),
    });
    expect(exitCode).toBe(mailrithCliExitCodes.usage);
    expect(JSON.parse(stderr[0]!)).toMatchObject({ error: { code: "invalid_usage" } });
    expect(stderr.join("\n")).toContain("URL");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("explains missing credentials with an authentication exit", async () => {
    const stderr: string[] = [];
    const fetchMock = vi.fn();
    const exitCode = await runMailrithCli(["capabilities", "--json"], {
      environment: { MAILRITH_CONFIG_FILE: await createTemporaryConfigPath() },
      fetch: fetchMock,
      stderr: (line) => stderr.push(line),
    });
    expect(exitCode).toBe(mailrithCliExitCodes.authentication);
    expect(JSON.parse(stderr[0]!)).toMatchObject({ error: { code: "credential_required" } });
    expect(stderr.join("\n")).toContain("mailrith auth login");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    ["invalid_request", "Subject is required.\nsecret"],
    ["invalid_request", "x".repeat(2048)],
    ["constructor", "secret"],
    ["__proto__", "secret"],
    ["secret", "Subject is required."],
    ["x".repeat(2048), "secret"],
  ])("does not trust arbitrary API codes or partial message matches", async (code, message) => {
    const stderr: string[] = [];
    const exitCode = await runMailrithCli(["capabilities", "--json"], {
      environment: { MAILRITH_API_KEY: "test_key" },
      fetch: vi.fn(async () => Response.json({ error: {
        code, message, details: { field: "secret" },
      } }, { status: 400, headers: { "x-mailrith-request-id": "secret" } })),
      stderr: (line) => stderr.push(line),
    });
    expect(exitCode).toBe(mailrithCliExitCodes.usage);
    expect(stderr.join("\n")).not.toContain("secret");
    expect(stderr.join("\n")).not.toContain("Subject is required.");
    expect(stderr.join("\n")).not.toContain("x".repeat(200));
  });

  it("does not print secrets echoed by API or network errors", async () => {
    const secret = "mailrith_secret_that_must_not_be_logged";
    for (const fetchImpl of [
      vi.fn(async () =>
        Response.json(
          {
            error: {
              code: secret,
              message: secret,
              credential_type: "workspace_api_key",
              missing_scopes: [secret],
              recovery: {
                action: "replace_api_key",
                message: secret,
                replacement_scopes: [secret],
              },
            },
          },
          {
            status: 500,
            headers: { "x-mailrith-request-id": secret },
          },
        ),
      ),
      vi.fn(async () => {
        throw new Error(secret);
      }),
    ]) {
      const stderr: string[] = [];
      const exitCode = await runMailrithCli(["capabilities", "--json"], {
        environment: {
          MAILRITH_API_KEY: secret,
          MAILRITH_API_BASE_URL: "https://api.mailrith.test",
        },
        fetch: fetchImpl as typeof fetch,
        stderr: (line) => stderr.push(line),
      });

      expect(exitCode).toBe(mailrithCliExitCodes.transient);
      expect(stderr.join("\n")).not.toContain(secret);
    }
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
      "Permission help: https://mailrith.com/developers/authentication#add-permissions",
    );
  });

  it("does not print server-provided credential recovery text or URLs", async () => {
    const secret = "mailrith_recovery_secret";
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
              message: secret,
              credential_type: "workspace_api_key",
              recovery: {
                action: "replace_api_key",
                message: secret,
                access_update_url: `https://example.test/${secret}`,
              },
            },
          },
          { status: 403 },
        ),
      ) as typeof fetch,
      stderr: (line) => stderr.push(line),
    });

    expect(exitCode).toBe(mailrithCliExitCodes.permission);
    expect(stderr.join("\n")).not.toContain(secret);
    expect(stderr).toContain(
      "Next step: Create and install a replacement API key with the missing permission.",
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
