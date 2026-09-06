'use client';

import * as React from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Send, CheckCircle2, Copy, RefreshCw, Smartphone } from 'lucide-react';

export function TelegramIntegrationCard() {
  const { data: session } = useSession();
  const [status, setStatus] = React.useState<{ linked: boolean; chatId?: number | null; linkToken?: string | null }>({
    linked: false,
  });
  const [loading, setLoading] = React.useState(false);
  const [token, setToken] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  const fetchStatus = React.useCallback(async () => {
    if (!session?.user?.email) return;
    try {
      const res = await fetch('/api/user/telegram');
      const data = await res.json();
      setStatus(data);
      if (data.linkToken) {
        setToken(data.linkToken);
      }
    } catch (err) {
      console.error('Error loading Telegram status:', err);
    }
  }, [session]);

  React.useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const generateCode = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/telegram', { method: 'POST' });
      const data = await res.json();
      if (data.token) {
        setToken(data.token);
      }
    } catch (err) {
      console.error('Error generating token:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!token) return;
    navigator.clipboard.writeText(`/link ${token}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border bg-card/60">
      <CardHeader className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Send className="h-4 w-4 text-sky-400" />
            <CardTitle className="text-sm font-semibold">Telegram Bot Account Sync</CardTitle>
          </div>
          {status.linked ? (
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] gap-1">
              <CheckCircle2 className="h-3 w-3" /> Connected
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] text-muted-foreground font-mono">
              Not Connected
            </Badge>
          )}
        </div>
        <CardDescription className="text-xs">
          Connect your Web Terminal account to <strong>@Marketrapor_bot</strong> to receive instant AI research reports and price surge alerts directly to your phone.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {status.linked ? (
          <div className="rounded-lg border bg-background/50 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Connected Chat ID:</span>
              <span className="font-mono font-bold text-foreground">{status.chatId}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Real-time Push Alerts:</span>
              <span className="text-emerald-400 font-medium">Enabled (Active)</span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {token ? (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Send this command to <a href="https://t.me/Marketrapor_bot" target="_blank" rel="noreferrer" className="text-sky-400 underline font-medium">@Marketrapor_bot</a>:
                </p>
                <div className="flex items-center gap-2 bg-background border p-2.5 rounded-lg">
                  <span className="font-mono text-xs font-bold text-primary flex-1 tracking-wider">
                    /link {token}
                  </span>
                  <Button size="sm" variant="outline" onClick={copyToClipboard} className="h-7 text-xs gap-1">
                    <Copy className="h-3 w-3" /> {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-muted-foreground">Code valid for 15 minutes</span>
                  <button
                    onClick={fetchStatus}
                    className="text-[10px] text-sky-400 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="h-2.5 w-2.5" /> Check Status
                  </button>
                </div>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={generateCode}
                disabled={loading || !session?.user}
                className="w-full text-xs font-medium gap-1.5 bg-sky-600 hover:bg-sky-500 text-white"
              >
                <Smartphone className="h-3.5 w-3.5" />
                {session?.user ? (loading ? 'Generating Code...' : 'Connect Telegram Account') : 'Sign In to Connect Telegram'}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
