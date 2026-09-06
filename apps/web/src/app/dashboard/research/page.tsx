'use client';

import * as React from 'react';
import Link from 'next/link';
import { Header } from '@/components/dashboard/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StartResearchModal } from '@/components/research/start-research-modal';
import { mockResearchReports } from '@/mock/market';
import { ResearchReportDetail } from '@/types/market';
import {
  FileText,
  Plus,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Database,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

export default function ResearchReportsPage() {
  const [reports, setReports] = React.useState<ResearchReportDetail[]>(mockResearchReports);
  const [loading, setLoading] = React.useState(true);
  const [modalOpen, setModalOpen] = React.useState(false);

  async function loadReports() {
    try {
      const res = await fetch('/api/research');
      const data = await res.json();
      if (data.success && data.reports?.length > 0) {
        setReports(data.reports);
      }
    } catch (err) {
      console.error('Failed to load reports from PostgreSQL:', err);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadReports();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Research Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">AI Research Reports Terminal</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Autonomous multi-agent intelligence reports with verified pgvector evidence & citations
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={loadReports}
              className="text-xs h-9 gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => setModalOpen(true)}
              className="text-xs gap-1.5 font-medium h-9"
            >
              <Plus className="h-3.5 w-3.5" /> Start New Research Session
            </Button>
          </div>
        </div>

        {/* Reports List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : reports.length === 0 ? (
          <Card className="border bg-card/60 p-12 text-center space-y-3">
            <Sparkles className="h-8 w-8 text-primary mx-auto opacity-80" />
            <h3 className="text-sm font-semibold">No Research Reports Yet</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Start your first autonomous multi-agent research session to generate a verified intelligence briefing.
            </p>
            <Button size="sm" onClick={() => setModalOpen(true)} className="text-xs">
              Start First Research
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((report) => (
              <Card
                key={report.id}
                className="border bg-card/60 hover:border-primary/50 transition-colors group flex flex-col justify-between"
              >
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge variant="success" className="text-[10px] font-mono">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> {report.status.toUpperCase()}
                    </Badge>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {report.createdAt}
                    </span>
                  </div>

                  <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors">
                    {report.title}
                  </CardTitle>

                  <CardDescription className="text-xs line-clamp-2 mt-1">
                    Query: &ldquo;{report.query}&rdquo;
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-5 pt-0 space-y-4">
                  <div className="p-3 rounded-md bg-secondary/50 border text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {report.executiveSummary}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t text-xs">
                    <div className="flex items-center gap-3 text-muted-foreground font-mono text-[11px]">
                      <span className="flex items-center gap-1 text-primary">
                        <ShieldCheck className="h-3.5 w-3.5" /> {report.confidence}% Confidence
                      </span>
                      <span className="flex items-center gap-1">
                        <Database className="h-3.5 w-3.5" /> {report.sourcesCount} Verified Sources
                      </span>
                    </div>

                    <Link href={`/dashboard/research/${report.id}`}>
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                        View Report <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Start Research Modal */}
        <StartResearchModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          onReportCreated={loadReports}
        />
      </main>
    </div>
  );
}
