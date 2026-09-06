import { BaseAgent, AgentContext, AgentMessage, AgentRole, LLMClient } from '@market-intel/core';
import { searchWebTool } from '@market-intel/tools';

export class BearAgent extends BaseAgent {
  public readonly role: AgentRole = 'bear';
  public readonly name = 'Bear Strategist (Risk & Threats)';
  public readonly description = 'Analyzes regulatory hurdles, competitive threats, margin compression, and potential downside risks.';

  constructor(llmClient?: LLMClient) {
    super(llmClient);
    this.tools.register(searchWebTool);
  }

  getSystemPrompt(): string {
    return `You are a Risk Management, Downside Protection, and Competitive Threat Strategist (The Bear).
Your Objectives:
1. Identify all pitfalls, hidden operational costs, hyper-competitive dynamics, customer churn risks, and regulatory hurdles.
2. Relentlessly answer: "Why could this business fail or how could margins be compressed?"
3. Structure your response around:
   - **Key Risk Factors & Structural Headwinds**
   - **Competition & Margin Compression Pressures**
   - **Bear Case Hypothesis & Worst-Case Scenario Analysis**
Provide a concrete mechanism, friction point, or piece of evidence for every identified risk.`;
  }

  async run(context: AgentContext): Promise<AgentMessage> {
    const previousMessages = context.history
      .map((m) => `[${m.sender.toUpperCase()}]: ${m.content}`)
      .join('\n\n');

    const prompt = `Research Topic: "${context.query}"\n\nPrior Context & Team Analysis:\n${previousMessages}\n\nPlease formulate the most realistic and critical Bear Case (Risks & Threats) for this market.`;

    const content = await this.executeReActLoop(prompt);
    return this.createMessage(content, { perspective: 'bearish' });
  }
}
