# 🚀 Bulk Email Sender

A modern, full-stack bulk email sending application with a **SvelteKit frontend** and **Hono/Node.js backend**.

## 📋 Overview

This application allows you to:
- Send personalized bulk emails from Excel contact lists
- Manage multiple SMTP configurations
- Schedule emails for later delivery
- Process emails in batches with rate limiting
- Track email delivery reports and statistics
- Secure multi-user authentication

## 🛠️ Tech Stack

### Backend
- **Framework**: Hono (Node.js)
- **Database**: SQLite (better-sqlite3)
- **Authentication**: Argon2 password hashing with session tokens
- **Email**: Nodemailer with SMTP

### Frontend
- **Framework**: SvelteKit 2.x with Svelte 5 (Runes)
- **Styling**: TailwindCSS v4
- **State Management**: Svelte 5 reactive stores
- **Build Tool**: Vite 7

## 📁 Project Structure

```
├── src/                    # Backend source code
│   ├── app.ts              # Main Hono app
│   ├── middleware/         # Auth middleware
│   ├── routes/             # API routes
│   └── services/           # Business logic services
├── frontend/               # SvelteKit frontend
│   ├── src/
│   │   ├── lib/            # Components, stores, API client
│   │   └── routes/         # SvelteKit routes
│   └── ...
├── data/                   # SQLite databases
├── uploads/                # Uploaded files
└── logs/                   # Email logs
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation

1. **Install backend dependencies:**
   ```bash
   npm install
   ```

2. **Install frontend dependencies:**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

### Development

1. **Start the backend server:**
   ```bash
   npm run dev
   ```
   Backend runs on http://localhost:3000

2. **Start the frontend (in a new terminal):**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend runs on http://localhost:5173

### Production

1. **Build the frontend:**
   ```bash
   cd frontend
   npm run build
   cd ..
   ```

2. **Start the backend:**
   ```bash
   npm start
   ```

## 🔧 Configuration

Create a `.env` file in the root directory:

```env
# Server
PORT=3000
FRONTEND_URL=http://localhost:5173

# Optional: Default SMTP (can also be configured per-user in UI)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com
FROM_NAME=Your Name
```

## 📖 API Endpoints

### Authentication
- `POST /auth/register` - Create new account
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get current user

### SMTP Configuration
- `GET /config/smtp` - Get user's SMTP configs
- `POST /config/smtp` - Create SMTP config
- `PUT /config/smtp/:id` - Update SMTP config
- `DELETE /config/smtp/:id` - Delete SMTP config

### Email Sending
- `POST /send` - Send emails (form data with Excel file)
- `POST /parse-excel` - Parse Excel file for preview

### Reports
- `GET /report` - Get email logs and stats
- `GET /report/export/csv` - Export logs as CSV
- `GET /report/export/json` - Export logs as JSON
- `DELETE /report/clear` - Clear all logs

### Dashboard
- `GET /dashboard/poll-status` - Check if polling needed
- `GET /dashboard/batch-status` - Get batch job status
- `GET /dashboard/scheduled-jobs` - Get scheduled jobs

## ✨ Features

- **Multi-user support** - Each user has their own SMTP configs
- **Personalization** - Use {{FirstName}}, {{Email}}, etc. placeholders
- **Batch processing** - Send in batches with configurable delays
- **Scheduling** - Schedule emails for future delivery
- **Email notifications** - Get notified when batches complete
- **Rate limiting** - Automatic provider detection for limits
- **Export reports** - Download logs as CSV or JSON

## 📄 License

MIT
