import { describe, expect, it } from "vitest";
import { describeMailrithApiError } from "./api-errors.js";

describe("shared API error guidance", () => {
  it.each(["sequence", "automation"])("explains %s activation blockers", (resource) => {
    const error = describeMailrithApiError(409, `${resource}_activation_prerequisites_not_met`, "untrusted");
    expect(error.code).toBe(`${resource}_activation_prerequisites_not_met`);
    expect(error.message).toContain("preflight");
    expect(error.message).toContain("blocking checks");
  });

  it.each(["sequence", "magic_link", "tag", "custom_field", "form", "segment"])(
    "explains references blocking changes to %s", (resource) => {
      const error = describeMailrithApiError(409, `${resource}_in_use`, "untrusted");
      expect(error.code).toBe(`${resource}_in_use`);
      expect(error.message).toContain("references");
    },
  );

  it.each([
    ["invalid_broadcast_connection", "Choose an available sender for the Broadcast."],
    ["invalid_sequence_connection", "Choose an available sender before sending Sequence test messages."],
  ])("names the sender for %s", (code, message) => {
    expect(describeMailrithApiError(400, code, "Email delivery connection is required.")).toEqual({ code, message });
  });

  it.each(["email_delivery_connection_not_found", "secure_setup_session_required", "invalid_setup_purpose"])(
    "treats retired connection code %s as unknown", (code) => {
      expect(describeMailrithApiError(400, code, "untrusted").code).toBe("api_request_failed");
    },
  );

  it("distinguishes requests still processing from keys reused for a different action", () => {
    expect(describeMailrithApiError(409, "idempotency_key_in_progress").message)
      .toContain("same idempotency key");
    expect(describeMailrithApiError(409, "idempotency_key_reused").message)
      .toContain("new key only for a new action");
  });

  it("explains a Broadcast refused for a paused Subscriber source", () => {
    const error = describeMailrithApiError(409, "broadcast_subscriber_source_paused", "untrusted");
    expect(error.code).toBe("broadcast_subscriber_source_paused");
    expect(error.message).toContain("Subscriber filters");
    expect(error.message).toContain("preflight");
    expect(error.message).not.toContain("untrusted");
  });

  it("bounds and rejects unknown codes regardless of message contents", () => {
    for (const code of [null, {}, [], "__proto__", "constructor", "x".repeat(10_000)]) {
      expect(describeMailrithApiError(400, code, "Subscriber email must be valid.").code)
        .toBe("api_request_failed");
    }
  });
});
