import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AIMarketInsight } from '@/types/market';
import { BrainCircuit, CheckCircle2, ArrowRight } from 'lucide-react';

export function MarketInsights({ insights }: { insights: AIMarketInsight[] }) {
  return (
    <Card className="border bg-card/60">
      <CardHeader className="p-4 border-b flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-semibold tracking-tight">
            AI Market Insights (RAG & Multi-Agent)
          </CardTitle>
        </div>
        <Badge variant="outline" className="text-[10px] font-mono">
          Live Inferences
        </Badge>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="p-3 rounded-lg border bg-background/50 hover:bg-background/80 transition-colors space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs leading-none text-foreground">
                {insight.title}
              </span>
              <Badge
                variant={insight.impact === 'bullish' ? 'success' : 'secondary'}
                className="text-[10px] font-mono"
              >
                {insight.confidence}% Confidence
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {insight.summary}
            </p>

            <div className="flex items-center justify-between pt-1 text-[10px] text-muted-foreground font-mono">
              <span className="flex items-center gap-1 text-primary">
                <CheckCircle2 className="h-3 w-3" /> Evidence: {insight.evidenceCount} sources verified
              </span>
              <span>{insight.timestamp}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
