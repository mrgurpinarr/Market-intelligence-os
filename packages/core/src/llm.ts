import OpenAI from 'openai';
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

export interface LLMConfig {
  apiKey?: string;
  baseURL?: string;
  model?: string;
  temperature?: number;
}

export class LLMClient {
  private client: OpenAI;
  private defaultModel: string;
  private defaultTemperature: number;

  constructor(config?: LLMConfig) {
    const apiKey = config?.apiKey || process.env.DEEPSEEK_API_KEY || '';
    const baseURL = config?.baseURL || process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';
    
    this.defaultModel = config?.model || process.env.DEEPSEEK_MODEL || 'deepseek-chat';
    this.defaultTemperature = config?.temperature ?? 0.3;

    this.client = new OpenAI({
      apiKey,
      baseURL,
    });
  }

  /**
   * Plain text completion call
   */
  async generateText(
    systemPrompt: string,
    userPrompt: string,
    options?: { model?: string; temperature?: number }
  ): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: options?.model || this.defaultModel,
      temperature: options?.temperature ?? this.defaultTemperature,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    return response.choices[0]?.message?.content || '';
  }

  /**
   * Structured Output with Zod Schema Validation
   */
  async generateStructured<T>(
    systemPrompt: string,
    userPrompt: string,
    schema: z.ZodType<T>,
    options?: { model?: string; temperature?: number }
  ): Promise<T> {
    const jsonInstructions = `
CRITICAL INSTRUCTION: Respond ONLY with a valid JSON object matching the requested format. Do NOT wrap in markdown code blocks (\`\`\`json) or include any introductory/concluding remarks. Output pure JSON string only.
`;

    const fullSystemPrompt = `${systemPrompt}\n${jsonInstructions}`;

    const rawResponse = await this.generateText(fullSystemPrompt, userPrompt, {
      ...options,
      model: options?.model || this.defaultModel,
    });

    let cleaned = rawResponse.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    try {
      const parsed = JSON.parse(cleaned);
      return schema.parse(parsed);
    } catch (error) {
      throw new Error(
        `LLM JSON output did not match schema: ${(error as Error).message}\nRaw Output: ${rawResponse}`
      );
    }
  }

  /**
   * OpenAI / DeepSeek Compatible Tool Calling
   */
  async chatWithTools(
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    tools: OpenAI.Chat.Completions.ChatCompletionTool[],
    options?: { model?: string; temperature?: number }
  ): Promise<OpenAI.Chat.Completions.ChatCompletionMessage> {
    const response = await this.client.chat.completions.create({
      model: options?.model || this.defaultModel,
      temperature: options?.temperature ?? this.defaultTemperature,
      messages,
      tools: tools.length > 0 ? tools : undefined,
    });

    return response.choices[0].message;
  }
}

export const defaultLLM = new LLMClient();
