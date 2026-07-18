/**
 * BoneDry session intro
 *
 * 
 * Places the BoneDry Pi art in the TUI header — above Context / Skills /
 * Extensions — via ctx.ui.setHeader() on session_start.
 *
 * Restores Pi version + keybinding tooltips (compact / expandable via the
 * same app.tools.expand toggle as the built-in header).
 *
 * Centers the symbol + title/keybinding tooltips when term width allows.
 * Indents Context / Skills / Extensions on the left rail (not centered).
 *
 * Not sent to the LLM. No session transcript entry.
 *
 * Asset is embedded (PNG base64) so this file is a single-file drop-in for
 * ~/.pi/agent/extensions/. Optional on-disk override still wins if present.
 *
 * Source SVG:  ~/.pi/bonedry-pi.svg (repo root / docs only)
 * Raster asset: embedded below; optional ~/.pi/agent/assets/bonedry-pi.png
 *
 * Docker often gets TERM=xterm and strips Ghostty env markers, so Pi's image
 * detector falls back to "[Image: …]". We force the Kitty graphics protocol
 * when the host is Ghostty (Kevin's setup) or when PI_FORCE_TERM_IMAGES=1.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
	keyHint,
	keyText,
	rawKeyHint,
	VERSION,
	type ExtensionAPI,
	type Theme,
} from "@earendil-works/pi-coding-agent";
import {
	Container,
	Image,
	getCapabilities,
	getCellDimensions,
	getImageDimensions,
	setCapabilities,
	visibleWidth,
	type Component,
	type TUI,
} from "@earendil-works/pi-tui";

// --- layout knobs ---
const IMAGE_MAX_WIDTH_CELLS = 32;
const IMAGE_MAX_HEIGHT_CELLS = 16;
/** Left inset for Context / Skills / Extensions list. */
const LIST_INDENT_CELLS = 4;
/** Mark our resources wrapper so reload/session_start won't double-wrap. */
const RESOURCES_WRAP_FLAG = "__bonedryResourcesWrap";

/**
 * Embedded PNG so new users only need this one file under extensions/.
 * Populated after build; loadPngBase64() prefers on-disk override if present.
 */
// __EMBEDDED_PNG_BASE64__ is replaced / kept in sync with assets/bonedry-pi.png
const EMBEDDED_PNG_BASE64 =
	"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";

function loadPngBase64(): string {
	const candidates = [
		join(process.env.HOME ?? "/root", ".pi/agent/assets/bonedry-pi.png"),
		join(dirname(fileURLToPath(import.meta.url)), "../assets/bonedry-pi.png"),
		// Single-file drop-in: assets next to the extension (optional)
		join(dirname(fileURLToPath(import.meta.url)), "bonedry-pi.png"),
		join(dirname(fileURLToPath(import.meta.url)), "assets/bonedry-pi.png"),
	];

	for (const path of candidates) {
		try {
			return readFileSync(path).toString("base64");
		} catch {
			// try next
		}
	}

	if (EMBEDDED_PNG_BASE64 && !EMBEDDED_PNG_BASE64.startsWith("__")) {
		return EMBEDDED_PNG_BASE64;
	}

	throw new Error(
		"bonedry-pi.png not found (no on-disk asset and no embedded PNG)",
	);
}

const PNG_BASE64 = loadPngBase64();

const IMAGE_DIMENSIONS =
	getImageDimensions(PNG_BASE64, "image/png") ?? { widthPx: 800, heightPx: 600 };

/** Mirror of pi-tui calculateImageCellSize (not re-exported from the package root). */
function measureImageCells(
	maxWidthCells = IMAGE_MAX_WIDTH_CELLS,
	maxHeightCells = IMAGE_MAX_HEIGHT_CELLS,
): { columns: number; rows: number } {
	const cell = getCellDimensions();
	const maxWidth = Math.max(1, Math.floor(maxWidthCells));
	const maxHeight = Math.max(1, Math.floor(maxHeightCells));
	const imageWidth = Math.max(1, IMAGE_DIMENSIONS.widthPx);
	const imageHeight = Math.max(1, IMAGE_DIMENSIONS.heightPx);
	const widthScale = (maxWidth * cell.widthPx) / imageWidth;
	const heightScale = (maxHeight * cell.heightPx) / imageHeight;
	const scale = Math.min(widthScale, heightScale);
	const columns = Math.ceil((imageWidth * scale) / cell.widthPx);
	const rows = Math.ceil((imageHeight * scale) / cell.heightPx);
	return {
		columns: Math.max(1, Math.min(maxWidth, columns)),
		rows: Math.max(1, Math.min(maxHeight, rows)),
	};
}

/** True when host is Ghostty or the operator opted into terminal images. */
function shouldForceKittyImages(): boolean {
	if (process.env.PI_FORCE_TERM_IMAGES === "0") return false;
	if (process.env.PI_FORCE_TERM_IMAGES === "1") return true;

	const termProgram = (process.env.TERM_PROGRAM ?? "").toLowerCase();
	const term = (process.env.TERM ?? "").toLowerCase();

	// Host Ghostty markers (sometimes forwarded into the container)
	if (termProgram === "ghostty") return true;
	if (term.includes("ghostty")) return true;
	if (process.env.GHOSTTY_RESOURCES_DIR) return true;
	if (process.env.KITTY_WINDOW_ID) return true;
	if (termProgram === "kitty" || termProgram === "wezterm" || termProgram === "warpterminal") {
		return true;
	}

	// Containerized Pi on Kevin's Ghostty host: generic TERM + Pi flag.
	// Without this, detectCapabilities() returns images:null and we only
	// paint the textual "[Image: …]" placeholder above Context.
	if (process.env.PI_CODING_AGENT === "true" && (term === "xterm" || term === "xterm-256color")) {
		return true;
	}

	return false;
}

function ensureImageCapable(): void {
	if (!shouldForceKittyImages()) return;
	const caps = getCapabilities();
	if (caps.images) return;
	setCapabilities({
		images: "kitty",
		trueColor: true,
		hyperlinks: caps.hyperlinks,
	});
}

/** Prefix every rendered line with `pad` spaces (Kitty image seq stays at cursor col). */
function padLines(lines: string[], pad: number): string[] {
	if (pad <= 0) return lines;
	const left = " ".repeat(pad);
	return lines.map((line) => left + line);
}

/** Center a single visual line within `width` cells. Empty lines pass through. */
function centerLine(line: string, width: number): string {
	if (line.length === 0) return line;
	const w = visibleWidth(line);
	if (w >= width) return line;
	const pad = Math.floor((width - w) / 2);
	return padLines([line], pad)[0]!;
}

/** Center each non-empty line within `width` cells. */
function centerLines(lines: string[], width: number): string[] {
	return lines.map((line) => centerLine(line, width));
}

function buildHintLines(theme: Theme, expanded: boolean): string[] {
	const hint = (keybinding: Parameters<typeof keyHint>[0], description: string) =>
		keyHint(keybinding, description);

	if (expanded) {
		return [
			hint("app.interrupt", "to interrupt"),
			hint("app.clear", "to clear"),
			rawKeyHint(`${keyText("app.clear")} twice`, "to exit"),
			hint("app.exit", "to exit (empty)"),
			hint("app.suspend", "to suspend"),
			keyHint("tui.editor.deleteToLineEnd", "to delete to end"),
			hint("app.thinking.cycle", "to cycle thinking level"),
			rawKeyHint(
				`${keyText("app.model.cycleForward")}/${keyText("app.model.cycleBackward")}`,
				"to cycle models",
			),
			hint("app.model.select", "to select model"),
			hint("app.tools.expand", "to expand tools"),
			hint("app.thinking.toggle", "to expand thinking"),
			hint("app.editor.external", "for external editor"),
			rawKeyHint("/", "for commands"),
			rawKeyHint("!", "to run bash"),
			rawKeyHint("!!", "to run bash (no context)"),
			hint("app.message.followUp", "to queue follow-up"),
			hint("app.message.dequeue", "to edit all queued messages"),
			hint("app.clipboard.pasteImage", "to paste image (with text fallback)"),
			rawKeyHint("drop files", "to attach"),
			"",
			theme.fg(
				"dim",
				"Pi can explain its own features and look up its docs. Ask it how to use or extend Pi.",
			),
		];
	}

	const compact = [
		hint("app.interrupt", "interrupt"),
		rawKeyHint(`${keyText("app.clear")}/${keyText("app.exit")}`, "clear/exit"),
		rawKeyHint("/", "commands"),
		rawKeyHint("!", "bash"),
		hint("app.tools.expand", "more"),
	].join(theme.fg("muted", " · "));

	return [
		compact,
		theme.fg(
			"dim",
			`Press ${keyText("app.tools.expand")} to show full startup help and loaded resources.`,
		),
		"",
		theme.fg(
			"dim",
			"Pi can explain its own features and look up its docs. Ask it how to use or extend Pi.",
		),
	];
}

function buildHeader(_tui: TUI, theme: Theme): Component & {
	dispose?(): void;
	setExpanded?(expanded: boolean): void;
} {
	const image = new Image(
		PNG_BASE64,
		"image/png",
		{ fallbackColor: (s) => theme.fg("accent", s) },
		{
			maxWidthCells: IMAGE_MAX_WIDTH_CELLS,
			maxHeightCells: IMAGE_MAX_HEIGHT_CELLS,
			filename: "bonedry-pi.png",
		},
		IMAGE_DIMENSIONS,
	);

	const titleBase =
		theme.bold(theme.fg("accent", "BoneDry Pi")) + theme.fg("dim", ` v${VERSION}`);

	let expanded = false;
	let cached: { width: number; expanded: boolean; lines: string[] } | undefined;

	return {
		setExpanded(next: boolean) {
			if (expanded === next) return;
			expanded = next;
			cached = undefined;
		},
		invalidate() {
			cached = undefined;
			image.invalidate();
		},
		render(width: number): string[] {
			if (cached && cached.width === width && cached.expanded === expanded) {
				return cached.lines;
			}

			// Image component clamps max width to width-2 internally — match that.
			const imgMaxW = Math.max(1, Math.min(width - 2, IMAGE_MAX_WIDTH_CELLS));
			const imageCells = measureImageCells(imgMaxW, IMAGE_MAX_HEIGHT_CELLS);

			const imgLines = image.render(width);

			// Center the symbol block; fall back to the shared inset if too narrow.
			const centerPad = Math.max(0, Math.floor((width - imageCells.columns) / 2));
			const symbolPad =
				centerPad >= LIST_INDENT_CELLS ? centerPad : Math.min(LIST_INDENT_CELLS, Math.max(0, width - 1));

			const symbolLines = padLines(imgLines, symbolPad);

			// Title + hints: each line centered under the symbol.
			const textLines = centerLines(
				[titleBase, "", ...buildHintLines(theme, expanded)],
				width,
			);

			const lines = ["", ...symbolLines, ...textLines, ""];
			cached = { width, expanded, lines };
			return lines;
		},
		dispose() {
			// Image holds kitty IDs; header is replaced wholly on next setHeader
		},
	};
}

/**
 * Left-indent wrapper for Pi's loadedResourcesContainer
 * (Context / Skills / Extensions). Keeps the list on a side rail under the
 * centered symbol/tooltips header.
 */
function createIndentedResources(child: Component): Component & {
	[RESOURCES_WRAP_FLAG]?: boolean;
} {
	const wrap: Component & {
		[RESOURCES_WRAP_FLAG]?: boolean;
		children?: Component[];
	} = {
		[RESOURCES_WRAP_FLAG]: true,
		// Expose child so Pi's setToolsExpanded walk still reaches ExpandableTexts.
		children: [child],
		invalidate() {
			child.invalidate?.();
		},
		render(width: number): string[] {
			const indent = Math.min(LIST_INDENT_CELLS, Math.max(0, width - 1));
			const childWidth = Math.max(1, width - indent);
			// Child wraps against the remaining width, then we pad left.
			return padLines(child.render(childWidth), indent);
		},
	};
	return wrap;
}

/**
 * Indent Context / Skills / Extensions by wrapping the loaded-resources
 * container (TUI child index 1). Idempotent across reload/session_start.
 */
function indentLoadedResources(tui: TUI): void {
	const children = (tui as Container).children;
	if (!children || children.length < 2) return;

	const existing = children[1] as Component & {
		[RESOURCES_WRAP_FLAG]?: boolean;
	};

	if (existing?.[RESOURCES_WRAP_FLAG]) {
		existing.invalidate?.();
		return;
	}

	// Pi layout: [headerContainer, loadedResourcesContainer, chatContainer, ...]
	const resources = children[1];
	if (!resources) return;

	children[1] = createIndentedResources(resources);
}

function applyChrome(tui: TUI, theme: Theme): Component & {
	dispose?(): void;
	setExpanded?(expanded: boolean): void;
} {
	indentLoadedResources(tui);
	return buildHeader(tui, theme);
}

export default function (pi: ExtensionAPI) {
	// Eager capability fix so first paint can use Kitty/Ghostty image protocol.
	ensureImageCapable();

	pi.on("session_start", async (_event, ctx) => {
		if (ctx.mode !== "tui") return;

		ensureImageCapable();

		// Header sits above Context / Skills / Extensions. Replacing the built-in
		// logo+hints header puts art first on every fresh/resumed/forked session.
		ctx.ui.setHeader((tui, theme) => applyChrome(tui, theme));
	});

	// Escape hatch to restore stock Pi header (resource indent stays until restart).
	pi.registerCommand("builtin-header", {
		description: "Restore built-in Pi header (remove BoneDry art)",
		handler: async (_args, ctx) => {
			ctx.ui.setHeader(undefined);
			ctx.ui.notify("Built-in header restored", "info");
		},
	});

	pi.registerCommand("bonedry-header", {
		description: "Show BoneDry Pi art in the header",
		handler: async (_args, ctx) => {
			if (ctx.mode !== "tui") {
				ctx.ui.notify("Header art is TUI-only", "warning");
				return;
			}
			ensureImageCapable();
			ctx.ui.setHeader((tui, theme) => applyChrome(tui, theme));
			ctx.ui.notify("BoneDry header applied", "info");
		},
	});
}
