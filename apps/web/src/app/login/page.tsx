'use client';

import * as React from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <Card className="max-w-md w-full border bg-card/60">
        <CardHeader className="text-center p-6 pb-4 space-y-2">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-primary border border-primary/40 font-bold text-sm">
            MI
          </div>
          <CardTitle className="text-lg font-bold">
            Sign In to Market Intelligence OS
          </CardTitle>
          <CardDescription className="text-xs">
            Access autonomous multi-agent research briefings, real-time CoinMarketCap screener, and customized market alerts.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 pt-2 space-y-4">
          <Button
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            className="w-full text-xs font-medium h-10 gap-2"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google Account
          </Button>

          <div className="pt-2 border-t flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1 text-emerald-400 font-mono">
              <ShieldCheck className="h-3.5 w-3.5" /> NextAuth Secure Session
            </span>
            <Link href="/dashboard" className="text-primary hover:underline">
              Back to Terminal
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
