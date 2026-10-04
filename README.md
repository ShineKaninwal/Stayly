# Stayly: Find stays worth remembering.
Airbnb-style stay discovery app (student project; fictional listings). React + Vite, Flask, PostgreSQL, JWT in httpOnly cookies with CSRF protection, Werkzeug password hashing.

## Local setup
1. **Database:** `psql -U postgres` then `CREATE USER stayly_user WITH PASSWORD 'pw'; CREATE DATABASE stayly OWNER stayly_user;`
2. **Backend:** `cd backend && python -m venv venv && source venv/bin/activate` (Windows: `venv\Scripts\activate`), `pip install -r requirements.txt`, `cp .env.example .env`, edit `.env` (generate secrets with `python -c "import secrets;print(secrets.token_hex(32))"`), then `python seed.py` and `flask --app wsgi run --debug --port 5001`. Tables are created automatically on start.
3. **Frontend:** `cd frontend && npm install && cp .env.example .env && npm run dev` → http://localhost:5174 (Vite proxies `/api` to Flask).

## Environment variables (backend/.env)
`SECRET_KEY`, `JWT_SECRET_KEY`, `DATABASE_URL`, `FRONTEND_ORIGIN`, `JWT_COOKIE_SECURE` (true in production).

## API
`POST /api/auth/signup|login|logout`, `GET /api/auth/me`, `GET /api/properties` (also `/search`; params `location,max_price,guests,category,min_rating`), `GET /api/properties/:id`, `GET|POST /api/wishlist`, `DELETE /api/wishlist/:propertyId`. Responses: `{success, data}` or `{success:false, error:{code,message}}`.

## Test authentication
Sign up at /signup, log out, log in, save a stay, log out and in again: the heart stays saved. `curl -i localhost:5001/api/auth/me` returns 401 when logged out.

## Deploy
**Database:** create a hosted Postgres (Render, Neon or Supabase) and copy its connection URL.
**Backend (Render):** New Web Service → root `backend`, build `pip install -r requirements.txt`, start `gunicorn wsgi:app`. Set env vars: `DATABASE_URL`, `SECRET_KEY`, `JWT_SECRET_KEY`, `FRONTEND_ORIGIN=https://<your-app>.vercel.app`, `JWT_COOKIE_SECURE=true`. Seed once from the Render shell: `python seed.py`.
**Frontend (Vercel):** import repo, root `frontend`, framework Vite. In `frontend/vercel.json` replace `YOUR-RENDER-SERVICE` with your Render hostname. The rewrite makes the browser see one origin, so cookies and CORS work.
**Verify:** open the Vercel URL, sign up, save a stay, reload.

## Security
Hashed passwords, httpOnly+CSRF cookies, backend validation, SQLAlchemy parameterized queries, CORS limited to `FRONTEND_ORIGIN`, secrets only in env.
