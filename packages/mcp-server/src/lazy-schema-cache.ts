type McpSchemaSource<SourceSchema> = {
  operationId: string;
  inputSchema: SourceSchema;
  outputSchema: SourceSchema;
};

type CompiledMcpSchemas<CompiledSchema> = {
  inputSchema: CompiledSchema;
  outputSchema: CompiledSchema;
};

export const createLazyMcpSchemaCache = <SourceSchema, CompiledSchema>(
  compile: (schema: SourceSchema) => CompiledSchema,
) => {
  const compiledByOperationId = new Map<
    string,
    CompiledMcpSchemas<CompiledSchema>
  >();

  return {
    get(tool: McpSchemaSource<SourceSchema>) {
      const existing = compiledByOperationId.get(tool.operationId);
      if (existing) {
        return existing;
      }

      // Schema compilation is synchronous, so concurrent requests on the same
      // isolate cannot observe or populate a partially compiled cache entry.
      const compiled = {
        inputSchema: compile(tool.inputSchema),
        outputSchema: compile(tool.outputSchema),
      };
      compiledByOperationId.set(tool.operationId, compiled);
      return compiled;
    },
  };
};
