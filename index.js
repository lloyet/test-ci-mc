import express from "express";
import { Rcon } from "rcon-client";

/**
 * @type {Rcon}
 */
export let rcon;

Rcon.connect({
	host: "localhost",
	port: 25575,
	password: "1234",
}).then((connection) => {
	console.log("[RCON] Connected at 0.0.0.0:25575.");
	rcon = connection;

	rcon.on("end", () => {
		console.log("[RCON] Disconnected from 0.0.0.0:25575.");
	});
});

export const app = express().use(express.json());

app.post("/mobs", async (req, res) => {
	const { type, x, y, z } = req.body;

	if (!type || x === undefined || y === undefined || z === undefined)
		return res.sendStatus(400);

	const rconResponse = await rcon.send(`summon ${type} ${x} ${y} ${z}`);

	res.status(201).send(rconResponse);
});

export const server = app.listen(3000, () => {
	console.log("Server is running on http://localhost:3000");
});
