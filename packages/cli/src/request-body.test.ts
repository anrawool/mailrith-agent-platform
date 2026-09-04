import { createReadStream } from "node:fs";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import { mailrithSdkResources } from "@mailrith/sdk";
import { afterEach, describe, expect, it, vi } from "vitest";
import { mailrithCliExitCodes, runMailrithCli } from "./index.js";

const input = vi.hoisted(() => ({ stream: undefined as NodeJS.ReadableStream | undefined }));
vi.mock("node:process", async (importOriginal) => {
  const original = await importOriginal<typeof import("node:process")>();
  return { ...original, get stdin() { return input.stream ?? original.stdin; } };
});
vi.mock("node:fs", async (importOriginal) => {
  const original = await importOriginal<typeof import("node:fs")>();
  return { ...original, createReadStream: vi.fn(original.createReadStream) };
});

const directories: string[] = [];
const temporaryDirectory = async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "mailrith-body-test-"));
  directories.push(directory);
  return directory;
};

afterEach(async () => {
  input.stream = undefined;
  const original = await vi.importActual<typeof import("node:fs")>("node:fs");
  vi.mocked(createReadStream).mockReset().mockImplementation(original.createReadStream);
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

const run = async (argv: string[]) => {
  const stderr: string[] = [];
  const stdout: string[] = [];
  const fetchMock = vi.fn(async (_url: string | URL | Request, _init?: RequestInit) =>
    Response.json({ data: { accepted: true } }),
  );
  const exitCode = await runMailrithCli(argv, {
    environment: { MAILRITH_API_KEY: "synthetic_test_key" },
    fetch: fetchMock,
    stderr: (line) => stderr.push(line),
    stdout: (line) => stdout.push(line),
  });
  return { exitCode, stderr, stdout, fetchMock };
};

const failingStream = (code: unknown) => Readable.from((async function* () {
  yield "partial-private-request";
  throw Object.assign(new Error("private-file-location and private-request-content"), { code });
})());

describe("shared request-body reader", () => {
  it("explains missing files for every operation and shorthand without sending an API request", async () => {
    const missing = path.join(await temporaryDirectory(), "private-missing-file.json");
    const commands = [
      ["subscribers", "sync"], ["broadcasts", "draft"],
      ...mailrithSdkResources.flatMap((resource) => resource.operations.flatMap((operation) => [
        ["call", resource.namespace, operation.methodName],
        ["operations", "run", operation.operationId],
      ])),
    ];
    for (const command of commands) {
      const result = await run([...command, "--body-file", missing, "--json"]);
      expect(result.exitCode, command.join(" ")).toBe(mailrithCliExitCodes.usage);
      expect(JSON.parse(result.stderr[0]!)).toMatchObject({ error: {
        code: "invalid_usage",
        message: "The request file was not found. Check the file location.",
        details: { field: "body-file" },
      } });
      expect(result.stderr.join("\n")).not.toContain(missing);
      expect(result.stdout).toEqual([]);
      expect(result.fetchMock).not.toHaveBeenCalled();
    }
  });

  it.each([false, true])("explains real folder and invalid-path failures in JSON=%s output", async (json) => {
    const directory = await temporaryDirectory();
    const file = path.join(directory, "private-file.json");
    await writeFile(file, "{}");
    for (const [filePath, explanation] of [
      [directory, "location is a folder"],
      [path.join(file, "child.json"), "location is invalid"],
      ["private\0path", "location is invalid"],
      ["", "file was not found"],
    ]) {
      const result = await run([
        "broadcasts", "draft", `--body-file=${filePath}`, ...(json ? ["--json"] : []),
      ]);
      expect(result.exitCode).toBe(mailrithCliExitCodes.usage);
      expect(result.stderr.join("\n")).toContain(explanation);
      expect(result.stderr.join("\n")).not.toContain("private");
      expect(result.fetchMock).not.toHaveBeenCalled();
    }
  });

  it.each([
    ["EACCES", "access permissions"],
    ["EPERM", "access permissions"],
    ["ENAMETOOLONG", "location is invalid"],
    ["ELOOP", "location is invalid"],
  ])("explains %s without exposing paths or partially read content", async (code, explanation) => {
    vi.mocked(createReadStream).mockReturnValueOnce(failingStream(code) as ReturnType<typeof createReadStream>);
    const result = await run(["subscribers", "sync", "--body-file", "private.json", "--json"]);
    expect(result.exitCode).toBe(mailrithCliExitCodes.usage);
    expect(result.stderr.join("\n")).toContain(explanation);
    expect(result.stderr.join("\n")).not.toContain("private");
    expect(result.fetchMock).not.toHaveBeenCalled();
  });

  it("keeps unexpected storage failures distinct from invalid usage", async () => {
    vi.mocked(createReadStream).mockReturnValueOnce(failingStream("EIO") as ReturnType<typeof createReadStream>);
    const result = await run(["subscribers", "sync", "--body-file", "private.json", "--json"]);
    expect(result.exitCode).toBe(mailrithCliExitCodes.transient);
    expect(JSON.parse(result.stderr[0]!)).toMatchObject({ error: {
      code: "request_file_read_failed", details: { field: "body-file" },
    } });
    expect(result.stderr.join("\n")).toContain("available and readable");
    expect(result.stderr.join("\n")).not.toContain("private");
    expect(result.fetchMock).not.toHaveBeenCalled();
  });

  it("retains JSON validation without printing file contents", async () => {
    const file = path.join(await temporaryDirectory(), "private.json");
    await writeFile(file, '{"private-token":');
    const result = await run(["subscribers", "sync", "--body-file", file, "--json"]);
    expect(result.exitCode).toBe(mailrithCliExitCodes.usage);
    expect(result.stderr.join("\n")).toContain("must contain valid JSON");
    expect(result.stderr.join("\n")).not.toContain("private");
    expect(result.fetchMock).not.toHaveBeenCalled();
  });

  it.each([0, 1])("preserves the 1 MiB input boundary with %s extra bytes", async (extraBytes) => {
    const file = path.join(await temporaryDirectory(), "body.json");
    const source = JSON.stringify({ value: "x".repeat(1024 * 1024 - 12 + extraBytes) });
    await writeFile(file, source);
    const result = await run(["subscribers", "sync", "--body-file", file, "--json"]);
    if (extraBytes) {
      expect(result.exitCode).toBe(mailrithCliExitCodes.usage);
      expect(result.stderr.join("\n")).toContain("Input exceeds the 1 MiB CLI limit.");
      expect(result.fetchMock).not.toHaveBeenCalled();
    } else {
      expect(result.exitCode).toBe(mailrithCliExitCodes.success);
      expect(result.fetchMock).toHaveBeenCalledTimes(1);
      expect(result.fetchMock.mock.calls[0]?.[1]?.body).toBe(source);
    }
  });

  it("reads piped JSON without opening a file", async () => {
    input.stream = Readable.from(['{"email":', '"subscriber@example.test"}']);
    const result = await run(["subscribers", "sync", "--body-file", "-", "--json"]);
    expect(result.exitCode).toBe(mailrithCliExitCodes.success);
    expect(result.fetchMock).toHaveBeenCalledTimes(1);
    expect(JSON.parse(String(result.fetchMock.mock.calls[0]?.[1]?.body)))
      .toEqual({ email: "subscriber@example.test" });
    expect(createReadStream).not.toHaveBeenCalled();
  });

  it("explains an interrupted input pipe without exposing partial content", async () => {
    input.stream = failingStream("EIO");
    const result = await run(["subscribers", "sync", "--body-file", "-", "--json"]);
    expect(result.exitCode).toBe(mailrithCliExitCodes.usage);
    expect(result.stderr.join("\n")).toContain("Check the command supplying JSON");
    expect(result.stderr.join("\n")).not.toContain("private");
    expect(result.fetchMock).not.toHaveBeenCalled();
  });

  it("keeps the input limit for piped data", async () => {
    input.stream = Readable.from([Buffer.alloc(1024 * 1024 + 1, "x")]);
    const result = await run(["subscribers", "sync", "--body-file", "-", "--json"]);
    expect(result.exitCode).toBe(mailrithCliExitCodes.usage);
    expect(result.stderr.join("\n")).toContain("Input exceeds the 1 MiB CLI limit.");
    expect(result.fetchMock).not.toHaveBeenCalled();
  });

  it("does not read files for operation search or a command without --body-file", async () => {
    const search = await run(["operations", "search", "find Subscribers", "--json"]);
    expect(search.exitCode).toBe(mailrithCliExitCodes.success);
    expect(search.fetchMock).not.toHaveBeenCalled();
    const result = await run(["call", "subscribers", "list", "--json"]);
    expect(result.exitCode).toBe(mailrithCliExitCodes.success);
    expect(result.fetchMock).toHaveBeenCalledTimes(1);
    expect(createReadStream).not.toHaveBeenCalled();
  });
});
