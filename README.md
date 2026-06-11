# 🌌 NexusRAG: Enterprise Multi-Agent Knowledge Intelligence Platform

### 🚀 Live Deployments
* **Frontend UI (Vercel):** [https://nexus-rag-dkkz.vercel.app](https://nexus-rag-dkkz.vercel.app)
* **Backend API (Render):** [https://nexusrag-gdd7.onrender.com](https://nexusrag-gdd7.onrender.com)

**NexusRAG is not a chatbot.** 

It is a production-grade **Multi-Agent Knowledge Intelligence Platform** that blends Agentic AI, Advanced RAG pipelines, Knowledge Graphs, AI Observability, and Collaborative Workspace management. Built to bridge the gap between static databases and cognitive reasoning, it gives enterprises a fully transparent, observed, and highly secure window into their knowledge bases.

Inspired by industry leaders like **Perplexity Enterprise**, **Linear**, **Vercel**, and **LangSmith**, NexusRAG features a high-fidelity glassmorphic dashboard, real-time agent tracking, and a physical knowledge graph explorer.

---

## ✨ Features at a Glance

### 1. 📊 AI Operations Command Center (Dashboard)
* **Live Agent Activity Feed:** A real-time terminal tracing multi-agent sub-process operations (planning, filtering, validating).
* **Telemetry Meters:** Monitor RAG Quality Scores, Semantic Cache Hit Rates, Vector Search Health, Token Ratios, and Hallucination Index scores.
* **Latency Trackers:** Track execution times across standard models (GPT-4o, Claude 3.5 Sonnet, Cohere-Embed).

### 2. 🔍 Perplexity-Style Enterprise Search (`/search`)
* **Hybrid Retrieval Shell:** Merges dense vector matches with sparse BM25 keyword rankings.
* **Groundedness Gauges:** Evaluates answers for faithfulness (detects LLM hallucination).
* **Citation Explorer & Chunk Viewer:** Highlights exact source chunks and displays Qdrant payload records.
* **Agent Latency Trace:** LangSmith-style horizontal Gantt charts detailing sub-millisecond execution times per agent.

### 3. 🕸️ Interactive Knowledge Graph Explorer (`/graph`)
* **SVG Force Canvas:** Visualizes connections between uploaded Documents, Semantic Chunks, and Extracted Concept Entities.
* **Physical Node Drag & Pan:** Zoom, pan, and drag nodes to interact with the topology.
* **Metadata Inspector Drawer:** Notion-style slide-over panel displaying degree centrality, PageRank scores, and parent-child relations.

### 4. 📂 Document Intelligence Center (`/documents`)
* **OCR Ingestion Dropzone:** Supports PDF, DOCX, TXT, and MD files.
* **Real-Time Parser Progress:** Stages parsing states from `ingesting` ➡️ `parsing` ➡️ `chunked` ➡️ `vectorized`.
* **JSON Payload Exposer:** Inspects raw payloads formatted for Qdrant database clusters.

### 5. 🛡️ Collaborative Workspaces & Access Control (`/workspaces`)
* **Role-Based Access Control (RBAC):** Manage team roles (Admin, Editor, Viewer).
* **Access Matrix Switcher:** Turn read/write access on or off for individual collections.
* **Secure IP Audit Logs:** Monitor IP addresses, actors, and events for compliance.

### 6. ⚙️ Smart Compliance & Settings (`/settings`)
* **PII Redaction Guardrails:** Automatic scrubbing of Emails, Phone Numbers, SSNs, and private API keys before sending queries to external LLMs.
* **Redis Semantic Cache Policy:** Bypasses expensive LLM invocations by storing similar query matches above set similarity thresholds.

---

## 🛠️ Technology Stack

* **Frontend:** Next.js (React 19), Tailwind CSS / Vanilla CSS, Lucide Icons, glassmorphism backdrop filters.
* **Backend:** FastAPI, Python 3.10+, SQLite/Postgres.
* **Vector Store:** Qdrant Cloud Cluster / Local Memory Fallback.
* **Semantic Caching:** Redis Cache / Local Memory Fallback.

---

## 🚀 Getting Started

### 📦 Prerequisites
* Node.js (v18 or higher)
* Python (v3.10 or higher)

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows
   .\venv\Scripts\activate
   # On macOS/Linux
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI server:
   ```bash
   python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
   ```
   The backend API will be available at [http://127.0.0.1:8000](http://127.0.0.1:8000).

### 2. Frontend Setup
1. In the project root, install packages:
   ```bash
   npm install
   ```
2. Start the Next.js development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 💡 Developer Perspective: Why NexusRAG?
Many RAG applications act like "black boxes" — you input a question and get a text output, but you never know *why* the model responded that way, *where* it pulled the data from, or *how* much it cost.

NexusRAG was built to make retrieval explainable. By displaying intermediate agent planning logs, showing physical chunk nodes in a graph, and outputting execution trace waterfall charts, developers and operators get absolute visibility into the reasoning pipeline. 

---

## 🔒 License
This project is licensed under the MIT License - see the LICENSE file for details.
