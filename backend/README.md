# MEXO TRADES — Backend (Step 1: Architecture Only)

A standalone Express backend, kept completely separate from the existing
frontend. Nothing in the frontend was touched or needs to change.

## Folder structure

```
backend/
├── server.js              # Entry point — starts the HTTP server
├── app.js                 # Express app setup (middleware + routes)
├── package.json
├── .env                    # Real environment values (not committed)
├── .env.example             # Template — safe to commit
├── .gitignore
├── config/
│   └── env.js               # Centralized environment variable access
├── routes/
│   ├── enrollmentRoutes.js  # /api/enrollment/*
│   └── healthRoutes.js      # /api/health
├── controllers/
│   └── enrollmentController.js
├── middleware/
│   ├── upload.js            # Multer config for screenshot uploads
│   └── errorHandler.js
├── services/
│   ├── telegramService.js   # Placeholder — not implemented yet
│   └── emailService.js      # Placeholder — not implemented yet
└── uploads/                 # Stored payment screenshots
```

## Setup

```bash
cd backend
npm install
cp .env.example .env   # already done for you — just fill in real values later
npm run dev             # starts with nodemon (auto-restart)
# or
npm start                # starts normally
```

Server runs at `http://localhost:5000` by default (set by `PORT` in `.env`).

## Endpoints available now

- `GET /api/health` — confirms the server is running.
- `POST /api/enrollment/payment-proof` — accepts the enrollment form data
  and payment screenshot exactly as sent by `PaymentFlow.astro`'s existing
  `fetch("/api/enrollment/payment-proof", ...)` call. Stores the screenshot
  in `uploads/` and returns a JSON confirmation. Telegram/email sending are
  wired in as placeholders (see below) but do nothing yet.

## Where to add the Telegram Bot Token and Chat ID later

Open `backend/.env` and fill in:

```
TELEGRAM_BOT_TOKEN=your-token-from-BotFather
TELEGRAM_CHAT_ID=your-chat-id
```

Then implement the actual API call inside
`backend/services/telegramService.js` — the controller already calls this
service, so no other file needs to change.

## Where to add backup email credentials later

Open `backend/.env` and fill in the `EMAIL_*` variables, then implement the
sending logic inside `backend/services/emailService.js`.

## Connecting the frontend later

The frontend already calls `POST /api/enrollment/payment-proof`. Once this
backend is deployed, either:
- Proxy `/api/*` requests from the frontend host to this backend, or
- Update the frontend fetch URL to point at the backend's full URL, or
- Serve both from the same domain behind a reverse proxy (e.g. Nginx).

No frontend code changes were made as part of this step.
