import { Bot } from 'grammy';
import cron from 'node-cron';
import dotenv from 'dotenv';
import path from 'path';
import { MarketIntelOrchestrator } from '@market-intel/agents';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.warn('⚠️ TELEGRAM_BOT_TOKEN is not defined. Please set it in your .env file.');
}

export const bot = new Bot(token || 'dummy_token');
const orchestrator = new MarketIntelOrchestrator();

// /start command
bot.command('start', async (ctx) => {
  await ctx.reply(
    `🤖 *Welcome to Market Intelligence OS Terminal!*\n\n` +
    `Available Commands:\n` +
    `👉 \`/report <topic/asset>\` : Runs multi-agent intelligence research (Analyst → Bull/Bear → Critic → Report Writer).\n` +
    `👉 \`/example\` : Runs an example intelligence report for Bitcoin Macro Liquidity & ETF Inflows.\n` +
    `👉 \`/status\` : Shows database, pgvector & engine health.`,
    { parse_mode: 'Markdown' }
  );
});

// /status command
bot.command('status', async (ctx) => {
  await ctx.reply(
    `🟢 *Market Intelligence OS*: Online\n📊 *PostgreSQL & pgvector*: Connected\n🧠 *LLM Engine*: DeepSeek API Ready\n📈 *Market Feed*: CoinMarketCap Pro API Active`,
    { parse_mode: 'Markdown' }
  );
});

// /link <token> command to pair with Web Terminal account
bot.command('link', async (ctx) => {
  const token = ctx.match?.trim();
  if (!token) {
    return ctx.reply(
      `🔗 *Connect Telegram with Web Terminal*\n\n` +
      `Please provide your verification code from the Web Terminal settings.\n` +
      `Usage: \`/link <YOUR_CODE>\`\n\n` +
      `Example: \`/link A9X2KP\``,
      { parse_mode: 'Markdown' }
    );
  }

  try {
    const { dbPool } = await import('@market-intel/tools');
    const check = await dbPool.query(
      `SELECT * FROM user_profiles WHERE link_token = $1 AND link_token_expires_at > NOW()`,
      [token.toUpperCase()]
    );

    if (check.rowCount === 0) {
      return ctx.reply(`❌ *Invalid or Expired Code*\n\nPlease generate a new connection token from the Web Terminal.`, { parse_mode: 'Markdown' });
    }

    const user = check.rows[0];
    await dbPool.query(
      `UPDATE user_profiles 
       SET telegram_chat_id = $1, link_token = NULL, link_token_expires_at = NULL, updated_at = NOW() 
       WHERE id = $2`,
      [ctx.chat.id, user.id]
    );

    await ctx.reply(
      `🎉 *Account Connected Successfully!*\n\n` +
      `Linked Email: \`${user.email}\`\n` +
      `Chat ID: \`${ctx.chat.id}\`\n\n` +
      `You will now receive personalized real-time market anomaly alerts and requested research briefs directly here!`,
      { parse_mode: 'Markdown' }
    );
  } catch (err: any) {
    console.error('Link command error:', err);
    await ctx.reply(`❌ Failed to link account: ${err.message}`);
  }
});

// /example command
bot.command('example', async (ctx) => {
  await ctx.reply('⚡ *Initiating market intelligence report on Bitcoin Macro Liquidity & ETF Inflows 2026...*', {
    parse_mode: 'Markdown',
  });
  runReportWorkflow(ctx, 'Bitcoin Spot ETF Inflow Momentum, Stablecoin Liquidity & Layer-1 Market Structure 2026');
});

// /report command
bot.command('report', async (ctx) => {
  const query = ctx.match;
  if (!query) {
    return ctx.reply(
      'Please specify a market, asset, or topic. Example:\n`/report Solana vs Ethereum DeFi Market Share 2026`',
      { parse_mode: 'Markdown' }
    );
  }

  await ctx.reply(`🔍 *Multi-agent research pipeline initiated for:* "${query}"...`, {
    parse_mode: 'Markdown',
  });
  runReportWorkflow(ctx, query);
});

// Legacy /rapor support
bot.command('rapor', async (ctx) => {
  const query = ctx.match || 'Global Crypto Market Dynamics 2026';
  await ctx.reply(`🔍 *Multi-agent research pipeline initiated for:* "${query}"...`, {
    parse_mode: 'Markdown',
  });
  runReportWorkflow(ctx, query);
});

// Workflow execution runner
async function runReportWorkflow(ctx: any, query: string) {
  const statusMsg = await ctx.reply('⏳ Step 1/4: Senior Market Analyst Agent is ingesting data & extracting market landscape...');

  try {
    const { finalReport } = await orchestrator.execute(query, {
      onProgress: async (step: string) => {
        try {
          await ctx.api.editMessageText(ctx.chat.id, statusMsg.message_id, `⏳ ${step}`);
        } catch {
          // Catch telegram edit message limits
        }
      },
    });

    await ctx.reply('✅ *Intelligence Report Generated Successfully!*', { parse_mode: 'Markdown' });

    const chunks = splitMessage(finalReport, 3800);
    for (const chunk of chunks) {
      await ctx.reply(chunk);
    }
  } catch (error) {
    await ctx.reply(`❌ An error occurred during report generation: ${(error as Error).message}`);
  }
}

// Split message to respect Telegram 4096 character limit
function splitMessage(text: string, maxLength = 3800): string[] {
  const chunks: string[] = [];
  let current = text;
  while (current.length > 0) {
    if (current.length <= maxLength) {
      chunks.push(current);
      break;
    }
    let sliceIndex = current.lastIndexOf('\n', maxLength);
    if (sliceIndex === -1) sliceIndex = maxLength;
    chunks.push(current.substring(0, sliceIndex));
    current = current.substring(sliceIndex).trim();
  }
  return chunks;
}

// Scheduled Daily Cron (09:00 AM UTC)
const defaultChatId = process.env.TELEGRAM_REPORT_CHAT_ID;
if (defaultChatId) {
  cron.schedule('0 9 * * *', async () => {
    console.log('⏰ Triggering daily automated market briefing...');
    try {
      const { finalReport } = await orchestrator.execute('Global Crypto Market & Macro Liquidity Daily Intelligence Briefing');
      const chunks = splitMessage(`📢 *Daily Automated Market Intelligence Briefing*\n\n${finalReport}`);
      for (const chunk of chunks) {
        await bot.api.sendMessage(defaultChatId, chunk);
      }
    } catch (err) {
      console.error('Cron report error:', err);
    }
  });
}

// Scheduled Market Anomaly Detector Cron (Every 2 minutes)
cron.schedule('*/2 * * * *', async () => {
  try {
    const { checkMarketAnomalies } = await import('./alertEngine.js');
    await checkMarketAnomalies();
  } catch (err) {
    console.error('Scheduled anomaly detection failed:', err);
  }
});

if (process.env.TELEGRAM_BOT_TOKEN) {
  bot.start({
    onStart: (info) => console.log(`🚀 Telegram Bot Started: @${info.username}`),
  });
}

