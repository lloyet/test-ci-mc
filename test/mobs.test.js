import { describe, test, after, before } from "node:test";
import assert from "node:assert/strict";

import request from "supertest";
import { app, server, rcon } from "../index.js";

function wait(delay = 2000) {
	return new Promise((resolve) => {
		setTimeout(() => resolve(), 2000);
	});
}

describe("TEST /mobs", () => {
	async function tryGetRconConnect() {
		if (rcon?.authenticated) return;

		await wait(2000);
		await tryGetRconConnect();
	}

	before(async () => {
		await tryGetRconConnect();
	});

	after(() => {
		process.exit(0);
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
