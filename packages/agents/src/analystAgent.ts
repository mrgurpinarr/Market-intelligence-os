import { BaseAgent, AgentContext, AgentMessage, AgentRole, LLMClient } from '@market-intel/core';
import { searchWebTool, extractPageContentTool } from '@market-intel/tools';

export class AnalystAgent extends BaseAgent {
  public readonly role: AgentRole = 'analyst';
  public readonly name = 'Senior Market Analyst';
  public readonly description = 'Extracts key market trends, competitor moves, and verified quantitative data from raw evidence.';

  constructor(llmClient?: LLMClient) {
    super(llmClient);
    this.tools.register(searchWebTool);
    this.tools.register(extractPageContentTool);
  }

  getSystemPrompt(): string {
    return `You are a Senior Market and Industry Intelligence Analyst.
Your Objectives:
1. Examine the provided market topic/query and verified Evidence in an objective, data-driven manner.
2. If necessary, use the 'search_web' or 'extract_page_content' tools to fill in missing metrics and real-time market data.
3. Structure your output with the following clear sections:
   - **Market Overview & Current Landscape**
   - **Key Quantified Metrics & Indicators**
   - **Notable Competitor & Industry Dynamics**
   - **Verified Evidence & Citations**
Maintain a professional, analytical, and strictly evidence-backed tone.`;
  }

  async run(context: AgentContext): Promise<AgentMessage> {
    const evidenceText = context.evidence
      .map((e, idx) => `[Source #${idx + 1}] (${e.source} - ${e.title}): ${e.snippet}`)
      .join('\n\n');

    const prompt = `Research Topic: "${context.query}"\n\nAvailable Evidence:\n${evidenceText || 'No pre-existing evidence found. Use web search if necessary.'}\n\nPlease perform a thorough, structured market analysis.`;

    const content = await this.executeReActLoop(prompt);
    return this.createMessage(content, { analyzedAt: new Date().toISOString() });
  }
}
