# Smart Incentive Calculator with Dynamic Slab Admin Panel

## Project Overview
This is a full-stack web application designed for Nippon Toyota to handle incentive calculations for their sales officers based on dynamic slabs. It allows administrators to configure car models and incentive slabs, while sales officers can enter their monthly sales to calculate and save their incentives.

## Features
- **Role-Based Authentication**: Secure JWT-based login for ADMIN and SALES_OFFICER.
- **Admin Dashboard**: 
  - Manage active car inventory.
  - Configure per-model incentive slabs (e.g. Innova: 1–3 units = ₹1000/car, 4–7 = ₹2000).
- **Sales Dashboard**:
  - Real-time calculation per car model; each model’s slab applies to that model’s units sold only.
  - Breakdown of cars sold and total payouts.
  - History of previous monthly submissions.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, React Router, Axios, Zustand/Context.
- **Backend**: Spring Boot 3, Spring Security (JWT), Spring Data JPA.
- **Database**: PostgreSQL (Neon).

## Local Setup

### Database
Ensure you have PostgreSQL running or provide Neon DB credentials.

### Backend Setup
1. Navigate to the `backend/` directory.
2. Set environment variables or update `application.properties`:
   - `SPRING_DATASOURCE_URL`
   - `SPRING_DATASOURCE_USERNAME`
   - `SPRING_DATASOURCE_PASSWORD`
   - `JWT_SECRET`
   - `FRONTEND_URL`
3. Run `mvn spring-boot:run`. The backend will start on `http://localhost:8080`.

### Frontend Setup
1. Navigate to the `frontend/` directory.
2. Run `npm install`.
3. Run `npm run dev`. The frontend will be available at `http://localhost:5173`.

## Demo Credentials
On first run, the database is seeded with two default users:
- **Admin**: `admin@example.com` / `admin123`
- **Sales**: `sales@example.com` / `sales123`

## API Endpoints
- `POST /api/auth/login` - Authenticate user
- `GET /api/admin/cars` - Fetch all cars (Admin)
- `POST /api/admin/cars` - Create car model
- `GET /api/admin/slabs` - Fetch all incentive slabs (Admin)
- `POST /api/admin/slabs` - Create incentive slab
- `GET /api/sales/cars` - Get active cars for sales dashboard
- `POST /api/sales/calculate` - Preview calculation
- `POST /api/sales/submissions` - Save sales entry

## Deployment Steps
- **Backend (Render/Railway)**: Provide environment variables. Uses standard Java 17 Maven build.
- **Frontend (Vercel/Netlify)**: Set the build command to `npm run build`, output directory `dist`. Update the backend API URL in `api.js` (or via env variables) to point to the deployed backend URL.

