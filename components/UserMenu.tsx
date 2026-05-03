'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

function getInitials(name?: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (parts[0]?.[0] ?? '?').toUpperCase();
}

interface AvatarProps {
  image?: string | null;
  name?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Avatar({ image, name, size = 'md' }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-24 h-24 text-3xl',
  }[size];

  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt={name ?? 'User'}
        className={`${sizeClasses} rounded-full object-cover ring-2 ring-primary-500/30`}
        referrerPolicy="no-referrer"
      />
    );
  }
  return (
    <div
      className={`${sizeClasses} rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center font-bold text-white ring-2 ring-primary-500/30`}
    >
      {getInitials(name)}
    </div>
  );
}

export default function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  if (status === 'loading') {
    return <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />;
  }

  if (status === 'unauthenticated') {
    return (
      <Link
        href="/c3h/login"
        className="px-4 py-2 rounded-lg text-sm font-medium bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary-500/50 transition-all whitespace-nowrap"
      >
        Sign In
      </Link>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-primary-500/50 transition-all"
        aria-label="Open user menu"
      >
        <Avatar image={session?.user?.image} name={session?.user?.name} size="md" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl border border-white/15 shadow-2xl py-2 z-50 bg-gray-950 ring-1 ring-black/50">
          {/* User info card */}
          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Avatar image={session?.user?.image} name={session?.user?.name} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{session?.user?.name || 'Member'}</p>
                <p className="text-xs text-gray-400 truncate">{session?.user?.email}</p>
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 rounded-full bg-primary-500/20 border border-primary-500/30">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary-400"></span>
              </span>
              <span className="text-xs text-primary-300 font-semibold">Signed in to C3H</span>
            </div>
          </div>

          {/* Quick links */}
          <Link
            href="/c3h/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all"
          >
            <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            C3H Dashboard
          </Link>
          <Link
            href="/c3h/events"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all"
          >
            <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Events &amp; Calendar
          </Link>
          <Link
            href="/c3h/watch"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all"
          >
            <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            Watch Live
          </Link>
          <Link
            href="/c3h/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all"
          >
            <svg className="w-4 h-4 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile Settings
          </Link>

          {/* Sign out */}
          <div className="border-t border-white/10 mt-2 pt-2">
            <button
              onClick={() => {
                setOpen(false);
                signOut({ callbackUrl: '/' });
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline user card for the mobile menu — different from the dropdown
export function MobileUserCard({ onClose }: { onClose: () => void }) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="mx-4 mb-4 p-4 rounded-xl bg-white/5 animate-pulse h-20" />;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="mx-4 mb-4">
        <Link
          href="/c3h/login"
          onClick={onClose}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 font-semibold shadow-xl hover:shadow-primary-500/50 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          Sign In to C3H
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-4 mb-4 glass rounded-xl p-4 border border-primary-500/30">
      <div className="flex items-center gap-3 mb-3">
        <Avatar image={session?.user?.image} name={session?.user?.name} size="md" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">{session?.user?.name || 'Member'}</p>
          <p className="text-xs text-gray-400 truncate">{session?.user?.email}</p>
        </div>
      </div>
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-500/20 border border-primary-500/30 mb-3">
        <span className="w-1.5 h-1.5 rounded-full bg-primary-400"></span>
        <span className="text-xs text-primary-300 font-semibold">Signed in to C3H</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Link
          href="/c3h/profile"
          onClick={onClose}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 hover:bg-white/10 transition-all"
        >
          Profile
        </Link>
        <button
          onClick={() => {
            onClose();
            signOut({ callbackUrl: '/' });
          }}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 hover:bg-red-500/20 transition-all"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
