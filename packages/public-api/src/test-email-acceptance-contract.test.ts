import { expect, it } from "vitest";
import { publicApiSpec } from "./index";

it("documents bounded nullable provider acceptance IDs for every preview object", () => {
  const spec = publicApiSpec as unknown as {
    components: {
      schemas: Record<string, { properties: Record<string, unknown> }>;
    };
  };
  const fields = [
    spec.components.schemas.BroadcastTestResult.properties.provider_message_ids,
    spec.components.schemas.WorkflowTestResult.properties.provider_message_ids,
  ];
  for (const field of fields)
    expect(field).toMatchObject({
      type: "array",
      minItems: 1,
      maxItems: 5,
      items: { type: "string", nullable: true, maxLength: 200 },
    });
});
