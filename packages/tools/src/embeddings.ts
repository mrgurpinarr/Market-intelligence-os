import crypto from 'crypto';

export interface TextChunk {
  id: string;
  text: string;
  index: number;
}

/**
 * Metinleri örtüşmeli (overlapping) parçalara böler (Chunking)
 */
export function chunkText(text: string, chunkSize = 800, chunkOverlap = 150): TextChunk[] {
  const chunks: TextChunk[] = [];
  if (!text || text.trim().length === 0) return chunks;

  let start = 0;
  let index = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunkText = text.substring(start, end).trim();

    if (chunkText.length > 0) {
      const id = crypto.createHash('md5').update(`${index}-${chunkText}`).digest('hex');
      chunks.push({
        id,
        text: chunkText,
        index,
      });
      index++;
    }

    if (end === text.length) break;
    start += chunkSize - chunkOverlap;
  }

  return chunks;
}

/**
 * Deterministic / Mock Embedding (veya OpenAI compatible embedding)
 * pgvector (1536 dim) için standart uyumlu vektör üretici
 */
export function createDeterministicEmbedding(text: string, dimensions = 1536): number[] {
  const vector: number[] = new Array(dimensions).fill(0);
  const hash = crypto.createHash('sha256').update(text).digest();

  for (let i = 0; i < dimensions; i++) {
    const byte = hash[i % hash.length];
    // -1 ile +1 arasında normalize değer
    vector[i] = (byte / 127.5) - 1.0;
  }

  // L2 Norm normalize
  const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map((val) => (norm > 0 ? val / norm : 0));
}
