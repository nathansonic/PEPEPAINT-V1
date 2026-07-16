# PEPEPAINT V1

PEPEPAINT is a single-page browser drawing app for creating Pepe-themed artwork. It is built with plain HTML, CSS, and JavaScript and currently has no build step or backend.

Live site: <https://pepepaint.journeypaint.fun>

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

For a small change made directly on `main`:

```sh
git add .
git commit -m "Describe the change"
git push
```

There are currently no automated tests. Manually verify brush previews, drawing behaviour, keyboard controls, filters, undo/redo, and image export in a browser.

See [CONTRIBUTING.md](CONTRIBUTING.md) for more detail and [AGENTS.md](AGENTS.md) for project-specific coding guidance.

## Production deployment

Production is hosted at <https://pepepaint.journeypaint.fun> on the same VPS as JourneyPaint, but uses an isolated deployment user, web directory, Nginx site, and TLS certificate.

Every push to `main` triggers the [Deploy PEPEPAINT workflow](.github/workflows/deploy.yml). The workflow:

1. Checks out the committed `main` branch.
2. Authenticates to the VPS with a dedicated deployment key stored as a GitHub Actions secret.
3. Synchronises only the production files to `/var/www/pepepaint/current`.
4. Requests the live URL and fails the workflow if the site is unavailable.

The deployed files are:

```text
index.html
main.js
filters.js
styles.css
brushes/
fonts/
```

Repository documentation, Git metadata, workflow files, and local environment files are not deployed.

Deployment runs and logs are available in the repository's **Actions** tab. A successful Git push does not by itself prove that deployment succeeded, so check the latest workflow run after production changes.

### Manual deployment

The workflow can also be started from GitHub:

1. Open **Actions**.
2. Select **Deploy PEPEPAINT**.
3. Choose **Run workflow** on the `main` branch.

### Rollback

To undo a deployed change without rewriting Git history:

```sh
git log --oneline
git revert <commit-hash>
git push
```

The revert commit triggers a new deployment. If deployment fails, investigate the failed Actions run before making unrelated changes.

### Deployment security

- Never commit deployment keys, `.env` files, API tokens, or passwords.
- The `PEPEPAINT_DEPLOY_KEY` secret must contain only the dedicated PEPEPAINT deployment key.
- If that key is exposed, replace the GitHub secret and remove the corresponding public key from the VPS.
- Changes to Nginx, DNS, certificates, users, or server permissions are not managed by the deployment workflow and require deliberate server administration.

## Submission form and planned backend

The submission interface is present, but form processing is not implemented yet. A future Node.js backend will handle validation and submission storage or delivery.

The backend should remain isolated from JourneyPaint with its own process name, private localhost port, environment file, logs, database role, and Nginx `/api` route. Do not place API keys, credentials, or other secrets in browser-side JavaScript.

## License and bundled assets

The project source code is available under the [MIT License](LICENSE).

The `fonts/` and `brushes/` directories include bundled third-party or derivative assets that may be subject to separate copyright, trademark, or font-license terms. Their inclusion in this repository does not grant rights beyond those provided by their respective owners. Contributors should verify asset rights before adding or reusing bundled assets, particularly for commercial use.
