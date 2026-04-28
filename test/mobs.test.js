import { describe, test, after } from "node:test";
import assert from "node:assert/strict";

import request from "supertest";
import { app, server, rcon } from "../index.js";

describe("TEST /mobs", () => {
	after(() => {
		server.close();
		rcon.end();
	});

	test("test POST /mobs", async () => {
		const response = await request(app)
			.post("/mobs")
			.send({
				type: "minecraft:creeper",
				x: 17,
				y: 71,
				z: -11,
			})
			.set("Accept", "application/json")
			.set("Content-Type", "application/json")
			.expect("Content-Type", "text/html; charset=utf-8")
			.expect(201);

		assert.equal(response.text, "Summoned new Creeper");
	});
});
