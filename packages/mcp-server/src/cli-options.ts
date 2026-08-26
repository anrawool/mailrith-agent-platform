export type MailrithMcpCliOptions = {
  transport: "stdio" | "http";
  baseUrl?: string;
  apiKey?: string;
  host: string;
  port: number;
};

type MailrithMcpCliEnvironment = {
  MAILRITH_API_KEY?: string;
};

const resolveEnvironmentApiKey = (
  env: MailrithMcpCliEnvironment,
) => {
  const apiKey = env.MAILRITH_API_KEY?.trim();
  return apiKey ? apiKey : undefined;
};

export const parseMailrithMcpCliOptions = (
  argv: string[],
  env: MailrithMcpCliEnvironment = process.env,
): MailrithMcpCliOptions => {
  const options: MailrithMcpCliOptions = {
    transport: "stdio",
    host: "127.0.0.1",
    port: 8788,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    const nextValue = argv[index + 1];

    if (!value?.startsWith("--")) {
      continue;
    }

    if (value === "--api-key" || value.startsWith("--api-key=")) {
      throw new Error(
        "Do not pass Mailrith credentials as command arguments. Set MAILRITH_API_KEY in the client secret environment for local stdio use.",
      );
    }

    if (value === "--transport" && nextValue) {
      options.transport = nextValue === "http" ? "http" : "stdio";
      index += 1;
      continue;
    }

    if (value === "--base-url" && nextValue) {
      options.baseUrl = nextValue;
      index += 1;
      continue;
    }

    if (value === "--host" && nextValue) {
      options.host = nextValue;
      index += 1;
      continue;
    }

    if (value === "--port" && nextValue) {
      const parsed = Number(nextValue);
      if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
        throw new Error("The MCP HTTP port must be an integer from 1 to 65535.");
      }
      options.port = parsed;
      index += 1;
    }
  }

  if (
    options.transport === "http" &&
    options.host !== "127.0.0.1" &&
    options.host !== "localhost"
  ) {
    throw new Error(
      "The built-in MCP HTTP server must listen on 127.0.0.1 or localhost. Put a TLS reverse proxy in front of it for remote access.",
    );
  }

  const environmentApiKey = resolveEnvironmentApiKey(env);
  if (options.transport === "stdio" && environmentApiKey) {
    options.apiKey = environmentApiKey;
  }

  return options;
};

export const requireMailrithMcpStdioCredential = (
  options: Pick<MailrithMcpCliOptions, "apiKey">,
) => {
  if (!options.apiKey) {
    throw new Error(
      "Local stdio requires a Mailrith credential. Set MAILRITH_API_KEY in the client secret environment.",
    );
  }
};
