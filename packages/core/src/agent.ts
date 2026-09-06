import { AgentContext, AgentMessage, AgentRole } from './types.js';
import { LLMClient, defaultLLM } from './llm.js';
import { ToolRegistry } from './tools.js';
import OpenAI from 'openai';

/**
 * BaseAgent: Tüm uzman ajanların miras alacağı temel sınıf
 */
export abstract class BaseAgent {
  public abstract readonly role: AgentRole;
  public abstract readonly name: string;
  public abstract readonly description: string;

  protected llm: LLMClient;
  public tools: ToolRegistry = new ToolRegistry();

  constructor(llmClient: LLMClient = defaultLLM) {
    this.llm = llmClient;
  }

  /**
   * Ajanın sistem promptu (Rolü ve davranış kuralları)
   */
  abstract getSystemPrompt(): string;

  /**
   * Ajanın ana çalışma döngüsü (Think & Act / ReAct Pattern)
   */
  abstract run(context: AgentContext): Promise<AgentMessage>;

  /**
   * ReAct (Reasoning + Acting) Döngüsü: LLM Tool çağırmak isterse çalıştırıp cevabı geri iletir
   */
  protected async executeReActLoop(
    userPrompt: string,
    maxIterations = 5
  ): Promise<string> {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: this.getSystemPrompt() },
      { role: 'user', content: userPrompt },
    ];

    let iterations = 0;

    while (iterations < maxIterations) {
      iterations++;
      const openAiTools = this.tools.toOpenAITools();

      const response = await this.llm.chatWithTools(messages, openAiTools);
      messages.push(response);

      // Tool çağırma isteği yoksa yanıtı döndür (Düşünme/Sonuç bitti)
      if (!response.tool_calls || response.tool_calls.length === 0) {
        return response.content || '';
      }

      // Tool çağrılarını paralel veya sıralı yürüt ve sonuçları mesaj geçmişine ekle
      for (const toolCall of response.tool_calls) {
        if (toolCall.type === 'function') {
          const toolResult = await this.tools.executeTool(
            toolCall.function.name,
            toolCall.function.arguments
          );

          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: toolResult,
          });
        }
      }
    }

    return 'Maksimum ReAct iterasyon sınırına ulaşıldı.';
  }

  /**
   * Yardımcı mesaj oluşturucu
   */
  protected createMessage(content: string, metadata?: Record<string, unknown>): AgentMessage {
    return {
      id: crypto.randomUUID(),
      sender: this.role,
      content,
      timestamp: Date.now(),
      metadata,
    };
  }
}
