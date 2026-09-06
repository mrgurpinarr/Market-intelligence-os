export interface MarketOverviewMetric {
  title: string;
  value: string;
  change: string;
  changePercent: number;
  period: string;
  isPositive: boolean;
}

export interface TrackedAsset {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  change7d: number;
  marketCap: number;
  volume24h: number;
  rank: number;
  sparkline: number[];
  category: 'crypto' | 'equity' | 'commodity' | 'saas';
}

export interface SentimentBreakdown {
  score: number; // 0-100
  label: 'Bullish' | 'Neutral' | 'Bearish';
  positivePct: number;
  neutralPct: number;
  negativePct: number;
  newsVolume: number;
  positiveNewsCount: number;
  negativeNewsCount: number;
  neutralNewsCount: number;
  timeline: { day: string; score: number }[];
}

export interface MarketEvent {
  id: string;
  type: 'price_anomaly' | 'volume_spike' | 'volatility_spike' | 'sentiment_shift' | 'news_break';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  timestamp: string;
  assetSymbol?: string;
  actionRequired?: boolean;
}

export interface AIMarketInsight {
  id: string;
  title: string;
  summary: string;
  confidence: number;
  evidenceCount: number;
  timestamp: string;
  impact: 'bullish' | 'bearish' | 'neutral';
  sources: string[];
}

export interface CitationDetail {
  id: string;
  title: string;
  publisher: string;
  publishedDate: string;
  relevantEvidence: string;
  url: string;
  retrievedDate: string;
}

export interface ResearchReportDetail {
  id: string;
  title: string;
  query: string;
  createdAt: string;
  assets: string[];
  confidence: number;
  status: 'completed' | 'analyzing' | 'draft';
  sourcesCount: number;
  executiveSummary: string;
  marketOverview: string;
  keyFindings: string[];
  bullCase: string;
  bearCase: string;
  riskAnalysis: string;
  criticSynthesis: string;
  strategicRecommendations: string[];
  citations: CitationDetail[];
  agentExecution: {
    name: string;
    status: 'complete' | 'running' | 'waiting';
    duration?: string;
  }[];
}
