# PEPEPAINT V1

PEPEPAINT is a single-page browser drawing app for creating Pepe-themed artwork. It is built with plain HTML, CSS, and JavaScript and currently has no build step or backend.

## Features

- Image-based brushes and custom fonts
- Adjustable brush size and opacity
- Keyboard-controlled effects, filters, transforms, and randomisation
- Undo and redo
- Canvas export

## Run locally

The project is static, so it can be served by any local HTTP server. From the project root, for example:

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

You can also use an editor-provided static server. No package installation or build command is required.

## Project structure

```text
index.html   UI layout and controls
styles.css  Application styling
main.js     Drawing logic, brushes, canvas pipeline, and events
filters.js  Image and canvas filters
brushes/    Brush image assets
fonts/      Custom font assets
```

## Development workflow

1. Create a branch from `main`.
2. Make and test changes locally.
3. Commit the changes and push the branch to GitHub.
4. Open a pull request for review before merging into `main`.

There are currently no automated tests. Manually verify brush previews, drawing behaviour, keyboard controls, filters, undo/redo, and image export in a browser.

See [CONTRIBUTING.md](CONTRIBUTING.md) for more detail and [AGENTS.md](AGENTS.md) for project-specific coding guidance.

## Submission form and planned backend

The submission interface is present, but form processing is not implemented yet. A future Node.js backend will handle validation and submission storage or delivery. Do not place API keys, credentials, or other secrets in browser-side JavaScript.

## License and bundled assets

The project source code is available under the [MIT License](LICENSE).

The `fonts/` and `brushes/` directories include bundled third-party or derivative assets that may be subject to separate copyright, trademark, or font-license terms. Their inclusion in this repository does not grant rights beyond those provided by their respective owners. Contributors should verify asset rights before adding or reusing bundled assets, particularly for commercial use.

