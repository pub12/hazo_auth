// file_description: declares the primary express router for the hazo_auth backend
// section: imports
import { Router } from "express";
// section: router_factory
export const create_root_router = () => {
    const root_router = Router();
    // section: health_endpoint
    root_router.get("/health", (_request, response) => {
        response.status(200).json({
            status: "ok",
        });
    });
    return root_router;
};
