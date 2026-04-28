import express from "express";
import { Rcon } from "rcon-client";

const HOST = process.env.HOST ?? "0.0.0.0";
const PORT = Number.parseInt(process.env.PORT ?? "3000");
const RCON_HOST = process.env.RCON_HOST ?? "0.0.0.0";
const RCON_PORT = Number.parseInt(process.env.RCON_PORT ?? "25575");
const RCON_PASSWORD = process.env.RCON_PASSWORD ?? "1234";

/**
 * @type {Rcon}
 */
export let rcon;

Rcon.connect({
	host: RCON_HOST,
	port: RCON_PORT,
	password: RCON_PASSWORD,
}).then((connection) => {
	console.log(`[RCON] Connected at ${RCON_HOST}:${RCON_PORT}.`);
	rcon = connection;

	rcon.on("end", () => {
		console.log(`[RCON] Disconnected from ${RCON_HOST}:${RCON_PORT}.`);
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

export const server = app.listen(PORT, HOST, () => {
	console.log(`Server is running on http://${HOST}:${PORT}`);
});
