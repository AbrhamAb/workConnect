# WorkConnect Deployment

This repository deploys as two services:

- Frontend: Next.js on Vercel
- API: Go Docker service on Render
- Database: PostgreSQL on Neon (or another managed PostgreSQL provider)

## 1. Prepare the database

Create a PostgreSQL database and copy its connection string. It must include SSL for Neon:

```text
postgres://USER:PASSWORD@HOST/DATABASE?sslmode=require
```

The API applies its schema migrations when it starts.

## 2. Deploy the API

1. Push this repository to GitHub.
2. In Render, choose **New > Blueprint** and select the repository.
3. Render will read `render.yaml` and create `workconnect-api`.
4. Set the `DATABASE_URL` environment variable to the managed PostgreSQL connection string.
5. Deploy and wait for the health check to pass.
6. Verify:

```text
https://YOUR-API-DOMAIN.onrender.com/health
```

The frontend API base URL will be:

```text
https://YOUR-API-DOMAIN.onrender.com/api/v1
```

## 3. Deploy the frontend

1. In Vercel, choose **Add New > Project** and import the same repository.
2. Set **Root Directory** to `frontend`.
3. Keep the framework as Next.js. Vercel detects `npm run build` automatically.
4. Add this production environment variable:

```text
NEXT_PUBLIC_API_BASE_URL=https://YOUR-API-DOMAIN.onrender.com/api/v1
```

5. Deploy and copy the resulting Vercel URL.

## 4. Allow the frontend origin

In Render, set the API environment variable below to the exact Vercel origin, with no trailing slash:

```text
CORS_ALLOWED_ORIGIN=https://YOUR-PROJECT.vercel.app
```

Redeploy the API after changing it. For a custom domain, use that custom origin instead.

## 5. Smoke test

Open the deployed frontend and verify registration, login, worker discovery, and one authenticated dashboard request. A direct API check should also work:

```powershell
Invoke-WebRequest https://YOUR-API-DOMAIN.onrender.com/health
```

Do not commit `.env` files or production secrets. The only values that cannot be completed from this workspace are the managed database URL and the hosting account/domain choices.
