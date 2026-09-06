import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Loader2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AgentActivity() {
  const agents = [
    { name: 'Research Manager (Orchestrator)', status: 'complete', time: '14:30:02' },
    { name: 'Market Data Agent', status: 'complete', time: '14:30:05' },
    { name: 'Web Research Agent (Scraper)', status: 'complete', time: '14:30:10' },
    { name: 'pgvector Evidence RAG', status: 'complete', time: '14:30:12' },
    { name: 'Analyst Agent', status: 'complete', time: '14:30:16' },
    { name: 'Bull vs. Bear Agents (Parallel)', status: 'complete', time: '14:30:22' },
    { name: 'Critic & Validator Agent', status: 'complete', time: '14:30:26' },
    { name: 'Chief Report Writer Agent', status: 'complete', time: '14:30:31' },
  ];

  return (
    <Card className="border bg-card/60">
      <CardHeader className="p-4 border-b flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <CardTitle className="text-sm font-semibold tracking-tight">
            Multi-Agent Execution Pipeline
          </CardTitle>
        </div>
        <Badge variant="outline" className="text-[10px] font-mono">
          DeepSeek V3 / R1 Engine
        </Badge>
      </CardHeader>

      <CardContent className="p-4">
        <div className="space-y-2.5">
          {agents.map((agent, index) => (
            <div
              key={agent.name}
              className="flex items-center justify-between text-xs py-1 border-b border-border/50 last:border-0"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span className="font-medium text-foreground">{agent.name}</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
                <span>{agent.time}</span>
                <Badge variant="success" className="text-[9px] py-0 px-1">
                  DONE
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
