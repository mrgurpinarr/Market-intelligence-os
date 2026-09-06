import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MarketOverviewMetric } from '@/types/market';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MarketOverview({ metrics }: { metrics: MarketOverviewMetric[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {metrics.map((metric) => {
        const isUp = metric.isPositive;
        return (
          <Card key={metric.title} className="bg-card/60 backdrop-blur border">
            <CardHeader className="p-3.5 pb-1">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                {metric.title}
              </span>
            </CardHeader>
            <CardContent className="p-3.5 pt-0">
              <div className="text-xl font-bold tracking-tight font-mono tabular-nums">
                {metric.value}
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-xs">
                <span
                  className={cn(
                    'flex items-center font-mono font-medium text-[11px]',
                    isUp ? 'text-emerald-400' : 'text-rose-400'
                  )}
                >
                  {isUp ? (
                    <ArrowUpRight className="h-3 w-3 mr-0.5 inline" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-0.5 inline" />
                  )}
                  {metric.change} ({isUp ? '+' : ''}{metric.changePercent}%)
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {metric.period}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
