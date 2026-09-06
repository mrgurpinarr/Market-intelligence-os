'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { TrackedAsset } from '@/types/market';
import { formatCurrency, formatPercent, cn } from '@/lib/utils';
import { Search, ArrowUpRight, ArrowDownRight, ExternalLink, Star } from 'lucide-react';
import { useSession } from 'next-auth/react';

export function AssetWatchlist({ assets }: { assets: TrackedAsset[] }) {
  const { data: session } = useSession();
  const [search, setSearch] = React.useState('');
  const [filterCategory, setFilterCategory] = React.useState<string>('all');
  const [watchlist, setWatchlist] = React.useState<string[]>([]);
  const [loadingWatchlist, setLoadingWatchlist] = React.useState(false);

  React.useEffect(() => {
    if (session?.user?.email) {
      fetch('/api/user/watchlist')
        .then((res) => res.json())
        .then((data) => {
          if (data.watchlist) setWatchlist(data.watchlist);
        })
        .catch((err) => console.error('Error loading watchlist:', err));
    }
  }, [session]);

  const toggleFavorite = async (e: React.MouseEvent, symbol: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session?.user) {
      alert('Please sign in to save assets to your personal watchlist.');
      return;
    }

    const isFav = watchlist.includes(symbol);
    const updated = isFav ? watchlist.filter((s) => s !== symbol) : [...watchlist, symbol];
    setWatchlist(updated);

    try {
      await fetch('/api/user/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          action: isFav ? 'remove' : 'add',
        }),
      });
    } catch (err) {
      console.error('Failed to update watchlist:', err);
    }
  };

  const filtered = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(search.toLowerCase()) ||
      asset.symbol.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      filterCategory === 'all'
        ? true
        : filterCategory === 'watchlist'
        ? watchlist.includes(asset.symbol)
        : asset.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Card className="border bg-card/60">
      <CardHeader className="p-4 flex-row items-center justify-between space-y-0 border-b">
        <div className="flex items-center gap-3">
          <CardTitle className="text-sm font-semibold tracking-tight">
            Asset Watchlist & Market Screener
          </CardTitle>
          <Badge variant="outline" className="text-[10px] font-mono">
            {filtered.length} Tracked
          </Badge>
          {watchlist.length > 0 && (
            <Badge variant="secondary" className="text-[10px] font-mono flex items-center gap-1 text-amber-400">
              <Star className="h-3 w-3 fill-amber-400" /> {watchlist.length} Saved
            </Badge>
          )}
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2">
          <div className="relative w-44">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter assets..."
              className="h-8 pl-8 text-xs font-mono"
            />
          </div>

          <div className="flex items-center rounded-md bg-secondary/80 p-0.5 text-[11px]">
            {['all', 'watchlist', 'crypto', 'saas', 'equity'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={cn(
                  'px-2.5 py-1 rounded text-xs font-medium capitalize transition-all flex items-center gap-1',
                  filterCategory === cat
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {cat === 'watchlist' && <Star className="h-2.5 w-2.5" />}
                {cat === 'watchlist' ? 'Watchlist' : cat}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-12 text-center">#</TableHead>
              <TableHead>Asset</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">24h Change</TableHead>
              <TableHead className="text-right">7d Change</TableHead>
              <TableHead className="text-right">24h Volume</TableHead>
              <TableHead className="text-right">Market Cap</TableHead>
              <TableHead className="text-center w-24">Category</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((asset) => {
              const isUp24h = asset.change24h >= 0;
              const isUp7d = asset.change7d >= 0;

              return (
                <TableRow
                  key={asset.symbol}
                  className="cursor-pointer group hover:bg-muted/40 transition-colors"
                >
                  <TableCell className="text-center font-mono text-muted-foreground text-xs">
                    <button
                      onClick={(e) => toggleFavorite(e, asset.symbol)}
                      title={watchlist.includes(asset.symbol) ? 'Remove from Watchlist' : 'Add to Watchlist'}
                      className="p-1 rounded hover:bg-muted/80 text-muted-foreground hover:text-amber-400 transition-colors"
                    >
                      <Star
                        className={cn(
                          'h-3.5 w-3.5',
                          watchlist.includes(asset.symbol)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-muted-foreground/40 hover:text-muted-foreground'
                        )}
                      />
                    </button>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/dashboard/assets/${asset.symbol}`}
                      className="flex items-center gap-2 font-medium"
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded bg-secondary font-mono text-[10px] font-bold">
                        {asset.symbol.slice(0, 3)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs leading-none group-hover:text-primary transition-colors">
                          {asset.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {asset.symbol}
                        </span>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium text-xs tabular-nums">
                    {formatCurrency(asset.price, asset.price < 10 ? 4 : 2)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-right font-mono font-medium text-xs tabular-nums',
                      isUp24h ? 'text-emerald-400' : 'text-rose-400'
                    )}
                  >
                    <span className="inline-flex items-center">
                      {isUp24h ? (
                        <ArrowUpRight className="h-3 w-3 mr-0.5 inline" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 mr-0.5 inline" />
                      )}
                      {formatPercent(asset.change24h)}
                    </span>
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-right font-mono font-medium text-xs tabular-nums',
                      isUp7d ? 'text-emerald-400' : 'text-rose-400'
                    )}
                  >
                    {formatPercent(asset.change7d)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground text-xs tabular-nums">
                    {formatCurrency(asset.volume24h, 1)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground text-xs tabular-nums">
                    {formatCurrency(asset.marketCap, 1)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="text-[10px] uppercase font-mono">
                      {asset.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Link
                      href={`/dashboard/assets/${asset.symbol}`}
                      className="text-muted-foreground hover:text-primary transition-colors inline-block"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
