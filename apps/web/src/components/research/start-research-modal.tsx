'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  BrainCircuit,
  ArrowRight,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export function StartResearchModal({
  open,
  onOpenChange,
  onReportCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReportCreated?: () => void;
}) {
  const [query, setQuery] = React.useState('');
  const [isRunning, setIsRunning] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState('');
  const [stepLogs, setStepLogs] = React.useState<string[]>([]);
  const [progressPercent, setProgressPercent] = React.useState(0);
  const router = useRouter();

  const presets = [
    'Bitcoin Spot ETF Inflows & Macro Liquidity Cycle 2026',
    'Solana vs Ethereum Layer-1 DeFi Market Share & Fee Revenue',
    'DeFi Lending Protocol Yields & Stablecoin Supply Expansion',
  ];

  async function handleStartResearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!query.trim() || isRunning) return;

    setIsRunning(true);
    setCurrentStep('Initializing Multi-Agent Orchestrator...');
    setStepLogs(['[00:01] ▶ Multi-Agent Research Session Started.']);
    setProgressPercent(10);

    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (!response.body) {
        throw new Error('No response body from research stream');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.replace('data: ', ''));

            if (data.type === 'progress') {
              setCurrentStep(data.step);
              setStepLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ▶ ${data.step}`]);
              setProgressPercent((prev) => Math.min(90, prev + 20));
            } else if (data.type === 'complete') {
              setProgressPercent(100);
              setCurrentStep('Report Generated & Saved to PostgreSQL!');
              setStepLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ✅ Research Complete.`]);
              
              setTimeout(() => {
                setIsRunning(false);
                onOpenChange(false);
                onReportCreated?.();
                router.refresh();
              }, 1200);
            } else if (data.type === 'error') {
              throw new Error(data.error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Research execution error:', error);
      setCurrentStep(`Error: ${(error as Error).message}`);
      setIsRunning(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={isRunning ? () => {} : onOpenChange}>
      <DialogContent className="max-w-xl" onClose={isRunning ? undefined : () => onOpenChange(false)}>
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-6 w-6 rounded bg-primary/20 text-primary flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <DialogTitle className="text-base font-bold">
              Autonomous Multi-Agent Market Research
            </DialogTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            Launches our 4-stage dialectical pipeline: Analyst ➔ Bull & Bear Theses ➔ Critic Audit ➔ Executive Report.
          </p>
        </DialogHeader>

        {!isRunning ? (
          <form onSubmit={handleStartResearch} className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">
                Research Topic or Asset Query
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Bitcoin ETF Inflows vs Layer-1 Fee Velocity..."
                  className="pl-9 text-xs font-mono h-10"
                  autoFocus
                />
              </div>
            </div>

            {/* Quick preset suggestions */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
                Suggested Research Questions
              </span>
              <div className="flex flex-col gap-1.5">
                {presets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setQuery(preset)}
                    className="text-left p-2 rounded-md bg-secondary/50 hover:bg-secondary border text-xs text-muted-foreground hover:text-foreground transition-colors font-mono"
                  >
                    👉 {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!query.trim()}
                className="text-xs gap-1.5 font-medium"
              >
                <Sparkles className="h-3.5 w-3.5" /> Launch Research Session
              </Button>
            </div>
          </form>
        ) : (
          /* Live Streaming Progress Stepper */
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-primary flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> {currentStep}
                </span>
                <span className="font-mono text-muted-foreground font-medium">
                  {progressPercent}%
                </span>
              </div>
              <Progress value={progressPercent} indicatorClassName="bg-primary" />
            </div>

            <div className="p-3.5 rounded-lg bg-black/50 border font-mono text-[11px] text-muted-foreground max-h-48 overflow-y-auto space-y-1.5">
              {stepLogs.map((log, index) => (
                <div key={index} className="leading-snug">
                  {log}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 text-[11px] text-muted-foreground font-mono">
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" /> pgvector + CoinMarketCap Live Feed
              </span>
              <span>Autonomous Agents Active</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
