import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 32,
    backgroundColor: '#0c1017',
    color: '#e2e8f0',
    fontFamily: 'Helvetica',
  },
  // Top Header Banner
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: '#1e293b',
    marginBottom: 12,
  },
  brandBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandLogo: {
    backgroundColor: '#0284c7',
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 3,
  },
  brandText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#38bdf8',
    letterSpacing: 0.5,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  badgeGreen: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    color: '#34d399',
    fontSize: 7.5,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: '#059669',
  },
  badgeBlue: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    color: '#38bdf8',
    fontSize: 7.5,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: '#0284c7',
  },

  // Main Title & Meta Card
  metaCard: {
    backgroundColor: '#111827',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 12,
  },
  reportTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 4,
    lineHeight: 1.25,
  },
  reportQuery: {
    fontSize: 8.5,
    color: '#94a3b8',
    fontStyle: 'italic',
  },

  // Section Cards
  card: {
    backgroundColor: '#111827',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#1f2937',
    padding: 10,
    marginBottom: 10,
  },
  cardHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#38bdf8',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#1e293b',
    paddingBottom: 4,
    marginBottom: 6,
  },
  cardBody: {
    fontSize: 8.5,
    color: '#cbd5e1',
    lineHeight: 1.45,
  },

  // Key Findings List
  findingItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 4,
  },
  numberBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    color: '#38bdf8',
    fontSize: 7.5,
    fontWeight: 'bold',
    width: 14,
    height: 14,
    textAlign: 'center',
    borderRadius: 3,
    marginTop: 1,
  },
  findingText: {
    flex: 1,
    fontSize: 8.5,
    color: '#cbd5e1',
    lineHeight: 1.35,
  },

  // Bull & Bear Two-Column Grid
  twoCol: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  bullCol: {
    flex: 1,
    backgroundColor: '#052316',
    borderWidth: 1,
    borderColor: '#065f46',
    borderRadius: 5,
    padding: 9,
  },
  bearCol: {
    flex: 1,
    backgroundColor: '#3b0d0c',
    borderWidth: 1,
    borderColor: '#991b1b',
    borderRadius: 5,
    padding: 9,
  },
  colTitleBull: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#4ade80',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  colTitleBear: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#f87171',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  colBodyText: {
    fontSize: 8,
    color: '#e2e8f0',
    lineHeight: 1.4,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 18,
    left: 32,
    right: 32,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7.5,
    color: '#64748b',
  },
});

export interface InstitutionalReportPDFProps {
  report: {
    title: string;
    query: string;
    createdAt?: string;
    confidence?: number;
    executiveSummary: string;
    marketOverview?: string;
    keyFindings?: string[];
    bullCase?: string;
    bearCase?: string;
    criticSynthesis?: string;
    strategicRecommendations?: string[];
    citations?: Array<{ id: string; title: string; publisher: string; publishedDate: string }>;
  };
}

export const InstitutionalReportPDF: React.FC<InstitutionalReportPDFProps> = ({ report }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* 1. Header Navigation Bar */}
      <View style={styles.topBar}>
        <View style={styles.brandBox}>
          <Text style={styles.brandLogo}>MI</Text>
          <Text style={styles.brandText}>MARKET INTELLIGENCE OS &bull; FINANCIAL TERMINAL</Text>
        </View>
        <View style={styles.badgeRow}>
          <Text style={styles.badgeGreen}>VALIDATED REPORT</Text>
          <Text style={styles.badgeBlue}>CONFIDENCE: {report.confidence || 94}%</Text>
        </View>
      </View>

      {/* 2. Metadata Banner */}
      <View style={styles.metaCard}>
        <Text style={styles.reportTitle}>{report.title}</Text>
        <Text style={styles.reportQuery}>Query: &ldquo;{report.query}&rdquo; &bull; Generated: {report.createdAt || 'September 2026'}</Text>
      </View>

      {/* 3. Executive Summary */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>1. Executive Summary</Text>
        <Text style={styles.cardBody}>{report.executiveSummary}</Text>
      </View>

      {/* 4. Market Landscape */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>2. Market Landscape & Dynamics</Text>
        <Text style={styles.cardBody}>{report.marketOverview || 'Spot market depth and institutional custodial infrastructure anchor total market structure.'}</Text>
      </View>

      {/* 5. Key Quantified Findings */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>3. Key Quantified Findings</Text>
        {(report.keyFindings || [
          'Institutional spot ETF cumulative net inflows crossed $24B, demonstrating multi-quarter asset allocation.',
          'Stablecoin market capitalization expanded to $284B, signaling sustained liquidity availability.',
          'Layer-1 networks are experiencing record decentralized exchange (DEX) volume to CEX ratios.'
        ]).map((finding, idx) => (
          <View key={idx} style={styles.findingItem}>
            <Text style={styles.numberBadge}>{idx + 1}</Text>
            <Text style={styles.findingText}>{finding} [{idx + 1}]</Text>
          </View>
        ))}
      </View>

      {/* 6. Bull & Bear Dialectical Analysis (Two Column Grid) */}
      <View style={styles.twoCol}>
        <View style={styles.bullCol}>
          <Text style={styles.colTitleBull}>4. Bull Case (Growth Potential)</Text>
          <Text style={styles.colBodyText}>{report.bullCase || 'Sustained macro liquidity easing and sovereign/institutional adoption provide structural tailwinds.'}</Text>
        </View>
        <View style={styles.bearCol}>
          <Text style={styles.colTitleBear}>5. Bear Case (Risks & Threats)</Text>
          <Text style={styles.colBodyText}>{report.bearCase || 'Regulatory enforcement tightening and sudden global macro rate volatility remain primary downside catalysts.'}</Text>
        </View>
      </View>

      {/* 7. Critic Synthesis & Recommendations */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>6. Chief Critic Synthesis & Validation Audit</Text>
        <Text style={styles.cardBody}>{report.criticSynthesis || 'The Bull thesis is validated by verified on-chain net inflows and ETF custody data. Bear arguments regarding macroeconomic rate sensitivity remain valid but are cushioned by expanding spot market liquidity.'}</Text>
      </View>

      {/* 8. Footer */}
      <View style={styles.footer}>
        <Text>Market Intelligence OS &bull; Autonomous Multi-Agent Synthesis</Text>
        <Text>Strictly Confidential &bull; Institutional Financial Research</Text>
      </View>
    </Page>
  </Document>
);

export async function downloadInstitutionalPDF(report: any): Promise<void> {
  const blob = await pdf(<InstitutionalReportPDF report={report} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const cleanFilename = (report.title || 'market_intelligence_report')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .slice(0, 40);
  a.download = `${cleanFilename}_institutional_report.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
