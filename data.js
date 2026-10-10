/*
 * Ghost architecture data.
 * Every component has a `source` status:
 *   "verified"  = confirmed against the TryGhost/Ghost repository: the repo page,
 *                 the apps/ folder listing, the root package.json, or ghost/package.json
 *   "knowledge" = from the AI's general knowledge; not confirmed by those sources,
 *                 check docs.ghost.org before relying on it
 */
window.GHOST_DATA = {
  system: {
    name: "Ghost",
    tagline: "Open-source, headless Node.js CMS for publishing, memberships, and newsletters",
    style: "Modular monolith with decoupled clients",
    styleExplained:
      "Ghost's docs describe it as \"a modern, decoupled web application with a sensible service-based architecture.\" In the code, that means one Node.js server (the ghost package, with its code in ghost/core) serves the public site, the Admin API, and the Content API from a single deployable process with one database, while the clients are decoupled: Ghost Admin uses the same Admin API any integration can, and any front end can read the Content API. The monorepo, managed with pnpm and Nx, holds the separately built front-end apps (apps/), the Koenig editor (koenig/), and shared packages (packages/). Pluggable adapters handle caching, jobs, scheduling, and storage. The server itself is not split into independently deployed microservices; Mailgun, Stripe, Tinybird, and ActivityPub are external services.",
    repo: "https://github.com/TryGhost/Ghost",
    license: "MIT",
    latestRelease: "v6.69.0 (main branch is at 6.70.0-rc.0)",
    nodeVersion: "22 or 24 (engines: ^22.23.1 || ^24.20.0)",
    languages: "TypeScript 56.7%, JavaScript 38.8%, CSS 2.5%, Handlebars 1.4%",
    tooling: "pnpm 12.8.2 + Nx 23.3.0"
  },

  layers: [
    { id: "client", name: "Clients" },
    { id: "edge", name: "Edge" },
    { id: "app", name: "Application (one Node.js process)" },
    { id: "data", name: "Data & storage" },
    { id: "external", name: "External services" },
    { id: "tooling", name: "Install & deploy tooling" }
  ],

  components: [
    {
      id: "browser",
      name: "Reader's browser",
      layer: "client",
      tech: "Any web browser",
      summary: "Visitors read posts on the public site, rendered as HTML by Ghost's theme layer.",
      repoPath: "n/a",
      source: "knowledge",
      evidence: "General web architecture; not a repo component."
    },
    {
      id: "admin",
      name: "Ghost Admin",
      layer: "client",
      tech: "React apps + legacy Ember admin, served at /ghost",
      summary: "The dashboard staff use to write, publish, and manage the site, served at the /ghost path. Talks to Ghost through the Admin API. It is being moved from Ember to React, so both exist side by side.",
      repoPath: "apps/admin, apps/admin-x-framework, apps/shade, apps/ember-admin",
      source: "verified",
      evidence: "apps/ listing shows admin, admin-x-framework, shade, and ember-admin. A shade commit says \"Fixed the React editor's publish error handling to match Ember\". Root scripts include dev:ember."
    },
    {
      id: "portal",
      name: "Portal (members widget)",
      layer: "client",
      tech: "Front-end app embedded in the site",
      summary: "Signup, sign-in, and subscription popup that readers see on the site.",
      repoPath: "apps/portal",
      source: "verified",
      evidence: "apps/portal exists, and the root dev target starts @tryghost/portal alongside the admin."
    },
    {
      id: "widgets",
      name: "Site widgets",
      layer: "client",
      tech: "Small front-end apps (some in Preact)",
      summary: "Extra pieces added to the public site: comments, newsletter signup form, site search, and an announcement bar.",
      repoPath: "apps/comments-ui, apps/signup-form, apps/sodo-search, apps/announcement-bar",
      source: "verified",
      evidence: "apps/ listing; commits \"Changed Signup Form to Preact\" and \"Changed Announcement Bar to Preact and TypeScript\"; the dev:public target starts all of them."
    },
    {
      id: "headless",
      name: "Headless front end",
      layer: "client",
      tech: "Any framework (e.g., Next.js, Gatsby)",
      summary: "A separate website that fetches published content as JSON from the Content API, instead of using Ghost's themes.",
      repoPath: "n/a (outside the repo)",
      source: "verified",
      evidence: "README: Ghost is \"the most popular open source, headless Node.js CMS\"; \"headless\" is a keyword in ghost/package.json; the docs have a \"Ghost On The JAMstack\" section with guides for Next.js, Gatsby, Nuxt, Eleventy, and others."
    },
    {
      id: "nginx",
      name: "Reverse proxy + TLS",
      layer: "edge",
      tech: "NGINX 1.9.5+ with Let's Encrypt SSL",
      summary: "Sits in front of Ghost on a production server, handles HTTPS, and forwards requests to the Node.js process.",
      repoPath: "Configured by Ghost-CLI",
      source: "verified",
      evidence: "Production install docs list NGINX (minimum 1.9.5 for SSL) in the recommended stack; Ghost-CLI offers \"Set up NGINX?\" and \"Set up SSL?\" using Let's Encrypt during `ghost install`."
    },
    {
      id: "core",
      name: "Ghost core server",
      layer: "app",
      tech: "Node.js 22 or 24, Express",
      summary: "The heart of the monolith. One process that routes requests, runs business logic (posts, members, newsletters), and serves all APIs and the public site.",
      repoPath: "ghost/ (code in ghost/core/server and ghost/core/frontend)",
      source: "verified",
      evidence: "The ghost/core folder holds server/, frontend/, shared/, cli/, app.js, boot.js, and bridge.js. ghost/package.json depends on express, express-session, and cors, and its engines require Node ^22.23.1 || ^24.20.0."
    },
    {
      id: "adminapi",
      name: "Admin API",
      layer: "app",
      tech: "Authenticated REST/JSON with secret keys and tokens",
      summary: "Read-write API for creating and managing content, members, newsletters, themes, and webhooks. Ghost Admin itself runs on this API, so anything Admin can do, an integration can do too.",
      repoPath: "ghost/",
      source: "verified",
      evidence: "Docs index: \"Ghost Admin, uses the admin API - which means that everything Ghost Admin can do is also possible with the API\"; Admin API keys \"should remain secret\" and the client generates tokens. ghost/package.json depends on @tryghost/admin-api-schema, express-jwt, and jsonwebtoken."
    },
    {
      id: "contentapi",
      name: "Content API",
      layer: "app",
      tech: "Read-only RESTful JSON",
      summary: "Public, read-only API that any client can use to fetch published posts, pages, tags, authors, settings, and tiers. Ghost provides a JavaScript client for it.",
      repoPath: "ghost/",
      source: "verified",
      evidence: "Docs index: \"Ghost's RESTful Content API delivers published content to the world and can be accessed in a read-only manner by any client\"; endpoints for posts, pages, tags, authors, settings, and tiers; a Content API JavaScript Client page. Key details are on docs.ghost.org/content-api.md."
    },
    {
      id: "themes",
      name: "Theme renderer",
      layer: "app",
      tech: "Handlebars via express-hbs",
      summary: "Turns content into HTML pages for the public site using the active theme. Ghost ships with the Casper and Source themes.",
      repoPath: "ghost/core/frontend, ghost/content/themes",
      source: "verified",
      evidence: "ghost/package.json depends on handlebars 4.7.10, express-hbs 2.5.0, and gscan 6.6.1, and packages content/themes/casper and content/themes/source. The local install docs say themes live in /content/themes/ and that Ghost runs GScan to validate a theme when it's uploaded or activated."
    },
    {
      id: "koenig",
      name: "Koenig editor",
      layer: "app",
      tech: "Lexical-based editor (koenig-lexical, kg-* packages)",
      summary: "The post editor Admin uses for writing, plus the server-side packages that turn editor content into HTML.",
      repoPath: "koenig/",
      source: "verified",
      evidence: "Top-level koenig/ folder; root dev:lexical script targets @tryghost/koenig-lexical; ghost/package.json depends on kg-lexical-html-renderer, kg-default-nodes, and other kg-* packages."
    },
    {
      id: "jobs",
      name: "Jobs & scheduling",
      layer: "app",
      tech: "Jobs and scheduling adapters, @breejs/later, fastq",
      summary: "Runs background and timed work inside the monolith, such as publishing scheduled posts, without blocking web requests.",
      repoPath: "ghost/",
      source: "verified",
      evidence: "ghost/package.json depends on @tryghost/adapter-base-jobs, @tryghost/adapter-base-scheduling, @breejs/later, and fastq."
    },
    {
      id: "webhooks",
      name: "Webhooks",
      layer: "app",
      tech: "Outgoing HTTP event notifications",
      summary: "Notifies outside systems when something happens in Ghost, like a post being published or a new member signing up. Managed through the Admin API.",
      repoPath: "ghost/",
      source: "verified",
      evidence: "Docs index: webhooks are \"specific events triggered when something happens in Ghost, like publishing a new post or receiving a new member\"; Admin API pages for creating, updating, and deleting webhooks."
    },
    {
      id: "db",
      name: "Database",
      layer: "data",
      tech: "MySQL 8.0 or 8.4 in production (mysql2, Knex, Bookshelf); SQLite for local dev",
      summary: "One shared database for posts, members, settings, and users. The whole monolith reads and writes it. Schema changes run through knex-migrator.",
      repoPath: "ghost/core/server/data",
      source: "verified",
      evidence: "ghost/package.json depends on mysql2 3.24.4, knex 2.4.2, bookshelf 1.2.0, and knex-migrator; better-sqlite3 is an optional dependency; the dev Docker setup uses a mysql-data volume. The production install docs require MySQL 8.0 or 8.4; the local install docs say SQLite3 runs in development mode from /content/data/ and is not suitable for production."
    },
    {
      id: "cache",
      name: "Cache",
      layer: "data",
      tech: "Cache adapter; Redis via cache-manager-ioredis",
      summary: "Optional caching layer that can store frequently read data in Redis to reduce database load.",
      repoPath: "ghost/",
      source: "verified",
      evidence: "ghost/package.json depends on @tryghost/adapter-base-cache, cache-manager, and cache-manager-ioredis. Whether Redis is on by default isn't shown."
    },
    {
      id: "storage",
      name: "File storage",
      layer: "data",
      tech: "Storage adapter: local disk or S3",
      summary: "Stores uploaded images and media.",
      repoPath: "ghost-storage-base, compose.dev.storage.yaml",
      source: "verified",
      evidence: "ghost/package.json depends on ghost-storage-base and @aws-sdk/client-s3; dev:storage script; S3 integration test commit."
    },
    {
      id: "mailgun",
      name: "Mailgun",
      layer: "external",
      tech: "Email delivery API (mailgun.js 10.4.0)",
      summary: "Sends newsletters to members.",
      repoPath: "compose.dev.mailgun.yaml",
      source: "verified",
      evidence: "ghost/package.json depends on mailgun.js 10.4.0; root has dev:mailgun and dev:fake-mailgun scripts."
    },
    {
      id: "stripe",
      name: "Stripe",
      layer: "external",
      tech: "Payments API + webhooks (stripe 8.222.0)",
      summary: "Handles paid memberships and subscriptions.",
      repoPath: "docker/stripe/",
      source: "verified",
      evidence: "ghost/package.json depends on stripe 8.222.0; root dev:stripe script runs docker/stripe/with-stripe.sh."
    },
    {
      id: "tinybird",
      name: "Tinybird analytics",
      layer: "external",
      tech: "Analytics data platform",
      summary: "Powers site traffic analytics. Ghost-CLI installs don't support web analytics; self-hosting it requires the Docker Compose install.",
      repoPath: "ghost/core/server/data/tinybird",
      source: "verified",
      evidence: "Root scripts tb, tb:test, and data:analytics:* point to ghost/core/server/data/tinybird; compose.dev.analytics.yaml; Tinybird is a sponsor. Production install docs: Ghost-CLI installs \"are not compatible with web analytics\"."
    },
    {
      id: "activitypub",
      name: "ActivityPub service",
      layer: "external",
      tech: "Social web (federation) service",
      summary: "Connects a Ghost site to the social web. Ghost-CLI installs use the hosted service run by Ghost(Pro); fully self-hosting it requires the Docker Compose install.",
      repoPath: "apps/activitypub (Admin UI)",
      source: "verified",
      evidence: "Production install docs: Ghost-CLI installs support social web features \"via the Ghost(Pro) hosted ActivityPub service\". apps/activitypub exists in the repo."
    },
    {
      id: "sentry",
      name: "Error monitoring",
      layer: "external",
      tech: "Sentry (@sentry/node 7.120.4) + Prometheus metrics",
      summary: "Reports server errors and exposes performance metrics for operators.",
      repoPath: "ghost/",
      source: "verified",
      evidence: "ghost/package.json depends on @sentry/node 7.120.4 and @tryghost/prometheus-metrics 5.0.3."
    },
    {
      id: "cli",
      name: "Ghost-CLI",
      layer: "tooling",
      tech: "npm install ghost-cli -g (CLI ^1.29.1)",
      summary: "Installs, configures, and upgrades Ghost on a server or locally.",
      repoPath: "separate npm package",
      source: "verified",
      evidence: "README Quickstart: `npm install ghost-cli -g`, `ghost install local`, `ghost install`. ghost/package.json engines require cli ^1.29.1. The local install docs list `ghost start`, `ghost stop`, `ghost log`, and `ghost ls`, and say Ghost runs as a background process."
    },
    {
      id: "systemd",
      name: "systemd",
      layer: "tooling",
      tech: "Linux process manager",
      summary: "Keeps the Ghost process running in production and restarts it if it stops.",
      repoPath: "Configured by Ghost-CLI",
      source: "verified",
      evidence: "Production install docs list systemd in the recommended stack; Ghost-CLI asks \"Set up systemd?\" during install."
    },
    {
      id: "docker",
      name: "Docker image",
      layer: "tooling",
      tech: "Dockerfile.production",
      summary: "Container image for self-hosting.",
      repoPath: "Dockerfile.production, docker/",
      source: "verified",
      evidence: "Commit \"Added a nightly multi-arch self-hosting Docker image (#31695)\"."
    }
  ],

  flows: [
    {
      id: "read",
      name: "A reader opens a blog post",
      steps: [
        { component: "browser", text: "The reader's browser requests a post URL over HTTPS." },
        { component: "nginx", text: "The reverse proxy terminates TLS and forwards the request to the Ghost process." },
        { component: "core", text: "Ghost core's Express routes match the URL to the post." },
        { component: "db", text: "Ghost reads the post and site settings from MySQL through Knex and Bookshelf." },
        { component: "themes", text: "The active Handlebars theme renders the post into HTML." },
        { component: "browser", text: "The finished HTML page goes back to the reader." }
      ]
    },
    {
      id: "publish",
      name: "An editor publishes a post with a newsletter",
      steps: [
        { component: "admin", text: "The editor opens Ghost Admin in the browser." },
        { component: "koenig", text: "They write the post in the Koenig editor." },
        { component: "adminapi", text: "Clicking Publish sends an authenticated request to the Admin API." },
        { component: "core", text: "Ghost core saves the post and marks it published." },
        { component: "db", text: "The post is written to the database." },
        { component: "mailgun", text: "If sent as a newsletter, Ghost hands the email to Mailgun for delivery." }
      ]
    },
    {
      id: "schedule",
      name: "A scheduled post goes live",
      steps: [
        { component: "admin", text: "The editor schedules a post for tomorrow at 9:00 instead of publishing now." },
        { component: "adminapi", text: "The Admin API saves the post with a scheduled status and time." },
        { component: "db", text: "The scheduled post waits in the database." },
        { component: "jobs", text: "At 9:00, the scheduling adapter triggers the publish in the background." },
        { component: "core", text: "Ghost core marks the post published, and it appears on the site." }
      ]
    },
    {
      id: "headless",
      name: "A headless site fetches content",
      steps: [
        { component: "headless", text: "A separate front end (for example, a Next.js site) needs the latest posts." },
        { component: "contentapi", text: "It calls the read-only Content API with a public content key." },
        { component: "core", text: "Ghost core checks the key and builds the response." },
        { component: "db", text: "Published posts are read from the database." },
        { component: "headless", text: "JSON comes back, and the front end renders it however it wants." }
      ]
    },
    {
      id: "member",
      name: "A reader becomes a paid member",
      steps: [
        { component: "portal", text: "The reader clicks Subscribe and Portal opens." },
        { component: "core", text: "Ghost core creates a checkout session for the chosen plan." },
        { component: "stripe", text: "The reader pays on Stripe's checkout page." },
        { component: "core", text: "Stripe sends a webhook back to Ghost confirming payment." },
        { component: "db", text: "Ghost records the paid membership in the database." }
      ]
    }
  ],

  audit: [
    {
      claim: "Ghost is a Node.js monolith.",
      initial: "Ghost is a single Node.js monolith.",
      finding: "Partly verified. The repo shows one Ghost server process with one database, but Ghost's docs call it \"a modern, decoupled web application with a sensible service-based architecture\": clients like Admin and headless sites talk to it only through APIs. Refined to \"modular monolith with decoupled clients.\" Read docs.ghost.org/architecture.md for Ghost's full explanation.",
      status: "partial"
    },
    {
      claim: "The core server code lives in ghost/core.",
      initial: "Ghost's main server code is in the ghost/core package.",
      finding: "Verified, with a nuance. Commit #31630 moved the package manifest from ghost/core up to ghost/, but the code still lives in ghost/core, which contains server/, frontend/, shared/, cli/, app.js, and boot.js.",
      status: "verified"
    },
    {
      claim: "Ghost runs on Node.js 18 or 20.",
      initial: "Ghost supports Node.js 18 LTS or 20 LTS.",
      finding: "Outdated. Both package.json files require Node ^22.23.1 || ^24.20.0, and development pins 22.23.3.",
      status: "corrected"
    },
    {
      claim: "The current major version is Ghost 5.",
      initial: "Ghost 5.x is the current major release.",
      finding: "Outdated. The latest release is v6.69.0, and ghost/package.json is at 6.70.0-rc.0.",
      status: "corrected"
    },
    {
      claim: "Ghost is mostly written in JavaScript.",
      initial: "The codebase is mostly JavaScript.",
      finding: "Corrected. TypeScript is the largest share at 56.7%, ahead of JavaScript at 38.8%.",
      status: "corrected"
    },
    {
      claim: "Ghost is a headless Node.js CMS.",
      initial: "Ghost is a headless Node.js CMS.",
      finding: "Verified. The README says exactly this, and \"headless\" is a keyword in ghost/package.json.",
      status: "verified"
    },
    {
      claim: "Ghost-CLI installs Ghost and sets up SSL.",
      initial: "Ghost-CLI handles install and Let's Encrypt SSL.",
      finding: "Verified. README shows npm install ghost-cli -g, ghost install local, and ghost install with automatic SSL using LetsEncrypt.",
      status: "verified"
    },
    {
      claim: "Ghost uses Mailgun, Stripe, and S3-compatible storage.",
      initial: "Newsletters via Mailgun, payments via Stripe, media via storage adapters such as S3.",
      finding: "Verified. ghost/package.json depends on mailgun.js 10.4.0, stripe 8.222.0, and @aws-sdk/client-s3.",
      status: "verified"
    },
    {
      claim: "The web server uses Express.",
      initial: "Ghost core is built on Express.",
      finding: "Verified. ghost/package.json depends on express, express-hbs, express-session, and express-jwt.",
      status: "verified"
    },
    {
      claim: "Production uses MySQL 8.",
      initial: "Ghost uses MySQL 8 in production.",
      finding: "Verified. The production install docs require MySQL 8.0 or 8.4, and the code uses the mysql2 driver. The local install docs say SQLite3 is for development only.",
      status: "verified"
    },
    {
      claim: "Nginx is the reverse proxy.",
      initial: "Ghost-CLI sets up Nginx in front of Ghost.",
      finding: "Verified. The production install docs require NGINX 1.9.5 or newer, and Ghost-CLI offers to set it up during install.",
      status: "verified"
    },
    {
      claim: "Ghost uses Tinybird for analytics.",
      initial: "Not mentioned in the AI's first breakdown.",
      finding: "Missed by the AI. Root scripts point to ghost/core/server/data/tinybird, and there's a dev analytics compose file. The production docs add that Ghost-CLI installs don't support web analytics.",
      status: "corrected"
    },
    {
      claim: "Other subsystems: background jobs, Redis caching, error monitoring, site widgets, ActivityPub, systemd.",
      initial: "Not mentioned in the AI's first breakdown.",
      finding: "Missed by the AI. ghost/package.json has jobs and scheduling adapters, a Redis cache adapter, and Sentry; apps/ has comments, signup form, search, and announcement bar widgets; the production docs add the hosted ActivityPub service and systemd.",
      status: "corrected"
    },
    {
      claim: "Ghost ships an official self-hosting Docker image.",
      initial: "Ghost has no official Docker image; use the community one.",
      finding: "Outdated. A nightly multi-arch self-hosting Docker image was added in commit #31695, and the production docs point to a Docker Compose install for self-hosting analytics and ActivityPub.",
      status: "corrected"
    }
  ]
};
