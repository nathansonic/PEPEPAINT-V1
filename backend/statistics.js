import { readFile } from "node:fs/promises";
import { readArchivedSubmission } from "./submissions.js";

export async function readStatistics(storage_root, approval_file) {
	const approvals = JSON.parse(await readFile(approval_file, "utf8"));
	if (!Array.isArray(approvals)) throw new Error("Approval list must be an array.");
	const cards = [];
	const seen = new Set();
	for (const entry of approvals) {
		if (!entry || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(entry.submission_id)
			|| typeof entry.artist !== "string" || !entry.artist.trim()) {
			throw new Error("Each approval needs a valid submission ID and artist.");
		}
		const objkt_id = entry.objkt_id == null ? "" : String(entry.objkt_id).trim();
		if (objkt_id && !/^\d+$/.test(objkt_id)) throw new Error("Objkt ID must contain only digits.");
		if (seen.has(entry.submission_id)) continue;
		seen.add(entry.submission_id);
		const record = await readArchivedSubmission(storage_root, entry.submission_id);
		if (!record) throw new Error("An approved submission is missing from the archive.");
		const traits = record.traits ?? {};
		// Explicit public fields only; never expose the archive or delivery details.
		cards.push({
			received_at: record.received_at,
			title: record.title,
			artist: entry.artist.trim(),
			address: record.wallet_address,
			editions: record.editions,
			croakage: traits.croakage ?? traits.pepeness ?? null,
			rsi: traits.rsi ?? traits.number_of_strokes ?? null,
			brushiness: traits.brushiness ?? traits.variety ?? null,
			quietus: traits.quietus ?? null,
			quietus_elapsed: traits.quietus_elapsed ?? traits.duration ?? null,
			wanderlust: traits.wanderlust ?? traits.distance_travelled ?? null,
			cows: traits.chaos ?? null,
			objkt_url: objkt_id ? `https://objkt.com/tokens/KT18yLY7fzR5ZMKTaYQD2rNSvB6Go2VuW8gG/${objkt_id}` : null,
		});
	}
	return cards;
}
