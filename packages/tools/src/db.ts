import pg from 'pg';
import pgvector from 'pgvector/pg';

const { Pool } = pg;

export const dbPool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgrespassword@localhost:5432/market_intelligence',
  max: 10,
  idleTimeoutMillis: 30000,
});

// pgvector tip desteğini kaydet
export async function initDb() {
  const client = await dbPool.connect();
  try {
    await pgvector.registerTypes(client);
  } finally {
    client.release();
  }
}
