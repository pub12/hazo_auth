// section: factory
export const createLayoutDataClient = (hazoClient) => ({
    client: hazoClient,
    healthCheck: async () => {
        if (hazoClient && typeof hazoClient.healthCheck === "function") {
            await hazoClient.healthCheck();
        }
    },
});
