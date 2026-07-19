// It's PEPEPAINT v1 first uploaded on 7th Oct 2025

/**
 * PEPEPAINT
 * A generative art tool for creating Pepe-themed paintings.
 * Features include:
 * - Multiple brush types and sizes
 * - A palette of Pepe-themed colors
 * - Layer management with blending modes
 * - Randomization options for brushes, colors, and effects
 * - Export options for saving and sharing artwork
 * Author: Nathan Gregg
 * License: MIT License
 */

/**
 * NOTES:
 * console log help and change settings within console
 * inc/dec for hue, brightness, saturation, opacity,
 */

////////////////////
//      NAV       //
////////////////////

const submission_button = document.getElementById("submission_button");
const submission_dialog = document.getElementById("submission_dialog");
const submission_close_button = document.getElementById("submission_close_button");
const submission_cancel_button = document.getElementById("submission_cancel_button");

submission_button?.addEventListener("click", () => {
	if (!submission_dialog.open) {
		submission_dialog.show();
	}
});

[submission_close_button, submission_cancel_button].forEach((button) => {
	button?.addEventListener("click", () => submission_dialog.close());
});

/////////////////////
//     HELPERS     //
/////////////////////

function getRandomInt(min, max) {
	// min = Math.ceil(min);
	// max = Math.floor(max);
	if (min > max) {
		[min, max] = [max, min];
	}
	let value = Math.floor(Math.random() * (max - min + 1)) + min;
	return value;
}

function getRandomFloat(min, max, decimals = 3) {
	const value = Math.random() * (max - min) + min;
	const factor = Math.pow(10, decimals);
	return Math.round(value * factor) / factor;
}

function getWeightedGradientStopCount() {
	const stop_count_weights = [
		{ count: 2, weight: 1 },
		{ count: 3, weight: 8 },
		{ count: 4, weight: 3 },
		{ count: 5, weight: 2 },
		{ count: 6, weight: 1 },
		{ count: 7, weight: 1 },
		{ count: 8, weight: 1 },
	];

	const total_weight = stop_count_weights.reduce((sum, item) => sum + item.weight, 0);
	let roll = Math.random() * total_weight;

	for (const item of stop_count_weights) {
		roll -= item.weight;
		if (roll < 0) return item.count;
	}

	return 3;
}

function invert_val(num, min, max) {
	return max + min - num;
}

// Function to calculate the angle from a direction vector
function getAngleFromVector(vector) {
	return Math.atan2(vector.y, vector.x);
}

// Function to interpolate between vectors
function interpolateVector(target, current, factor) {
	return {
		x: current.x + (target.x - current.x) * factor,
		y: current.y + (target.y - current.y) * factor,
	};
}

// Normalize a vector
function normalizeVector(vector) {
	const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
	return length === 0 ? { x: 1, y: 0 } : { x: vector.x / length, y: vector.y / length };
}

// Utility function to compute the mirror origin (in pixels)
function getMirrorOrigin() {
	return {
		x: window_w * (mirror_origin_x / 100),
		y: window_h * (mirror_origin_y / 100),
	};
}

// Rotate a point (x, y) about the given origin by theta radians.
function rotatePoint(x, y, origin, theta) {
	const dx = x - origin.x;
	const dy = y - origin.y;
	const cosTheta = Math.cos(theta);
	const sinTheta = Math.sin(theta);
	return {
		x: origin.x + dx * cosTheta - dy * sinTheta,
		y: origin.y + dx * sinTheta + dy * cosTheta,
	};
}

// Reflect a point (x, y) about a line through the mirror origin at a given angle.
function reflectPoint(x, y, angle) {
	const origin = getMirrorOrigin();
	const dx = x - origin.x;
	const dy = y - origin.y;
	const cos2 = Math.cos(2 * angle);
	const sin2 = Math.sin(2 * angle);
	return {
		x: origin.x + dx * cos2 + dy * sin2,
		y: origin.y + dx * sin2 - dy * cos2,
	};
}

function updateTabPreviewSizes() {
	return;
}

function lerp(a, b, t) {
	return a + (b - a) * t;
}

// Interpolates hue angle properly (wraps around 360°)
function lerpAngle(h1, h2, t) {
	let delta = ((h2 - h1 + 360 + 180) % 360) - 180;
	return (h1 + delta * t + 360) % 360;
}

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const clamp01 = (v) => Math.max(0, Math.min(1, v));

const clampPct = (p) => Math.max(0, Math.min(100, p));

/////////////////////
//     COLOURS     //
/////////////////////
let color_palette_seed_all = [
	"#000000", // black
	"#FFFFFF", // white
	"#FF0000", // red
	"#00FF00", // lime
	"#0000FF", // blue
	"#FFFF00", // yellow
	"#00FFFF", // cyan/aqua
	"#FF00FF", // magenta/fuchsia
	"#C0C0C0", // silver
	"#808080", // gray/grey
	"#800000", // maroon
	"#808000", // olive
	"#008000", // green
	"#800080", // purple
	"#008080", // teal
	"#000080", // navy
	"#F0F8FF", // aliceblue
	"#FAEBD7", // antiquewhite
	"#7FFFD4", // aquamarine
	"#F0FFFF", // azure
	"#F5F5DC", // beige
	"#FFE4C4", // bisque
	"#FFEBCD", // blanchedalmond
	"#8A2BE2", // blueviolet
	"#A52A2A", // brown
	"#DEB887", // burlywood
	"#5F9EA0", // cadetblue
	"#7FFF00", // chartreuse
	"#D2691E", // chocolate
	"#FF7F50", // coral
	"#6495ED", // cornflowerblue
	"#FFF8DC", // cornsilk
	"#DC143C", // crimson
	"#00008B", // darkblue
	"#008B8B", // darkcyan
	"#B8860B", // darkgoldenrod
	"#A9A9A9", // darkgray
	"#006400", // darkgreen
	"#BDB76B", // darkkhaki
	"#8B008B", // darkmagenta
	"#556B2F", // darkolivegreen
	"#FF8C00", // darkorange
	"#9932CC", // darkorchid
	"#8B0000", // darkred
	"#E9967A", // darksalmon
	"#8FBC8F", // darkseagreen
	"#483D8B", // darkslateblue
	"#2F4F4F", // darkslategray
	"#00CED1", // darkturquoise
	"#9400D3", // darkviolet
	"#FF1493", // deeppink
	"#00BFFF", // deepskyblue
	"#696969", // dimgray
	"#1E90FF", // dodgerblue
	"#B22222", // firebrick
	"#FFFAF0", // floralwhite
	"#228B22", // forestgreen
	"#DCDCDC", // gainsboro
	"#F8F8FF", // ghostwhite
	"#FFD700", // gold
	"#DAA520", // goldenrod
	"#ADFF2F", // greenyellow
	"#F0FFF0", // honeydew
	"#FF69B4", // hotpink
	"#CD5C5C", // indianred
	"#4B0082", // indigo
	"#FFFFF0", // ivory
	"#F0E68C", // khaki
	"#E6E6FA", // lavender
	"#FFF0F5", // lavenderblush
	"#7CFC00", // lawngreen
	"#FFFACD", // lemonchiffon
	"#ADD8E6", // lightblue
	"#F08080", // lightcoral
	"#E0FFFF", // lightcyan
	"#FAFAD2", // lightgoldenrodyellow
	"#D3D3D3", // lightgray
	"#90EE90", // lightgreen
	"#FFB6C1", // lightpink
	"#FFA07A", // lightsalmon
	"#20B2AA", // lightseagreen
	"#87CEFA", // lightskyblue
	"#778899", // lightslategray
	"#B0C4DE", // lightsteelblue
	"#FFFFE0", // lightyellow
	"#32CD32", // limegreen
	"#FAF0E6", // linen
	"#66CDAA", // mediumaquamarine
	"#0000CD", // mediumblue
	"#BA55D3", // mediumorchid
	"#9370DB", // mediumpurple
	"#3CB371", // mediumseagreen
	"#7B68EE", // mediumslateblue
	"#00FA9A", // mediumspringgreen
	"#48D1CC", // mediumturquoise
	"#C71585", // mediumvioletred
	"#191970", // midnightblue
	"#F5FFFA", // mintcream
	"#FFE4E1", // mistyrose
	"#FFE4B5", // moccasin
	"#FFDEAD", // navajowhite
	"#FDF5E6", // oldlace
	"#6B8E23", // olivedrab
	"#FFA500", // orange
	"#FF4500", // orangered
	"#DA70D6", // orchid
	"#EEE8AA", // palegoldenrod
	"#98FB98", // palegreen
	"#AFEEEE", // paleturquoise
	"#DB7093", // palevioletred
	"#FFEFD5", // papayawhip
	"#FFDAB9", // peachpuff
	"#CD853F", // peru
	"#FFC0CB", // pink
	"#DDA0DD", // plum
	"#B0E0E6", // powderblue
	"#BC8F8F", // rosybrown
	"#4169E1", // royalblue
	"#8B4513", // saddlebrown
	"#FA8072", // salmon
	"#F4A460", // sandybrown
	"#2E8B57", // seagreen
	"#FFF5EE", // seashell
	"#A0522D", // sienna
	"#87CEEB", // skyblue
	"#6A5ACD", // slateblue
	"#708090", // slategray
	"#FFFAFA", // snow
	"#00FF7F", // springgreen
	"#4682B4", // steelblue
	"#D2B48C", // tan
	"#D8BFD8", // thistle
	"#FF6347", // tomato
	"#40E0D0", // turquoise
	"#EE82EE", // violet
	"#F5DEB3", // wheat
	"#F5F5F5", // whitesmoke
	"#9ACD32", // yellowgreen
];

const color_palette_seed_gradients = [
	// Reds gradient
	"#ffcccc",
	"#ff9999",
	"#ff6666",
	"#ff3333",
	"#ff0000",
	"#cc0000",

	// Oranges gradient
	"#ffebcc",
	"#ffd699",
	"#ffc266",
	"#ffad33",
	"#ff9900",
	"#cc7a00",

	// Browns gradient
	"#f2d6cc",
	"#e6b399",
	"#d99966",
	"#cc8033",
	"#bf6600",
	"#994d00",

	// Yellows gradient
	"#ffffcc",
	"#ffff99",
	"#ffff66",
	"#ffff33",
	"#ffff00",
	"#cccc00",

	// Greens gradient
	"#ccffcc",
	"#99ff99",
	"#66ff66",
	"#33cc33",
	"#00cc00",
	"#009900",

	// Blues gradient
	"#cce5ff",
	"#99ccff",
	"#66b3ff",
	"#3399ff",
	"#007fff",
	"#0066cc",

	// Purples gradient
	"#e6ccff",
	"#cc99ff",
	"#b366ff",
	"#9933ff",
	"#6600cc",
	"#4d0099",

	// Monochrome gradient from white to black
	"#ffffff",
	"#cccccc",
	"#999999",
	"#666666",
	"#333333",
	"#000000",
];

const color_palette_seed_shortlist = [
	"#FFFFFF",
	"#D3D3D3",
	"#A9A9A9",
	"#696969",
	"#000000", // monochrome
	"#FFE4E1",
	"#FFA07A",
	"#FF0000",
	"#DC143C",
	"#8B0000", // reds
	"#FFE4B5",
	"#F4A460",
	"#FFA500",
	"#FF8C00",
	"#FF4500", // oranges
	"#FFFACD",
	"#EEE8AA",
	"#DAA520",
	"#FFFF00",
	"#BDB76B", // yellows
	"#F0FFF0",
	"#98FB98",
	"#7FFF00",
	"#3CB371",
	"#008000",
	"#006400", // greens
	"#E0FFFF",
	"#40E0D0",
	"#00FFFF",
	"#1E90FF",
	"#0000FF",
	"#000080", // blues
	"#E6E6FA",
	"#EE82EE",
	"#FF00FF",
	"#8A2BE2",
	"#800080",
	"#4B0082", // purples
	"#D2B48C",
	"#CD853F",
	"#8B4513",
	"#A52A2A",
	"#800000", // browns
];

function getColor() {
	let seed_no = getRandomInt(0, color_palette_seed_shortlist.length - 1);
	let color_hex = color_palette_seed_shortlist[seed_no];
	return color_hex;
}

function parseHSL(hslString) {
	const match = hslString.match(/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/);
	if (!match) return [0, 0, 0];
	return [parseFloat(match[1]), parseFloat(match[2]) / 100, parseFloat(match[3]) / 100];
}

// Helper function to convert a CSS color name to RGBA with a specified alpha
function cssColorToRgba(colorName) {
	const tempElement = document.createElement("div");
	tempElement.style.color = colorName;
	document.body.appendChild(tempElement);

	const computedColor = getComputedStyle(tempElement).color;
	document.body.removeChild(tempElement);

	// computedColor is in "rgb(r, g, b)" or "rgba(r, g, b, a)" format.
	const rgbValues = computedColor.match(/\d+/g); // Extract numeric values

	const r = parseInt(rgbValues[0], 10);
	const g = parseInt(rgbValues[1], 10);
	const b = parseInt(rgbValues[2], 10);

	return [r, g, b];
}

function hexToRgba(hex) {
	// Remove the leading '#' if present
	hex = hex.replace(/^#/, "");

	// Parse the hex color
	let r = parseInt(hex.substring(0, 2), 16);
	let g = parseInt(hex.substring(2, 4), 16);
	let b = parseInt(hex.substring(4, 6), 16);

	// Return the rgba color
	return [r, g, b];
}

// HSL to RGB conversion (returns r, g, b in 0–255)
function hslToRgb(h, s, l) {
	h = h % 360;
	const c = (1 - Math.abs(2 * l - 1)) * s;
	const hp = h / 60;
	const x = c * (1 - Math.abs((hp % 2) - 1));
	let r = 0,
		g = 0,
		b = 0;

	if (hp >= 0 && hp < 1) [r, g, b] = [c, x, 0];
	else if (hp < 2) [r, g, b] = [x, c, 0];
	else if (hp < 3) [r, g, b] = [0, c, x];
	else if (hp < 4) [r, g, b] = [0, x, c];
	else if (hp < 5) [r, g, b] = [x, 0, c];
	else if (hp < 6) [r, g, b] = [c, 0, x];

	const m = l - c / 2;
	return {
		r: Math.round((r + m) * 255),
		g: Math.round((g + m) * 255),
		b: Math.round((b + m) * 255),
	};
}

function hslToRGB(h, s, l) {
	s /= 100;
	l /= 100;

	const c = (1 - Math.abs(2 * l - 1)) * s;
	const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
	const m = l - c / 2;

	let r1, g1, b1;
	if (h < 60) [r1, g1, b1] = [c, x, 0];
	else if (h < 120) [r1, g1, b1] = [x, c, 0];
	else if (h < 180) [r1, g1, b1] = [0, c, x];
	else if (h < 240) [r1, g1, b1] = [0, x, c];
	else if (h < 300) [r1, g1, b1] = [x, 0, c];
	else [r1, g1, b1] = [c, 0, x];

	return [Math.round((r1 + m) * 255), Math.round((g1 + m) * 255), Math.round((b1 + m) * 255)];
}

function rgbToHSL(r, g, b) {
	r /= 255;
	g /= 255;
	b /= 255;
	const max = Math.max(r, g, b),
		min = Math.min(r, g, b);
	let h,
		s,
		l = (max + min) / 2;

	if (max === min) {
		h = s = 0; // achromatic
	} else {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2;
				break;
			case b:
				h = (r - g) / d + 4;
				break;
		}
		h /= 6;
	}
	return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function getRandomHexColor() {
	// Generate a random number between 0 and 0xFFFFFF, then convert it to a hexadecimal string
	const randomColor = Math.floor(Math.random() * 0xffffff).toString(16);
	// Pad with zeros if necessary to ensure the color has 6 characters
	return `#${randomColor.padStart(6, "0")}`;
}

function hexToHSL(hex) {
	let r = parseInt(hex.slice(1, 3), 16) / 255;
	let g = parseInt(hex.slice(3, 5), 16) / 255;
	let b = parseInt(hex.slice(5, 7), 16) / 255;

	let max = Math.max(r, g, b),
		min = Math.min(r, g, b);
	let h,
		s,
		l = (max + min) / 2;

	if (max === min) {
		h = s = 0; // achromatic
	} else {
		let d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2;
				break;
			case b:
				h = (r - g) / d + 4;
				break;
		}
		h /= 6;
	}

	return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

// Helper: build a CSS color with embedded alpha from any of your 3 formats
function getFillColorWithAlpha(fill_color, alphaPct) {
	const a = clamp(alphaPct, 0, 100) / 100;

	if (typeof fill_color === "string" && /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(fill_color)) {
		// hex -> rgba
		let hex = fill_color.slice(1);
		if (hex.length === 3)
			hex = hex
				.split("")
				.map((ch) => ch + ch)
				.join("");
		const r = parseInt(hex.slice(0, 2), 16);
		const g = parseInt(hex.slice(2, 4), 16);
		const b = parseInt(hex.slice(4, 6), 16);
		return `rgba(${r}, ${g}, ${b}, ${a})`;
	}

	if (Array.isArray(fill_color_rgb) && fill_color_rgb.length === 3) {
		const [r, g, b] = fill_color_rgb.map((v) => clamp(v, 0, 255));
		return `rgba(${r}, ${g}, ${b}, ${a})`;
	}

	if (Array.isArray(fill_color_hsl) && fill_color_hsl.length === 3) {
		const [h, s, l] = [fill_color_hsl[0], clamp(fill_color_hsl[1], 0, 100), clamp(fill_color_hsl[2], 0, 100)];
		return `hsla(${h}, ${s}%, ${l}%, ${a})`;
	}

	// Fallback
	return `rgba(0, 0, 0, ${a})`;
}

/////////////////////
//     SAVING      //
/////////////////////
Date.prototype.today = function () {
	return (this.getDate() < 10 ? "0" : "") + this.getDate() + "/" + (this.getMonth() + 1 < 10 ? "0" : "") + (this.getMonth() + 1) + "/" + this.getFullYear();
};

// For the time now
Date.prototype.timeNow = function () {
	return (
		(this.getHours() < 10 ? "0" : "") +
		this.getHours() +
		":" +
		(this.getMinutes() < 10 ? "0" : "") +
		this.getMinutes() +
		":" +
		(this.getSeconds() < 10 ? "0" : "") +
		this.getSeconds()
	);
};

function createFlattenedCanvas() {
	const offscreenCanvas = document.createElement("canvas");
	const offscreenCtx = offscreenCanvas.getContext("2d");
	offscreenCanvas.width = window_w;
	offscreenCanvas.height = window_h;
	offscreenCtx.imageSmoothingEnabled = true;
	offscreenCtx.globalAlpha = draw_canvas_data.opacity;
	offscreenCtx.drawImage(draw_canvas, 0, 0, window_w, window_h);

	return offscreenCanvas;
}

function getExportFileName(prefix = "JOURNEYPAINT") {
	const now = new Date();
	const iso_stamp = now.toISOString().replace(/[:.]/g, "-");
	return `${prefix}_${iso_stamp}.png`;
}

function downloadBlobAsImage(blob, fileName) {
	const downloadLink = document.createElement("a");
	downloadLink.setAttribute("download", fileName);
	const url = URL.createObjectURL(blob);
	downloadLink.setAttribute("href", url);
	downloadLink.click();
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function writeGifShort(bytes, value) {
	bytes.push(value & 0xff, (value >> 8) & 0xff);
}

function writeGifString(bytes, value) {
	for (let i = 0; i < value.length; i++) {
		bytes.push(value.charCodeAt(i));
	}
}

function getGifPaletteIndex(red, green, blue) {
	const r = red >> 5;
	const g = green >> 5;
	const b = blue >> 6;
	return (r << 5) | (g << 2) | b;
}

function writeGifSubBlocks(bytes, data) {
	for (let i = 0; i < data.length; i += 255) {
		const block = data.slice(i, i + 255);
		bytes.push(block.length, ...block);
	}
	bytes.push(0);
}

function encodeGifLzw(indexedPixels, minCodeSize = 8) {
	const clearCode = 1 << minCodeSize;
	const endCode = clearCode + 1;
	let codeSize = minCodeSize + 1;
	const output = [];
	let bitBuffer = 0;
	let bitCount = 0;

	function writeCode(code) {
		bitBuffer += code * Math.pow(2, bitCount);
		bitCount += codeSize;

		while (bitCount >= 8) {
			output.push(bitBuffer % 256);
			bitBuffer = Math.floor(bitBuffer / 256);
			bitCount -= 8;
		}
	}

	writeCode(clearCode);

	for (let i = 0; i < indexedPixels.length; i++) {
		writeCode(indexedPixels[i]);

		// Keep the stream at 9-bit literal codes. GIF decoders grow their
		// dictionaries while reading, so clear before they need 10-bit codes.
		if ((i + 1) % 250 === 0 && i < indexedPixels.length - 1) {
			writeCode(clearCode);
			codeSize = minCodeSize + 1;
		}
	}

	writeCode(endCode);

	if (bitCount > 0) {
		output.push(bitBuffer & 0xff);
	}

	return output;
}

function createGifBlob(frames, width, height, delayMs) {
	const bytes = [];
	const frameDelayMs = Number.isFinite(delayMs) ? delayMs : 100;
	const delay = Math.max(2, Math.round(frameDelayMs / 10));

	writeGifString(bytes, "GIF89a");
	writeGifShort(bytes, width);
	writeGifShort(bytes, height);
	bytes.push(0xf7, 0, 0);

	for (let r = 0; r < 8; r++) {
		for (let g = 0; g < 8; g++) {
			for (let b = 0; b < 4; b++) {
				bytes.push(Math.round((r / 7) * 255), Math.round((g / 7) * 255), Math.round((b / 3) * 255));
			}
		}
	}

	bytes.push(0x21, 0xff, 0x0b);
	writeGifString(bytes, "NETSCAPE2.0");
	bytes.push(3, 1);
	writeGifShort(bytes, 0);
	bytes.push(0);

	frames.forEach((frame) => {
		bytes.push(0x21, 0xf9, 4, 0);
		writeGifShort(bytes, delay);
		bytes.push(0, 0);

		bytes.push(0x2c);
		writeGifShort(bytes, 0);
		writeGifShort(bytes, 0);
		writeGifShort(bytes, width);
		writeGifShort(bytes, height);
		bytes.push(0);

		const indexedPixels = new Uint8Array(width * height);
		const data = frame.data;

		for (let i = 0, p = 0; i < data.length; i += 4, p++) {
			indexedPixels[p] = data[i + 3] === 0 ? 0 : getGifPaletteIndex(data[i], data[i + 1], data[i + 2]);
		}

		bytes.push(8);
		writeGifSubBlocks(bytes, encodeGifLzw(indexedPixels, 8));
	});

	bytes.push(0x3b);
	return new Blob([new Uint8Array(bytes)], { type: "image/gif" });
}

function getGifExportFileName(prefix = "JOURNEYPAINT") {
	const now = new Date();
	const iso_stamp = now.toISOString().replace(/[:.]/g, "-");
	return `${prefix}_${iso_stamp}.gif`;
}

function DownloadCanvasAsGif() {
	if (!window.pepepaint.canvas_animation_on || typeof window.pepepaint.renderAnimationFrameToCanvas !== "function") {
		DownloadCanvasAsPng();
		return;
	}

	const frameCanvas = document.createElement("canvas");
	const frameCtx = frameCanvas.getContext("2d", { willReadFrequently: true });
	frameCanvas.width = draw_canvas.width;
	frameCanvas.height = draw_canvas.height;
	const frames = [];

	for (let i = 0; i < 10; i++) {
		const hasFrame = window.pepepaint.renderAnimationFrameToCanvas(frameCtx, frameCanvas);
		if (!hasFrame) {
			DownloadCanvasAsPng();
			return;
		}
		frames.push(frameCtx.getImageData(0, 0, frameCanvas.width, frameCanvas.height));
	}

	const blob = createGifBlob(frames, frameCanvas.width, frameCanvas.height, window.animation_speed);
	downloadBlobAsImage(blob, getGifExportFileName("JOURNEYPAINT"));
}

function DownloadCanvasAsPng() {
	const offscreenCanvas = createFlattenedCanvas();

	// Generate the file name
	const fileName = getExportFileName("JOURNEYPAINT");

	// Convert offscreen canvas to Blob and download
	offscreenCanvas.toBlob(function (blob) {
		if (!blob) {
			return;
		}
		downloadBlobAsImage(blob, fileName);
	});
}

function DownloadCanvasAsImage() {
	if (window.pepepaint.canvas_animation_on) {
		DownloadCanvasAsGif();
		return;
	}

	DownloadCanvasAsPng();
}

async function shareCanvasImage() {
	const offscreenCanvas = createFlattenedCanvas();
	const fileName = getExportFileName("JOURNEYPAINT");

	const blob = await new Promise((resolve, reject) => {
		offscreenCanvas.toBlob((result) => {
			if (!result) {
				reject(new Error("Failed to export image for sharing."));
				return;
			}
			resolve(result);
		}, "image/png");
	});

	const shareFile = new File([blob], fileName, { type: "image/png" });

	const supports_share_api = !!navigator.share;
	const can_share_files = !navigator.canShare || navigator.canShare({ files: [shareFile] });

	if (supports_share_api && can_share_files) {
		try {
			// Keep payload file-only for better iOS compatibility.
			await navigator.share({ files: [shareFile] });
			return;
		} catch (error) {
			if (error && error.name === "AbortError") {
				return;
			}
			console.warn("Share failed. Falling back to download.", error);
		}
	}

	downloadBlobAsImage(blob, fileName);
}

function downloadSeparateCanvases() {
	const d = new Date();
	const today = d.toLocaleDateString();
	const time_now = d.toLocaleTimeString();
	const tempCanvas = document.createElement("canvas");
	const tempCtx = tempCanvas.getContext("2d");
	tempCanvas.width = window_w;
	tempCanvas.height = window_h;
	tempCtx.imageSmoothingEnabled = true;
	tempCtx.drawImage(draw_canvas, 0, 0, window_w, window_h);

	const fileName = `JOURNEYPAINT_${today}@${time_now}_LAYER_0.png`;
	const downloadLink = document.createElement("a");
	downloadLink.setAttribute("download", fileName);

	tempCanvas.toBlob(function (blob) {
		const url = URL.createObjectURL(blob);
		downloadLink.setAttribute("href", url);
		downloadLink.click();
	});
}

//////////////////////
//    VARIABLES     //
//////////////////////
const window_w = 400;
const window_h = 560;
function syncPreviewCanvasToActiveCanvas() {
	if (!preview_canvas || !preview_ctx) {
		return;
	}

	setupMainCanvas(preview_canvas, preview_ctx);
}

function setupMainCanvas(canvas, context) {
	if (!canvas || !context) return;

	const width = Math.max(1, Math.round(window_w));
	const height = Math.max(1, Math.round(window_h));

	canvas.width = width;
	canvas.height = height;

	context.setTransform(1, 0, 0, 1, 0, 0);
	context.imageSmoothingEnabled = true;
}

let nav_preview_canvas_width = 40;
let nav_preview_canvas_height = 40;

let mousePos;
let x, y;
let px, py;
let isDrawing = false; // Variable to track if the mouse button is down

let constantlyUpdateOnMousedown = true;
let stop_drawing_on_mouse_out = false;

let preserve_merged_layers = true;

// Filters (for canvas)

// Brushes
let brush_type = "image";

let brush_width = 50;
let brush_height = 50;

let brush_width_float = brush_width;
let brush_height_float = brush_height;

let brush_size_increment_x = 1;
let brush_size_increment_y = 1;

// Image
let img;
let image_opacity = 100;
let image_array = [];
let image_index = 0;

function getImageBrushAlpha() {
	return clampPct(Number(image_opacity) || 0) / 100;
}

// BEHAVIOURS

// Randomiser
let randomiser_brush_type_on = false;
let randomiser_brush_settings_on = true;
let randomiser_behaviour_type_on = false;
let randomiser_behaviour_settings_on = false;

let randomiser_brush_size_on = true;
let randomiser_brush_size_min = 10;
let randomiser_brush_size_max = 300;

// Drawing speed
let drawing_speed_on = false;
let drawing_frame_count = 0;
let drawing_speed = 1;

// Size
let brush_size_automation_on = false;
let brush_size_before_automation = null;
let randomise_lock_width_and_height = true;
let brush_width_random;
let randomise_width = true;
let random_walker_width = false;
let randomise_width_range = 40;
let randomise_width_speed = 2;
let randomise_width_easing = 0.5;

let brush_height_random;
let randomise_height = true;
let random_walker_height = false;
let randomise_height_range = 40;
let randomise_height_speed = 2;
let randomise_height_easing = 0.5;
// let break_coords = false;

// Follow
let follow_brush_direction = false;
let lastPos = null;
let smoothedDirection = { x: 1, y: 0 };

function getCurrentBrushSize() {
	const brushSizeInput = document.getElementById("brush_w_input_number");
	const parsed = Number.parseInt(brushSizeInput ? brushSizeInput.value : brush_height, 10);
	return Number.isFinite(parsed) ? parsed : brush_height;
}

function syncBrushSizeInputs() {
	const brushSizeRange = document.getElementById("brush_w_input_range");
	const brushSizeNumber = document.getElementById("brush_w_input_number");

	if (brushSizeRange) {
		brushSizeRange.value = brush_height;
	}
	if (brushSizeNumber) {
		brushSizeNumber.value = brush_height;
	}
}

function setBrushSizeAutomation(enabled) {
	const next_state = Boolean(enabled);

	if (next_state === brush_size_automation_on) {
		return;
	}

	if (next_state) {
		brush_size_before_automation = {
			width: brush_width,
			height: brush_height,
			width_float: brush_width_float,
			height_float: brush_height_float,
		};
	} else if (brush_size_before_automation) {
		brush_width = brush_size_before_automation.width;
		brush_height = brush_size_before_automation.height;
		brush_width_float = brush_size_before_automation.width_float;
		brush_height_float = brush_size_before_automation.height_float;
		syncBrushSizeInputs();
		brush_size_before_automation = null;
	}

	brush_size_automation_on = next_state;
}

function getActiveBrushAspectRatio() {
	const activeImage = image_array[Number.parseInt(image_index, 10)];
	if (!activeImage) {
		return 1;
	}

	const naturalWidth = activeImage.naturalWidth || activeImage.width;
	const naturalHeight = activeImage.naturalHeight || activeImage.height;
	if (!naturalWidth || !naturalHeight) {
		return 1;
	}

	return naturalWidth / naturalHeight;
}

function setBrushSizeFromHeight(size) {
	const nextHeight = Number.parseInt(size, 10);
	if (!Number.isFinite(nextHeight)) {
		return;
	}

	const nextWidth = Math.max(1, Math.round(nextHeight * getActiveBrushAspectRatio()));
	brush_width = nextWidth;
	brush_height = nextHeight;
	brush_width_float = nextWidth;
	brush_height_float = nextHeight;
	syncBrushSizeInputs();
}
let smoothing_factor = 0.5;
let follow_angle_rads = 0;

// Rotate
let rotate_on = false;
let manual_inc_rotate = 10;
let rotate_angle = 0;
let rotate_angle_rads = rotate_angle * (Math.PI / 180);
let rotate_speed = parseFloat(500 / 100);
let auto_rotate = true;
let origin_x = 0;
let origin_y = 0;
let flip_brush_h = false;
let flip_brush_v = false;

// let total_angle_rads = 0;

// Mirror
let mirror_on = false;
let mirror_reflections = 4;
let mirror_origin_x = 50;
let mirror_origin_y = 50;
let mirror_angle_degrees = 0;
let mirror_angle_rads = (mirror_angle_degrees * Math.PI) / 180; // Convert to radians;
let mirror_origin = getMirrorOrigin();

// Snap
let snap_on = false;
let snap_match_brush_size_on = false;
let snap_x = 10;
let snap_y = 10;
let is_x_holding_set = false;
let is_y_holding_set = false;
let is_x_holding = false;
let is_y_holding = false;
let x_hold = 0;
let y_hold = 0;

// Increment
let increment_on = false;
let auto_inc_x_amount = 2;
let auto_inc_y_amount = 2;
let auto_inc_x_running = 0;
let auto_inc_y_running = 0;
let increment_screen_wrap_on = true;
let wave_on = false;
let x_amp = 20;
let x_freq = 0.09;
let x_phase = 0;
let y_amp = 80;
let y_freq = 0.02;
let y_phase = 0;

// Fx
let fx_on = false;
let filters = "none"; // `sepia(100%)`; // `blur(5px)`;

function isFxAllowedForBrushType(_brush_type_name) {
	return true;
}

let hue_rotate_amount = 0;
let auto_hue_rotate_on = true;
let auto_hue_increment_amount = 10;

let brightness_amount = 100;
let brightness_auto_increment_on = true;
let brightness_auto_increment_amount = 1.89;
let brightness_ping_pong_on = true;
let brightness_ping_pong_direction = 1;

let saturate_amount = 100;
let saturate_auto_increment_on = true;
let saturate_auto_increment_amount = 2.23;
let saturate_ping_pong_on = true;
let saturate_ping_pong_direction = 1;

let drop_shadow_on = false;
let drop_shadow_color = "black";
let drop_shadow_color_rgb = hexToRgba(drop_shadow_color);
let drop_shadow_x_amount = 30;
let drop_shadow_y_amount = 30;
let drop_shadow_blur_amount = 10;

let opacity_amount = 100;
let opacity_auto_increment_on = false;
let opacity_auto_increment_amount = 0.4;
let opacity_ping_pong_on = true;
let opacity_ping_pong_direction = 1;

let invert_on = true;
let invert_amount = 100;
let invert_auto_increment_on = false;
let invert_auto_increment_amount = 5;
let invert_ping_pong_on = false;
let invert_ping_pong_direction = 1;

let blur_on = false;
let blur_amount = 4;

// Blend
let blend_on = false;
let blend_mode = "difference";

let tint_r = 255;
let tint_g = 255;
let tint_b = 255;

// Set sliders and inputs to initial settings
function setSlidersAndInputs() {
	// BRUSH SIZE
	syncBrushSizeInputs();

	// IMAGE
	setTimeout(() => {
		let image_radio = document.getElementById(`image_brush_${image_index}`);
		if (image_radio) {
			image_radio.checked = true;
		}
	}, 2000);
	document.getElementById("image_opacity_input_range").value = image_opacity;
}

setSlidersAndInputs();

//////////////////////////
//      RANDOMIZER      //
//////////////////////////
function randIndividual(type_to_randomise) {
	// BEHAVIOURS
	if (type_to_randomise == "size") {
		randomise_lock_width_and_height = Math.random() < 0.5;
		randomise_width = Math.random() < 0.5;
		random_walker_width = Math.random() < 0.5;
		randomise_width_range = getRandomInt(1, Math.abs(brush_width));
		randomise_width_speed = getRandomInt(1, 10);
		randomise_width_easing = getRandomFloat(0, 1);

		randomise_height = Math.random() < 0.5;
		random_walker_height = Math.random() < 0.5;
		randomise_height_range = getRandomInt(1, Math.abs(brush_height));
		randomise_height_speed = getRandomInt(1, 10);
		randomise_height_easing = getRandomFloat(0, 1);

		let current_width = getCurrentBrushSize();
		brush_width_random = new RandomWalker(
			current_width,
			current_width - randomise_width_range,
			current_width + randomise_width_range,
			randomise_width_speed,
			randomise_width_easing,
			random_walker_width,
		);
		let current_height = getCurrentBrushSize();
		brush_height_random = new RandomWalker(
			current_height,
			current_height - randomise_height_range,
			current_height + randomise_height_range,
			randomise_height_speed,
			randomise_height_easing,
			random_walker_height,
		);
	} else if (type_to_randomise == "follow") {
		smoothing_factor = getRandomFloat(0, 1);
	} else if (type_to_randomise == "rotate") {
		manual_inc_rotate = 10;
		rotate_angle = getRandomInt(0, 359);
		rotate_angle_rads = rotate_angle * (Math.PI / 180);
		rotate_speed = parseFloat(getRandomInt(1, 1000) / 100);
		auto_rotate = Math.random() < 0.5;
		origin_x = getRandomInt(0, window_w / 2);
		origin_y = getRandomInt(0, window_h / 2);
		flip_brush_h = Math.random() < 0.5;
		flip_brush_v = Math.random() < 0.5;
	} else if (type_to_randomise == "mirror") {
		mirror_reflections = getRandomInt(2, 8);
		mirror_angle_degrees = getRandomInt(0, 359);
		mirror_angle_rads = (mirror_angle_degrees * Math.PI) / 180; // Convert to radians;
		mirror_origin = getMirrorOrigin();
	} else if (type_to_randomise == "snap") {
		snap_x = getRandomInt(2, 20);
		snap_y = getRandomInt(2, 20);
	} else if (type_to_randomise == "increment") {
		auto_inc_x_amount = getRandomInt(-20, 20);
		auto_inc_y_amount = getRandomInt(-20, 20);
		increment_screen_wrap_on = Math.random() < 0.5;
		wave_on = Math.random() < 0.5;
		x_amp = getRandomInt(1, 100);
		x_freq = getRandomFloat(0, 0.1);
		y_amp = getRandomInt(1, 100);
		y_freq = getRandomFloat(0, 0.1);
	} else if (type_to_randomise == "fx") {
		hue_rotate_on = Math.random() < 0.5;
		hue_rotate_amount = getRandomInt(1, 359);
		auto_hue_rotate_on = Math.random() < 0.5;
		auto_hue_increment_amount = getRandomInt(1, 359);

		blur_on = Math.random() < 0.5;
		blur_amount = getRandomInt(1, 10);

		brightness_on = Math.random() < 0.5;
		brightness_amount = getRandomInt(1, 100);
		brightness_auto_increment_on = Math.random() < 0.5;
		brightness_auto_increment_amount = getRandomInt(1, 50);
		brightness_ping_pong_on = Math.random() < 0.5;

		saturate_on = Math.random() < 0.5;
		saturate_amount = getRandomInt(1, 100);
		saturate_auto_increment_on = Math.random() < 0.5;
		saturate_auto_increment_amount = getRandomInt(1, 50);
		saturate_ping_pong_on = Math.random() < 0.5;

		opacity_on = Math.random() < 0.5;
		opacity_amount = getRandomInt(0, 100);
		opacity_auto_increment_on = Math.random() < 0.5;
		opacity_auto_increment_amount = getRandomInt(1, 50);
		opacity_ping_pong_on = Math.random() < 0.5;

		drop_shadow_on = Math.random() < 0.5;
		drop_shadow_color = getColor(); // getRandomHexColor();
		drop_shadow_color_rgb = hexToRgba(drop_shadow_color);
		drop_shadow_x_amount = getRandomInt(-100, 100);
		drop_shadow_y_amount = getRandomInt(-100, 100);
		drop_shadow_blur_amount = getRandomInt(2, 12);

		invert_on = Math.random() < 0.5;
		invert_amount = getRandomInt(0, 100);
		invert_auto_increment_on = Math.random() < 0.5;
		invert_auto_increment_amount = getRandomInt(1, 50);
		invert_ping_pong_on = Math.random() < 0.5;
	} else if (type_to_randomise == "blend") {
		const blend_options = [
			"source-atop",
			"destination-over",
			"destination-out",
			"lighter",
			"blend_xor",
			"multiply",
			"lighter",
			"screen",
			"overlay",
			"darken",
			"lighten",
			"color-dodge",
			"color-burn",
			"hard-light",
			"soft-light",
			"difference",
			"exclusion",
			"blend_hue",
			"saturation",
			"color",
			"luminosity",
		];
		blend_type = blend_options[Math.floor(Math.random() * blend_options.length)];
	}

	// BRUSHES
	else if (type_to_randomise == "image") {
		image_opacity = getRandomInt(0, 100);
		image_index = getRandomInt(0, image_array.length - 1);
		image_is_ellipse = Math.random() < 0.5;
	}

	setSlidersAndInputs();
}

function randAll() {
	image_opacity = getRandomInt(0, 100);
	image_index = getRandomInt(0, image_array.length - 1);

	if (randomiser_behaviour_type_on) {
		setBrushSizeAutomation(Math.random() < 0.2);
		rotate_on = Math.random() < 0.2;
		mirror_on = Math.random() < 0.2;
		snap_on = Math.random() < 0.2;
		increment_on = Math.random() < 0.2;
		blend_on = Math.random() < 0.2;
		fx_on = Math.random() < 0.2;
		follow_brush_direction = Math.random() < 0.2;
	}

	if (randomiser_behaviour_settings_on) {
		const behaviour_options = ["size", "follow", "rotate", "mirror", "snap", "increment", "fx", "blend"];

		behaviour_options.forEach((behaviour_option) => {
			randIndividual(behaviour_option);
		});
	}

	if (randomiser_brush_size_on) {
		if (randomiser_brush_size_min < 1) {
			randomiser_brush_size_min = 1;
		}
		setBrushSizeFromHeight(getRandomInt(randomiser_brush_size_min, randomiser_brush_size_max));
	}

	setSlidersAndInputs();
}

/////////////////////////////
//   CONTROLS MANAGEMENT   //
/////////////////////////////
// c d f g h n m p r s t w x y z 1-9 0
function stepBrushSize(direction) {
	brush_height_float += brush_size_increment_y * direction;
	setBrushSizeFromHeight(Math.round(brush_height_float));
}

function stepManualRotate(direction) {
	rotate_angle += manual_inc_rotate * direction;
	rotate_angle_rads = rotate_angle * (Math.PI / 180);
}

function shouldIgnoreKeyboardShortcut(event) {
	const activeElement = document.activeElement;
	const target = event.target;
	const editableElement = target instanceof Element ? target : activeElement;

	if (submission_dialog?.open && editableElement?.closest("#submission_dialog")) {
		return true;
	}

	if (!activeElement) {
		return false;
	}

	if (activeElement.closest?.("#nav_container")) {
		return false;
	}

	if (activeElement.isContentEditable) {
		return true;
	}

	const tagName = activeElement.tagName;
	return tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT";
}

document.addEventListener("keydown", (e) => {
	// console.log("key: " + e.key);
	if (shouldIgnoreKeyboardShortcut(e)) {
		return;
	}

	// Skip if a meta key is held down
	if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;

	if (e.key == "s") {
		DownloadCanvasAsImage();
	} else if (e.key == "n") {
		stepBrushSize(-1);
	} else if (e.key == "m") {
		stepBrushSize(1);
	} else if (e.key === "d") {
		stepManualRotate(-1);
	} else if (e.key === "c") {
		stepManualRotate(1);
	} else if (e.key == "k") {
		is_x_holding = true;
	} else if (e.key == "l") {
		is_y_holding = true;
	} else if (e.key === "z" && draw_canvas) {
		layerUndo();
	} else if (e.key === "x" && draw_canvas) {
		layerRedo();
	} else if (e.key === "f") {
		flip_brush_h = true;
	} else if (e.key === "v") {
		flip_brush_v = true;
	}
});

function toggleControlsVisibility() {
	document.querySelectorAll("#nav_container").forEach((bar) => {
		bar.classList.toggle("hidden");
	});
}

document.addEventListener("keyup", (e) => {
	if (shouldIgnoreKeyboardShortcut(e)) {
		return;
	}

	if (e.key == "f" || e.key == "v") {
		is_x_holding = false;
		is_x_holding_set = false;
		is_y_holding = false;
		is_y_holding_set = false;
	} else if (e.key === "g") {
		flip_brush_h = false;
	} else if (e.key === "b") {
		flip_brush_v = false;
	} else if (e.key === "h") {
		toggleControlsVisibility();
	} else if (e.key === "1") {
		setBrushSizeAutomation(!brush_size_automation_on);
		console.log(`brush_size_automation: ${brush_size_automation_on},
			randomise_lock_width_and_height: ${randomise_lock_width_and_height},
			randomise_width: ${randomise_width},
			random_walker_width: ${random_walker_width},
			randomise_width_range: ${randomise_width_range},
			randomise_width_speed: ${randomise_width_speed},
			randomise_width_easing: ${randomise_width_easing},
			randomise_height: ${randomise_height},
			random_walker_height: ${random_walker_height},
			randomise_height_range: ${randomise_height_range},
			randomise_height_speed: ${randomise_height_speed},
			randomise_height_easing: ${randomise_height_easing}`);
	} else if (e.key === "2") {
		follow_brush_direction = !follow_brush_direction;
		if (!follow_brush_direction) {
			if (rotate_on) {
				rotate_angle = parseInt(document.getElementById("rotate_angle_input_number").value);
				rotate_angle_rads = rotate_angle * (Math.PI / 180);
			} else {
				rotate_angle = 0;
				rotate_angle_rads = 0; // rotate_angle * (Math.PI / 180);
			}
		}
		console.log(`follow_brush_direction: ${follow_brush_direction}`);
	} else if (e.key === "3") {
		rotate_on = !rotate_on;
		if (rotate_on) {
			rotate_angle = parseInt(document.getElementById("rotate_angle_input_number").value);
			rotate_angle_rads = rotate_angle * (Math.PI / 180);
		} else {
			rotate_angle = 0;
			rotate_angle_rads = 0; // rotate_angle * (Math.PI / 180);
		}
		console.log(`rotate: ${rotate_on},
			rotate_angle: ${rotate_angle},
			rotate_speed: ${rotate_speed},
			auto_rotate: ${auto_rotate},
			origin_x: ${origin_x},
			origin_y: ${origin_y}`);
	} else if (e.key === "4") {
		mirror_on = !mirror_on;
		console.log(`mirror: ${mirror_on},
			mirror_reflections: ${mirror_reflections},
			mirror_angle_degrees: ${mirror_angle_degrees},
			mirror_origin_x: ${mirror_origin_x},
			mirror_origin_y: ${mirror_origin_y}`);
	} else if (e.key === "5") {
		snap_on = !snap_on;
		console.log(`snap: ${snap_on},
			snap_x: ${snap_x},
			snap_y: ${snap_y}`);
	} else if (e.key === "6") {
		increment_on = !increment_on;
		console.log(`increment: ${increment_on},
			auto_inc_x_amount: ${auto_inc_x_amount},
			auto_inc_y_amount: ${auto_inc_y_amount},
			increment_screen_wrap_on: ${increment_screen_wrap_on},
			wave_on: ${wave_on},
			x_amp: ${x_amp},
			x_freq: ${x_freq},
			y_amp: ${y_amp},
			y_freq: ${y_freq}`);
	} else if (e.key === "7") {
		fx_on = !fx_on;
		setFilters();
		console.log(`fx_on: ${fx_on},
			filters: ${filters},
			hue_rotate_amount: ${hue_rotate_amount},
			auto_hue_rotate_on: ${auto_hue_rotate_on},
			auto_hue_increment_amount: ${auto_hue_increment_amount},
			brightness_amount: ${brightness_amount},
			brightness_auto_increment_on: ${brightness_auto_increment_on},
			brightness_auto_increment_amount: ${brightness_auto_increment_amount},
			brightness_ping_pong_on: ${brightness_ping_pong_on},
			saturate_amount: ${saturate_amount},
			saturate_auto_increment_on: ${saturate_auto_increment_on},
			saturate_auto_increment_amount: ${saturate_auto_increment_amount},
			saturate_ping_pong_on: ${saturate_ping_pong_on},
			opacity_amount: ${opacity_amount},
			opacity_auto_increment_on: ${opacity_auto_increment_on},
			opacity_auto_increment_amount: ${opacity_auto_increment_amount},
			opacity_ping_pong_on: ${opacity_ping_pong_on},
			drop_shadow_color_rgb: ${drop_shadow_color_rgb},
			drop_shadow_x_amount: ${drop_shadow_x_amount},
			drop_shadow_y_amount: ${drop_shadow_y_amount},
			drop_shadow_blur_amount: ${drop_shadow_blur_amount},
			invert_on: ${invert_on},
			invert_amount: ${invert_amount},
			invert_auto_increment_on: ${invert_auto_increment_on},
			invert_auto_increment_amount: ${invert_auto_increment_amount},
			invert_ping_pong_on: ${invert_ping_pong_on},
			blur_on: ${blur_on},
			blur_amount: ${blur_amount}`);
	} else if (e.key === "8") {
		blend_on = !blend_on;
		console.log(`blend_on: ${blend_on},
			blend_mode: ${blend_mode},
			Available blend modes: source-atop, destination-over, destination-out, lighter, blend_xor, multiply, lighter, screen, overlay, darken, lighten, color-dodge, color-burn, hard-light, soft-light, difference, exclusion, blend_hue, saturation, color, luminosity`);
	} else if (e.key === "0") {
		blend_on = false;
		fx_on = false;
		rotate_on = false;
		rotate_angle = 0;
		rotate_angle_rads = 0; // rotate_angle * (Math.PI / 180);
		mirror_on = false;
		snap_on = false;
		increment_on = false;
		follow_brush_direction = false;
		setBrushSizeAutomation(false);
		console.log(`All behaviours turned off`);
	} else if (e.key === "a") {
		randAll();
	} else if (e.key === "q") {
		blurr();
		console.log(`blur applied,
			canvas_blur_amount: ${window.canvas_blur_amount}`);
	} else if (e.key === "w") {
		invert();
		console.log(`invert applied,
			invert_percentage_amount: ${window.invert_percentage_amount}`);
	} else if (e.key === "e") {
		threshold();
		console.log(`threshold applied,
			threshold_level_amount: ${window.threshold_level_amount}`);
	} else if (e.key === "r") {
		dither();
		console.log(`dither applied,
			dither_pixel_size: ${window.dither_pixel_size}`);
	} else if (e.key === "t") {
		dilate();
		console.log(`dilate applied`);
	} else if (e.key === "y") {
		erode();
		console.log(`erode applied`);
	} else if (e.key === "u") {
		emboss();
		console.log(`emboss applied,
			emboss_pixel_size_amount: ${window.emboss_pixel_size_amount}`);
	} else if (e.key === "i") {
		edges();
		console.log(`edges applied,
			edge_pixel_size_amount: ${window.edge_pixel_size_amount}`);
	} else if (e.key === "o") {
		glitch();
		console.log(`glitch applied,
			glitch_pixel_size: ${window.glitch_pixel_size},
			canvas_glitch_amount: ${window.canvas_glitch_amount}`);
	} else if (e.key === "p") {
		pixelate();
		console.log(`pixelate applied,
			pixelate_amount: ${window.pixelate_amount}`);
	} else if (e.key === "j") {
		animatedGlitch();
		console.log(`animated glitch applied,
			animation_speed: ${window.animation_speed},
			glitch_pixel_size: ${window.glitch_pixel_size},
			canvas_glitch_amount: ${window.canvas_glitch_amount}`);
	} else if (e.key === "k") {
		animatedVhs();
		console.log(`animated vhs applied,
			animation_speed: ${window.animation_speed}`);
	} else if (e.key === "l") {
		animatedDither();
		console.log(`animated dither applied,
			animation_speed: ${window.animation_speed},
			dither_pixel_size: ${window.dither_pixel_size}`);
	}
});

// Any change in inputs
document.addEventListener("input", function (event) {
	if (event.target && event.target.classList.contains("canvas_controller")) {
		let type = event.target.dataset.type;
		console.log(type);
	} else if (event.target && event.target.classList.contains("brush_controller")) {
		let type = event.target.dataset.type;

		if (type == "brush_type") {
			const next_brush_type = event.target.dataset.brush_type;
			if (!isBrushTypeAvailable(next_brush_type)) {
				syncBrushType();
				return;
			}

			brush_type = next_brush_type;
		} else if (type == "brush_dim") {
			setBrushSizeFromHeight(event.target.value);

			if (randomise_width) {
				brush_width_random = new RandomWalker(
					brush_width,
					brush_width - randomise_width_range,
					brush_width + randomise_width_range,
					randomise_width_speed,
					randomise_width_easing,
					random_walker_width,
				);
			}
			if (randomise_height) {
				brush_height_random = new RandomWalker(
					brush_height,
					brush_height - randomise_height_range,
					brush_height + randomise_height_range,
					randomise_height_speed,
					randomise_height_easing,
					random_walker_height,
				);
			}
		} else if (type == "image") {
			let controller = event.target.dataset.controller;
			if (controller == "image_is_ellipse") {
				image_is_ellipse = event.target.checked;
			} else if (controller == "image_brush_shape") {
				image_index = event.target.dataset.image_index;
				setBrushSizeFromHeight(getCurrentBrushSize());
			} else if (controller == "image_opacity") {
				image_opacity = clampPct(parseInt(event.target.value, 10) || 0);
			}
		}
	}
});

////////////////////////////
//     RANDOMISATION      //
////////////////////////////
function getRandomStep(speed, easing) {
	let step = (Math.random() * 2 - 1) * speed; // Random step scaled by speed
	return step * easing; // Apply easing
}

class RandomWalker {
	constructor(current_number, range_min, range_max, speed, easing, use_random_walker) {
		const min = Math.min(range_min, range_max);
		const max = Math.max(range_min, range_max);
		this.minRange = min;
		this.maxRange = max;
		this.currentNumber = current_number;
		this.speedFactor = speed; // Speed between 2-7
		this.easingFactor = easing; // Easing between 0.5-1
		this.useRandomWalker = use_random_walker; // Randomly enable walker mode
		// this.displayElement = this.createDisplayElement();
	}

	// Generate a random number within a range
	getRandomNumber(min, max) {
		if (min > max) {
			[min, max] = [max, min];
		}
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	// Get a random step with speed and easing factors
	getRandomStep() {
		let step = (Math.random() * 2 - 1) * this.speedFactor;
		return step * this.easingFactor;
	}

	// Create a display element for each walker
	createDisplayElement() {
		let display = document.createElement("div");
		display.style.fontSize = "32px";
		display.style.fontWeight = "bold";
		display.style.textAlign = "center";
		display.style.margin = "10px";
		document.body.appendChild(display);
		return display;
	}

	// Update the random number for this walker
	update() {
		if (this.useRandomWalker) {
			this.currentNumber += this.getRandomStep();
			// Keep within range
			this.currentNumber = Math.max(this.minRange, Math.min(this.maxRange, this.currentNumber));
		} else {
			this.currentNumber = this.getRandomNumber(this.minRange, this.maxRange);
		}
		// this.displayElement.textContent = `Walker ${this.id}: ${Math.round(this.currentNumber)}`;
	}
}

function initRandomWalkers() {
	let current_width = getCurrentBrushSize();
	brush_width_random = new RandomWalker(
		current_width,
		current_width - randomise_width_range,
		current_width + randomise_width_range,
		randomise_width_speed,
		randomise_width_easing,
		random_walker_width,
	);

	let current_height = getCurrentBrushSize();
	brush_height_random = new RandomWalker(
		current_height,
		current_height - randomise_height_range,
		current_height + randomise_height_range,
		randomise_height_speed,
		randomise_height_easing,
		random_walker_height,
	);
}

initRandomWalkers();

///////////////////////
//    IMAGE BRUSH    //
///////////////////////
function drawImageToCanvas(ctx, px, py, reflectX = false, reflectY = false, rotation = 0) {
	// Bail out early if brush size is invalid
	if (!brush_width || !brush_height) {
		return; // Skip drawing if either dimension is 0
	}

	// Normalize negative sizes
	const width = Math.abs(brush_width);
	const height = Math.abs(brush_height);

	ctx.save();
	ctx.globalAlpha *= getImageBrushAlpha();

	// Translate, rotate, and scale as needed
	ctx.translate(px, py);
	ctx.rotate(rotation);
	ctx.scale(
		(reflectX ? -1 : 1) * (flip_brush_h ? -1 : 1) * (brush_width < 0 ? -1 : 1),
		(reflectY ? -1 : 1) * (flip_brush_v ? -1 : 1) * (brush_height < 0 ? -1 : 1),
	);

	// Draw the image centered at the transformed origin
	ctx.drawImage(image_array[image_index], -width / 2, -height / 2, width, height);

	ctx.restore();
}

// Generate image controllers
let image_brush_array = [
	"b19",
	"blob1",
	"blob6",
	"blob7",
	"blob8",
	"blob9",
	"blob10",
	"blob11",
	"blob12",
	"blob13",
	"blob14",
	"cat1",
	"cat2",
	"chad1",
	"chad2",
	"chad3",
	"cheems",
	"doge1",
	"face1",
	"face2",
	"face3",
	"face4",
	"fist1",
	"foil1",
	"foil2",
	"girlrunning",
	"gondola1",
	"gondola2",
	"green_up",
	"groyper1",
	"groyper2",
	"groyper3",
	"grug1",
	"grug2",
	"hand",
	"heart02",
	"knuckles2",
	"knuckles3",
	"mememan1",
	"mememan2",
	"npc2",
	"orang1",
	"orbi1",
	"orbi2",
	"orbi3",
	"orbi4",
	"orbi5",
	"orbi6",
	"pepe01",
	"pepe02",
	"pepe03",
	"pepe04",
	"pepe05",
	"pepe06",
	"pepe07",
	"pepe14",
	"pepe15",
	"pepe16",
	"pepe18",
	"pepe19",
	"pixels39",
	"rarestbook",
	"red_down",
	"sanic1",
	"sanic2",
	"sminem1",
	"sonic3",
	"spoderman1",
	"spongebob1",
	"sun4",
	"swoledoge",
	"template01",
	"template02",
	"template03",
	"template04",
	"template05",
	"trad",
	"tree4",
	"turtle",
	"ufo4",
	"weds1",
	"weds2",
	"wifejak1",
	"wifejakpepe",
	"wojak2",
	"wojak3",
	"wojak4",
	"wojak6",
	"wojak7",
];

for (let i = 0; i < image_brush_array.length; i++) {
	let image_name = image_brush_array[i];

	// create html controllers
	let image_controller = `<input type="radio" name="brush_shape" id="image_brush_${i}" class="controller brush_controller hidden_radio" data-type="image" data-controller="image_brush_shape" data-image_index="${i}"/>
      <label for="image_brush_${i}" class="controller color_box" style="background-image: url('brushes/${image_name}.png'); background-position: center; background-repeat: no-repeat; background-size: cover;"></label>`;

	document.getElementById("image_brush_controls").insertAdjacentHTML("beforeend", image_controller);

	// add url to image array
	image_array[i] = new Image();
	image_array[i].onload = () => {
		if (Number.parseInt(image_index, 10) !== i) {
			return;
		}

		setBrushSizeFromHeight(getCurrentBrushSize());
	};
	image_array[i].src = `brushes/${image_name}.png`;
}

////////////////////////
//     CANVASSES      //
////////////////////////
const draw_canvas = document.getElementById("draw_canvas");
const draw_ctx = draw_canvas.getContext("2d", { willReadFrequently: true });
const preview_canvas = document.getElementById("preview_canvas");
const preview_ctx = preview_canvas.getContext("2d");

const draw_canvas_data = {
	element: draw_canvas,
	context: draw_ctx,
	history: [],
	redoStack: [],
	blendMode: "normal",
	opacity: 1,
};

setupMainCanvas(draw_canvas, draw_ctx);
setupMainCanvas(preview_canvas, preview_ctx);
draw_canvas.style.zIndex = "1";
draw_canvas.style.mixBlendMode = draw_canvas_data.blendMode;
draw_canvas.style.opacity = draw_canvas_data.opacity;
preview_ctx.lineJoin = "miter";
preview_ctx.lineCap = "butt";

function saveCanvasState() {
	const currentCanvasState = draw_canvas.toDataURL();
	const canvasHistory = draw_canvas_data.history;
	canvasHistory.push(currentCanvasState);
	if (canvasHistory.length > 50) canvasHistory.shift();
	draw_canvas_data.redoStack = [];
}

const canvas_blend_radios = document.getElementsByName("canvas_blend_mode");
function setRadios(blend_name) {
	canvas_blend_radios.forEach((radio) => {
		if (radio.value === blend_name) {
			radio.checked = true;
		}
	});
}

function setCanvasBlendMode(blendMode) {
	draw_canvas_data.blendMode = blendMode;
	draw_canvas.style.mixBlendMode = blendMode;
	setRadios(blendMode);
}

function layerUndo() {
	clearFilters();
	clearBlendMode(draw_ctx);

	const history = draw_canvas_data.history;
	if (history.length > 0) {
		const redoStack = draw_canvas_data.redoStack;
		const currentCanvasState = draw_canvas.toDataURL();
		redoStack.push(currentCanvasState);
		const previousState = history.pop();

		const img = new Image();
		img.onload = () => {
			draw_ctx.clearRect(0, 0, window_w, window_h);
			draw_ctx.imageSmoothingEnabled = true;
			draw_ctx.drawImage(img, 0, 0, window_w, window_h);
			setFilters();
			setBlendMode(draw_ctx);
		};
		img.src = previousState;
	} else {
		setFilters();
		setBlendMode(draw_ctx);
	}
}

function layerRedo() {
	clearFilters();
	clearBlendMode(draw_ctx);

	const redoStack = draw_canvas_data.redoStack;
	if (redoStack.length > 0) {
		const history = draw_canvas_data.history;
		const currentCanvasState = draw_canvas.toDataURL();
		history.push(currentCanvasState);
		if (history.length > 50) history.shift();
		const nextState = redoStack.pop();

		const img = new Image();
		img.onload = () => {
			draw_ctx.clearRect(0, 0, window_w, window_h);
			draw_ctx.imageSmoothingEnabled = true;
			draw_ctx.drawImage(img, 0, 0, window_w, window_h);
			setFilters();
			setBlendMode(draw_ctx);
		};
		img.src = nextState;
	} else {
		setFilters();
		setBlendMode(draw_ctx);
	}
}

setRadios(draw_canvas_data.blendMode);
function setFilters() {
	if (fx_on) {
		clearFilters();

		if (auto_hue_rotate_on) {
			filters += `hue-rotate(${hue_rotate_amount}deg)`;
		}
		if (blur_on) {
			filters += `blur(${blur_amount}px)`;
		}
		if (brightness_auto_increment_on) {
			filters += `brightness(${brightness_amount}%)`;
		} else {
			filters += `brightness(100%)`;
		}
		if (opacity_auto_increment_on) {
			filters += `opacity(${parseInt(opacity_amount)}%)`;
		}
		if (invert_auto_increment_on) {
			filters += `invert(${invert_amount}%)`;
		}
		if (saturate_auto_increment_on) {
			filters += `saturate(${saturate_amount}%)`;
		} else {
			filters += `saturate(100%)`;
		}
		if (drop_shadow_on) {
			filters += `drop-shadow(${drop_shadow_x_amount}px ${drop_shadow_y_amount}px ${drop_shadow_blur_amount}px ${drop_shadow_color})`;
		}
	} else {
		// draw_ctx.filter = 'none';
		// preview_ctx.filter = 'none';
		clearFilters();
	}
	draw_ctx.filter = filters;
}

function clearFilters() {
	filters = ``;
	draw_ctx.filter = "none";
	preview_ctx.filter = "none";
}

function setBlendMode(ctx) {
	if (blend_on) {
		ctx.globalCompositeOperation = blend_mode;
	} else {
		ctx.globalCompositeOperation = "source-over";
	}
}

function clearBlendMode(ctx) {
	draw_ctx.globalCompositeOperation = "source-over";
}

/////////////////////////
//        DRAW         //
/////////////////////////
function getPointerPosition(canvas, event) {
	// Function to get the pointer position relative to the canvas
	const rect = canvas.getBoundingClientRect(); // Get the canvas bounds
	const x = event.clientX - rect.left; // Adjust for canvas position
	const y = event.clientY - rect.top;
	return { x, y };
}

function doBrushing(ctx, px, py) {
	drawImageToCanvas(ctx, px, py, false, false, rotate_angle_rads);
	if (!mirror_on) {
		return;
	}

	if (mirror_reflections % 2 === 1) {
		for (let i = 1; i < mirror_reflections; i++) {
			const theta = mirror_angle_rads + i * ((2 * Math.PI) / mirror_reflections);
			const p = rotatePoint(px, py, mirror_origin, theta);
			drawImageToCanvas(ctx, p.x, p.y, 50, 50, rotate_angle_rads);
		}
		return;
	}

	if (mirror_reflections == 2) {
		const rp = reflectPoint(px, py, mirror_angle_rads);
		drawImageToCanvas(ctx, rp.x, rp.y, false, true, -rotate_angle_rads);
	} else if (mirror_reflections == 4) {
		const rp1 = reflectPoint(px, py, mirror_angle_rads);
		drawImageToCanvas(ctx, rp1.x, rp1.y, false, true, -rotate_angle_rads);

		const rp2 = reflectPoint(px, py, mirror_angle_rads + Math.PI / 2);
		drawImageToCanvas(ctx, rp2.x, rp2.y, true, false, -rotate_angle_rads);

		const rp3 = rotatePoint(px, py, mirror_origin, Math.PI);
		drawImageToCanvas(ctx, rp3.x, rp3.y, true, true, rotate_angle_rads);
	} else if (mirror_reflections == 6) {
		const p1 = rotatePoint(px, py, mirror_origin, (2 * Math.PI) / 3);
		drawImageToCanvas(ctx, p1.x, p1.y, true, false, rotate_angle_rads);

		const p2 = rotatePoint(px, py, mirror_origin, (4 * Math.PI) / 3);
		drawImageToCanvas(ctx, p2.x, p2.y, false, true, rotate_angle_rads);

		const pr = reflectPoint(px, py, mirror_angle_rads);
		drawImageToCanvas(ctx, pr.x, pr.y, false, true, -rotate_angle_rads);

		const pr1 = rotatePoint(pr.x, pr.y, mirror_origin, (2 * Math.PI) / 3);
		drawImageToCanvas(ctx, pr1.x, pr1.y, true, false, -rotate_angle_rads);

		const pr2 = rotatePoint(pr.x, pr.y, mirror_origin, (4 * Math.PI) / 3);
		drawImageToCanvas(ctx, pr2.x, pr2.y, true, true, -rotate_angle_rads);
	} else if (mirror_reflections === 8) {
		const p1 = rotatePoint(px, py, mirror_origin, Math.PI / 2);
		drawImageToCanvas(ctx, p1.x, p1.y, true, false, rotate_angle_rads);

		const p2 = rotatePoint(px, py, mirror_origin, Math.PI);
		drawImageToCanvas(ctx, p2.x, p2.y, true, true, rotate_angle_rads);

		const p3 = rotatePoint(px, py, mirror_origin, (3 * Math.PI) / 2);
		drawImageToCanvas(ctx, p3.x, p3.y, false, true, rotate_angle_rads);

		const pr = reflectPoint(px, py, mirror_angle_rads);
		drawImageToCanvas(ctx, pr.x, pr.y, true, true, -rotate_angle_rads);

		const pr1 = rotatePoint(pr.x, pr.y, mirror_origin, Math.PI / 2);
		drawImageToCanvas(ctx, pr1.x, pr1.y, true, false, -rotate_angle_rads);

		const pr2 = rotatePoint(pr.x, pr.y, mirror_origin, Math.PI);
		drawImageToCanvas(ctx, pr2.x, pr2.y, false, false, -rotate_angle_rads);

		const pr3 = rotatePoint(pr.x, pr.y, mirror_origin, (3 * Math.PI) / 2);
		drawImageToCanvas(ctx, pr3.x, pr3.y, false, true, -rotate_angle_rads);
	}
}

function mouseIsDown() {
	px = mousePos.x;
	py = mousePos.y;

	if (isDrawing) {
		drawing_frame_count++;

		if (drawing_frame_count % drawing_speed === 0) {
			// for holding an axis
			if (is_x_holding) {
				if (!is_x_holding_set) {
					x_hold = mousePos.x;
					is_x_holding_set = true;
				}
				px = x_hold;
			}
			if (is_y_holding) {
				if (!is_y_holding_set) {
					y_hold = mousePos.y;
					is_y_holding_set = true;
				}
				py = y_hold;
			}

			// Size randomisation
			if (brush_size_automation_on) {
				if (randomise_width) {
					brush_width_random.update();
					brush_width = brush_width_random.currentNumber;
					if (randomise_lock_width_and_height) {
						brush_height = brush_width;
					}
				}
				if (randomise_height && !randomise_lock_width_and_height) {
					brush_height_random.update();
					brush_height = brush_height_random.currentNumber;
				}
			}

			// Snapping
			if (snap_on) {
				px = Math.round(px / snap_x) * snap_x;
				py = Math.round(py / snap_y) * snap_y;
			}

			// Incrementing
			if (increment_on) {
				auto_inc_x_running = auto_inc_x_running + auto_inc_x_amount;
				auto_inc_y_running = auto_inc_y_running + auto_inc_y_amount;

				if (increment_screen_wrap_on) {
					px = (((px + auto_inc_x_running) % window_w) + window_w) % window_w;
					py = (((py + auto_inc_y_running) % window_h) + window_h) % window_h;
				} else {
					px = px + auto_inc_x_running;
					py = py + auto_inc_y_running;
				}

				if (wave_on) {
					let sin_y = y_amp * Math.sin(y_freq * px) + y_phase;
					let sin_x = x_amp * Math.sin(x_freq * py) + x_phase;
					py = py + sin_y;
					px = px + sin_x;
				}
			}

			// rotate_angle while the mouse is down
			if (follow_brush_direction) {
				if (rotate_on && auto_rotate) {
					rotate_angle += rotate_speed;
					rotate_angle_rads = rotate_angle * (Math.PI / 180);
					rotate_angle_rads += follow_angle_rads;
				} else {
					rotate_angle_rads = follow_angle_rads;
				}
			} else {
				if (rotate_on && auto_rotate) {
					rotate_angle += rotate_speed;
					rotate_angle_rads = rotate_angle * (Math.PI / 180);
					rotate_angle_rads += follow_angle_rads;
				}
			}

			// add/increment filters
			if (fx_on) {
				if (auto_hue_rotate_on) {
					hue_rotate_amount += auto_hue_increment_amount;
				}
				if (brightness_auto_increment_on) {
					if (brightness_ping_pong_on) {
						brightness_amount += brightness_auto_increment_amount * brightness_ping_pong_direction;

						// Reverse direction if hitting the bounds
						if (brightness_amount >= 200 || brightness_amount <= 0) {
							brightness_ping_pong_direction *= -1;
							// Ensure the value stays within bounds
							brightness_amount = Math.max(0, Math.min(200, brightness_amount));
						}
					} else {
						brightness_amount = (brightness_amount + brightness_auto_increment_amount) % 200;
					}
				}
				if (saturate_auto_increment_on) {
					if (saturate_ping_pong_on) {
						saturate_amount += saturate_auto_increment_amount * saturate_ping_pong_direction;

						// Reverse direction if hitting the bounds
						if (saturate_amount >= 200 || saturate_amount <= 0) {
							saturate_ping_pong_direction *= -1;
							// Ensure the value stays within bounds
							saturate_amount = Math.max(0, Math.min(200, saturate_amount));
						}
					} else {
						saturate_amount = (saturate_amount + saturate_auto_increment_amount) % 200;
					}
				}
				if (opacity_auto_increment_on) {
					if (opacity_ping_pong_on) {
						opacity_amount += opacity_auto_increment_amount * opacity_ping_pong_direction;

						// Reverse direction if hitting the bounds
						if (opacity_amount >= 100 || opacity_amount <= 0) {
							opacity_ping_pong_direction *= -1;
							// Ensure the value stays within bounds
							opacity_amount = Math.max(0, Math.min(100, opacity_amount));
						}
					} else {
						opacity_amount = (opacity_amount + opacity_auto_increment_amount) % 100;
					}
				}
				if (invert_auto_increment_on) {
					if (invert_ping_pong_on) {
						invert_amount += invert_auto_increment_amount * invert_ping_pong_direction;

						// Reverse direction if hitting the bounds
						if (invert_amount >= 100 || invert_amount <= 0) {
							invert_ping_pong_direction *= -1;
							// Ensure the value stays within bounds
							invert_amount = Math.max(0, Math.min(100, invert_amount));
						}
					} else {
						invert_amount = (invert_amount + invert_auto_increment_amount) % 100;
					}
				}
				setFilters();
			}

			if (mirror_on) {
				mirror_origin = getMirrorOrigin();
			}

			doBrushing(draw_ctx, px, py);
		}

		// Call this function again on the next animation frame
		if (constantlyUpdateOnMousedown) {
			requestAnimationFrame(mouseIsDown);
		}
	}
}

// POINTER EVENTS
let active_pointer_id = null;

preview_canvas.addEventListener("pointerdown", (event) => {
	// Event listener for pointer down (start drawing on draw_canvas)
	if (window.pepepaint.canvas_animation_on) {
		return;
	}
	if (active_pointer_id !== null && active_pointer_id !== event.pointerId) {
		return;
	}
	if (event.pointerType === "mouse" && event.button !== 0) {
		return;
	}

	if (event.pointerType !== "mouse") {
		event.preventDefault();
	}

	active_pointer_id = event.pointerId;
	preview_canvas.setPointerCapture(event.pointerId);
	mousePos = getPointerPosition(preview_canvas, event);

	saveCanvasState();

	// setFilters(); // do this on mouseIsDown for automation
	setBlendMode(draw_ctx);

	if (is_x_holding) {
		x_hold = mousePos.x;
		is_x_holding_set = true;
	}
	if (is_y_holding) {
		y_hold = mousePos.y;
		is_y_holding_set = true;
	}
	isDrawing = true; // Set drawing mode to true
	preview_ctx.clearRect(0, 0, window_w, window_h); // Clear the top canvas before redrawing (avoids smearing of previous drawings)

	mouseIsDown();
});

preview_canvas.addEventListener("pointerup", (event) => {
	// Event listener for pointer up (stop drawing)
	if (event.pointerId !== active_pointer_id) {
		return;
	}
	mousePos = getPointerPosition(preview_canvas, event);

	isDrawing = false; // Set drawing mode to false
	auto_inc_x_running = 0;
	auto_inc_y_running = 0;

	clearFilters();
	clearBlendMode(draw_ctx);

	preview_canvas.releasePointerCapture(event.pointerId);
	active_pointer_id = null;
});

preview_canvas.addEventListener("pointerout", (event) => {
	// Optional: Pointer out event to stop drawing if pointer leaves canvas
	const is_mouse_pointer = event.pointerType === "mouse";
	if (!is_mouse_pointer && event.pointerId !== active_pointer_id) {
		return;
	}

	if (stop_drawing_on_mouse_out) {
		isDrawing = false;
		auto_inc_x_running = 0;
		auto_inc_y_running = 0;
		lastPos = null; // Reset last position to avoid drawing a line on re-entry
	}
	if (is_mouse_pointer) {
		lastPos = null;
	}

	preview_ctx.clearRect(0, 0, window_w, window_h); // clear any preview
});

preview_canvas.addEventListener("pointercancel", (event) => {
	// Pointer cancel event to stop drawing
	if (event.pointerId !== active_pointer_id) {
		return;
	}
	preview_ctx.clearRect(0, 0, window_w, window_h);
	isDrawing = false;
	auto_inc_x_running = 0;
	auto_inc_y_running = 0;
	lastPos = null;
	preview_canvas.releasePointerCapture(event.pointerId);
	active_pointer_id = null;
});

preview_canvas.addEventListener("pointermove", (event) => {
	// Event listener for pointer move on preview_canvas (live preview)
	if (active_pointer_id !== null && event.pointerId !== active_pointer_id) {
		return;
	}
	if (event.pointerType !== "mouse" && active_pointer_id === null) {
		return;
	}
	if (event.pointerType !== "mouse") {
		event.preventDefault();
	}
	if (event.pointerType !== "mouse" && !isDrawing) {
		return;
	}
	mousePos = getPointerPosition(preview_canvas, event); // Get pointer coordinates

	preview_ctx.clearRect(0, 0, window_w, window_h); // Clear the top canvas before redrawing (avoids smearing of previous drawings)

	if (follow_brush_direction) {
		if (lastPos) {
			const dx = mousePos.x - lastPos.x;
			const dy = mousePos.y - lastPos.y;
			const targetDirection = normalizeVector({ x: dx, y: dy }); // Target direction as a normalized vector
			smoothedDirection = interpolateVector(targetDirection, smoothedDirection, smoothing_factor); // Smooth the direction vector

			// Calculate the angle from the smoothed direction vector
			follow_angle_rads = getAngleFromVector(smoothedDirection);
		}
	}

	if (!isDrawing) {
		px = mousePos.x;
		py = mousePos.y;

		// x = px; y = py;

		if (snap_on) {
			px = Math.round(px / snap_x) * snap_x;
			py = Math.round(py / snap_y) * snap_y;
		}

		if (fx_on) {
			preview_ctx.filter = filters;
		}

		if (mirror_on) {
			mirror_origin = getMirrorOrigin();
		}

		doBrushing(preview_ctx, px, py);
	}

	// Update the last mouse position
	lastPos = mousePos;
});

function help() {
	console.log("Welcome to PEPEPAINT");
	console.log("Controls and Variables:");
	console.log(
		"Filters: blur(AMOUNT_IN_PIXELS), invert(PERCENTAGE), sepia(PERCENTAGE), threshold(0-255), solarize(0-255), monochrome(), posterize(LEVELS 2-16), dither(PIXEL_SIZE), dilate(), erode(), emboss(PIXEL_SIZE), edges(PIXEL_SIZE), pixelate(PIXEL_SIZE), glitch(PIXEL_SIZE, AMOUNT), ",
	);
}

function initCard() {
	const templateImage = new Image();
	templateImage.src = "brushes/template02.png";
	templateImage.onload = () => {
		draw_ctx.drawImage(templateImage, 0, 0, window_w, window_h);
	};
}

initCard();

window.pepepaint = {
	canvas_animation_on: false,
	draw_canvas,
	draw_ctx,
	window_w,
	window_h,
	clearFilters,
	saveCanvasState,
};
window.help = help;
