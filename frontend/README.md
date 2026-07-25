# Bulk Email Sender - Frontend

A modern SvelteKit frontend for the Bulk Email Sender application. Provides a clean, responsive dashboard for managing SMTP configurations, composing bulk emails, and viewing reports.

## Technologies Used

- **SvelteKit 5** (latest runes mode)
- **TypeScript** (strict mode)
- **Tailwind CSS v4** (with `@tailwindcss/forms` and `@tailwindcss/typography` plugins)
- **Vite 8** (with SvelteKit + Tailwind plugins)
- **Axios** (HTTP client for API calls)

## Project Structure

```
frontend/
├── src/
│   ├── app.css               # Global styles (Tailwind imports)
│   ├── app.html              # Root HTML template
│   ├── app.d.ts              # TypeScript declarations
│   ├── lib/
│   │   ├── api/
│   │   │   └── client.ts     # Axios instance with base config
│   │   ├── components/
│   │   │   ├── Navbar.svelte  # Top navigation bar
│   │   │   ├── Sidebar.svelte # Collapsible sidebar menu
│   │   │   ├── StatCard.svelte# Dashboard metric card
│   │   │   ├── Card.svelte    # Generic content wrapper
│   │   │   ├── Button.svelte  # Reusable button (primary/secondary/danger/ghost)
│   │   │   ├── Input.svelte   # Form input with label & error state
│   │   │   ├── Table.svelte   # Data table with headers & loading state
│   │   │   ├── Modal.svelte   # Dialog modal with backdrop
│   │   │   └── Loader.svelte  # Loading spinner
│   │   ├── services/
│   │   │   ├── auth.ts        # Login, register, logout, session check
│   │   │   ├── config.ts      # SMTP CRUD operations
│   │   │   ├── dashboard.ts   # Dashboard data
│   │   │   ├── report.ts      # Email reports
│   │   │   └── send.ts        # Send bulk emails
│   │   ├── stores/
│   │   │   ├── auth.ts        # Auth state management
│   │   │   └── toast.ts       # Toast notification service
│   │   └── assets/
│   │       └── favicon.svg    # App favicon
│   ├── routes/
│   │   ├── +layout.svelte     # Root layout with auth guard
│   │   ├── +page.svelte       # Login page
│   │   ├── layout.css         # Layout-level Tailwind import
│   │   ├── dashboard/
│   │   │   └── +page.svelte   # Dashboard with stats & activity
│   │   ├── smtp/
│   │   │   └── +page.svelte   # SMTP configuration (CRUD + test)
│   │   ├── compose/
│   │   │   └── +page.svelte   # Email composer with file uploads
│   │   ├── reports/
│   │   │   └── +page.svelte   # Reports with search, pagination, export
│   │   └── profile/
│   │       └── +page.svelte   # User profile
│   └── lib/index.ts           # Library exports
├── vite.config.ts             # Vite config with Tailwind plugin & API proxy
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

### Prerequisites

- [Bun](https://bun.sh/) v1.0+
- Node.js v18+ (if not using Bun)

### Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
bun install
```

## Environment Variables

No environment variables are required. The Vite proxy configuration in `vite.config.ts` handles API routing during development. For production, configure the backend URL in `src/lib/api/client.ts`.

## Running the Backend

The frontend requires the Hono backend server to be running:

```bash
# From project root
cd ..
bun run dev
```

The backend runs on `http://localhost:3000` and handles authentication, SMTP management, email sending, and reporting.

## Running the Frontend

```bash
# From frontend directory
cd frontend
bun run dev
```

The development server starts on `http://localhost:5173` (or next available port).

## Building for Production

```bash
bun run build
```

This generates optimized output in `.svelte-kit/output/`.

## Features

### Core Features
- ✅ **Authentication** — Secure login with session management
- ✅ **Route Protection** — Auth guard redirects unauthenticated users to login
- ✅ **Responsive Design** — Works on mobile, tablet, laptop, and desktop

### Dashboard
- ✅ 4 stat cards: Total Emails, Success, Failed, SMTP Configs
- ✅ Recent activity feed
- ✅ Automatic data refresh

### SMTP Configuration
- ✅ Full CRUD: Add, Edit, Delete SMTP configurations
- ✅ Set default SMTP
- ✅ Test SMTP connection
- ✅ Modal form with validation

### Compose Email
- ✅ Select SMTP configuration
- ✅ Subject and delay configuration
- ✅ Excel file upload (contacts list)
- ✅ HTML template upload (optional)
- ✅ FormData multipart upload

### Reports
- ✅ 4 stat cards: Total Sent, Success, Failed, Success Rate
- ✅ Search logs by email, status, or subject
- ✅ Pagination with page navigation
- ✅ Export to CSV
- ✅ Export to JSON

### Reusable Component Library
- `Navbar` — Top navigation with user info & logout
- `Sidebar` — Collapsible side navigation with active state
- `StatCard` — Color-coded metric card
- `Card` — Generic content container
- `Button` — Variants: primary, secondary, danger, ghost, success; loading state support
- `Input` — Form input with label, required indicator, error state
- `Table` — Data table with loading and empty states
- `Modal` — Dialog with backdrop, title, close button
- `Loader` — Animated spinner

## Type Checking

```bash
bun run check
```

This runs `svelte-check` with strict TypeScript configuration.

## Code Quality

- Strict TypeScript configuration
- Svelte 5 runes mode (`$state`, `$derived`, `$effect`, `$props`)
- Accessible form labels with `for`/`id` associations
- A11y-compliant components (0 warnings from `svelte-check`)
- Clean, readable component structure
- Proper error handling with user-friendly messages

## Future Improvements

- [ ] Add unit tests with Vitest
- [ ] Add end-to-end tests with Playwright
- [ ] Implement dark mode support
- [ ] Add real-time updates via WebSocket
- [ ] Implement email templates library
- [ ] Add batch scheduling UI
- [ ] Add user management (admin panel)

