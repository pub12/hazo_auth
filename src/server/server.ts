// file_description: configure and export the express application for hazo_auth
// section: imports
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookie_parser from "cookie-parser";
import compression from "compression";
import type { Application } from "express";
import { create_root_router } from "hazo_auth/server/routes/root_router";
import { create_app_context } from "hazo_auth/server/config/config_loader";

// section: app_factory
export const create_server_app = (): Application => {
  const server_app = express();
  server_app.use(helmet({ crossOriginResourcePolicy: false }));
  server_app.use(cors({ credentials: true, origin: true }));
  server_app.use(express.json({ limit: "1mb" }));
  server_app.use(express.urlencoded({ extended: true }));
  server_app.use(cookie_parser());
  server_app.use(compression());
  server_app.use((request, _response, next) => {
    request.context = create_app_context();
    next();
  });
  server_app.use(create_root_router());
  return server_app;
};

