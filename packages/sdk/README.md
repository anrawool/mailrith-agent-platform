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
