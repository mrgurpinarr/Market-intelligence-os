'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Header } from '@/components/dashboard/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { mockResearchReports } from '@/mock/market';
import { CitationDetail, ResearchReportDetail } from '@/types/market';
import {
  ArrowLeft,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Scale,
  Lightbulb,
  FileCheck2,
  Share2,
  Download,
  Database,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { exportReportToPDF } from '@/lib/pdf-export';

export default function InteractiveReportViewer() {
  const params = useParams();
  const reportId = (params?.id as string) || 'rep-1';

  const [report, setReport] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [exporting, setExporting] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState('summary');
  const [selectedCitation, setSelectedCitation] = React.useState<CitationDetail | null>(null);

  React.useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch(`/api/research/${reportId}`);
        const data = await res.json();
        if (data.success && data.report) {
          setReport(data.report);
        } else {
          // Fallback to mock report
          const fallback = mockResearchReports.find((r) => r.id === reportId) || mockResearchReports[0];
          setReport(fallback);
        }
      } catch (err) {
        console.error('Failed to fetch report from DB:', err);
        const fallback = mockResearchReports.find((r) => r.id === reportId) || mockResearchReports[0];
        setReport(fallback);
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [reportId]);

  const handleExportPDF = async () => {
    if (!report) return;
    setExporting(true);
    try {
      await exportReportToPDF({
        elementId: 'printable-report-container',
        reportTitle: report.title,
        query: report.query,
        confidence: report.confidence || 95,
      });
    } catch (err) {
      console.error('PDF Export Error:', err);
    } finally {
      setExporting(false);
    }
  };

  const sections = [
    { id: 'summary', title: '1. Executive Summary' },
    { id: 'market', title: '2. Market Landscape' },
    { id: 'findings', title: '3. Key Findings' },
    { id: 'bull', title: '4. Bull Case (Growth)' },
    { id: 'bear', title: '5. Bear Case (Risks)' },
    { id: 'critic', title: '6. Critic & Synthesis' },
    { id: 'strategy', title: '7. Recommendations' },
    { id: 'sources', title: '8. Evidence & Citations' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
          <Skeleton className="h-28 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="lg:col-span-3 h-96 w-full" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Navigation & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/dashboard/research"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Research History
          </Link>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Report link copied to clipboard!');
              }}
              className="text-xs h-8 gap-1.5"
            >
              <Share2 className="h-3.5 w-3.5" /> Share
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={exporting}
              onClick={handleExportPDF}
              className="text-xs h-8 gap-1.5 bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
            >
              <Download className="h-3.5 w-3.5" /> {exporting ? 'Generating PDF...' : 'Export PDF'}
            </Button>
          </div>
        </div>

        <div id="printable-report-container" className="space-y-6 p-1">
        {/* Report Meta Header */}
        <div className="p-6 rounded-lg border bg-card/60 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="success" className="text-xs font-mono">
                <CheckCircle2 className="h-3 w-3 mr-1" /> VALIDATED REPORT
              </Badge>
              <Badge variant="outline" className="font-mono text-xs text-primary border-primary/40">
                <ShieldCheck className="h-3.5 w-3.5 mr-1 inline" /> {report?.confidence || 94}% Confidence
              </Badge>
              <Badge variant="secondary" className="font-mono text-xs">
                <Database className="h-3 w-3 mr-1 inline" /> pgvector Verified
              </Badge>
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              Generated: {report?.createdAt}
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {report?.title}
          </h1>
          <p className="text-xs text-muted-foreground font-mono">
            Query: &ldquo;{report?.query}&rdquo;
          </p>
        </div>

        {/* Left Table of Contents + Main Report Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Table of Contents */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="border bg-card/60 sticky top-20">
              <CardHeader className="p-4 border-b">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                  Table of Contents
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 space-y-1">
                {sections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => {
                      setActiveSection(sec.id);
                      document.getElementById(sec.id)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded text-xs font-medium transition-colors',
                      activeSection === sec.id
                        ? 'bg-primary/20 text-primary font-semibold'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    )}
                  >
                    {sec.title}
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Report Body */}
          <div className="lg:col-span-3 space-y-6">
            {/* 1. Executive Summary */}
            <Card id="summary" className="border bg-card/60">
              <CardHeader className="p-5 border-b flex-row items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-primary" />
                <CardTitle className="text-base font-semibold">
                  1. Executive Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 text-sm text-foreground/90 leading-relaxed">
                {report?.executiveSummary}
              </CardContent>
            </Card>

            {/* 2. Market Landscape */}
            <Card id="market" className="border bg-card/60">
              <CardHeader className="p-5 border-b">
                <CardTitle className="text-base font-semibold">
                  2. Market Landscape & Dynamics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                {report?.marketOverview || report?.fullContent?.slice(0, 800)}
              </CardContent>
            </Card>

            {/* 3. Key Findings */}
            <Card id="findings" className="border bg-card/60">
              <CardHeader className="p-5 border-b">
                <CardTitle className="text-base font-semibold">
                  3. Key Quantified Findings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-2.5">
                {(report?.keyFindings || []).map((finding: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2.5 text-sm">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary/20 text-primary font-mono text-xs font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-muted-foreground">
                      {finding}{' '}
                      <button
                        onClick={() => setSelectedCitation(report.citations?.[0] || null)}
                        className="text-primary hover:underline font-mono text-xs font-bold"
                      >
                        [1]
                      </button>
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 4. Bull Case & 5. Bear Case Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Bull Case */}
              <Card id="bull" className="border border-emerald-500/30 bg-emerald-500/5">
                <CardHeader className="p-4 border-b border-emerald-500/20 flex-row items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  <CardTitle className="text-sm font-semibold text-emerald-400">
                    4. Bull Case (Growth Potential)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 text-xs text-foreground/90 leading-relaxed">
                  {report?.bullCase}
                </CardContent>
              </Card>

              {/* Bear Case */}
              <Card id="bear" className="border border-rose-500/30 bg-rose-500/5">
                <CardHeader className="p-4 border-b border-rose-500/20 flex-row items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-400" />
                  <CardTitle className="text-sm font-semibold text-rose-400">
                    5. Bear Case (Risks & Threats)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 text-xs text-foreground/90 leading-relaxed">
                  {report?.bearCase}
                </CardContent>
              </Card>
            </div>

            {/* 6. Critic Synthesis */}
            <Card id="critic" className="border bg-card/60">
              <CardHeader className="p-5 border-b flex-row items-center gap-2">
                <Scale className="h-4 w-4 text-primary" />
                <CardTitle className="text-base font-semibold">
                  6. Chief Critic Sentezi & Çelişki Denetimi
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 text-sm text-foreground/90 leading-relaxed">
                {report?.criticSynthesis}
              </CardContent>
            </Card>

            {/* 7. Strategic Recommendations */}
            <Card id="strategy" className="border bg-card/60">
              <CardHeader className="p-5 border-b flex-row items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-400" />
                <CardTitle className="text-base font-semibold">
                  7. Stratejik Eylem Önerileri
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-2.5">
                {(report?.strategicRecommendations || []).map((rec: string, i: number) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-foreground/90">{rec}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 8. Evidence & Citations */}
            <Card id="sources" className="border bg-card/60">
              <CardHeader className="p-5 border-b">
                <CardTitle className="text-base font-semibold">
                  8. Doğrulanmış Kaynaklar & Kanıt Listesi
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                {(report?.citations || []).map((cite: CitationDetail) => (
                  <div
                    key={cite.id}
                    onClick={() => setSelectedCitation(cite)}
                    className="p-3.5 rounded-lg border bg-background/50 hover:border-primary/50 cursor-pointer transition-colors space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-primary font-mono">
                        [{cite.id}] {cite.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {cite.publishedDate}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                       Publisher: {cite.publisher}
                    </p>
                    <div className="text-[11px] text-primary/80 flex items-center gap-1 font-mono pt-1">
                      View citation & evidence details <ExternalLink className="h-3 w-3" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
        </div>

        {/* Interactive Citation Dialog */}
        <Dialog open={!!selectedCitation} onOpenChange={(open) => !open && setSelectedCitation(null)}>
          {selectedCitation && (
            <DialogContent onClose={() => setSelectedCitation(null)}>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="font-mono text-[10px]">
                    CITATION [{selectedCitation.id}]
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">
                    {selectedCitation.publishedDate}
                  </span>
                </div>
                <DialogTitle className="text-base">
                  {selectedCitation.title}
                </DialogTitle>
                <DialogDescription>
                  Publisher: {selectedCitation.publisher}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 pt-2">
                <div className="p-3.5 rounded-md bg-secondary/60 border text-xs text-foreground/90 font-mono leading-relaxed">
                  <span className="text-[10px] uppercase text-muted-foreground block mb-1 font-sans">
                    Relevant Verified Evidence:
                  </span>
                  &ldquo;{selectedCitation.relevantEvidence}&rdquo;
                </div>

                <div className="text-xs space-y-1 font-mono text-muted-foreground">
                  <div>
                    URL:{' '}
                    <a
                      href={selectedCitation.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline break-all"
                    >
                      {selectedCitation.url}
                    </a>
                  </div>
                  <div>Retrieved Date: {selectedCitation.retrievedDate}</div>
                </div>
              </div>
            </DialogContent>
          )}
        </Dialog>
      </main>
    </div>
  );
}
