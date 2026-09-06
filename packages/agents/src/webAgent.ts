import { BaseAgent, AgentContext, AgentMessage, AgentRole, LLMClient } from '@market-intel/core';
import { searchWebTool, extractPageContentTool, EvidenceStoreRepository } from '@market-intel/tools';

export class WebIntelligenceAgent extends BaseAgent {
  public readonly role: AgentRole = 'web_agent';
  public readonly name = 'Web Intelligence & Scraping Agent';
  public readonly description = 'Searches the live web, extracts real-time market data, news, and competitor dynamics, and stores verified evidence chunks into pgvector.';

  constructor(llmClient?: LLMClient) {
    super(llmClient);
    this.tools.register(searchWebTool);
    this.tools.register(extractPageContentTool);
  }

  getSystemPrompt(): string {
    return `You are an Autonomous Real-Time Web Intelligence and Data Extraction Agent.
Your Objectives:
1. Break down the user's financial or crypto query into targeted search queries.
2. Use 'search_web' to find high-authority financial news, regulatory updates, and on-chain intelligence.
3. Use 'extract_page_content' on the top relevant URLs to retrieve clean, verbatim text and metrics.
4. Extract quantitative numbers (prices, volumes, inflow figures, dates, percentages) and source URLs.
5. Provide a crisp, structured dossier of your web findings.

Formatting:
- **Discovered Live Sources**: List titles, URLs, and publisher names.
- **Critical Real-Time Intelligence**: Bulleted list of facts, numbers, and recent moves.
- **Sentiment & Breaking Signals**: Immediate market reaction or regulatory posture.`;
  }

  async run(context: AgentContext): Promise<AgentMessage> {
    const prompt = `Conduct targeted live web intelligence research for: "${context.query}".
Find the latest 2026 data, ETF flows, institutional announcements, and price action metrics.`;

    const content = await this.executeReActLoop(prompt);

    // Save extracted insights as fresh evidence into evidence_store if feasible
    try {
      await EvidenceStoreRepository.insert({
        title: `Web Intel: ${context.query.slice(0, 50)}`,
        source: 'Live Web Search Agent',
        snippet: content.slice(0, 300) + '...',
        content: content,
        tags: ['web_agent', 'live_web', 'realtime'],
      });
    } catch (e) {
      console.warn('Failed to auto-archive web agent evidence:', e);
    }

    return this.createMessage(content, {
      agent: 'web_agent',
      completedAt: new Date().toISOString(),
    });
  }
}
