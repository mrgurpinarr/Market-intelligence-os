import { NextResponse } from 'next/server';
import { getLiveMarketOverview, getLiveTopAssets } from '@/lib/cmc';

export const revalidate = 60; // 60 saniyede bir dinamik cache yenileme

export async function GET() {
  try {
    const [overview, assets] = await Promise.all([
      getLiveMarketOverview(),
      getLiveTopAssets(20),
    ]);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      overview,
      assets,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
