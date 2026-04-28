import express from "express";
import { Rcon } from "rcon-client";

const HOST = process.env.HOST ?? "0.0.0.0";
const PORT = Number.parseInt(process.env.PORT ?? "3000");
const RCON_HOST = process.env.RCON_HOST ?? "0.0.0.0";
const RCON_PORT = Number.parseInt(process.env.RCON_PORT ?? "25575");
const RCON_PASSWORD = process.env.RCON_PASSWORD ?? "1234";

/**
 * @type {Rcon | null}
 */
export let rcon = null;
let reconnecting = false;

function scheduleReconnect() {
	if (reconnecting) return;

	reconnecting = true;
	rcon = null;

	setTimeout(async () => {
		reconnecting = false;
		await getRcon();
	}, 2000);
}

async function getRcon() {
	if (rcon?.authenticated) return rcon;

	try {
		const newRcon = new Rcon({
			host: RCON_HOST,
			port: RCON_PORT,
			password: RCON_PASSWORD,
			timeout: 0,
		});

		newRcon.on("error", (err) => {
			console.log(`[RCON] Error ${err} from ${RCON_HOST}:${RCON_PORT}.`);
			scheduleReconnect();
		});

		newRcon.on("end", () => {
			console.log(`[RCON] Disconnected from ${RCON_HOST}:${RCON_PORT}.`);
			scheduleReconnect();
		});

		await newRcon.connect();
		rcon = newRcon;
		console.log(`[RCON] Connected at ${RCON_HOST}:${RCON_PORT}.`);
	} catch {
		console.log(`[RCON] Timeout Try reconnect at ${RCON_HOST}:${RCON_PORT}`);
		scheduleReconnect();
	}

	return rcon;
}

export const app = express().use(express.json());

app.post("/mobs", async (req, res) => {
	const { type, x, y, z } = req.body;

	if (!type || x === undefined || y === undefined || z === undefined)
		return res.sendStatus(400);

	const rconClient = await getRcon();

	const rconResponse = await rconClient.send(`summon ${type} ${x} ${y} ${z}`);

	res.status(201).send(rconResponse);
});

export const server = app.listen(PORT, HOST, () => {
	console.log(`Server is running on http://${HOST}:${PORT}`);

	getRcon();
});
