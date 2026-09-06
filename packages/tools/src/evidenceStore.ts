import { dbPool, initDb } from './db.js';
import pgvector from 'pgvector/pg';
import type { EvidenceItem } from '@market-intel/core';

export interface InsertEvidenceParams {
  title: string;
  url?: string;
  source: string;
  snippet: string;
  content?: string;
  tags?: string[];
  embedding?: number[];
  metadata?: Record<string, unknown>;
}

export class EvidenceStoreRepository {
  static async insert(item: InsertEvidenceParams): Promise<string> {
    await initDb();
    const query = `
      INSERT INTO evidence_store (title, url, source, snippet, content, tags, embedding, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id;
    `;
    const values = [
      item.title,
      item.url || null,
      item.source,
      item.snippet,
      item.content || null,
      item.tags || [],
      item.embedding ? pgvector.toSql(item.embedding) : null,
      JSON.stringify(item.metadata || {})
    ];

    const res = await dbPool.query(query, values);
    return res.rows[0].id;
  }

  /**
   * Vektör Benzerlik Araması (Cosine Distance via pgvector)
   */
  static async searchSimilar(embedding: number[], limit = 5, minSimilarity = 0.5): Promise<EvidenceItem[]> {
    await initDb();
    const query = `
      SELECT 
        id, 
        title, 
        url, 
        source, 
        snippet, 
        created_at as timestamp, 
        tags,
        1 - (embedding <=> $1) as similarity
      FROM evidence_store
      WHERE embedding IS NOT NULL AND 1 - (embedding <=> $1) >= $2
      ORDER BY similarity DESC
      LIMIT $3;
    `;

    const res = await dbPool.query(query, [pgvector.toSql(embedding), minSimilarity, limit]);
    return res.rows.map(row => ({
      id: row.id,
      title: row.title,
      url: row.url,
      source: row.source,
      snippet: row.snippet,
      timestamp: row.timestamp.toISOString(),
      tags: row.tags,
      relevanceScore: parseFloat(row.similarity)
    }));
  }
}
