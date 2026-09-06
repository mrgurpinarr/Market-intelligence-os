'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { Layers, ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

export function AssetComparisonMatrix() {
  const [selectedAssets, setSelectedAssets] = React.useState<string[]>([
    'BTC',
    'ETH',
    'SOL',
  ]);

  const comparisonData = [
    { period: '24h Change', BTC: 2.31, ETH: 1.84, SOL: 5.24, AVAX: 4.12 },
    { period: '7d Change', BTC: 7.82, ETH: 4.21, SOL: 12.8, AVAX: 9.45 },
    { period: '30d Change', BTC: 14.5, ETH: 9.1, SOL: 28.4, AVAX: 18.2 },
    { period: '90d Change', BTC: 42.1, ETH: 22.4, SOL: 84.6, AVAX: 45.1 },
    { period: '1Y Change', BTC: 124.5, ETH: 68.2, SOL: 290.0, AVAX: 110.4 },
  ];

  const assetMetrics = [
    {
      metric: 'Current Price',
      BTC: '$94,250',
      ETH: '$3,420',
      SOL: '$198.40',
      AVAX: '$34.80',
    },
    {
      metric: 'Market Cap',
      BTC: '$1.85T',
      ETH: '$412B',
      SOL: '$92.4B',
      AVAX: '$14.2B',
    },
    {
      metric: '24h Volume',
      BTC: '$38.5B',
      ETH: '$19.2B',
      SOL: '$6.8B',
      AVAX: '$540M',
    },
    {
      metric: 'Market Rank',
      BTC: '#1',
      ETH: '#2',
      SOL: '#3',
      AVAX: '#12',
    },
    {
      metric: 'ATH Drawdown',
      BTC: '-4.2%',
      ETH: '-28.1%',
      SOL: '-24.0%',
      AVAX: '-76.0%',
    },
    {
      metric: 'Layer-1 Category',
      BTC: 'Store of Value',
      ETH: 'Smart Contracts',
      SOL: 'High-Throughput',
      AVAX: 'Subnets',
    },
  ];

  const availableAssets = ['BTC', 'ETH', 'SOL', 'AVAX'];

  function toggleAsset(sym: string) {
    if (selectedAssets.includes(sym)) {
      if (selectedAssets.length > 2) {
        setSelectedAssets(selectedAssets.filter((s) => s !== sym));
      }
    } else {
      setSelectedAssets([...selectedAssets, sym]);
    }
  }

  const assetColors: Record<string, string> = {
    BTC: '#f59e0b',
    ETH: '#6366f1',
    SOL: '#10b981',
    AVAX: '#ef4444',
  };

  return (
    <Card className="border bg-card/60">
      <CardHeader className="p-4 border-b flex-col sm:flex-row sm:items-center justify-between gap-3 space-y-0">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-semibold">
            Competitor & Multi-Asset Performance Matrix
          </CardTitle>
        </div>

        {/* Selected assets pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-muted-foreground font-mono mr-1">Compare:</span>
          {availableAssets.map((sym) => {
            const isSelected = selectedAssets.includes(sym);
            return (
              <button
                key={sym}
                onClick={() => toggleAsset(sym)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-all ${
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {sym}
              </button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-6">
        {/* Recharts Performance Comparison Chart */}
        <div className="h-64 w-full">
          <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2 font-mono">
            Comparative Return Timeline (% Growth)
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={comparisonData}>
              <XAxis dataKey="period" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} unit="%" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  fontSize: '12px',
                  borderRadius: '6px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              {selectedAssets.map((sym) => (
                <Line
                  key={sym}
                  type="monotone"
                  dataKey={sym}
                  stroke={assetColors[sym] || '#38bdf8'}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Dense Comparison Table */}
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-xs font-mono">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="p-2.5 text-left text-muted-foreground font-sans uppercase text-[10px]">
                  Metric / Indicator
                </th>
                {selectedAssets.map((sym) => (
                  <th key={sym} className="p-2.5 text-right font-bold text-foreground">
                    {sym}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {assetMetrics.map((row) => (
                <tr key={row.metric} className="hover:bg-muted/30 transition-colors">
                  <td className="p-2.5 text-muted-foreground font-sans font-medium">
                    {row.metric}
                  </td>
                  {selectedAssets.map((sym) => (
                    <td key={sym} className="p-2.5 text-right tabular-nums">
                      {(row as any)[sym]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
