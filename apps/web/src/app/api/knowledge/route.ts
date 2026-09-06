import { NextRequest, NextResponse } from 'next/server';
import { dbPool } from '@market-intel/tools';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tag = searchParams.get('tag') || 'bitcoin';

    const result = await dbPool.query(
      `SELECT 
        id, 
        title, 
        url, 
        source, 
        snippet, 
        content,
        tags, 
        created_at,
        metadata,
        (embedding IS NOT NULL) as has_vector
       FROM evidence_store
       WHERE $1 = ANY(tags)
       ORDER BY created_at DESC
       LIMIT 50;`,
      [tag]
    );

    return NextResponse.json({
      success: true,
      tag,
      totalChunks: result.rowCount,
      chunks: result.rows.map((r) => ({
        id: r.id,
        title: r.title,
        url: r.url,
        source: r.source,
        snippet: r.snippet,
        content: r.content,
        tags: r.tags,
        createdAt: new Date(r.created_at).toISOString().replace('T', ' ').slice(0, 16),
        metadata: r.metadata,
        hasVector: r.has_vector,
      })),
    });
  } catch (error: any) {
    console.error('RAG Knowledge API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
