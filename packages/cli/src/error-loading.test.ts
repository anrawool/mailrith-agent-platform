import { afterEach, expect, it, vi } from "vitest";

afterEach(() => {
  vi.doUnmock("./api-errors.js");
  vi.resetModules();
});

it("keeps the error catalog out of operation search and successful requests", async () => {
  vi.resetModules();
  vi.doMock("./api-errors.js", () => {
    throw new Error("The error catalog must only load after an API failure.");
  });
  const { runMailrithCli } = await import("./index.js");
  const fetchMock = vi.fn(async (_input: string | URL | Request) => Response.json({ data: [] }));
  const stdout: string[] = [];
  const stderr: string[] = [];
  const dependencies = {
    environment: { MAILRITH_API_KEY: "test_key" },
    fetch: fetchMock,
    stdout: (line: string) => stdout.push(line),
    stderr: (line: string) => stderr.push(line),
  };
  expect(await runMailrithCli([
    "operations", "search", "find Subscribers", "--json",
  ], dependencies)).toBe(0);
  expect(JSON.parse(stdout[0]!).data.data.length).toBeGreaterThan(0);
  expect(fetchMock).not.toHaveBeenCalled();
  expect(await runMailrithCli([
    "call", "subscribers", "get", "--path", "subscriber_id=0", "--json",
  ], dependencies)).toBe(0);
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(String(fetchMock.mock.calls[0]?.[0])).toContain("/subscribers/0");
  expect(stderr).toEqual([]);
});
