# 🚀 KODEXIS - Render Deployment Guide

This guide details how to deploy both the **Spring Boot Java Backend** and **React + Vite Frontend** to **[Render](https://render.com/)**.

---

## 🏗️ Architecture Overview

| Service | Technology | Render Service Type | Port / Build |
| :--- | :--- | :--- | :--- |
| **Backend** | Spring Boot 3.3.2, Java 21, Maven | **Web Service (Docker)** | `PORT: 8080` (overridden dynamically by Render) |
| **Frontend** | React 19, Vite, TailwindCSS | **Static Site** | Build: `npm run build` → Publish: `dist` |

---

## ⚡ Option 1: Automatic 1-Click Blueprint Deployment (Recommended)

The repository includes a ready-to-use [`render.yaml`](./render.yaml) blueprint that configures both services, connects them with environment variables, and configures single-page application (SPA) rewrites automatically.

### Steps:
1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "feat: add study calendar and render deployment configs"
   git push origin main
   ```

2. **Open Render Dashboard**:
   - Go to [dashboard.render.com](https://dashboard.render.com/).
   - Click **New +** in the top right corner and select **Blueprint**.

3. **Connect Repository**:
   - Select your GitHub repository (`HR-AI` or your fork).
   - Render will detect [`render.yaml`](./render.yaml).

4. **Review & Apply**:
   - Render displays the two services:
     - `kodexis-backend` (Docker Web Service)
     - `kodexis-frontend` (Static Site with SPA rewrites and automatic backend URL binding)
   - Click **Apply**.
   - Render will build and deploy both services!

---

## 🛠️ Option 2: Manual Deployment via Render Dashboard

If you prefer to configure each service manually in the Render UI:

### Step 1: Deploy the Backend (Spring Boot Web Service)

1. In Render Dashboard, click **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Configure the service settings:
   - **Name**: `kodexis-backend`
   - **Region**: Choose closest (e.g., `Oregon (US West)` or `Frankfurt (EU Central)`)
   - **Branch**: `main`
   - **Root Directory**: `backend` (or leave empty if using root `Dockerfile`)
   - **Runtime**: `Docker`
   - **Dockerfile Path**: `./backend/Dockerfile`
   - **Docker Build Context**: `./backend`
   - **Instance Type**: `Free`
4. **Environment Variables**:
   Click **Add Environment Variable**:
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `PORT` | `8080` | Required port (Render injects this dynamically) |
   | `SPRING_PROFILES_ACTIVE` | `prod` | Production Spring profile |
   | `MISTRAL_API_KEY` | *(Optional)* | Your Mistral AI API key (if using AI features) |
   | `SPRING_DATASOURCE_URL` | *(Optional)* | Set if connecting a Render PostgreSQL DB |
5. **Health Check Path**:
   - Set to: `/api/learning/knowledge/topics`
6. Click **Create Web Service**.
7. Once deployed, **copy your backend URL** (e.g. `https://kodexis-backend.onrender.com`).

---

### Step 2: Deploy the Frontend (Vite Static Site)

1. In Render Dashboard, click **New +** → **Static Site**.
2. Connect the same GitHub repository.
3. Configure the static site settings:
   - **Name**: `kodexis-frontend`
   - **Branch**: `main`
   - **Root Directory**: Leave blank (root directory `./`)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. **Environment Variables**:
   Click **Add Environment Variable**:
   | Key | Value |
   | :--- | :--- |
   | `VITE_API_URL` | `https://kodexis-backend.onrender.com` *(paste your backend URL from Step 1)* |
5. **Single-Page Application (SPA) Routing Rewrite**:
   *(Crucial for React Router paths like `/calendar`, `/dashboard`, `/interview/1` so page refreshes don't 404)*:
   - Go to **Redirects/Rewrites** in the left sidebar menu of the frontend service.
   - Click **Add Rule**:
     - **Type**: `Rewrite`
     - **Source**: `/*`
     - **Destination**: `/index.html`
   - Click **Save Changes**.
6. Click **Create Static Site** (or **Manual Deploy** → **Deploy latest commit**).

---

## 🔍 Verification & Health Checks

Once both services show **Live**:

1. **Verify Backend API**:
   - Open: `https://<your-backend-name>.onrender.com/api/learning/knowledge/topics`
   - You should receive HTTP 200 with JSON topic entities.

2. **Verify Calendar API**:
   - Open: `https://<your-backend-name>.onrender.com/api/learning/calendar/events`
   - You should receive HTTP 200 with the seeded schedule events.

3. **Verify Frontend**:
   - Open: `https://<your-frontend-name>.onrender.com`
   - Log in or test demo mode.
   - Navigate to **Study Calendar** (`/calendar`).
   - Click any date on the calendar, schedule an event, mark as completed, and test editing/deleting.

---

## 💡 Troubleshooting & Notes

- **Render Free Tier Spin-Down**:
  On Render's free tier, backend services spin down after 15 minutes of inactivity. The first request after sleep may take ~30–50 seconds to wake up. The frontend contains built-in resilient offline/demo fallback caching so the UI remains responsive.
- **Cross-Origin Resource Sharing (CORS)**:
  `SecurityConfig.java` has been configured with `allowedOriginPatterns` to permit `https://*.onrender.com` and `http://localhost:*` automatically.
- **Database Persistence**:
  By default, the backend runs an H2 database stored at `./data/kodexisdb`. For permanent production persistence across Docker rebuilds, you can create a free **Render PostgreSQL** database under **New +** → **PostgreSQL** and set `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, and `SPRING_DATASOURCE_PASSWORD` in your backend environment variables.
