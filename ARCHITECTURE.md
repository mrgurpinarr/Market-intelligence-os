# 🌐 Market Intelligence OS — Architecture & System Design Document

**Market Intelligence OS** is an autonomous, multi-agent crypto & financial market research, live asset screening, and executive intelligence reporting platform.

---

## 🏛️ 1. High-Level Architecture

```mermaid
flowchart TB
    subgraph Client Layer
        Web["Web Terminal (Next.js 14 App Router)"]
        TG["Telegram Client (@Marketrapor_bot)"]
    end

    subgraph Authentication & Gateway
        NextAuth["NextAuth.js (Google OAuth)"]
        SSE["SSE Live Streaming Endpoint (/api/research)"]
        CMC_Proxy["CMC Pro Data Gateway (/api/market)"]
        UserAPI["User Watchlist & Sync API (/api/user/*)"]
    end

    subgraph Multi-Agent Orchestration Layer
        Orchestrator["MarketIntelOrchestrator"]
        Analyst["Senior Market Analyst Agent"]
        Bull["Bull Case Growth Specialist"]
        Bear["Bear Case Risk Specialist"]
        Critic["Chief Critic Audit Agent"]
        Writer["Executive Report Writer Agent"]
    end

    subgraph Data & Tool Services
        WebScraper["Real-time Web Search & Scraper (Cheerio/DDG)"]
        CMC["CoinMarketCap Pro API v1"]
        Embedder["Deterministic 1536-dim Embedding Generator"]
        AnomalyEngine["Market Anomaly & Volatility Scanner (2-min Cron)"]
    end

    subgraph Storage & Persistence
        PG[("PostgreSQL 16 + pgvector 0.8.6")]
        EvidenceStore["evidence_store (Vector Cosine HNSW)"]
        Reports["market_reports (JSONB + Perspectives)"]
        Users["user_profiles (Telegram Linking)"]
        Watchlists["user_watchlists (Favorited Assets)"]
    end

    Web --> NextAuth
    Web --> SSE
    Web --> CMC_Proxy
    Web --> UserAPI

    TG --> AnomalyEngine
    TG --> Orchestrator

    SSE --> Orchestrator
    CMC_Proxy --> CMC

    Orchestrator --> Analyst
    Analyst --> WebScraper
    Analyst --> Embedder --> EvidenceStore

    Analyst --> Bull
    Analyst --> Bear
    Bull --> Critic
    Bear --> Critic
    Critic --> Writer
    Writer --> Reports

    AnomalyEngine --> CMC
    AnomalyEngine --> Users
    AnomalyEngine --> TG
```

---

## 🧩 2. Multi-Agent Pipeline Flow

The research pipeline executes in a multi-stage ReAct loop with audit synthesis:

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Web / Telegram
    participant O as Orchestrator
    participant A as Senior Analyst
    participant E as Vector Evidence Store
    participant B as Bull & Bear Specialists
    participant C as Chief Critic
    participant W as Report Writer

    User->>O: Initiate Research ("Bitcoin Spot ETF Inflows 2026")
    O->>A: Step 1: Landscape Discovery & Scrape
    A->>E: Store vectorized web citations (1536-dim)
    A-->>O: Structural Market Briefing

    par Parallel Dialectical Analysis
        O->>B: Step 2a: Bull Case Growth & Upside Analysis
        O->>B: Step 2b: Bear Case Downside & Macro Risk Analysis
    end
    B-->>O: Bull & Bear Reports

    O->>C: Step 3: Chief Critic Fact-Check & Hallucination Audit
    C-->>O: Audited Synthesis & Confidence Score (e.g. 94%)

    O->>W: Step 4: Executive Report Writer
    W->>E: Persist Final Report in PostgreSQL
    W-->>User: Streamed Markdown + Interactive Citation Viewer + PDF Export
```

---

## 🗄️ 3. Database Schema (`PostgreSQL + pgvector`)

### 1. `evidence_store`
Stores vectorized evidence chunks, citations, and source snippets.
- `id` (UUID, Primary Key)
- `title` (TEXT)
- `url` (TEXT)
- `source` (TEXT)
- `snippet` (TEXT)
- `content` (TEXT)
- `tags` (TEXT[])
- `embedding` (`vector(1536)` indexed via HNSW cosine distance `<=>`)
- `created_at` (TIMESTAMP)

### 2. `market_reports`
Stores validated institutional reports with audit trails.
- `id` (UUID, Primary Key)
- `task_id` (VARCHAR)
- `title` (TEXT)
- `query` (TEXT)
- `summary` (TEXT)
- `content` (TEXT)
- `perspectives` (`JSONB` — Analyst, Bull, Bear)
- `critique` (`JSONB` — Critic Audit & Verification Score)
- `created_at` (TIMESTAMP)

### 3. `user_profiles`
Stores user settings and Telegram chat links.
- `id` (SERIAL, Primary Key)
- `email` (VARCHAR, Unique)
- `name` (VARCHAR)
- `image` (TEXT)
- `telegram_chat_id` (BIGINT, Unique)
- `link_token` (VARCHAR(64), Unique)
- `link_token_expires_at` (TIMESTAMP)

### 4. `user_watchlists`
Stores user-pinned asset trackers.
- `id` (SERIAL, Primary Key)
- `user_email` (VARCHAR)
- `symbol` (VARCHAR)
- `created_at` (TIMESTAMP)
- Unique constraint on `(user_email, symbol)`

---

## 📦 4. Monorepo Structure

```
market-intelligence/
├── apps/
│   ├── web/                     # Next.js 14 App Router Terminal UI
│   │   ├── src/app/             # Dashboard, Asset details, Research viewer, Auth
│   │   ├── src/components/      # TradingView Candlesticks, Watchlist, Modals
│   │   └── src/lib/             # CMC Gateway, PDF Export, User & Auth Services
│   │
│   └── telegram-bot/            # Grammy Bot Daemon (@Marketrapor_bot)
│       └── src/
│           ├── index.ts         # /report, /status, /link commands & Cron
│           └── alertEngine.ts   # 2-min CMC Anomaly Scanner & Push Dispatcher
│
├── packages/
│   ├── core/                    # LLM abstractions, ReAct BaseAgent, Tools
│   ├── agents/                  # Multi-Agent Personas & Orchestrator
│   └── tools/                   # pgvector DB Pool, Evidence Store, Scraper
│
├── docker/
│   └── init.sql                 # Vector extensions, schemas, & HNSW indexes
├── docker-compose.yml           # Local PostgreSQL 16 + pgvector container
└── ARCHITECTURE.md              # System Architecture & Technical Specifications
```

---

## ⚡ 5. Key Features

1. **Autonomous Multi-Agent Workflow:** 5 specialized agents working sequentially and in parallel to eliminate single-LLM bias and hallucination.
2. **Real-time Financial Data Feed:** Direct integration with CoinMarketCap Pro API for global macro stats and live top 50 screener.
3. **Interactive High-Density Terminal:** TradingView Lightweight Charts (v5 OHLCV + Volume), Recharts Multi-Asset Matrix, and live SSE research progress stepper.
4. **Corporate PDF Export:** Single-click branded PDF export with A4 pagination.
5. **Real-Time Market Anomaly Engine:** Background cron that detects 3%+ hourly surges and pushes instant Telegram alerts to linked users.
6. **Cross-Platform Account Sync:** One-time verification token linking web accounts with Telegram chat IDs.
