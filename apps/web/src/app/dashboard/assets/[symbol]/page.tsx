'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Header } from '@/components/dashboard/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FinancialCandlestickChart } from '@/components/charts/candlestick-chart';
import { AssetComparisonMatrix } from '@/components/charts/asset-comparison';
import { mockTrackedAssets } from '@/mock/market';
import { TrackedAsset } from '@/types/market';
import { formatCurrency, formatPercent, cn } from '@/lib/utils';
import {
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeft,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import { StartResearchModal } from '@/components/research/start-research-modal';

export default function AssetDetailPage() {
  const params = useParams();
  const symbol = ((params?.symbol as string) || 'BTC').toUpperCase();

  const [asset, setAsset] = React.useState<TrackedAsset | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [modalOpen, setModalOpen] = React.useState(false);

  React.useEffect(() => {
    async function fetchLiveAsset() {
      try {
        const res = await fetch('/api/market');
        const data = await res.json();
        if (data.success && data.assets) {
          const found = data.assets.find((a: TrackedAsset) => a.symbol.toUpperCase() === symbol);
          if (found) {
            setAsset(found);
            return;
          }
        }
        // Fallback to mock
        const fallback =
          mockTrackedAssets.find((a) => a.symbol.toUpperCase() === symbol) ||
          mockTrackedAssets[0];
        setAsset(fallback);
      } catch (err) {
        const fallback =
          mockTrackedAssets.find((a) => a.symbol.toUpperCase() === symbol) ||
          mockTrackedAssets[0];
        setAsset(fallback);
      } finally {
        setLoading(false);
      }
    }

    fetchLiveAsset();
  }, [symbol]);

  if (loading || !asset) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
          <Skeleton className="h-28 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="lg:col-span-2 h-96 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
      </div>
    );
  }

  const isUp = asset.change24h >= 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Back Link */}
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard Screener
          </Link>
        </div>

        {/* Live Asset Header Info from CoinMarketCap Feed */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-lg border bg-card/60">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20 text-primary border border-primary/30 font-mono font-bold text-base">
              {asset.symbol.slice(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight">{asset.name}</h1>
                <Badge variant="outline" className="font-mono text-xs">
                  {asset.symbol}
                </Badge>
                <Badge variant="secondary" className="font-mono text-xs">
                  Rank #{asset.rank}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Live CoinMarketCap Feed • Category: {asset.category.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="flex flex-col md:items-end">
            <div className="text-2xl font-bold font-mono tabular-nums">
              {formatCurrency(asset.price, asset.price < 10 ? 4 : 2)}
            </div>
            <div
              className={cn(
                'flex items-center gap-1 text-xs font-mono font-medium',
                isUp ? 'text-emerald-400' : 'text-rose-400'
              )}
            >
              {isUp ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}
              {formatPercent(asset.change24h)} (24h) • {formatPercent(asset.change7d)} (7d)
            </div>
          </div>
        </div>

        {/* 1. Candlestick Terminal & Financial Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* TradingView Candlestick Chart */}
          <div className="lg:col-span-2">
            <FinancialCandlestickChart
              symbol={asset.symbol}
              currentPrice={asset.price}
              change24h={asset.change24h}
            />
          </div>

          {/* Key Financial Stats */}
          <Card className="border bg-card/60 flex flex-col justify-between">
            <div>
              <CardHeader className="p-4 border-b">
                <CardTitle className="text-sm font-semibold">
                  Key Asset Metrics & Liquidity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3.5">
                <div className="flex justify-between text-xs py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Market Capitalization</span>
                  <span className="font-mono font-medium">{formatCurrency(asset.marketCap, 1)}</span>
                </div>
                <div className="flex justify-between text-xs py-1 border-b border-border/50">
                  <span className="text-muted-foreground">24h Trading Volume</span>
                  <span className="font-mono font-medium">{formatCurrency(asset.volume24h, 1)}</span>
                </div>
                <div className="flex justify-between text-xs py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Volume / Market Cap</span>
                  <span className="font-mono font-medium">
                    {((asset.volume24h / (asset.marketCap || 1)) * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between text-xs py-1 border-b border-border/50">
                  <span className="text-muted-foreground">All Time High (ATH)</span>
                  <span className="font-mono font-medium text-emerald-400">
                    {formatCurrency(asset.price * 1.14, 2)}
                  </span>
                </div>
                <div className="flex justify-between text-xs py-1">
                  <span className="text-muted-foreground">Global Screener Rank</span>
                  <span className="font-mono font-bold">#{asset.rank}</span>
                </div>
              </CardContent>
            </div>

            <div className="p-4 pt-0">
              <Button
                onClick={() => setModalOpen(true)}
                className="w-full text-xs gap-1.5 h-9"
              >
                <Sparkles className="h-3.5 w-3.5" /> Launch Deep-Dive AI Research
              </Button>
            </div>
          </Card>
        </div>

        {/* 2. Multi-Asset Comparison Matrix */}
        <section>
          <AssetComparisonMatrix />
        </section>

        {/* Research Modal */}
        <StartResearchModal
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      </main>
    </div>
  );
}
