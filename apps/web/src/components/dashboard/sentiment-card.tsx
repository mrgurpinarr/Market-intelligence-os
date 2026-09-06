import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { SentimentBreakdown } from '@/types/market';
import { Smile, Frown, Meh, TrendingUp } from 'lucide-react';

export function SentimentCard({ sentiment }: { sentiment: SentimentBreakdown }) {
  return (
    <Card className="border bg-card/60">
      <CardHeader className="p-4 border-b flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <Smile className="h-4 w-4 text-emerald-400" />
          <CardTitle className="text-sm font-semibold tracking-tight">
            Market Sentiment & News Analytics
          </CardTitle>
        </div>
        <Badge
          variant={sentiment.score >= 60 ? 'success' : sentiment.score <= 40 ? 'destructive' : 'secondary'}
          className="font-mono text-[11px]"
        >
          {sentiment.score} / 100 ({sentiment.label})
        </Badge>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Sentiment Progress Bars */}
        <div className="space-y-2">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <Smile className="h-3 w-3 text-emerald-400" /> Positive
              </span>
              <span className="font-mono font-medium text-emerald-400">{sentiment.positivePct}%</span>
            </div>
            <Progress value={sentiment.positivePct} indicatorClassName="bg-emerald-500" />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <Meh className="h-3 w-3 text-muted-foreground" /> Neutral
              </span>
              <span className="font-mono font-medium text-muted-foreground">{sentiment.neutralPct}%</span>
            </div>
            <Progress value={sentiment.neutralPct} indicatorClassName="bg-slate-400" />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <Frown className="h-3 w-3 text-rose-400" /> Negative
              </span>
              <span className="font-mono font-medium text-rose-400">{sentiment.negativePct}%</span>
            </div>
            <Progress value={sentiment.negativePct} indicatorClassName="bg-rose-500" />
          </div>
        </div>

        {/* Sentiment Timeline */}
        <div className="pt-2 border-t">
          <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
            7-Day Sentiment Velocity
          </div>
          <div className="flex items-end justify-between h-14 pt-2 px-1">
            {sentiment.timeline.map((item) => {
              const heightPct = Math.min(100, Math.max(20, item.score));
              return (
                <div key={item.day} className="flex flex-col items-center gap-1 flex-1">
                  <span className="text-[9px] font-mono text-muted-foreground">{item.score}</span>
                  <div
                    className="w-4 rounded-t bg-primary/40 hover:bg-primary transition-all cursor-pointer"
                    style={{ height: `${heightPct}%` }}
                    title={`${item.day}: ${item.score}`}
                  />
                  <span className="text-[10px] text-muted-foreground font-mono">{item.day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
