import request from "supertest";
import { startServer } from "@app/server";

describe("Hello world", () => {
	it("should return 200", async () => {
		const app = await startServer();
		const response = await request(app).get("/").expect(200);
		expect(response.text).toMatch(/hello world/i);
	});
});
