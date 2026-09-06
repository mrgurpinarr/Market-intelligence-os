import { AgentContext, AgentMessage } from '@market-intel/core';
import { WebIntelligenceAgent } from './webAgent.js';
import { AnalystAgent } from './analystAgent.js';
import { BullAgent } from './bullAgent.js';
import { BearAgent } from './bearAgent.js';
import { CriticAgent } from './criticAgent.js';
import { ReportWriterAgent } from './reportWriterAgent.js';

export interface WorkflowOptions {
  onProgress?: (step: string, message: AgentMessage) => void;
}

/**
 * Market Intelligence Multi-Agent Workflow Runner (Orchestrator)
 */
export class MarketIntelOrchestrator {
  private webAgent = new WebIntelligenceAgent();
  private analyst = new AnalystAgent();
  private bull = new BullAgent();
  private bear = new BearAgent();
  private critic = new CriticAgent();
  private reportWriter = new ReportWriterAgent();

  async execute(query: string, options?: WorkflowOptions): Promise<{ finalReport: string; context: AgentContext }> {
    const taskId = `task_${Date.now()}`;
    const context: AgentContext = {
      taskId,
      query,
      history: [],
      evidence: [],
      state: { startedAt: new Date().toISOString() },
    };

    // Step 0: Real-Time Web Intelligence Agent
    options?.onProgress?.('Web Intelligence Agent is searching live financial sources and scraping current market metrics...', {
      id: crypto.randomUUID(),
      sender: 'orchestrator',
      content: `Live web discovery started: ${query}`,
      timestamp: Date.now(),
    });

    const webMsg = await this.webAgent.run(context);
    context.history.push(webMsg);
    options?.onProgress?.('Web Intelligence Agent extracted live signals and market evidence.', webMsg);

    // Step 1: Analyst Data & Trend Ingestion
    options?.onProgress?.('Analyst Agent is synthesizing market dynamics from live and vector evidence...', {
      id: crypto.randomUUID(),
      sender: 'orchestrator',
      content: `Analysis initiated: ${query}`,
      timestamp: Date.now(),
    });

    const analystMsg = await this.analyst.run(context);
    context.history.push(analystMsg);
    options?.onProgress?.('Analyst assessment completed.', analystMsg);

    // Step 2: Parallel Bull & Bear Formulations
    options?.onProgress?.('Formulating Bull (Opportunity) and Bear (Risk) theses in parallel...', {
      id: crypto.randomUUID(),
      sender: 'orchestrator',
      content: 'Bull and Bear analysis initiated.',
      timestamp: Date.now(),
    });

    const [bullMsg, bearMsg] = await Promise.all([
      this.bull.run(context),
      this.bear.run(context),
    ]);

    context.history.push(bullMsg);
    context.history.push(bearMsg);
    options?.onProgress?.('Bull thesis generated.', bullMsg);
    options?.onProgress?.('Bear thesis generated.', bearMsg);

    // Step 3: Critic Agent Validation & Synthesis
    options?.onProgress?.('Critic Agent is auditing claims and resolving contradictions...', {
      id: crypto.randomUUID(),
      sender: 'orchestrator',
      content: 'Critic validation initiated.',
      timestamp: Date.now(),
    });

    const criticMsg = await this.critic.run(context);
    context.history.push(criticMsg);
    options?.onProgress?.('Critic synthesis completed.', criticMsg);

    // Step 4: Report Writer Executive Briefing Compilation
    options?.onProgress?.('Report Writer is compiling final executive intelligence report...', {
      id: crypto.randomUUID(),
      sender: 'orchestrator',
      content: 'Report compilation initiated.',
      timestamp: Date.now(),
    });

    const reportMsg = await this.reportWriter.run(context);
    context.history.push(reportMsg);
    options?.onProgress?.('Executive intelligence report completed and persisted to database.', reportMsg);

    return {
      finalReport: reportMsg.content,
      context,
    };
  }
}
