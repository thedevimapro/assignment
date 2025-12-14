# Bulk Email Sender - SvelteKit Frontend

A modern, responsive frontend for the Bulk Email Sender application built with SvelteKit 5, Svelte 5 (with runes), and TailwindCSS v4.

## Features

- 🔐 **Authentication** - Login and registration with secure session handling
- 📧 **Email Composition** - Rich email editor with personalization placeholders
- 📊 **Excel Import** - Upload contact lists from Excel files
- ⚙️ **SMTP Management** - Multiple SMTP configuration support
- 📅 **Scheduling** - Schedule emails for later delivery
- 📈 **Batch Processing** - Send emails in batches with configurable delays
- 📋 **Reports** - View email logs, statistics, and export data
- 🎨 **Modern UI** - Clean, responsive design with TailwindCSS

## Tech Stack

- **Framework**: SvelteKit 2.x with Svelte 5
- **State Management**: Svelte 5 Runes ($state, $derived, $effect)
- **Styling**: TailwindCSS v4
- **Build Tool**: Vite 7
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Backend server running on port 3000

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── app.css              # Global styles with TailwindCSS
│   ├── app.html             # HTML template
│   ├── lib/
│   │   ├── api.ts           # API client for backend communication
│   │   ├── stores.svelte.ts # Svelte 5 reactive stores
│   │   └── components/      # Reusable UI components
│   │       ├── Button.svelte
│   │       ├── Card.svelte
│   │       ├── Input.svelte
│   │       ├── Toast.svelte
│   │       ├── ComposeTab.svelte
│   │       ├── ReportsTab.svelte
│   │       └── ConfigsTab.svelte
│   └── routes/
│       ├── +layout.svelte   # Root layout
│       ├── +page.svelte     # Dashboard (main page)
│       └── login/
│           └── +page.svelte # Login/Register page
├── static/                  # Static assets
├── svelte.config.js         # SvelteKit configuration
├── vite.config.ts           # Vite configuration with API proxy
├── tailwind.config.js       # TailwindCSS configuration
└── package.json
```

## API Proxy

In development, the Vite dev server proxies API requests to `http://localhost:3000`. This is configured in `vite.config.ts`.

Proxied routes:
- `/auth/*` - Authentication endpoints
- `/config/*` - SMTP configuration
- `/send` - Email sending
- `/report/*` - Email logs and reports
- `/dashboard/*` - Dashboard status
- `/user/*` - User info

## Environment Variables

Create a `.env` file for environment-specific settings:

```env
VITE_API_URL=http://localhost:3000  # Not needed with proxy
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run check` - Type-check the codebase
