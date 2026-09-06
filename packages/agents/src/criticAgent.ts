import { BaseAgent, AgentContext, AgentMessage, AgentRole, LLMClient } from '@market-intel/core';

export class CriticAgent extends BaseAgent {
  public readonly role: AgentRole = 'critic';
  public readonly name = 'Chief Critic & Validator';
  public readonly description = 'Cross-examines Analyst, Bull, and Bear arguments, verifies evidence, and resolves contradictions.';

  constructor(llmClient?: LLMClient) {
    super(llmClient);
  }

  getSystemPrompt(): string {
    return `You are the Chief Critic, Arbitrator, and Validation Officer.
Your Objectives:
1. Cross-examine all arguments presented by the Analyst, Bull Agent, and Bear Agent.
2. Debunk exaggerated or unsubstantiated claims from either side.
3. Expose key contradictions and trade-offs between growth vectors and risk factors.
4. Structure your output around:
   - **Evidence Audit & Unsubstantiated Claims (Debunked Points)**
   - **Key Debates & Trade-offs (Bull vs. Bear Tension)**
   - **Balanced Arbitrator Verdict & Net Assessment**`;
  }

  async run(context: AgentContext): Promise<AgentMessage> {
    const historyText = context.history
      .map((m) => `### [${m.sender.toUpperCase()} AGENT]:\n${m.content}`)
      .join('\n\n---\n\n');

    const prompt = `Research Topic: "${context.query}"\n\nTeam Analysis & Theses:\n${historyText}\n\nPlease critically evaluate these arguments, eliminate unfounded claims, resolve contradictions, and deliver a balanced audit report.`;

    const content = await this.llm.generateText(this.getSystemPrompt(), prompt);
    return this.createMessage(content, { validated: true });
  }
}
