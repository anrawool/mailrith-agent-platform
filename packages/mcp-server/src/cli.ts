#!/usr/bin/env node

import http from "node:http";
import { Readable } from "node:stream";
import {
  parseMailrithMcpCliOptions,
  requireMailrithMcpStdioCredential,
  type MailrithMcpCliOptions,
} from "./cli-options.js";
import {
  handleMailrithMcpHttpRequest,
  runMailrithMcpStdioServer,
} from "./index.js";

const hasRequestBody = (method: string | undefined) =>
  method !== undefined && method !== "GET" && method !== "HEAD";

const toHeaders = (headers: http.IncomingHttpHeaders) => {
  const normalized = new Headers();

  for (const [key, value] of Object.entries(headers)) {
    if (value === undefined) {
      continue;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        normalized.append(key, item);
      }
      continue;
    }
    normalized.set(key, value);
  }

  return normalized;
};

const createRequestFromNode = (req: http.IncomingMessage, origin: string) => {
  const url = new URL(req.url ?? "/", origin);
  const method = req.method ?? "GET";
  const init: RequestInit & { duplex?: "half" } = {
    method,
    headers: toHeaders(req.headers),
  };

  if (hasRequestBody(method)) {
    init.body = Readable.toWeb(req) as unknown as BodyInit;
    init.duplex = "half";
  }

  return new Request(url, init);
};

const writeNodeResponse = async (
  res: http.ServerResponse,
  response: Response,
) => {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  if (!response.body) {
    res.end();
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const stream = Readable.fromWeb(response.body as never);
    stream.on("error", reject);
    res.on("error", reject);
    res.on("finish", () => resolve());
    stream.pipe(res);
  });
};

const startHttpServer = async (options: MailrithMcpCliOptions) => {
  const origin = `http://${options.host}:${options.port}`;
  const server = http.createServer(async (req, res) => {
    try {
      const request = createRequestFromNode(req, origin);
      const response = await handleMailrithMcpHttpRequest(request, {
        baseUrl: options.baseUrl,
      });
      await writeNodeResponse(res, response);
    } catch {
      res.statusCode = 500;
      res.setHeader("content-type", "application/json");
      res.end(
        JSON.stringify(
          {
            jsonrpc: "2.0",
            error: {
              code: -32603,
              message: "Internal server error.",
            },
            id: null,
          },
          null,
          2,
        ),
      );
    }
  });

  await new Promise<void>((resolve) => {
    server.listen(options.port, options.host, () => resolve());
  });

  console.error(
    `Mailrith MCP server listening on ${origin} -> ${options.baseUrl ?? "https://api.mailrith.com"}`,
  );
};

export const runMailrithMcpCli = async (
  argv: string[] = process.argv.slice(2),
) => {
  const options = parseMailrithMcpCliOptions(argv);

  if (options.transport === "http") {
    await startHttpServer(options);
    return;
  }

  requireMailrithMcpStdioCredential(options);
  await runMailrithMcpStdioServer({
    baseUrl: options.baseUrl,
    apiKey: options.apiKey,
  });
};

await runMailrithMcpCli();
