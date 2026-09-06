import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MarketEvent } from '@/types/market';
import { AlertCircle, Zap, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MarketEvents({ events }: { events: MarketEvent[] }) {
  return (
    <Card className="border bg-card/60">
      <CardHeader className="p-4 border-b flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-400" />
          <CardTitle className="text-sm font-semibold tracking-tight">
            Market Signals & Anomaly Stream
          </CardTitle>
        </div>
        <Badge variant="warning" className="text-[10px] font-mono">
          Real-time Alerts
        </Badge>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {events.map((evt) => (
          <div
            key={evt.id}
            className={cn(
              'p-3 rounded-lg border transition-colors space-y-1.5',
              evt.severity === 'high'
                ? 'border-destructive/40 bg-destructive/5'
                : 'bg-background/50'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs flex items-center gap-1.5 text-foreground">
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    evt.severity === 'high' ? 'bg-destructive animate-ping' : 'bg-amber-400'
                  )}
                />
                {evt.title}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {evt.timestamp}
              </span>
            </div>

            <p className="text-xs text-muted-foreground leading-snug">
              {evt.description}
            </p>

            {evt.actionRequired && (
              <div className="pt-1 flex items-center justify-between">
                <span className="text-[10px] text-destructive font-mono">
                  AI analysis recommended
                </span>
                <Button size="sm" variant="outline" className="h-6 px-2 text-[10px]">
                  Investigate <ArrowUpRight className="h-2.5 w-2.5 ml-1" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
