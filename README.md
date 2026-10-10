# Ghost Architecture Visualizer

An interactive dashboard that breaks down the architecture of [Ghost](https://github.com/TryGhost/Ghost), the open-source Node.js publishing platform, and documents how an AI-generated architecture breakdown was fact-checked against Ghost's source repository.

**Live site:** `https://<your-github-username>.github.io/ghost-architecture-visualizer/`
**Repository:** `https://github.com/<your-github-username>/ghost-architecture-visualizer`

---

## Project description

### The system analyzed: Ghost

Ghost is an open-source, headless Node.js CMS for publishing, memberships, and newsletters (MIT license).

- **Architectural style:** modular monolith with decoupled clients. Ghost's own docs describe it as "a modern, decoupled web application with a sensible service-based architecture." In the code, one Node.js server process (the `ghost` package, with its code in `ghost/core/`) serves the public website, the Admin API, and the Content API, backed by one database. The monorepo, managed with pnpm and Nx, also holds separately built front-end apps (`apps/`), the Koenig editor (`koenig/`), and shared packages (`packages/`). Pluggable adapters handle caching, jobs, scheduling, and storage. External services such as Mailgun, Stripe, and Tinybird are integrations, not internal microservices.
- **Core components:**

| Layer | Components |
|---|---|
| Clients | Reader's browser, Ghost Admin (React apps plus legacy Ember admin), Portal, site widgets (comments, signup form, search, announcement bar), headless front ends |
| Edge | NGINX reverse proxy with Let's Encrypt TLS |
| Application | Ghost core server (Node.js 22/24, Express), Admin API, Content API, Handlebars theme renderer, Koenig editor (Lexical), jobs and scheduling, webhooks |
| Data | MySQL 8.0 or 8.4 via mysql2 with Knex and Bookshelf (SQLite for local development), Redis cache adapter, file storage (local or S3) |
| External services | Mailgun (newsletters), Stripe (payments), Tinybird (analytics), hosted ActivityPub service (social web), Sentry (error monitoring) |
| Tooling | Ghost-CLI, systemd, production Docker image |

### The prototype built

A static, single-page web app with four views:

1. **Overview:** key facts (style, release, Node version, languages, monorepo tooling, license) and a layered, clickable map of 24 components. Each component is marked **Verified in repo** or **AI knowledge, not yet verified**.
2. **Components:** a search form (text, layer, and source-status filters) and a details panel showing each component's role, repo location, and evidence.
3. **Request flows:** step-by-step walkthroughs of five flows (reader opens a post, editor publishes a newsletter, scheduled post goes live, headless site fetches content, reader becomes a paid member), highlighting the active component on the map.
4. **AI audit:** every claim from the AI's first breakdown, what it said, what verification found, and whether it was verified, corrected, or is still unverified.

Built with plain HTML, CSS, and JavaScript: no framework, no build step, no external requests.

---

## Setup and run instructions

### Requirements

- Git
- Any modern browser
- Optional: Python 3 or Node.js, to run a local web server

### Environment variables

None. The app is fully static and makes no API calls, so there is nothing to configure.

### Run locally

```bash
git clone https://github.com/<your-github-username>/ghost-architecture-visualizer.git
cd ghost-architecture-visualizer
```

Then either open `index.html` directly in your browser, or serve the folder:

```bash
# Option A: Python
python -m http.server 8000

# Option B: Node.js
npx serve .
```

Open `http://localhost:8000` (or the address `serve` prints).

### Deploy to GitHub Pages

1. Push the repository to GitHub as a **public** repo.
2. On GitHub, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**, choose `main` and `/ (root)`, then **Save**.
4. After a minute, the site is live at `https://<your-github-username>.github.io/ghost-architecture-visualizer/`.

### Project structure

```
ghost-architecture-visualizer/
├── index.html        # Page structure and the four views
├── styles.css        # Layout, responsive breakpoints, focus styles
├── app.js            # Routing, diagram, search, flow stepper, audit table
├── data.js           # Ghost components, flows, and audit findings
├── QA-CHECKLIST.md   # Test cases and results
└── README.md
```

---

## AI disclosure and prompt appendix

### AI tools used

- **Claude (Anthropic), Claude Opus 5.5**, used through the Claude app to generate the initial architectural breakdown of Ghost and to scaffold this prototype's code and documentation.

### Sample prompts submitted

1. Pasted the full assignment brief with: *"i need to do this:"*
2. When asked which system to analyze: *"use smaller?"* (Claude chose Ghost, the smallest system on the assignment's example list.)
3. Pasted the TryGhost/Ghost GitHub repository page so Claude could fact-check its breakdown against the source.
4. *"do you need to see specific files"*
5. Re-pasted the Step 2 instructions (generate a breakdown, fact-check the AI, customize).
6. Pasted the root `package.json`, `ghost/package.json`, the `apps/` folder listing, the `ghost/core/` folder listing, and the README's Quickstart install section as further sources.
7. Pasted Ghost's "How To Install Ghost Locally" documentation page.
8. Pasted Ghost's "How To Install Ghost On Ubuntu" production documentation page.
9. Pasted the docs index from docs.ghost.org/llms.txt.

> Add any further prompts you send while customizing the project here, word for word.

### Initial output generated

> **Note:** Claude did not save its first breakdown as a separate document before seeing the repository. The list below is Claude's stated set of pre-verification assumptions, written down afterward. *(Optional: for a word-for-word record, ask an AI for a Ghost architecture breakdown without giving it any source files, paste its answer here, and compare it to the table below.)*

Claude's pre-verification breakdown described Ghost as a single Node.js monolith with:

- core server code in `ghost/core`
- support for Node.js 18 or 20
- Ghost 5.x as the current major version
- a mostly JavaScript codebase
- MySQL 8 in production, Nginx as the reverse proxy, and Express as the web framework
- Mailgun for newsletters, Stripe for payments, and S3-compatible storage
- no official Docker image (community image recommended)

It then scaffolded the four-view static app in this repository.

### What was verified, corrected, or customized

Verification sources, all from the [TryGhost/Ghost repository](https://github.com/TryGhost/Ghost), captured October 2026:

- the repository home page (README, file listing, commit messages, release info, language breakdown)
- the root `package.json`
- `ghost/package.json`
- the `apps/` and `ghost/core/` folder listings
- Ghost's official docs: [How To Install Ghost Locally](https://docs.ghost.org/install/local/), [How To Install Ghost On Ubuntu](https://docs.ghost.org/install/ubuntu/), and the docs index at [docs.ghost.org/llms.txt](https://docs.ghost.org/llms.txt), which includes one-line official descriptions of the Architecture, Content API, Admin API, Webhooks, and JAMstack pages

| Claim from the AI | Result | Evidence |
|---|---|---|
| Ghost is a Node.js monolith | **Partly verified** | One server process and one database in the repo, but Ghost's docs call it "a modern, decoupled web application with a sensible service-based architecture"; refined to "modular monolith with decoupled clients" |
| Core server code is in `ghost/core` | **Verified, with a nuance** | Commit #31630 moved the package manifest up to `ghost/`, but the code still lives in `ghost/core/` (`server/`, `frontend/`, `shared/`, `cli/`, `boot.js`) |
| Runs on Node.js 18 or 20 | **Corrected (outdated)** | Both `package.json` files require Node `^22.23.1 \|\| ^24.20.0` |
| Current major version is Ghost 5 | **Corrected (outdated)** | Latest release v6.69.0; `ghost/package.json` at 6.70.0-rc.0 |
| Codebase is mostly JavaScript | **Corrected** | TypeScript 56.7%, JavaScript 38.8% |
| Headless Node.js CMS | **Verified** | README wording; `headless` keyword in `ghost/package.json` |
| Ghost-CLI installs Ghost and sets up SSL | **Verified** | README Quickstart; engines require CLI `^1.29.1` |
| Mailgun, Stripe, S3-compatible storage | **Verified** | `mailgun.js` 10.4.0, `stripe` 8.222.0, `@aws-sdk/client-s3` |
| Web server uses Express | **Verified** | `express`, `express-hbs`, `express-session`, `express-jwt` |
| Production uses MySQL 8 | **Verified** | Production docs require MySQL 8.0 or 8.4; code uses `mysql2`; local docs say SQLite3 is development-only |
| Nginx is the reverse proxy | **Verified** | Production docs require NGINX 1.9.5+; Ghost-CLI offers to set it up |
| (Missed) Tinybird analytics | **Corrected (omission)** | Root `tb` and `data:analytics:*` scripts, analytics compose file; production docs say Ghost-CLI installs don't support web analytics |
| (Missed) jobs, Redis cache, Sentry, site widgets, ActivityPub, systemd | **Corrected (omission)** | Jobs/scheduling/cache adapters, `cache-manager-ioredis`, `@sentry/node`, widget apps in `apps/`; production docs mention the hosted ActivityPub service and systemd |
| No official Docker image | **Corrected (outdated)** | Commit #31695 added a nightly multi-arch self-hosting image; production docs point to a Docker Compose install |

**Totals:** 7 verified, 6 corrected, 1 partly verified. Every Ghost component on the map is now backed by a source; only the reader's browser, which isn't part of Ghost, relies on general knowledge.

**Customizations made:**

- Added a source-status flag to every component so unverified AI claims are visibly labeled instead of stated as fact.
- Added the AI audit view to show the fact-check inside the app itself.
- Rebuilt rendering to use `textContent` only (no `innerHTML`), so search text can't inject markup.
- Added edge-case handling: empty searches, 100-character input limit, long-text truncation in messages, a "no results" state, disabled Previous/Next buttons at the ends of a flow, and a "page not found" view for unknown URLs.
- Added accessibility features: a skip link, labeled form fields, visible focus outlines, `aria-current` for the active page and step, and live status messages.
- Used an inline SVG favicon so GitHub Pages doesn't log a `favicon.ico` 404.

> Update this list with any changes you make yourself.

---

## QA results

See [`QA-CHECKLIST.md`](QA-CHECKLIST.md) for every test case and its result.

---

## License and attribution

This project's code is provided for coursework. Ghost is © Ghost Foundation and released under the MIT license; "Ghost" is a trademark of the Ghost Foundation. This project is not affiliated with or endorsed by Ghost.
