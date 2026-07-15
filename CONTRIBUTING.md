# Contributing to PEPEPAINT

Thanks for helping improve PEPEPAINT.

## Getting started

1. Fork or clone the repository.
2. Create a focused branch for your change.
3. Serve the project with a local static HTTP server.
4. Make and manually test your changes.
5. Open a pull request with a concise description of the change and how it was tested.

## Code conventions

- Keep the app dependency-free unless a dependency is clearly justified.
- Add brush logic near the existing brush sections in `main.js`.
- Prefer offscreen canvases for brush previews and performance-sensitive work.
- Follow the existing `snake_case` naming style.
- When adding controls, use the `.brush_controller` system, update previews, and keep HTML defaults in sync with `setSlidersAndInputs()`.
- Keep pull requests focused and avoid unrelated formatting changes.

## Manual testing

Before submitting a pull request, verify the relevant behaviour in a browser. Depending on the change, check:

- Initial load without console errors
- Brush thumbnails and previews
- Mouse, trackpad, or pointer drawing
- Brush size and opacity
- Keyboard shortcuts
- Filters and effects
- Undo and redo
- Canvas save/export
- Submission dialog opening and closing

Include the browser(s) and operating system used in the pull request description.

## Assets and secrets

- Do not commit passwords, API tokens, private keys, or `.env` files.
- Optimise large image assets where practical.
- Confirm that new fonts and images may legally be redistributed, and record their source and licence.

