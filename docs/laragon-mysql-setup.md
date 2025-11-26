# Laragon MySQL Setup for COVASOL

This guide explains how to bootstrap the Prisma + MySQL stack on Laragon so the new backend can persist real data.

## 1. Prepare Laragon
1. Start Laragon and ensure the MySQL service is running.
2. Open **Menu ▸ MySQL ▸ Console** (or phpMyAdmin) and create the database:
   ```sql
   CREATE DATABASE IF NOT EXISTS covasol CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Create a dedicated user (optional but recommended):
   ```sql
   CREATE USER IF NOT EXISTS 'covasol'@'localhost' IDENTIFIED BY 'change-me';
   GRANT ALL PRIVILEGES ON covasol.* TO 'covasol'@'localhost';
   FLUSH PRIVILEGES;
   ```

## 2. Configure environment variables
Duplicate `.env.example` into `.env` at the repo root and adjust:
```
DATABASE_URL=mysql://covasol:change-me@localhost:3306/covasol
ADMIN_SEED_PASSWORD=ChangeMe#2025
```
`ADMIN_SEED_PASSWORD` controls the password created by the Prisma seed script for the default admin account.

## 3. Apply Prisma schema
From the repo root run:
```powershell
npm run prisma:generate --workspace apps/backend
npm run prisma:migrate --workspace apps/backend -- --name init-mysql
npm run prisma:seed --workspace apps/backend
```
`prisma:migrate` will create the tables described in `apps/backend/prisma/schema.prisma`. The seed step provisions:
- An `admin` user (`displayName: COVASOL Admin`, password pulled from `ADMIN_SEED_PASSWORD`)
- Two published blog posts
- Two published products

## 4. Verify with Prisma Studio (optional)
```powershell
npm run prisma:studio --workspace apps/backend
```
Open the URL in your browser to inspect the Laragon database.

You are now ready to run `npm run dev` to start both backend and frontend pointing to the Laragon MySQL instance.
