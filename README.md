# Account Management System

Full stack account management system with React on the frontend and Node.js, Express, JWT, and Supabase on the backend.

## Project Structure

```text
Account-Management-System/
├── frontend/
└── backend/
```

## Backend Setup

1. Copy `backend/.env.example` to `backend/.env`.
2. Add your Supabase project URL, service role key, and JWT secret.
3. Run the SQL in `backend/supabase/schema.sql` inside the Supabase SQL editor.
4. Install dependencies and start the server:

```bash
cd backend
npm install
npm run dev
```

## Frontend Setup

1. Copy `frontend/.env.example` to `frontend/.env`.
2. Install dependencies and start the app:

```bash
cd frontend
npm install
npm run dev
```

By default the frontend expects the backend at `http://localhost:5000/api`.

## Features

- JWT signup and login flow
- Protected React routes with token stored in `localStorage`
- Dashboard with current balance and quick actions
- Send money flow between registered users
- Statement table with debit and credit rows and running balance
