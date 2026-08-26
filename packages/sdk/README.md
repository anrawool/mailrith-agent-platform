# Mailrith TypeScript SDK

Official TypeScript SDK for Mailrith's public API.

The SDK is generated from Mailrith's versioned public contract and exposes resource
namespaces such as `client.subscribers.list()` and `client.broadcasts.send()`.

```ts
import { createMailrithClient } from "@mailrith/sdk";

const client = createMailrithClient({
  apiKey: process.env.MAILRITH_API_KEY,
});

const capabilities = await client.discovery.getCapabilities();
const subscriber = await client.subscribers.upsert({
  body: {
    email: "ada@example.com",
    name: "Ada Lovelace",
  },
});
```

## Official Builds And Forks

Modified public versions must use distinct package and service names and
clearly say that they are unofficial. See the
[Mailrith Trademark And Unofficial Fork Policy](https://github.com/anrawool/mailrith-agent-platform/blob/main/TRADEMARKS.md).
