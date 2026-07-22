import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { mailrithCliExitCodes, runMailrithCli } from "./index.js";

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
      "cli/0.1.0-beta.1",
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
        data: [{ id: `activity_${page}` }],
        pagination: { has_more: true, next_cursor: `cursor_${page}` },
      });
    });

    const exitCode = await runMailrithCli(
      ["activity", "list", "--all", "--max-pages", "2", "--json"],
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

  it("blocks approval-token issuance through the generic command", async () => {
    const fetchMock = vi.fn();
    const stderr: string[] = [];

    const exitCode = await runMailrithCli(
      ["call", "agentActions", "issueApprovalToken", "--path", "action_id=action_1", "--json"],
      {
        environment: {
          MAILRITH_API_KEY: "mailrith_test_secret",
          MAILRITH_API_BASE_URL: "https://api.mailrith.test",
        },
        fetch: fetchMock as typeof fetch,
        stderr: (line) => stderr.push(line),
      },
    );

    expect(exitCode).toBe(mailrithCliExitCodes.usage);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(JSON.parse(stderr[0] ?? "{}")).toMatchObject({
      ok: false,
      error: { code: "invalid_usage" },
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
});
