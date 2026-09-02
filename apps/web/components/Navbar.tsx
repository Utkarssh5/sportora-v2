'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Trophy,
  Users,
  User,
  PlusCircle,
  ShoppingBag,
  Sun,
  Moon,
  Menu,
  X,
  ArrowUpRight,
} from 'lucide-react';
import AuthModal from './AuthModal';
import { useTheme } from '../context/ThemeContext';

const NAV_ITEMS = [
  {
    href: '/',
    label: 'Arena Hub',
    icon: Trophy,
    accent: '#00FF66',
  },
  {
    href: '/organizer',
    label: 'Host Event',
    icon: PlusCircle,
    accent: '#22D3EE',
  },
  {
    href: '/crew',
    label: 'Ground Crew',
    icon: Users,
    accent: '#FBBF24',
  },
  {
    href: '/store',
    label: 'Sponsor Store',
    icon: ShoppingBag,
    accent: '#FBBF24',
  },
  {
    href: '/profile',
    label: 'My Profile',
    icon: User,
    accent: '#00FF66',
  },
];

export default function Navbar() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<{
    id: string;
    fullName: string;
    email: string;
    role: string;
  } | null>(null);

  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  const visibleNavItems = NAV_ITEMS.filter(
    (item) =>
      item.href !== '/organizer' ||
      user?.role === 'ORGANIZER' ||
      user?.role === 'ADMIN',
  );

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch('/api/user/profile', {
          credentials: 'include',
          cache: 'no-store',
        });

        const data = await response.json();
        const profile = data?.profile;

        if (response.ok && data?.success && profile) {
          const currentUser = {
            id: profile._id || profile.id,
            fullName: profile.fullName || '',
            email: profile.email || '',
            role: profile.role || 'PLAYER',
          };

          setUser(currentUser);
          localStorage.setItem(
            'sportoraUser',
            JSON.stringify(currentUser),
          );
          return;
        }

        const storedUser = localStorage.getItem('sportoraUser');

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          setUser(null);
        }
      } catch {
        try {
          const storedUser = localStorage.getItem('sportoraUser');

          if (storedUser) {
            setUser(JSON.parse(storedUser));
          } else {
            setUser(null);
          }
        } catch {
          localStorage.removeItem('sportoraUser');
          setUser(null);
        }
      }
    };

    loadUser();

    const handleAuthChange = () => {
      loadUser();
    };

    window.addEventListener(
      'sportora-auth-change',
      handleAuthChange,
    );

    return () => {
      window.removeEventListener(
        'sportora-auth-change',
        handleAuthChange,
      );
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, {
      passive: true,
    });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <nav className="fixed left-0 right-0 top-0 z-50 px-3 py-3 sm:px-5">
        <div
          className={`mx-auto flex max-w-7xl items-center justify-between rounded-2xl border transition-all duration-500 ${
            scrolled
              ? 'border-white/15 bg-black/75 px-4 py-3 shadow-2xl shadow-black/30 backdrop-blur-2xl'
              : 'border-white/10 bg-black/35 px-4 py-4 backdrop-blur-xl sm:px-5'
          }`}
        >
          {/* Logo */}
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-2.5"
          >
            <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-[#00FF66] text-black shadow-[0_0_25px_rgba(0,255,102,0.18)] transition-transform duration-300 group-hover:rotate-[-6deg] group-hover:scale-110">
              <span className="relative z-10 text-lg font-black">S</span>

              <span className="absolute -inset-5 translate-x-[-100%] rotate-12 bg-white/60 transition-transform duration-700 group-hover:translate-x-[100%]" />
            </div>

            <div className="hidden sm:block">
              <div className="text-[15px] font-black tracking-[-0.04em] text-white">
                SPORTORA<span className="text-[#00FF66]">.V2</span>
              </div>

              <div className="text-[7px] font-black tracking-[0.3em] text-white/25">
                SPORTS ECOSYSTEM
              </div>
            </div>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden items-center gap-1 lg:flex">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const active =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-[9px] font-black uppercase tracking-[0.14em] transition-all duration-300 ${
                    active
                      ? 'bg-white/[0.07] text-white'
                      : 'text-white/35 hover:bg-white/[0.04] hover:text-white'
                  }`}
                >
                  <Icon
                    className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5"
                    style={{ color: item.accent }}
                  />

                  {item.label}

                  {active && (
                    <span
                      className="absolute bottom-1 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full"
                      style={{
                        backgroundColor: item.accent,
                        boxShadow: `0 0 10px ${item.accent}`,
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Theme */}
            <button
              onClick={toggleTheme}
              aria-label="Switch theme"
              title="Switch Theme"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-amber-400 transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:scale-105"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-500" />
              )}
            </button>

            {/* Auth */}
            {user ? (
              <div className="hidden items-center gap-2 sm:flex">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 rounded-xl border border-[#00FF66]/30 bg-[#00FF66]/10 px-3 py-2.5 transition-all duration-300 hover:bg-[#00FF66]/20"
                >
                  <User className="h-3.5 w-3.5 text-[#00FF66]" />
                  <span className="max-w-[120px] truncate text-[9px] font-black uppercase tracking-[0.12em] text-white">
                    {user.fullName}
                  </span>
                  {user.role === 'ORGANIZER' && (
                    <span className="rounded-md bg-cyan-400/15 px-1.5 py-0.5 text-[7px] font-black tracking-widest text-cyan-300">
                      ORGANIZER
                    </span>
                  )}
                </Link>

                <button
                  onClick={async () => {
                    try {
                      await fetch('/api/auth/logout', {
                        method: 'POST',
                        credentials: 'include',
                      });
                    } finally {
                      localStorage.removeItem('sportoraUser');
                      setUser(null);
                      window.location.href = '/';
                    }
                  }}
                  className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2.5 text-[8px] font-black tracking-[0.12em] text-white/60 transition-all hover:border-red-400/30 hover:bg-red-400/10 hover:text-red-300"
                >
                  LOGOUT
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="hidden items-center gap-2 rounded-xl border border-[#00FF66]/30 bg-[#00FF66]/10 px-4 py-2.5 text-[9px] font-black tracking-[0.15em] text-[#00FF66] transition-all duration-300 hover:bg-[#00FF66] hover:text-black hover:shadow-[0_0_25px_rgba(0,255,102,0.18)] sm:flex"
              >
                <User className="h-3.5 w-3.5" />
                LOGIN
              </button>
            )}

            {/* Mobile menu */}
            <button
              onClick={() => setIsMobileOpen((value) => !value)}
              aria-label="Toggle navigation menu"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white transition-all hover:bg-white/10 lg:hidden"
            >
              {isMobileOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        <div
          className={`mx-auto mt-2 max-w-7xl overflow-hidden rounded-2xl border border-white/10 bg-black/90 backdrop-blur-2xl transition-all duration-300 lg:hidden ${
            isMobileOpen
              ? 'max-h-[500px] translate-y-0 opacity-100'
              : 'pointer-events-none max-h-0 -translate-y-2 opacity-0'
          }`}
        >
          <div className="p-3">
            {visibleNavItems.map((item, index) => {
              const Icon = item.icon;
              const active =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);

              return (
                <MotionNavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  Icon={Icon}
                  accent={item.accent}
                  active={active}
                  index={index}
                />
              );
            })}

            <div className="my-2 h-px bg-white/10" />

            {user ? (
              <div className="space-y-2">
                <Link
                  href="/profile"
                  onClick={() => setIsMobileOpen(false)}
                  className="flex w-full items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-[10px] font-black tracking-[0.12em] text-white"
                >
                  <span className="flex items-center gap-2">
                    <User className="h-4 w-4 text-[#00FF66]" />
                    {user.fullName}
                  </span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>

                <button
                  onClick={async () => {
                    try {
                      await fetch('/api/auth/logout', {
                        method: 'POST',
                        credentials: 'include',
                      });
                    } finally {
                      localStorage.removeItem('sportoraUser');
                      setUser(null);
                      setIsMobileOpen(false);
                      window.location.href = '/';
                    }
                  }}
                  className="flex w-full items-center justify-center rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-[10px] font-black tracking-[0.18em] text-red-300"
                >
                  LOGOUT
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsAuthOpen(true);
                  setIsMobileOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-xl bg-[#00FF66] px-4 py-3 text-[10px] font-black tracking-[0.18em] text-black"
              >
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  LOGIN / SIGNUP
                </span>

                <ArrowUpRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </nav>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </>
  );
}

function MotionNavItem({
  href,
  label,
  Icon,
  accent,
  active,
  index,
}: {
  href: string;
  label: string;
  Icon: typeof Trophy;
  accent: string;
  active: boolean;
  index: number;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between rounded-xl px-4 py-3.5 transition-all ${
        active
          ? 'bg-white/[0.08] text-white'
          : 'text-white/45 hover:bg-white/[0.05] hover:text-white'
      }`}
      style={{
        animationDelay: `${index * 40}ms`,
      }}
    >
      <span className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.18em]">
        <Icon
          className="h-4 w-4"
          style={{ color: accent }}
        />
        {label}
      </span>

      {active && (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{
            backgroundColor: accent,
            boxShadow: `0 0 10px ${accent}`,
          }}
        />
      )}
    </Link>
  );
}
