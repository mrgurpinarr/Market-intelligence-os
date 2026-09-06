import { MarketIntelOrchestrator } from './orchestrator.js';

async function main() {
  const query = process.argv[2] || 'Global Crypto Market Structure, Bitcoin ETF Net Inflows & Layer-1 DeFi Liquidity 2026';
  console.log(`\n🚀 Market Intelligence Pipeline Initiating...`);
  console.log(`📌 Research Topic: "${query}"\n`);

  const orchestrator = new MarketIntelOrchestrator();

  const startTime = Date.now();
  const { finalReport } = await orchestrator.execute(query, {
    onProgress: (step: string) => {
      console.log(`[${new Date().toLocaleTimeString()}] ▶ ${step}`);
    },
  });

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n======================================================`);
  console.log(`🎉 INTELLIGENCE REPORT COMPLETED (${duration}s)`);
  console.log(`======================================================\n`);
  console.log(finalReport);
  console.log(`\n======================================================\n`);
  process.exit(0);
}

main().catch((err: Error) => {
  console.error('CLI execution error:', err);
  process.exit(1);
});
