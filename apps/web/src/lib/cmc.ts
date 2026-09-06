import { MarketOverviewMetric, TrackedAsset } from '../types/market';
import { formatCurrency } from '../lib/utils';

const CMC_API_KEY = process.env.CMC_API_KEY || '94abc0a5d19344a888a227fc68b61d65';
const BASE_URL = 'https://pro-api.coinmarketcap.com/v1';

/**
 * 1. Fetch Global Market Overview Metrics via Native Fetch
 */
export async function getLiveMarketOverview(): Promise<MarketOverviewMetric[]> {
  try {
    const res = await fetch(`${BASE_URL}/global-metrics/quotes/latest`, {
      headers: {
        'X-CMC_PRO_API_KEY': CMC_API_KEY,
        Accept: 'application/json',
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error(`CMC API error: ${res.statusText}`);
    }

    const json = await res.json();
    const data = json?.data;
    const usd = data?.quote?.USD;

    const totalCap = usd?.total_market_cap || 0;
    const totalVolume = usd?.total_volume_24h || 0;
    const btcDominance = data?.btc_dominance || 0;
    const activeCryptos = data?.active_cryptocurrencies || 0;
    const capChange24h = usd?.total_market_cap_yesterday_percentage_change || 0;
    const volumeChange24h = usd?.total_volume_24h_yesterday_percentage_change || 0;

    return [
      {
        title: 'Total Crypto Market Cap',
        value: formatCurrency(totalCap, 2),
        change: `${capChange24h >= 0 ? '+' : ''}${capChange24h.toFixed(2)}%`,
        changePercent: parseFloat(capChange24h.toFixed(2)),
        period: '24h',
        isPositive: capChange24h >= 0,
      },
      {
        title: '24h Total Volume',
        value: formatCurrency(totalVolume, 2),
        change: `${volumeChange24h >= 0 ? '+' : ''}${volumeChange24h.toFixed(2)}%`,
        changePercent: parseFloat(volumeChange24h.toFixed(2)),
        period: '24h',
        isPositive: volumeChange24h >= 0,
      },
      {
        title: 'BTC Dominance',
        value: `${btcDominance.toFixed(1)}%`,
        change: `${(data?.btc_dominance_24h_percentage_change || 0) >= 0 ? '+' : ''}${(data?.btc_dominance_24h_percentage_change || 0).toFixed(2)}%`,
        changePercent: parseFloat((data?.btc_dominance_24h_percentage_change || 0).toFixed(2)),
        period: '24h',
        isPositive: (data?.btc_dominance_24h_percentage_change || 0) >= 0,
      },
      {
        title: 'DeFi Market Cap',
        value: formatCurrency(usd?.defi_market_cap || 0, 2),
        change: `+${(usd?.defi_24h_percentage_change || 0).toFixed(1)}%`,
        changePercent: parseFloat((usd?.defi_24h_percentage_change || 0).toFixed(1)),
        period: '24h',
        isPositive: true,
      },
      {
        title: 'Active Cryptos',
        value: activeCryptos.toLocaleString(),
        change: `+${data?.past_24h_incremental_crypto_number || 0}`,
        changePercent: 1.2,
        period: '24h',
        isPositive: true,
      },
    ];
  } catch (error) {
    console.error('CMC Global Metrics API Error:', (error as Error).message);
    return [];
  }
}

/**
 * 2. Fetch Top Cryptocurrencies from CMC via Native Fetch
 */
export async function getLiveTopAssets(limit = 15): Promise<TrackedAsset[]> {
  try {
    const res = await fetch(`${BASE_URL}/cryptocurrency/listings/latest?limit=${limit}&convert=USD`, {
      headers: {
        'X-CMC_PRO_API_KEY': CMC_API_KEY,
        Accept: 'application/json',
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error(`CMC API error: ${res.statusText}`);
    }

    const json = await res.json();
    const list = json?.data || [];
    return list.map((item: any, idx: number) => {
      const quote = item.quote?.USD;
      const price = quote?.price || 0;
      const change24h = quote?.percent_change_24h || 0;
      const change7d = quote?.percent_change_7d || 0;

      const p7d = price / (1 + change7d / 100);
      const p24h = price / (1 + change24h / 100);
      const sparkline = [
        p7d,
        (p7d + p24h) / 2,
        p24h,
        (p24h + price) / 2 * 0.98,
        price * 0.99,
        price,
      ];

      return {
        symbol: item.symbol,
        name: item.name,
        price,
        change24h: parseFloat(change24h.toFixed(2)),
        change7d: parseFloat(change7d.toFixed(2)),
        marketCap: quote?.market_cap || 0,
        volume24h: quote?.volume_24h || 0,
        rank: item.cmc_rank || idx + 1,
        sparkline,
        category: 'crypto' as const,
      };
    });
  } catch (error) {
    console.error('CMC Top Assets API Error:', (error as Error).message);
    return [];
  }
}
