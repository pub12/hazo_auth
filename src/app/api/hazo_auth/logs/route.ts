// file_description: API route for hazo_logs log viewer
// section: imports
import { createLogApiHandler } from "hazo_logs/ui/server";

// section: handler
const handler = createLogApiHandler();

export const { GET } = handler;
