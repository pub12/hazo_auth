// file_description: integration tests covering express server bootstrapping
import request from "supertest";
import { create_server_app } from "@/server/server";

describe("server integration", () => {
  it("responds to health check", async () => {
    const app = create_server_app();
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });
});

