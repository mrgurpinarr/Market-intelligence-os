'use client';

import * as React from 'react';
import { Header } from '@/components/dashboard/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Database,
  FileCode,
  Layers,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Search,
  CheckCircle2,
  Cpu,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface KnowledgeChunk {
  id: string;
  title: string;
  url: string;
  source: string;
  snippet: string;
  content: string;
  tags: string[];
  createdAt: string;
  metadata?: any;
  hasVector: boolean;
}

export default function KnowledgeBaseViewerPage() {
  const [chunks, setChunks] = React.useState<KnowledgeChunk[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedTag, setSelectedTag] = React.useState('bitcoin');
  const [search, setSearch] = React.useState('');
  const [activeChunk, setActiveChunk] = React.useState<KnowledgeChunk | null>(null);

  const fetchChunks = React.useCallback(async (tag: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/knowledge?tag=${tag}`);
      const data = await res.json();
      if (data.success && data.chunks) {
        setChunks(data.chunks);
      }
    } catch (err) {
      console.error('Failed to load RAG chunks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchChunks(selectedTag);
  }, [fetchChunks, selectedTag]);

  const filteredChunks = chunks.filter((c) => {
    return (
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.snippet.toLowerCase().includes(search.toLowerCase()) ||
      c.source.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Header Title & Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Database className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold tracking-tight">RAG Knowledge Vector Vault</h1>
              <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                1536-dim HNSW Cosine Index
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Direct UI explorer for partitioned, vectorized markdown knowledge chunks (`knowledge/bitcoin`) stored in PostgreSQL `pgvector`.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => fetchChunks(selectedTag)}
              className="text-xs h-8 gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Re-sync
            </Button>
          </div>
        </div>

        {/* Filter controls & Categories */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-secondary/60 p-1 rounded-lg border text-xs">
            {['bitcoin', 'live_web', 'macro', 'defi'].map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={cn(
                  'px-3 py-1.5 rounded-md font-medium capitalize transition-all',
                  selectedTag === tag
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tag === 'bitcoin' ? '🪙 Bitcoin RAG' : tag}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search in chunks & embeddings..."
              className="h-8 w-full rounded-md border border-input bg-card/60 pl-8 pr-3 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        {/* Chunks Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : filteredChunks.length === 0 ? (
          <Card className="border bg-card/60 p-12 text-center space-y-3">
            <Layers className="h-8 w-8 text-muted-foreground mx-auto" />
            <h3 className="text-sm font-semibold">No Vectorized Chunks Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No chunks currently tagged with &quot;{selectedTag}&quot; in pgvector.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredChunks.map((chunk, idx) => (
              <Card
                key={chunk.id}
                onClick={() => setActiveChunk(chunk)}
                className="border bg-card/60 hover:border-primary/50 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <CardHeader className="p-4 pb-2 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" /> Vector Ready
                    </span>
                    <span>Chunk #{idx + 1}</span>
                  </div>

                  <CardTitle className="text-xs font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {chunk.title}
                  </CardTitle>

                  <CardDescription className="text-[11px] font-mono text-muted-foreground line-clamp-1">
                    Source: {chunk.source}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-4 pt-0 space-y-3">
                  <div className="p-2.5 rounded bg-secondary/40 border text-[11px] text-foreground/80 font-mono leading-relaxed line-clamp-4">
                    &ldquo;{chunk.snippet}&rdquo;
                  </div>

                  <div className="flex flex-wrap items-center gap-1 pt-1">
                    {chunk.tags.map((t) => (
                      <Badge key={t} variant="outline" className="text-[9px] py-0 px-1 font-mono uppercase">
                        {t}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[10px] text-muted-foreground font-mono">
                    <span>{chunk.createdAt}</span>
                    <span className="text-primary group-hover:underline flex items-center gap-1">
                      Inspect Chunk <ExternalLink className="h-2.5 w-2.5" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Detailed Chunk Inspection Dialog */}
        <Dialog open={!!activeChunk} onOpenChange={(open) => !open && setActiveChunk(null)}>
          {activeChunk && (
            <DialogContent className="max-w-2xl" onClose={() => setActiveChunk(null)}>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="success" className="text-[10px] font-mono">
                    PGVECTOR CHUNK
                  </Badge>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    UUID: {activeChunk.id}
                  </span>
                </div>
                <DialogTitle className="text-base">{activeChunk.title}</DialogTitle>
                <DialogDescription className="font-mono text-xs">
                  Source: {activeChunk.source} | Path: {activeChunk.url}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
                    Full Chunk Text Content:
                  </span>
                  <div className="p-4 rounded-lg bg-background border text-xs text-foreground/90 font-mono whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                    {activeChunk.content || activeChunk.snippet}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-secondary/40 border space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Vector Dimension:</span>
                    <span className="text-primary font-bold">1536 Float Array (Cosine HNSW)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Vector Distance Metric:</span>
                    <span className="text-foreground">Cosine Similarity (&lt;=&gt;)</span>
                  </div>
                </div>
              </div>
            </DialogContent>
          )}
        </Dialog>
      </main>
    </div>
  );
}
