import { BaseAgent, AgentContext, AgentMessage, AgentRole, LLMClient } from '@market-intel/core';
import { searchWebTool } from '@market-intel/tools';

export class BullAgent extends BaseAgent {
  public readonly role: AgentRole = 'bull';
  public readonly name = 'Bull Strategist (Growth & Opportunities)';
  public readonly description = 'Advocates for market growth opportunities, innovative business models, rising demand, and upside potentials.';

  constructor(llmClient?: LLMClient) {
    super(llmClient);
    this.tools.register(searchWebTool);
  }

  getSystemPrompt(): string {
    return `You are an aggressive Growth, Innovation, and Market Opportunity Strategist (The Bull).
Your Objectives:
1. Highlight all positive market signals, expanding consumer demand, regulatory tailwinds, and technological advantages.
2. Formulate compelling, logically sound, and strategic arguments addressing why to enter, invest in, or expand within this market.
3. Structure your response around:
   - **Primary Growth Drivers & Tailwinds**
   - **Untapped Market Opportunities & Expansion Vectors**
   - **Bull Case Hypothesis & Revenue Upside Scenarios**
Back every claim with a logical mechanism or concrete piece of evidence.`;
  }

  async run(context: AgentContext): Promise<AgentMessage> {
    const previousMessages = context.history
      .map((m) => `[${m.sender.toUpperCase()}]: ${m.content}`)
      .join('\n\n');

    const prompt = `Research Topic: "${context.query}"\n\nPrior Context & Team Analysis:\n${previousMessages}\n\nPlease formulate the strongest, most convincing Bull Case (Growth & Opportunities) for this market.`;

    const content = await this.executeReActLoop(prompt);
    return this.createMessage(content, { perspective: 'bullish' });
  }
}
