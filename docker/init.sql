-- PostgreSQL pgvector eklentisini aktif et
CREATE EXTENSION IF NOT EXISTS vector;

-- Kanıtlar ve Dokümanlar tablosu (Evidence Store with 1536-dim vector for embeddings)
CREATE TABLE IF NOT EXISTS evidence_store (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    url TEXT,
    source TEXT NOT NULL,
    snippet TEXT NOT NULL,
    content TEXT,
    tags TEXT[] DEFAULT '{}',
    embedding vector(1536), -- OpenAI text-embedding-3-small / ada-002 standardı
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Raporlar tablosu
CREATE TABLE IF NOT EXISTS market_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id VARCHAR(255) NOT NULL,
    title TEXT NOT NULL,
    query TEXT NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    perspectives JSONB DEFAULT '{}'::jsonb, -- bull, bear, analyst analizleri
    critique JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Hızlı vektör benzerlik aramaları için HNSW indeksi
CREATE INDEX IF NOT EXISTS evidence_store_embedding_idx 
ON evidence_store 
USING hnsw (embedding vector_cosine_ops);

-- Kullanıcı Profilleri & Telegram Eşleştirme tablosu
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    image TEXT,
    telegram_chat_id BIGINT UNIQUE,
    link_token VARCHAR(64) UNIQUE,
    link_token_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Kullanıcı Favori Varlık / İzleme Listesi (Watchlist)
CREATE TABLE IF NOT EXISTS user_watchlists (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    symbol VARCHAR(32) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_email, symbol)
);

CREATE INDEX IF NOT EXISTS idx_user_watchlists_email ON user_watchlists(user_email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_telegram ON user_profiles(telegram_chat_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_link_token ON user_profiles(link_token);

