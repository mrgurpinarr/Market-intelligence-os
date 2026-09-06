/**
 * Agent Rolleri (Roles)
 */
export type AgentRole =
  | 'orchestrator'
  | 'researcher'
  | 'analyst'
  | 'web_agent'
  | 'bull'
  | 'bear'
  | 'critic'
  | 'report_writer';


/**
 * Ajanlar arası Mesaj Protokolü (Message Protocol)
 */
export interface AgentMessage {
  id: string;
  sender: AgentRole | 'user' | 'system';
  recipient?: AgentRole | 'all';
  content: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

/**
 * Kanıt / Veri Kaynağı Modeli (Evidence Store Item)
 */
export interface EvidenceItem {
  id: string;
  title: string;
  url?: string;
  source: string;
  snippet: string;
  timestamp: string;
  relevanceScore?: number;
  tags: string[];
}

/**
 * Ajan Çalışma Durumu (Agent Execution Context)
 */
export interface AgentContext {
  taskId: string;
  query: string;
  history: AgentMessage[];
  evidence: EvidenceItem[];
  state: Record<string, unknown>;
}
