import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createSubmissionApp } from "../app.js";

test("statistics publishes only approved public fields and rereads approval edits", async (t) => {
	const root = await mkdtemp(path.join(os.tmpdir(), "pepepaint-statistics-"));
	const approval_file = path.join(root, "approved.json");
	const id = crypto.randomUUID();
	const rejected_id = crypto.randomUUID();
	for (const submission_id of [id, rejected_id]) {
		await mkdir(path.join(root, submission_id));
		await writeFile(path.join(root, submission_id, "submission.json"), JSON.stringify({
			submission_id, received_at: "2026-09-19T10:00:00.000Z", title: "Original title", wallet_address: "tz1example", editions: 10,
			description: "PRIVATE", email_delivery: { id: "PRIVATE" },
			traits: { pepeness: 10, number_of_strokes: 20, variety: 2, quietus: 0.000000001, duration: "1d 00:00:00", distance_travelled: 200, chaos: 30, private: "PRIVATE" },
		}));
	}
	await writeFile(approval_file, "[]");
	const server = createSubmissionApp({ storage_root: root, approval_file }).listen(0, "127.0.0.1");
	await new Promise(resolve => server.once("listening", resolve));
	t.after(async () => { await new Promise(resolve => server.close(resolve)); await rm(root, { recursive: true, force: true }); });
	const url = `http://127.0.0.1:${server.address().port}`;
	assert.deepEqual(await (await fetch(`${url}/api/statistics`)).json(), []);
	const entry = { submission_id: id, title: "Reference title", artist: "Artist", objkt_id: "0" };
	await writeFile(approval_file, JSON.stringify([entry, entry]));
	const response = await fetch(`${url}/api/statistics`);
	assert.equal(response.headers.get("cache-control"), "no-store");
	assert.deepEqual(await response.json(), [{ objkt_id: "0", received_at: "2026-09-19T10:00:00.000Z", title: "Original title", artist: "Artist", address: "tz1example", editions: 10, croakage: 10, rsi: 20, brushiness: 2, quietus: 0.000000001, quietus_elapsed: "1d 00:00:00", wanderlust: 200, cows: 30, objkt_url: "https://objkt.com/tokens/KT18yLY7fzR5ZMKTaYQD2rNSvB6Go2VuW8gG/0" }]);
	await writeFile(approval_file, JSON.stringify([{ ...entry, artist: "Updated", objkt_id: "" }]));
	const updated = await (await fetch(`${url}/api/statistics`)).json();
	assert.equal(updated[0].artist, "Updated");
	assert.equal(updated[0].objkt_url, null);
	assert.equal(updated[0].objkt_id, null);
	await writeFile(approval_file, "[]");
	assert.deepEqual(await (await fetch(`${url}/api/statistics`)).json(), []);
	for (const invalid of ["{", JSON.stringify([{ ...entry, submission_id: "../outside" }]), JSON.stringify([{ ...entry, objkt_id: "javascript:alert(1)" }]), JSON.stringify([{ ...entry, submission_id: crypto.randomUUID() }])]) {
		await writeFile(approval_file, invalid);
		const failed = await fetch(`${url}/api/statistics`);
		assert.equal(failed.status, 503);
		assert.deepEqual(await failed.json(), { error: "Statistics are temporarily unavailable." });
	}
	assert.equal((await fetch(`${url}/statistics`)).status, 200);
	assert.equal((await fetch(`${url}/backend/approved-cards.json`)).status, 404);
});
