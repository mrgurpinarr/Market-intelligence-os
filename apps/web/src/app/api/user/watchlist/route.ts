import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserWatchlist, addToWatchlist, removeFromWatchlist } from '@/lib/user';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ watchlist: [] });
  }

  try {
    const watchlist = await getUserWatchlist(session.user.email);
    return NextResponse.json({ watchlist });
  } catch (error: any) {
    console.error('Watchlist GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { symbol, action } = body;

    if (!symbol) {
      return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }

    if (action === 'remove') {
      await removeFromWatchlist(session.user.email, symbol);
    } else {
      await addToWatchlist(session.user.email, symbol);
    }

    const updated = await getUserWatchlist(session.user.email);
    return NextResponse.json({ success: true, watchlist: updated });
  } catch (error: any) {
    console.error('Watchlist POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
