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
  Mic,
  MicOff,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

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
  const [isListening, setIsListening] = React.useState(false);
  const [isRunning, setIsRunning] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState('');
  const [stepLogs, setStepLogs] = React.useState<string[]>([]);
  const [progressPercent, setProgressPercent] = React.useState(0);
  const router = useRouter();

  const recognitionRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };
        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
          setQuery(transcript);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported in this browser. Please use Chrome or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error('Speech recognition start failed:', e);
      }
    }
  };

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
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground">
                  Research Topic or Asset Query
                </label>
                {isListening && (
                  <Badge variant="destructive" className="text-[10px] animate-pulse font-mono flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" /> Listening to voice...
                  </Badge>
                )}
              </div>
              <div className="relative flex items-center">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Bitcoin ETF Inflows vs Layer-1 Fee Velocity..."
                  className="pl-9 pr-12 text-xs font-mono h-10"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={toggleListening}
                  title={isListening ? 'Stop recording voice' : 'Speak research prompt'}
                  className={cn(
                    'absolute right-2 p-1.5 rounded-md transition-all flex items-center justify-center',
                    isListening
                      ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  )}
                >
                  {isListening ? (
                    <Mic className="h-4 w-4 animate-bounce" />
                  ) : (
                    <Mic className="h-4 w-4 text-primary" />
                  )}
                </button>
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
