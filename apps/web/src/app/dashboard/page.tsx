'use client';

import * as React from 'react';
import { Header } from '@/components/dashboard/header';
import { MarketOverview } from '@/components/dashboard/market-overview';
import { AssetWatchlist } from '@/components/dashboard/asset-watchlist';
import { SentimentCard } from '@/components/dashboard/sentiment-card';
import { MarketInsights } from '@/components/dashboard/market-insights';
import { MarketEvents } from '@/components/dashboard/market-events';
import { AgentActivity } from '@/components/dashboard/agent-activity';
import { TelegramIntegrationCard } from '@/components/dashboard/telegram-integration-card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  mockMarketOverview,
  mockTrackedAssets,
  mockSentiment,
  mockMarketEvents,
  mockAIMarketInsights,
} from '@/mock/market';
import { MarketOverviewMetric, TrackedAsset } from '@/types/market';

export default function DashboardPage() {
  const [overview, setOverview] = React.useState<MarketOverviewMetric[]>(mockMarketOverview);
  const [assets, setAssets] = React.useState<TrackedAsset[]>(mockTrackedAssets);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchLiveData() {
      try {
        const res = await fetch('/api/market');
        const json = await res.json();
        if (json.success && json.overview?.length > 0 && json.assets?.length > 0) {
          setOverview(json.overview);
          setAssets(json.assets);
        }
      } catch (err) {
        console.error('Dinamik CMC verisi yüklenirken hata:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLiveData();
    const interval = setInterval(fetchLiveData, 60000); // Her 60 saniyede bir otomatik canlı yenileme
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* 1. Market Overview Bar */}
        <section>
          {loading && overview.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : (
            <MarketOverview metrics={overview} />
          )}
        </section>

        {/* 2. Main Analytics & Watchlist Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Live CMC Screener & Watchlist */}
          <div className="lg:col-span-2 space-y-6">
            {loading && assets.length === 0 ? (
              <Skeleton className="h-96 w-full" />
            ) : (
              <AssetWatchlist assets={assets} />
            )}
            <MarketInsights insights={mockAIMarketInsights} />
          </div>

          {/* Right 1 Col: Sentiment, Signals, Telegram Sync & Agent Activity */}
          <div className="space-y-6">
            <TelegramIntegrationCard />
            <SentimentCard sentiment={mockSentiment} />
            <MarketEvents events={mockMarketEvents} />
            <AgentActivity />
          </div>
        </div>
      </main>
    </div>
  );
}
