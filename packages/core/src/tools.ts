import { z } from 'zod';

/**
 * Ajanların çalıştırabileceği her aracın standart arayüzü
 */
export interface AgentTool<TInput = any, TOutput = any> {
  name: string;
  description: string;
  schema: z.ZodType<TInput>;
  execute: (input: TInput) => Promise<TOutput>;
}

/**
 * Tool Registry - Ajanların araçlarını kaydettiği ve yönettiği kayıt defteri
 */
export class ToolRegistry {
  private tools: Map<string, AgentTool> = new Map();

  register(tool: AgentTool): void {
    this.tools.set(tool.name, tool);
  }

  get(name: string): AgentTool | undefined {
    return this.tools.get(name);
  }

  getAll(): AgentTool[] {
    return Array.from(this.tools.values());
  }

  /**
   * DeepSeek / OpenAI Function Calling formatına dönüştürücü
   */
  toOpenAITools() {
    return this.getAll().map((t) => ({
      type: 'function' as const,
      function: {
        name: t.name,
        description: t.description,
        parameters: zodToJsonSchema(t.schema),
      },
    }));
  }

  /**
   * Bir aracın fonksiyon çağrısını yakalayıp çalıştırır
   */
  async executeTool(name: string, rawArgs: string): Promise<string> {
    const tool = this.get(name);
    if (!tool) {
      throw new Error(`Tool bulunamadı: ${name}`);
    }

    try {
      const parsedArgs = JSON.parse(rawArgs);
      const validatedArgs = tool.schema.parse(parsedArgs);
      const result = await tool.execute(validatedArgs);
      return typeof result === 'string' ? result : JSON.stringify(result);
    } catch (err) {
      return JSON.stringify({
        error: `Tool yürütme hatası (${name}): ${(err as Error).message}`,
      });
    }
  }
}

/**
 * Basit Zod -> JSON Schema Çevirici (Primitive/Object desteği)
 */
function zodToJsonSchema(schema: z.ZodType<any>): Record<string, any> {
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const properties: Record<string, any> = {};
    const required: string[] = [];

    for (const key in shape) {
      const field = shape[key];
      properties[key] = zodFieldToJsonSchema(field);
      if (!(field instanceof z.ZodOptional)) {
        required.push(key);
      }
    }

    return {
      type: 'object',
      properties,
      required: required.length > 0 ? required : undefined,
    };
  }

  return { type: 'object', properties: {} };
}

function zodFieldToJsonSchema(field: z.ZodTypeAny): Record<string, any> {
  if (field instanceof z.ZodString) return { type: 'string', description: field.description };
  if (field instanceof z.ZodNumber) return { type: 'number', description: field.description };
  if (field instanceof z.ZodBoolean) return { type: 'boolean', description: field.description };
  if (field instanceof z.ZodArray) return { type: 'array', items: zodFieldToJsonSchema(field.element) };
  if (field instanceof z.ZodOptional) return zodFieldToJsonSchema(field.unwrap());
  return { type: 'string' };
}
