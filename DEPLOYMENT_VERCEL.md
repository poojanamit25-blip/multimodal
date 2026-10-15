# ▲ Deploying KODEXIS to Vercel

This guide explains how to deploy the **KODEXIS Frontend** to **[Vercel](https://vercel.com/)** and link it to your backend.

---

## 🏗️ Architecture Overview

- **Frontend (React 19 + Vite)**: Deployed to **Vercel** for edge caching, instant global CDN delivery, automatic SSL, and seamless continuous deployment on every Git push.
- **Backend (Spring Boot 3.3.2, Java 21)**: Vercel specializes in frontend frameworks and serverless functions (Node.js/Python/Go) and does not host long-running Java/JVM processes. The backend runs as a Docker Web Service on **Render** (or Railway/AWS) and communicates with the Vercel frontend via REST APIs and CORS.

```
┌──────────────────────────────────────┐        REST API Calls         ┌──────────────────────────────────────┐
│           Vercel Frontend            │  ──────────────────────────>  │            Render Backend            │
│  https://kodexis.vercel.app          │  <──────────────────────────  │  https://kodexis-backend.onrender.com│
│  (React 19 + Vite + TailwindCSS SPA) │     CORS Allowed (*.vercel)   │  (Spring Boot 3.3.2 Docker Service)  │
└──────────────────────────────────────┘                               └──────────────────────────────────────┘
```

---

## ⚡ Method 1: Deploy via Vercel Web Dashboard (Recommended)

### Step 1: Push Your Code to GitHub
Ensure all recent changes (including `vercel.json` and the new Study Calendar) are committed:
```bash
git add .
git commit -m "feat: configure vercel deployment and study calendar"
git push origin main
```

### Step 2: Import into Vercel
1. Open [vercel.com/new](https://vercel.com/new).
2. Connect your GitHub account and locate your repository (`HR-AI`).
3. Click **Import**.

### Step 3: Configure Project Settings
Vercel automatically detects the Vite configuration:
- **Project Name**: `kodexis` (or your preferred name)
- **Framework Preset**: `Vite`
- **Root Directory**: `./` (leave default)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Step 4: Add Environment Variables
Expand **Environment Variables** and add:
| Key | Value | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://kodexis-backend.onrender.com` | Your deployed backend URL on Render |

### Step 5: Click Deploy
Click **Deploy**. In ~30–45 seconds, your application will be live at a URL like:
`https://kodexis.vercel.app` (or `https://kodexis-<username>.vercel.app`).

---

## 💻 Method 2: Deploy via Vercel CLI (Terminal)

The Vercel CLI is already available on your machine:

1. **Log in to Vercel**:
   ```bash
   npx vercel login
   ```
   Follow the prompt to authenticate with your GitHub, GitLab, or email account.

2. **Deploy Preview**:
   ```bash
   npx vercel
   ```
   - Confirm project settings (Accept defaults: Framework = Vite, Output Directory = `dist`).

3. **Set the Backend API Environment Variable**:
   ```bash
   npx vercel env add VITE_API_URL production
   # When prompted for value, enter: https://kodexis-backend.onrender.com
   ```

4. **Deploy to Production**:
   ```bash
   npx vercel --prod
   ```
   Your live production URL will be printed in the terminal.

---

## ⚙️ Configuration Files Added to the Project

1. **[`vercel.json`](./vercel.json)**:
   - Configures the Vite build preset and output directory (`dist`).
   - Includes Single Page Application (SPA) rewrites:
     ```json
     {
       "source": "/(.*)",
       "destination": "/index.html"
     }
     ```
     This prevents 404 errors when users refresh or directly load routes like `/calendar`, `/dashboard`, or `/interview/1`.
   - Sets HTTP security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection`).

2. **[`backend/src/main/java/com/kodexis/core/security/SecurityConfig.java`](./backend/src/main/java/com/kodexis/core/security/SecurityConfig.java)**:
   - Configured `allowedOriginPatterns` to explicitly allow `https://*.vercel.app` and `https://*.onrender.com` so requests from your Vercel frontend are never blocked by CORS.

3. **[`src/lib/api.ts`](./src/lib/api.ts)**:
   - Automatically detects `import.meta.env.VITE_API_URL` set in Vercel to route all API calls to your live backend server.

---

## 🔍 Verification

Once your Vercel deployment completes:
1. Open the URL provided by Vercel (e.g. `https://kodexis.vercel.app`).
2. Log in or use the built-in offline session mode.
3. Navigate to **Study Calendar** (`/calendar`).
4. Click on any date on the calendar, schedule a study session or mock interview, mark it as completed, and verify it updates instantly.
