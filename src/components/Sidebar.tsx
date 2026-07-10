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
import { LINKS, ADMIN_LINKS } from "@/lib/sidebar-links";
import { useI18n } from "@/lib/i18n/context";

export default function Sidebar() {
  const { t } = useI18n();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [open, setOpen] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [friendRequests, setFriendRequests] = useState(0);
  const { hasFeature } = usePlan();

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
        aria-label={t("sidebar.menu_toggle")}
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
        {/* Logo + desktop toggle integrated */}
        {open ? (
          <div className="flex items-center py-5 px-6 gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/[.15] border border-accent/30 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="flex-1 whitespace-nowrap">
              <span className="font-display text-base font-bold tracking-tight">Trade Journal</span>
              <p className="text-[10px] text-paper-500 font-mono">{t("sidebar.trade_journal_sub")}</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg border border-ink-700 bg-ink-900 p-2 text-paper-300 hover:text-paper-100 transition hidden lg:flex"
              aria-label={t("sidebar.collapse")}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center py-4 gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent/[.15] border border-accent/30 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <button
              onClick={() => setOpen(true)}
              className="rounded-lg border border-ink-700 bg-ink-900 p-2 text-paper-300 hover:text-paper-100 transition hidden lg:flex"
              aria-label={t("sidebar.expand")}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Nav links */}
        <nav className="flex flex-col gap-1 px-2 py-2 flex-1 overflow-y-auto">
          {LINKS.filter((link) => {
            if (link.requiresFeature) return hasFeature(link.requiresFeature);
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
                title={open ? undefined : t(link.label)}
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
                {open && t(link.label)}
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
              {ADMIN_LINKS.map((link) => {
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
                    title={open ? undefined : t(link.label)}
                    onClick={() => { if (window.innerWidth < 1024) setOpen(false) }}
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={link.icon} />
                    </svg>
                    {open && t(link.label)}
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
            title={open ? undefined : t("sidebar.profile")}
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
