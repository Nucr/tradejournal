"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { subscribeToProfile } from "@/lib/profile";
import { subscribeToConversations, getUnreadCounts } from "@/lib/messages";
import { Conversation, UserProfile } from "@/lib/types";
import ThemeToggle from "./ThemeToggle";
import { usePlan } from "@/lib/features";

const LINKS = [
  {
    href: "/dashboard",
    label: "Genel Bak\u0131\u015f",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/dashboard/journal",
    label: "Trade Defteri",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    href: "/dashboard/profile",
    label: "Profil",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/messages",
    label: "Mesajlar",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/friends",
    label: "Arkadaşlar",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/users",
    label: "Kullan\u0131c\u0131lar",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/calendar",
    label: "\u0130\u015flem Takvimi",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/analytics",
    label: "Analitik",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/strategies",
    label: "Stratejiler",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/leaderboard",
    label: "Liderlik",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/reports",
    label: "Raporlar",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/settings",
    label: "Ayarlar",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [open, setOpen] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [friendRequests, setFriendRequests] = useState(0);
  const { hasFeature } = usePlan();
  const canCalendar = hasFeature("calendar");
  const canMessaging = hasFeature("messaging");

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToProfile(user.uid, setProfile);
    return unsub;
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToConversations(user.uid, (list) => {
      getUnreadCounts(user.uid, list).then((counts) => {
        let total = 0;
        counts.forEach((c) => { total += c; });
        setUnreadCount(total);
      }).catch(() => {});
    });
    return unsub;
  }, [user]);

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  const avatarLetter = (profile?.displayName || user?.displayName || user?.email || "?")[0].toUpperCase();
  const avatarColor = profile?.avatarColor || "#2ED9A4";

  return (
    <>
      {/* Mobile toggle button — fixed, visible only on mobile */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed top-4 left-4 z-50 rounded-lg border border-ink-700 bg-ink-900 p-2 text-paper-300 hover:text-paper-100 transition lg:hidden"
        aria-label="Menüyü aç/kapa"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Backdrop overlay on mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          bg-ink-900 border-r border-ink-800
          flex flex-col overflow-hidden
          transition-all duration-200
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:sticky lg:top-0 lg:self-start lg:min-h-screen lg:shrink-0
          ${open ? "w-64" : "w-16"}
        `}
      >
        {/* Desktop toggle button */}
        <button
          onClick={() => setOpen((v) => !v)}
          className={`hidden lg:absolute lg:flex top-4 z-50 rounded-lg border border-ink-700 bg-ink-900 p-2 text-paper-300 hover:text-paper-100 transition items-center justify-center ${
            open ? "right-3" : "left-1/2 -translate-x-1/2"
          }`}
          aria-label="Menüyü aç/kapa"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            )}
          </svg>
        </button>

        {/* Logo */}
        <div className={`flex items-center py-5 ${open ? "px-6 gap-3" : "px-4 justify-center"}`}>
          <div className="w-8 h-8 rounded-lg bg-accent/[.15] border border-accent/30 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          {open && (
            <div className="whitespace-nowrap">
              <span className="font-display text-base font-bold tracking-tight">Trade Journal</span>
              <p className="text-[10px] text-paper-500 font-mono">{'\u0130'}şlem Günlüğü</p>
            </div>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 px-2 py-2 flex-1 overflow-y-auto">
          {LINKS.filter((link) => {
            if (link.href === "/dashboard/calendar") return canCalendar;
            if (link.href === "/dashboard/messages") return canMessaging;
            return true;
          }).map((link) => {
            const active = pathname === link.href;
            const showBadge = link.href === "/dashboard/messages" && unreadCount > 0;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition whitespace-nowrap ${
                  active
                    ? "bg-accent/10 text-accent border border-accent/20"
                    : "text-paper-300 hover:bg-ink-800 hover:text-paper-100"
                } ${open ? "" : "justify-center px-0"}`}
                title={open ? undefined : link.label}
                onClick={() => { if (window.innerWidth < 1024) setOpen(false) }}
              >
                <div className="relative">
                  {link.icon}
                  {showBadge && (
                    <span className="absolute -top-1.5 -right-1.5 bg-coral-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 leading-none">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </div>
                {open && link.label}
              </Link>
            );
          })}
        </nav>

        {/* Admin section */}
        {profile?.role === "admin" && (
          <div className="px-2 py-1">
            <p className={`text-[10px] uppercase tracking-wider text-amber-500/60 font-semibold mb-1 ${open ? "px-3" : "text-center"}`}>
              {open ? "Admin" : "A"}
            </p>
            <nav className="flex flex-col gap-1">
              {[
                { href: "/dashboard/admin", label: "Panel", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
                { href: "/dashboard/admin/users", label: "Kullanıcılar", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
                { href: "/dashboard/admin/trades", label: "İşlemler", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
                { href: "/dashboard/admin/strategies", label: "Stratejiler", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
                { href: "/dashboard/admin/leaderboard", label: "Liderlik", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
              ].map((link) => {
                const active = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition whitespace-nowrap ${
                      active
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "text-paper-400 hover:bg-ink-800 hover:text-paper-200"
                    } ${open ? "" : "justify-center px-0"}`}
                    title={open ? undefined : link.label}
                    onClick={() => { if (window.innerWidth < 1024) setOpen(false) }}
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={link.icon} />
                    </svg>
                    {open && link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        {/* Bottom section */}
        <div className={`flex flex-col px-3 py-4 border-t border-ink-800 gap-2 ${open ? "" : "items-center px-0"}`}>
          <ThemeToggle showLabel={open} />

          <Link
            href="/dashboard/profile"
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-ink-800 transition ${open ? "" : "justify-center px-0"}`}
            title={open ? undefined : "Profil"}
            onClick={() => { if (window.innerWidth < 1024) setOpen(false) }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-ink-950 shrink-0"
              style={{ backgroundColor: avatarColor }}
            >
              {avatarLetter}
            </div>
            {open && (
              <div className="min-w-0">
                <p className="text-sm font-medium text-paper-100 truncate">
                  {profile?.displayName || user?.displayName || "Trader"}
                </p>
                <p className="text-xs text-paper-500 font-mono truncate">{user?.email}</p>
              </div>
            )}
          </Link>

          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-left text-paper-300 hover:bg-ink-800 hover:text-coral-400 transition ${open ? "w-full" : "justify-center px-0"}`}
            title={open ? undefined : "Çıkış yap"}
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {open && "Çıkış yap"}
          </button>
        </div>
      </aside>
    </>
  );
}
