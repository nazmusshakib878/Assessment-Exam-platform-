# Level Assessment Exam Platform

A full-stack role-based assessment platform. Students can register, take a balanced ten-question level assessment, and view completed results. Administrators can manage the question bank and review submitted student outcomes.

## Tech stack

- Backend: Laravel 12, PHP 8.2+, Laravel Sanctum, SQLite, PHPUnit
- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- Authentication: Laravel Sanctum personal access tokens with admin/student role authorization

## Project structure

- `backend/` - Laravel API, database migrations, seeders, and feature tests
- `frontend/` - Next.js role-aware web interface

## Backend setup

```bash
cd backend
composer install
copy .env.example .env
php artisan key:generate
```

The default backend environment uses SQLite. If `database/database.sqlite` does not exist, create it before migrating:

```powershell
New-Item -ItemType File -Force database/database.sqlite
```

## Frontend setup

```bash
cd frontend
npm install
copy .env.example .env.local
```

Set the frontend API origin in `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Environment variables

Backend settings are documented in `backend/.env.example`. The default local configuration uses:

```env
APP_URL=http://localhost
DB_CONNECTION=sqlite
```

Frontend settings are documented in `frontend/.env.example`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Database migration and seeding

Run migrations:

```bash
cd backend
php artisan migrate
```

Reset the development database and load the complete baseline data:

```bash
php artisan migrate:fresh --seed
```

The seeders create exactly one admin, two students, and 50 questions: 10 questions at every level from 1 through 5.

## Test credentials

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@example.com` | `password` |
| Student | `student1@example.com` | `password` |
| Student | `student2@example.com` | `password` |

New registrations always receive the `student` role.

## Running the applications

Start the Laravel API:

```bash
cd backend
php artisan serve
```

The API will normally be available at `http://localhost:8000`.

In a second terminal, start the Next.js application:

```bash
cd frontend
npm run dev
```

Open `http://localhost:3000` and sign in using a seeded account or register a new student account.

## API and UI overview

- Public authentication: register and login
- Authenticated session: current user and logout
- Student flow: start an attempt, save selected answers while progressing, submit, and view results
- Admin flow: question CRUD with validation, filters, and pagination; submitted-results listing
- Role protection: Sanctum plus backend `role` middleware; frontend guards route the user to the appropriate workspace
- Security: question responses before submission include only text, level, and options; answer keys and points stay server-side

## Running tests and checks

Backend tests:

```bash
cd backend
php artisan test
```

Frontend checks:

```bash
cd frontend
npm run lint
npm run build
```

## Decisions and Improvements

- Sanctum bearer tokens are held in browser session storage and verified against `/api/user` when the app loads.
- Backend role middleware remains the authorization source of truth; frontend guards improve navigation and user experience.
- Attempt questions and selected answers are persisted, so students can safely refresh and resume an in-progress exam.
- Scores, correct options, and awarded points are calculated only by the Laravel service after submission.
- A future improvement is moving token handling to secure HTTP-only cookies with a dedicated web-session strategy.