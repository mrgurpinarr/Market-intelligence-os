'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  FileText,
  TrendingUp,
  Search,
  LogIn,
  LogOut,
  User,
  Database,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Asset Analysis', href: '/dashboard/assets/BTC', icon: TrendingUp },
  { name: 'Research Terminal', href: '/dashboard/research', icon: FileText },
  { name: 'RAG Knowledge Vault', href: '/dashboard/knowledge', icon: Database },
];

export function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur">
      <div className="flex h-14 items-center justify-between px-6">
        {/* Brand & Market Status */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-primary/20 text-primary border border-primary/40 font-bold text-xs tracking-tighter">
              MI
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight">Market Intelligence OS</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
                Financial Research Terminal
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-2 pl-4 border-l">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-muted-foreground font-mono">MARKET LIVE</span>
            <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-mono">
              UTC
            </Badge>
          </div>
        </div>

        {/* Global Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Global Search & Google Auth / Profile */}
        <div className="flex items-center gap-3">
          <div className="relative w-56 hidden sm:block">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search assets... (⌘K)"
              className="h-8 w-full rounded-md border border-input bg-background/50 pl-8 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring font-mono"
            />
          </div>

          <div className="flex items-center gap-2 pl-3 border-l">
            {status === 'authenticated' && session?.user ? (
              <div className="flex items-center gap-2.5">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    className="h-7 w-7 rounded-full border border-primary/30"
                  />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold font-mono">
                    {session.user.name?.charAt(0) || 'U'}
                  </div>
                )}
                <div className="hidden xl:flex flex-col text-left">
                  <span className="text-xs font-medium leading-none">
                    {session.user.name || 'Trader'}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {session.user.email}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => signOut()}
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                  title="Sign out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={() => signIn('google')}
                className="h-8 text-xs gap-1.5 font-medium"
              >
                <LogIn className="h-3.5 w-3.5" /> Sign in with Google
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
