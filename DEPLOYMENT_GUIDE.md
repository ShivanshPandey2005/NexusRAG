# 🚀 NexusRAG: Complete Step-by-Step Cloud Deployment Guide

This guide details how to deploy the **NexusRAG** frontend and backend entirely on free cloud tiers.

```mermaid
graph TD
    User([Browser Client]) -->|Requests App| Vercel[Vercel Frontend - Next.js]
    Vercel -->|API Queries| Render[Render Backend - FastAPI]
    Render -->|Semantic Search| Qdrant[Qdrant Cloud - Vector DB]
    Render -->|Cache / Rate Limit| Upstash[Upstash Redis - Cache]
    Render -->|Audit Logs / Memory| Neon[Neon Postgres - Database]
```

---

## 📋 Prerequisites
Make sure you have accounts on the following platforms (all have generous free tiers):
1. **GitHub** (already connected to `ShivanshPandey2005/NexusRAG`)
2. **Qdrant Cloud** (for Vector Embeddings)
3. **Upstash** (for Serverless Redis Cache)
4. **Neon.tech** (for Serverless Postgres SQL DB)
5. **Render** (for FastAPI Backend)
6. **Vercel** (for Next.js Frontend)

---

## 🗄️ Step 1: Set Up Cloud Databases

### 1. Vector Database: **Qdrant Cloud**
1. Sign in to [Qdrant Cloud Console](https://cloud.qdrant.io/).
2. Click **Create Cluster**. Select **Free Tier** (GCP or AWS, any region close to India/Singapore).
3. Once the cluster is active, copy the **Cluster URL** (looks like `https://xxxxxx.gcp.qdrant.tech:6333` or similar).
4. Go to **API Keys** in the sidebar, generate a new API key, and copy the **API Key Token**.

### 2. Cache & Rate Limiter: **Upstash Redis**
1. Sign in to [Upstash Console](https://console.upstash.com/).
2. Click **Create Database**.
3. Choose a Database Name (e.g., `nexusrag-cache`), select **Redis**, and pick a region.
4. Under the database details page, scroll down to the **Connection Details** section.
5. Copy the **Redis URL** (looks like `redis://default:password@xxxx.upstash.io:6379` or `rediss://...`).

### 3. Audit Logs & Memory: **Neon Postgres**
1. Sign in to [Neon Console](https://neon.tech/).
2. Click **Create Project**. Name it `nexusrag-db` and select Postgres version 16.
3. Once created, copy the **Postgres Connection String** from the dashboard dashboard (make sure the dropdown is set to `Connection String`).
4. The string will look like: `postgresql://neondb_owner:password@ep-xxxx.aws.neon.tech/neondb?sslmode=require`.

---

## 🐍 Step 2: Deploy Backend on Render

Render will build and deploy the FastAPI backend using the pre-configured `backend/Dockerfile` in the repository.

1. Sign in to [Render Console](https://dashboard.render.com/).
2. Click **New +** -> **Web Service**.
3. Select **Build and deploy from a Git repository** and connect your GitHub repository `ShivanshPandey2005/NexusRAG`.
4. Configure the Web Service:
   * **Name:** `nexusrag-backend`
   * **Region:** Select a region close to your users (e.g., Singapore).
   * **Branch:** `main`
   * **Root Directory:** `backend` (This is critical! Set it to `backend` so Render builds from inside the backend folder).
   * **Runtime:** `Docker` (Render will automatically find the `Dockerfile` inside the `backend` folder).
5. Scroll down to **Environment Variables** (Advanced section) and click **Add Environment Variable** for each of these:

| Key | Value | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://...` | Paste your Neon Postgres Connection String |
| `REDIS_URL` | `redis://...` | Paste your Upstash Redis Connection URL |
| `QDRANT_HOST` | `https://xxxx.tech` | Paste your Qdrant Cluster URL (without the port `:6333` or path if clean, or paste the whole domain) |
| `QDRANT_PORT` | `6333` or `443` | Set to `443` for Qdrant Cloud clusters using HTTPS |
| `QDRANT_API_KEY` | `your-key` | Paste your Qdrant API Key |
| `OPENAI_API_KEY`| `sk-proj-...` | Your OpenAI API Key (needed for live RAG embeddings) |
| `COHERE_API_KEY`| `your-key` | (Optional) Your Cohere API Key for reranking |
| `PYTHONUNBUFFERED`| `1` | Ensures python logs print immediately |

6. Click **Create Web Service**.
7. Render will begin building the Docker container and launching FastAPI. Once complete, it will show a green **Live** badge. Copy the Render Web Service URL at the top left (looks like `https://nexusrag-backend.onrender.com`).

---

## ⚛️ Step 3: Deploy Frontend on Vercel

Vercel will compile the Next.js frontend and host it on a global CDN.

1. Sign in to [Vercel](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Select your GitHub repository `ShivanshPandey2005/NexusRAG`.
4. Configure Project settings:
   * **Framework Preset:** `Next.js`
   * **Root Directory:** Keep as `./` (the default, since Next.js is in the root directory).
5. Open the **Environment Variables** section and add:
   * **Key:** `NEXT_PUBLIC_API_URL`
   * **Value:** Paste your Render Backend URL (e.g., `https://nexusrag-backend.onrender.com`) (Make sure there is no trailing slash `/` at the end).
6. Click **Deploy**.
7. Vercel will build, optimize, and launch your Next.js application in about 1-2 minutes. Once finished, you will receive a production deployment domain (e.g., `https://nexusrag-one.vercel.app`).

---

## 🎯 Step 4: Verify Your Deployment

Once both are live:
1. Open your Vercel URL in the browser.
2. Navigate to `/dashboard` to verify that telemetry widgets load without errors (this confirms the frontend is talking to the backend).
3. Try uploading a small PDF in the **Document Center** (`/documents`). The status should transition from `ingesting` ➡️ `parsing` ➡️ `vectorized`, confirming Qdrant connection works.
4. Run a test query in the **Search & Ask** console (`/search`) to test the complete end-to-end multi-agent loop.
