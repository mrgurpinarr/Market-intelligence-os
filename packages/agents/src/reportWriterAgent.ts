import { BaseAgent, AgentContext, AgentMessage, AgentRole, LLMClient } from '@market-intel/core';
import { dbPool } from '@market-intel/tools';

export class ReportWriterAgent extends BaseAgent {
  public readonly role: AgentRole = 'report_writer';
  public readonly name = 'Chief Report Writer';
  public readonly description = 'Synthesizes Analyst, Bull, Bear, and Critic outputs into a world-class executive intelligence report.';

  constructor(llmClient?: LLMClient) {
    super(llmClient);
  }

  getSystemPrompt(): string {
    return `You are the Chief Intelligence Report Writer preparing high-stakes strategic intelligence briefings for executive decision-makers (C-Level, Founders, Investors).
Your Objectives:
1. Synthesize the findings of the Analyst, Bull, Bear, and Critic agents into a cohesive, articulate, and impactful Markdown report.
2. The report must adhere strictly to the following structure:
   # [Market / Asset Title] — Strategic Market Intelligence Report
   ## 📌 1. Executive Summary
   ## 📊 2. Market Landscape & Dynamics
   ## 🚀 3. Growth Vectors & Opportunity (Bull Case)
   ## ⚠️ 4. Key Risks & Competitive Headwinds (Bear Case)
   ## ⚖️ 5. Critic Synthesis & Dialectical Resolution
   ## 🎯 6. Strategic Recommendations & Action Items
Your tone must be authoritative, objective, actionable, and executive-ready.`;
  }

  async run(context: AgentContext): Promise<AgentMessage> {
    const fullHistory = context.history
      .map((m) => `## [${m.sender.toUpperCase()} AGENT ANALYSIS]:\n${m.content}`)
      .join('\n\n---\n\n');

    const prompt = `Research Topic: "${context.query}"\n\nAgent Outputs & Findings:\n${fullHistory}\n\nPlease synthesize all findings into a complete, professional Executive Market Intelligence Report in Markdown format.`;

    const reportMarkdown = await this.llm.generateText(this.getSystemPrompt(), prompt);

    // Save report to PostgreSQL
    try {
      await dbPool.query(
        `INSERT INTO market_reports (task_id, title, query, summary, content, perspectives, critique)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          context.taskId,
          `${context.query} Intelligence Report`,
          context.query,
          reportMarkdown.slice(0, 500) + '...',
          reportMarkdown,
          JSON.stringify({
            historyCount: context.history.length,
          }),
          JSON.stringify({
            generatedAt: new Date().toISOString(),
          }),
        ]
      );
    } catch (err) {
      console.error('Report DB insert error:', (err as Error).message);
    }

    return this.createMessage(reportMarkdown, {
      reportType: 'market_intelligence',
      generatedAt: new Date().toISOString(),
    });
  }
}
