# 🚀 Bulk Email Sender

A full-stack web application for sending bulk emails with SMTP configuration management, contact uploads via Excel, HTML template support, batch processing, scheduling, and detailed reporting.

## ✨ Features

### 🔐 Authentication
- User registration and login with secure session-based authentication
- Protected routes with automatic redirect to login
- HTTP-only session cookies with Argon2 password hashing

### 📊 Dashboard
- Welcome message showing logged-in user
- Statistics cards: Total Emails, Success, Failed, SMTP Configs
- Recent activity feed with status indicators
- Loading spinner and empty state handling

### ⚙️ SMTP Configuration
- Full CRUD operations: Add, Edit, Delete SMTP configurations
- Set default SMTP configuration
- Test SMTP connection before saving
- Support for Gmail, Outlook, and custom SMTP providers

### ✉️ Compose Email
- Upload Excel file with contacts (supports .xlsx, .xls)
- Upload HTML email template (optional)
- Subject line configuration
- Configurable delay between emails
- SMTP selection from saved configurations
- Multipart form data upload

### 📈 Reports
- Email sending statistics: Total, Success, Failed, Success Rate
- Search logs by email, status, or subject
- Pagination with page navigation
- Export to CSV format
- Export to JSON format

### 🎨 UI/UX
- Mobile responsive design
- Loading indicators throughout
- Empty states with helpful messages
- Toast notifications for success/error
- Consistent spacing, colors, and typography
- Reusable component library

## 📋 Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| [Hono](https://hono.dev/) | Web framework (Bun runtime) |
| [TypeScript](https://www.typescriptlang.org/) | Programming language |
| [Bun](https://bun.sh/) | JavaScript runtime & package manager |
| [SQLite](https://www.sqlite.org/) (via Bun:sqlite) | Database |
| [Nodemailer](https://nodemailer.com/) | Email sending via SMTP |
| [Argon2](https://github.com/ranisalt/node-argon2) | Password hashing |
| [xlsx](https://github.com/SheetJS/sheetjs) | Excel file parsing |

### Frontend
| Technology | Purpose |
|---|---|
| [SvelteKit 5](https://kit.svelte.dev/) | Web framework (Runes mode) |
| [TypeScript](https://www.typescriptlang.org/) | Programming language (strict mode) |
| [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first CSS framework |
| [Vite 8](https://vitejs.dev/) | Build tool |
| [Axios](https://axios-http.com/) | HTTP client |

## 📁 Folder Structure

```
bulk-email-sender/
├── src/                          # Backend source (Hono + Bun)
│   ├── app.ts                    # Main Hono app setup
│   ├── types.ts                  # TypeScript interfaces
│   ├── middleware/
│   │   └── auth.ts              # Authentication middleware
│   ├── routes/
│   │   ├── auth.ts              # Login, register, logout
│   │   ├── config.ts            # SMTP configuration CRUD
│   │   ├── dashboard.ts         # Dashboard polling/data
│   │   ├── index.ts             # Static file routes
│   │   ├── report.ts            # Email logs and reports
│   │   └── send.ts              # Email sending
│   └── services/
│       ├── batchService.ts      # Batch email processing
│       ├── emailService.ts      # Nodemailer integration
│       ├── fileService.ts       # Excel/HTML file handling
│       ├── logService.ts        # Email log management
│       ├── notificationService.ts # Email notifications
│       ├── providerLimits.ts    # SMTP provider limits
│       ├── schedulerService.ts  # Job scheduling
│       └── userDatabase.ts      # SQLite user management
├── frontend/                     # SvelteKit frontend
│   ├── src/
│   │   ├── routes/              # SvelteKit routes
│   │   │   ├── +layout.svelte   # Root layout with auth guard
│   │   │   ├── +page.svelte     # Login page
│   │   │   ├── dashboard/       # Dashboard page
│   │   │   ├── smtp/            # SMTP configuration page
│   │   │   ├── compose/         # Email compose page
│   │   │   ├── reports/         # Reports page
│   │   │   └── profile/         # Profile page
│   │   ├── lib/
│   │   │   ├── api/             # API client (Axios)
│   │   │   ├── components/      # Reusable UI components
│   │   │   ├── services/        # API service functions
│   │   │   ├── stores/          # Svelte state stores
│   │   │   └── assets/          # Static assets
│   │   ├── app.css              # Global styles
│   │   └── app.html             # Root HTML template
│   ├── vite.config.ts           # Vite config with proxy
│   └── package.json
├── data/                         # SQLite databases
├── uploads/                      # Uploaded files
├── logs/                         # Email logs
├── package.json                  # Backend dependencies
└── README.md                     # This file
```

## 🚀 Installation

### Prerequisites
- [Bun](https://bun.sh/) v1.0+ (for backend)
- Node.js v18+ (for frontend if not using Bun)

### Backend Setup

```bash
# Navigate to project root
cd bulk-email-sender

# Install backend dependencies
bun install

# Create .env file with your SMTP configuration (optional)
# See Environment Variables section below

# Start the backend server
bun run dev
```

The backend runs on `http://localhost:3000`.

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install frontend dependencies
bun install

# Start the development server
bun run dev
```

The frontend runs on `http://localhost:5173`.

## 🔧 Environment Variables

Backend environment variables (`.env` file in project root):

| Variable | Description | Required |
|---|---|---|
| `PORT` | Server port (default: 3000) | No |
| `SMTP_HOST` | SMTP server hostname | No (user can configure) |
| `SMTP_PORT` | SMTP server port (default: 587) | No |
| `SMTP_SECURE` | Use SSL/TLS (true/false) | No |
| `SMTP_USER` | SMTP username | No |
| `SMTP_PASS` | SMTP password | No |
| `FROM_EMAIL` | Default from email address | No |
| `FROM_NAME` | Default from name | No |

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Login with email and password |
| `POST` | `/auth/logout` | Logout current session |
| `GET` | `/auth/me` | Get current authenticated user |

### SMTP Configuration
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/config/smtp` | Get all user SMTP configurations |
| `POST` | `/config/smtp` | Create new SMTP configuration |
| `PUT` | `/config/smtp/:id` | Update SMTP configuration |
| `DELETE` | `/config/smtp/:id` | Delete SMTP configuration |
| `POST` | `/config/smtp/:id/default` | Set as default configuration |
| `POST` | `/config/smtp/test` | Test SMTP connection |

### Email Sending
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/send` | Send bulk emails (FormData with file uploads) |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/dashboard/data` | Get dashboard data |
| `GET` | `/dashboard/poll-status` | Check if polling is needed |

### Reports
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/report` | Get email logs and statistics |
| `GET` | `/report/export/csv` | Export logs as CSV |
| `GET` | `/report/export/json` | Export logs as JSON |
| `DELETE` | `/report/clear` | Clear all logs |

## 📸 Screenshots

### Login Page
![Login Page](screenshots/login.png)

### Dashboard
![Dashboard](screenshots/dashboard.png)

### SMTP Configuration
![SMTP Configuration](screenshots/smtp.png)

### Compose Email
![Compose Email](screenshots/compose.png)

### Reports
![Reports](screenshots/reports.png)

> **Note:** Add actual screenshots to a `screenshots/` directory at the project root.

## 🧪 Development

### Type Checking
```bash
cd frontend && bun run check
```

### Production Build
```bash
cd frontend && bun run build
```

### Code Quality
- Strict TypeScript configuration
- Svelte 5 runes mode (`$state`, `$derived`, `$effect`, `$props`)
- Accessible form labels with proper `for`/`id` associations
- A11y-compliant components (0 warnings from `svelte-check`)
- Clean, modular component architecture

## 📜 License

MIT

## 👥 Author

Your Name

