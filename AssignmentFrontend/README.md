# PackageFlow — Package Tracking System

A responsive React + Vite + Bootstrap frontend for the Spring Boot package-tracking assignment. The interface uses a soft lavender palette with a subtle Gojo-inspired background, a package dashboard, and Find / Update / Delete operation panels.

## Run locally

```bash
npm install
npm run dev
```

Vite normally serves the app at `http://localhost:5173`.

## Backend connection

By default, requests go to `http://localhost:8001`. To change this, copy `.env.example` to `.env` and set:

```env
VITE_API_BASE_URL=http://localhost:8001
```

Expected endpoints:

- `GET /displayAll`
- `GET /displayById/{id}`
- `POST /addPackage`
- `PUT /update/{id}`
- `DELETE /delete/{id}`

Ensure the Spring Boot backend allows CORS from `http://localhost:5173`.

## Included frontend validation

- Tracking code is required and must contain exactly five digits.
- Current location is required and limited to 100 characters.
- Last-updated date is required and cannot be in the future.
- Package IDs for lookup must be positive whole numbers.
- Success, validation, backend, loading, and empty-state feedback are shown in the interface.

Keep equivalent validation on the backend as well. Tracking codes should remain strings so leading zeroes are preserved.

## Docker

Build and run the frontend container with the included `Dockerfile` and `nginx.conf`. The build argument `VITE_API_BASE_URL` controls the API base URL embedded in the production build.
