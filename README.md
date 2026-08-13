# Expense Tracker — React + Node.js + PostgreSQL

## Stack
- React + Vite
- Node.js + Express
- PostgreSQL
- JWT authentication
- Recharts
- Axios

## 1. Database
Create a PostgreSQL database named `expense_tracker`.

Run `database/schema.sql` in pgAdmin Query Tool.

## 2. Backend
Open a terminal in `backend`:

```bash
npm install
```

Copy `.env.example` to `.env` and update the PostgreSQL password.

Then:

```bash
npm run dev
```

Backend: http://localhost:5000

## 3. Frontend
Open another terminal in `frontend`:

```bash
npm install
npm run dev
```

Frontend: http://localhost:5173

## 4. First use
Open the frontend, register an account, log in, add income/expenses, and view the dashboard.

## Important
Do not commit `.env` to GitHub.
