import fs from 'fs';
import path from 'path';
import { chunkText, createDeterministicEmbedding } from './embeddings.js';
import { EvidenceStoreRepository } from './evidenceStore.js';
import { dbPool, initDb } from './db.js';

export async function ingestKnowledgeFolder(folderPath: string, defaultTag = 'knowledge'): Promise<number> {
  await initDb();

  if (!fs.existsSync(folderPath)) {
    console.warn(`Folder not found: ${folderPath}`);
    return 0;
  }

  const files = fs.readdirSync(folderPath).filter((f) => f.endsWith('.md') || f.endsWith('.txt'));
  let totalChunksIngested = 0;

  for (const file of files) {
    const fullPath = path.join(folderPath, file);
    const content = fs.readFileSync(fullPath, 'utf-8');
    const title = file.replace(/\.(md|txt)$/, '').replace(/_/g, ' ').toUpperCase();

    const chunks = chunkText(content, 600, 100);

    for (const chunk of chunks) {
      const embedding = createDeterministicEmbedding(chunk.text, 1536);

      await EvidenceStoreRepository.insert({
        title: `${title} (Part ${chunk.index + 1})`,
        url: `local://knowledge/${path.basename(folderPath)}/${file}`,
        source: `Internal Knowledge Base: ${path.basename(folderPath)}`,
        snippet: chunk.text.slice(0, 300) + '...',
        content: chunk.text,
        tags: [defaultTag, path.basename(folderPath), 'rag'],
        embedding,
        metadata: {
          file,
          chunkIndex: chunk.index,
        },
      });

      totalChunksIngested++;
    }
  }

  return totalChunksIngested;
}

// CLI runner if executed directly
if (process.argv[1]?.endsWith('knowledgeIngest.ts') || process.argv[1]?.endsWith('knowledgeIngest.js')) {
  const targetDir = process.argv[2] || path.resolve(process.cwd(), 'knowledge/bitcoin');
  console.log(`📥 Ingesting RAG knowledge from: ${targetDir}...`);
  ingestKnowledgeFolder(targetDir, 'bitcoin')
    .then((count) => {
      console.log(`✅ Successfully vectorized and stored ${count} chunks into PostgreSQL + pgvector.`);
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Ingestion failed:', err);
      process.exit(1);
    });
}
