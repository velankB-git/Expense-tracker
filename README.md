# Expense Tracker — React + Node.js + PostgreSQL

## Stack
- React + Vite
- Node.js + Express
- PostgreSQL
- JWT authentication
- Recharts
- Axios

## 1. Database
Create a Neon PostgreSQL project and copy its pooled connection string into the backend environment as `DATABASE_URL`.

The backend applies the idempotent `database/schema.sql` at startup, so the tables and indexes are created automatically.

## 2. Backend
Open a terminal in `backend`:

```bash
npm install
```

Set these backend environment variables in local development and in your deployment platform:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=use-a-long-random-secret
FRONTEND_URL=http://localhost:5173
```

For a deployed frontend, set `FRONTEND_URL` to its exact public origin. Multiple origins may be separated by commas.

Then:

```bash
npm run dev
```

Backend health check: `http://localhost:5000/api/health`

## 3. Frontend
Open another terminal in `frontend`:

```bash
npm install
npm run dev
```

Set `VITE_API_URL` to the deployed backend URL ending in `/api` before building the frontend, for example `https://api.example.com/api`.

Frontend: http://localhost:5173

## 4. First use
Open the frontend, register an account, log in, add income/expenses, and view the dashboard.

## Important
Do not commit `.env` to GitHub.
