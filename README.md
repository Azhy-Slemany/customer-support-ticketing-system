# Docker Setup

## Project structure expected

```
project-root/
  backend/          ← Laravel project
  frontend/         ← Next.js project
  docker/
    php/
      www.conf
  Dockerfile.backend
  Dockerfile.frontend
  docker-compose.yml
  .env.example
```

---

## First-time setup

### 1. Copy and fill in environment variables

```bash
cp .env.example .env
```

Edit `.env` and set a strong `DB_PASSWORD`. Leave `APP_KEY` blank for now.

### 2. Copy `.env` into the Laravel backend too

```bash
cp backend/.env.example backend/.env
# Edit backend/.env to match the DB values in your root .env
```

### 3. Build and start all services

```bash
docker compose up --build -d
```

This starts four containers:

| Container  | Port | Purpose |
|------------|------|---------|
| db         | 5432 | PostgreSQL 16 |
| backend    | —    | PHP 8.5 FPM |
| frontend   | 3000 | Next.js app |

### 4. Generate the Laravel app key

```bash
docker compose exec backend php artisan key:generate
```

Copy the output into your root `.env` as `APP_KEY=` and into `backend/.env` as well.

### 5. Run migrations and seed demo data

```bash
docker compose exec backend php artisan migrate:fresh --seed
```

### 6. Open the app

- Frontend: <http://localhost:3000>
- API:      <http://localhost:8000/api>

---

## Daily use

```bash
# Start
docker compose up -d

# Stop
docker compose down

# View logs (all services)
docker compose logs -f

# View logs for one service
docker compose logs -f backend
docker compose logs -f frontend

# Run artisan commands
docker compose exec backend php artisan <command>

# Open a shell in the backend container
docker compose exec backend bash
```

---

## Rebuilding after dependency changes

If you add a Composer or npm package, rebuild the affected image:

```bash
# Backend
docker compose build backend

# Frontend
docker compose build frontend

# Then restart
docker compose up -d
```

---

## Resetting the database

```bash
docker compose exec backend php artisan migrate:fresh --seed
```

To wipe the PostgreSQL volume entirely and start from scratch:

```bash
docker compose down -v   # -v removes named volumes including pgdata
docker compose up -d
docker compose exec backend php artisan migrate:fresh --seed
```

---

## Notes

- `NEXT_PUBLIC_API_URL` is baked into the Next.js build at image build time.
  If you change it, rebuild the frontend image with `docker compose build frontend`.
- PHP-FPM logs appear in `docker compose logs backend`.
- The `backend_vendor` named volume keeps Composer packages inside the container
  so host-mounted source changes don't clobber the installed dependencies.
