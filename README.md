# AyuDiet Connect Node.js Backend

Standalone Express and MongoDB API source for AyuDiet Connect.

## Requirements

- Node.js 18 or newer
- MongoDB local instance or MongoDB Atlas URI

## Setup

1. In this folder, install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and set `MONGO_URI` to your MongoDB connection string.

3. Seed the food catalogue and optional demo patient/plan records:

   ```bash
   npm run seed
   ```

   The seeder upserts foods by code and preserves unrelated records.

4. Start the API:

   ```bash
   npm run dev
   ```

   The server listens on `http://localhost:5000` by default. Check `GET /api/health`.

## API routes

- `GET /api/foods` and `GET /api/foods/:identifier`
- `GET /api/foods/categories/summary` and `GET /api/foods/dosha/:dosha`
- `POST /api/foods`
- `GET|POST /api/patients`, `GET|PUT /api/patients/:id`
- `POST /api/patients/:id/follow-ups`
- `GET /api/plans/patient/:patientId`, `POST /api/plans`
- `PUT /api/plans/:id/approve`

This source contains the documented food, patient, follow-up, and diet-plan workflows. It does not include authentication or the React client.
