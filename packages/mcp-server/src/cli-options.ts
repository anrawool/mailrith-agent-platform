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
  const environmentApiKey = resolveEnvironmentApiKey(env);
  const options: MailrithMcpCliOptions = {
    transport: "stdio",
    ...(environmentApiKey ? { apiKey: environmentApiKey } : {}),
    host: "127.0.0.1",
    port: 8788,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    const nextValue = argv[index + 1];

    if (!value?.startsWith("--")) {
      continue;
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

    if (value === "--api-key" && nextValue) {
      const apiKey = nextValue.trim();
      options.apiKey = apiKey ? apiKey : options.apiKey;
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
      if (!Number.isNaN(parsed) && Number.isFinite(parsed)) {
        options.port = parsed;
      }
      index += 1;
    }
  }

  return options;
};

export const requireMailrithMcpStdioCredential = (
  options: Pick<MailrithMcpCliOptions, "apiKey">,
) => {
  if (!options.apiKey) {
    throw new Error(
      "Local stdio requires a Mailrith credential. Set MAILRITH_API_KEY in the client secret environment or pass --api-key.",
    );
  }
};
