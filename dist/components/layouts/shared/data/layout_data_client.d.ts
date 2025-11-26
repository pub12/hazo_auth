export type LayoutDataClient<TClient = unknown> = {
    client: TClient;
    healthCheck: () => Promise<void>;
};
export declare const createLayoutDataClient: <TClient>(hazoClient: TClient) => LayoutDataClient<TClient>;
//# sourceMappingURL=layout_data_client.d.ts.map