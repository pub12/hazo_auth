// file_description: Demo API route for app_user_data schema
// Re-exports from server/routes for the demo app
// Consuming apps should create their own route file that imports from "hazo_auth/server/routes"

export const dynamic = "force-dynamic";

export { GET } from "../../../../../server/routes/app_user_data_schema";
