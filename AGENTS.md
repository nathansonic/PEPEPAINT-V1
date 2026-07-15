# AGENTS.md

Project: PEPEPAINT V1 (static HTML/CSS/JS app)

Purpose

- Single-page drawing app (no build step).
- Primary logic in `main.js`, UI in `index.html`, styling in `styles.css`.

How to run

- Open `index.html` in a browser (or use your preferred static server).

Key files

- `index.html` UI layout and controls.
- `main.js` drawing logic, brushes, canvas pipeline, events.
- `styles.css` UI styling.
- `filters.js` image/canvas filters.
- `fonts/` custom fonts (used by text brush).
- `brushes/` and `assets/` image assets (if present).

Conventions

- Prefer adding new brush logic near existing brush sections in `main.js`.
- Use offscreen canvases for brush previews and performance where possible.
- Keep variable names consistent with existing patterns (snake_case).
- Keep UI controls in `index.html` synced to defaults in `main.js` via `setSlidersAndInputs()`.

Notes

- If you add new controls, wire them through the `.brush_controller` system and update previews.

Testing

- No automated tests in this repo.
- Manual: open the page and verify brush previews, drawing behavior, and UI controls.
