// file_description: augment express request with hazo_auth context
import type { app_context } from "./app_types";

declare global {
  namespace Express {
    interface Request {
      context: app_context;
    }
  }
}

export {};

