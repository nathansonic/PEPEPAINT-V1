const columns = [
	["objkt_id", "ID", "id"],
	["received_at", "Date Submitted", "date"],
	["title", "Title", "text"],
	["artist", "Artist", "text"],
	["address", "Address", "text"],
	["editions", "Editions", "number"],
	["croakage", "Croakage", "percent"],
	["rsi", "RSi", "number"],
	["brushiness", "Brushiness", "number"],
	["quietus", "Quietus", "percent"],
	["quietus_elapsed", "Quietus Time Elapsed", "duration"],
	["wanderlust", "Wanderlust", "pixels"],
	["cows", "Cows", "number"],
];
const status_element = document.getElementById("status");
const headings = document.getElementById("headings");
const tbody = document.getElementById("cards");
let cards = [];
let sort_key = "received_at";
let sort_direction = -1;
let loaded = false;
const number_format = new Intl.NumberFormat(undefined, { maximumFractionDigits: 12 });

function sortValue(value, type) {
	if (value == null || value === "") return null;
	if (type === "text") return String(value);
	if (type === "id") return /^\d+$/.test(value) ? BigInt(value) : null;
	if (type === "date") return Number.isFinite(Date.parse(value)) ? Date.parse(value) : null;
	if (type === "duration") {
		const match = /^(?:(\d+)d )?(\d+):(\d{2}):(\d{2})$/.exec(value);
		return match ? Number(match[1] ?? 0) * 86400 + Number(match[2]) * 3600 + Number(match[3]) * 60 + Number(match[4]) : null;
	}
	return Number.isFinite(value) ? value : null;
}

for (const [key, label] of columns) {
	const th = document.createElement("th");
	th.scope = "col";
	const button = document.createElement("button");
	button.type = "button";
	button.textContent = label;
	button.addEventListener("click", () => {
		sort_direction = sort_key === key ? -sort_direction : 1;
		sort_key = key;
		render();
	});
	th.append(button);
	headings.append(th);
}

function render() {
	const type = columns.find(([key]) => key === sort_key)[2];
	const sorted = [...cards].sort((a, b) => {
		const left = sortValue(a[sort_key], type);
		const right = sortValue(b[sort_key], type);
		if (left == null) return right == null ? 0 : 1;
		if (right == null) return -1;
		return sort_direction * (type === "text" ? left.localeCompare(right) : left < right ? -1 : left > right ? 1 : 0);
	});
	for (const [index, [key]] of columns.entries()) {
		headings.children[index].setAttribute("aria-sort", key === sort_key ? (sort_direction === 1 ? "ascending" : "descending") : "none");
	}
	const rows = document.createDocumentFragment();
	for (const card of sorted) {
		const row = document.createElement("tr");
		for (const [key, , type] of columns) {
			const td = document.createElement("td");
			const value = card[key];
			let display = value == null || value === "" ? "—" : String(value);
			if (type === "date" && sortValue(value, type) != null) display = new Date(value).toISOString().replace("T", " ").slice(0, 19);
			if (["number", "percent", "pixels"].includes(type)) {
				td.className = "number";
				if (typeof value === "number") display = number_format.format(value) + (type === "percent" ? "%" : type === "pixels" ? " px" : "");
			}
			if (type === "id") td.className = "number";
			if (key === "address") td.className = "address";
			if (key === "title" && /^https:\/\/objkt\.com\/tokens\/KT18yLY7fzR5ZMKTaYQD2rNSvB6Go2VuW8gG\/\d+$/.test(card.objkt_url)) {
				const link = document.createElement("a");
				link.href = card.objkt_url;
				link.target = "_blank";
				link.rel = "noopener noreferrer";
				link.textContent = display;
				td.append(link);
			} else if (key === "artist" && typeof card.address === "string" && card.address.trim()) {
				const link = document.createElement("a");
				link.href = `https://objkt.com/users/${encodeURIComponent(card.address.trim())}`;
				link.target = "_blank";
				link.rel = "noopener noreferrer";
				link.textContent = display;
				td.append(link);
			} else td.textContent = display;
			row.append(td);
		}
		rows.append(row);
	}
	tbody.replaceChildren(rows);
}

async function refresh() {
	try {
		const response = await fetch("/api/statistics", { cache: "no-store", signal: AbortSignal.timeout(15000) });
		if (!response.ok) throw new Error("Statistics unavailable");
		const result = await response.json();
		if (!Array.isArray(result)) throw new Error("Invalid statistics");
		cards = result;
		loaded = true;
		render();
		status_element.textContent = cards.length ? `${cards.length} official ${cards.length === 1 ? "card" : "cards"}. Last updated ${new Date().toLocaleTimeString()}.` : "No official cards have been published yet.";
	} catch {
		status_element.textContent = loaded ? "Could not refresh. Showing the last loaded cards; retrying in 60 seconds." : "Statistics are temporarily unavailable. Retrying in 60 seconds.";
	} finally {
		setTimeout(refresh, 60000);
	}
}
render();
refresh();
