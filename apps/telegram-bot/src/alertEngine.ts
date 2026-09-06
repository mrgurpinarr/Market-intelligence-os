import axios from 'axios';
import { dbPool } from '@market-intel/tools';
import { bot } from './index';

interface AnomalyAsset {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  change1h?: number;
  volume24h: number;
}

const CMC_API_KEY = process.env.CMC_API_KEY || '94abc0a5d19344a888a227fc68b61d65';
const BASE_URL = 'https://pro-api.coinmarketcap.com/v1';

// Cache to prevent duplicate alert spamming within 1 hour
const alertCache = new Map<string, number>();

export async function checkMarketAnomalies(): Promise<void> {
  try {
    const res = await axios.get(`${BASE_URL}/cryptocurrency/listings/latest`, {
      headers: {
        'X-CMC_PRO_API_KEY': CMC_API_KEY,
        Accept: 'application/json',
      },
      params: {
        limit: 50,
        convert: 'USD',
      },
      timeout: 10000,
    });

    const listings = res.data?.data || [];
    const anomalies: AnomalyAsset[] = [];

    for (const item of listings) {
      const quote = item.quote?.USD;
      const change24h = quote?.percent_change_24h || 0;
      const change1h = quote?.percent_change_1h || 0;

      // Anomaly trigger: 1h change > 3% OR 24h change absolute > 7%
      if (Math.abs(change1h) >= 3.0 || Math.abs(change24h) >= 7.0) {
        anomalies.push({
          symbol: item.symbol,
          name: item.name,
          price: quote?.price || 0,
          change24h: parseFloat(change24h.toFixed(2)),
          change1h: parseFloat(change1h.toFixed(2)),
          volume24h: quote?.volume_24h || 0,
        });
      }
    }

    if (anomalies.length === 0) {
      return;
    }

    // Get all users who linked their Telegram chat ID
    const usersResult = await dbPool.query<{ telegram_chat_id: number; email: string }>(
      `SELECT telegram_chat_id, email FROM user_profiles WHERE telegram_chat_id IS NOT NULL`
    );

    const targetChatIds = new Set<number>();
    usersResult.rows.forEach((u) => targetChatIds.add(Number(u.telegram_chat_id)));

    // Also include default channel/group if configured
    if (process.env.TELEGRAM_REPORT_CHAT_ID) {
      targetChatIds.add(Number(process.env.TELEGRAM_REPORT_CHAT_ID));
    }

    if (targetChatIds.size === 0) {
      return;
    }

    const now = Date.now();

    for (const asset of anomalies) {
      const cacheKey = `${asset.symbol}_${asset.change24h > 0 ? 'UP' : 'DOWN'}`;
      const lastSent = alertCache.get(cacheKey) || 0;

      // Only send if not alerted in the last 45 minutes
      if (now - lastSent < 45 * 60 * 1000) {
        continue;
      }

      alertCache.set(cacheKey, now);

      const isBullish = asset.change24h >= 0;
      const emoji = isBullish ? '🚀' : '🩸';
      const direction = isBullish ? 'SURGE' : 'DUMP / PLUNGE';

      const message =
        `🚨 *MARKET ANOMALY DETECTED*\n\n` +
        `${emoji} *${asset.name} (${asset.symbol})* is experiencing extreme volatility!\n\n` +
        `📊 *Direction:* ${direction}\n` +
        `💵 *Current Price:* $${asset.price < 1 ? asset.price.toFixed(4) : asset.price.toLocaleString()}\n` +
        `⏱️ *1h Change:* ${asset.change1h && asset.change1h >= 0 ? '+' : ''}${asset.change1h}%\n` +
        `📈 *24h Change:* ${asset.change24h >= 0 ? '+' : ''}${asset.change24h}%\n` +
        `💰 *24h Volume:* $${(asset.volume24h / 1_000_000).toFixed(2)}M\n\n` +
        `👉 Run \`/report ${asset.symbol}\` to start an autonomous multi-agent deep research investigation.`;

      for (const chatId of targetChatIds) {
        try {
          await bot.api.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        } catch (err) {
          console.error(`Failed to dispatch alert to chat ${chatId}:`, (err as Error).message);
        }
      }
    }
  } catch (error) {
    console.error('Market Anomaly Detector Error:', (error as Error).message);
  }
}
