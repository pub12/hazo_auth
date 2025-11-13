// file_description: expose a common data client wrapper for layout components
// section: types
export type LayoutDataClient<TClient = unknown> = {
  client: TClient;
  healthCheck: () => Promise<void>;
};

// section: factory
export const createLayoutDataClient = <TClient,>(
  hazoClient: TClient,
): LayoutDataClient<TClient> => ({
  client: hazoClient,
  healthCheck: async () => {
    if (hazoClient && typeof (hazoClient as Record<string, unknown>).healthCheck === "function") {
      await ((hazoClient as unknown) as { healthCheck: () => Promise<void> }).healthCheck();
    }
  },
});

