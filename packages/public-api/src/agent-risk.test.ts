import { describe, expect, it } from "vitest";
import {
  getPublicApiAgentOperationRisk,
  getPublicApiOperations,
  publicApiAgentOperationRiskCatalog,
} from "./index";

describe("public API agent operation risk catalog", () => {
  it("classifies every public operation exactly once", () => {
    const publicOperationIds = getPublicApiOperations()
      .map((operation) => operation.operationId)
      .sort();
    const classifiedOperationIds = publicApiAgentOperationRiskCatalog
      .map((definition) => definition.operationId)
      .sort();

    expect(new Set(classifiedOperationIds).size).toBe(
      classifiedOperationIds.length,
    );
    expect(classifiedOperationIds).toEqual(publicOperationIds);
  });

  it("classifies every destructive operation explicitly", () => {
    const destructiveOperations = publicApiAgentOperationRiskCatalog.filter(
      (definition) => definition.risk === "delete",
    );

    expect(destructiveOperations.length).toBeGreaterThan(0);
    expect(destructiveOperations.every((definition) => definition.risk === "delete")).toBe(true);
  });

  it("keeps reads retry-safe and side-effect free", () => {
    const readOperations = publicApiAgentOperationRiskCatalog.filter(
      (definition) => definition.risk === "read",
    );

    expect(readOperations.length).toBeGreaterThan(0);
    expect(
      readOperations.every(
        (definition) =>
          definition.retryMode === "safe" &&
          definition.externalSideEffect === false,
      ),
    ).toBe(true);
  });

  it("classifies live sending and activation as external execution", () => {
    for (const operationId of [
      "sendBroadcast",
      "updateSequenceStatus",
      "updateAutomationStatus",
    ]) {
      expect(getPublicApiAgentOperationRisk(operationId)).toMatchObject({
        risk: "execute",
        externalSideEffect: true,
      });
    }
    for (const operationId of [
      "createSequence",
      "updateSequence",
      "createAutomation",
      "updateAutomation",
    ]) {
      expect(getPublicApiAgentOperationRisk(operationId)).toMatchObject({
        risk: "draft",
        externalSideEffect: false,
      });
    }
  });

  it("keeps cancellation available as an unblocked safety action", () => {
    expect(getPublicApiAgentOperationRisk("cancelBroadcastSend")).toMatchObject({
      risk: "execute",
    });
  });

  it("assigns explicit side-effect and idempotency policies to every operation", () => {
    for (const definition of publicApiAgentOperationRiskCatalog) {
      expect(definition.sideEffectClass, definition.operationId).toBeTruthy();
      expect(definition.idempotencyPolicy, definition.operationId).toBeTruthy();
      expect(definition.sideEffectClass === "none", definition.operationId).toBe(
        definition.risk === "read",
      );
    }

    expect(getPublicApiAgentOperationRisk("testBroadcast")).toMatchObject({
      sideEffectClass: "external-email",
      idempotencyPolicy: "idempotency-key",
    });
    expect(
      getPublicApiAgentOperationRisk("createSubscriberImportJob"),
    ).toMatchObject({
      sideEffectClass: "bulk-data",
    });
    expect(
      getPublicApiAgentOperationRisk("rotateWebhookSubscriptionSecret"),
    ).toMatchObject({
      sideEffectClass: "secret-change",
    });
  });
});
