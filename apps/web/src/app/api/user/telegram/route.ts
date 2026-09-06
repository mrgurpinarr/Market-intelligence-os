import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateTelegramLinkToken, getUserTelegramStatus } from '@/lib/user';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const status = await getUserTelegramStatus(session.user.email);
    return NextResponse.json(status);
  } catch (error: any) {
    console.error('Telegram status error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const token = await generateTelegramLinkToken(session.user.email);
    return NextResponse.json({ success: true, token, botUsername: 'Marketrapor_bot' });
  } catch (error: any) {
    console.error('Telegram link token generation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
