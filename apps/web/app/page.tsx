'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import TournamentsGrid from '../components/TournamentsGrid';
import RoleDashboard from '../components/RoleDashboard';
import SponsorsTicker from '../components/SponsorsTicker';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      <main className="arena-page min-h-screen text-white selection:bg-[#00FF66] selection:text-black">
      <div className="arena-grid" aria-hidden="true" />

      <div
        className="arena-light arena-light-one"
        aria-hidden="true"
      />

      <div
        className="arena-light arena-light-two"
        aria-hidden="true"
      />

      <div
        className="arena-light arena-light-three"
        aria-hidden="true"
      />

      <Navbar />

      {/* Floating About — desktop */}
      <Link
        href="/about"
        className="group fixed right-5 top-1/2 z-[80] hidden -translate-y-1/2 items-center gap-2 rounded-full border border-[#a78bfa]/30 bg-[#080b10]/80 px-3 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-white/50 shadow-[0_0_30px_rgba(167,139,250,0.08)] backdrop-blur-xl transition-all duration-500 hover:-translate-x-1 hover:border-[#a78bfa]/60 hover:bg-[#a78bfa]/10 hover:text-[#a78bfa] md:flex"
        aria-label="About Sportora"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[#a78bfa] shadow-[0_0_10px_rgba(167,139,250,0.8)] transition-all duration-300 group-hover:scale-125" />
        <span className="[writing-mode:vertical-rl]">
          ABOUT SPORTORA
        </span>
      </Link>

      {/* Floating About — mobile */}
      <Link
        href="/about"
        className="fixed bottom-5 right-5 z-[80] flex items-center gap-2 rounded-full border border-[#a78bfa]/30 bg-[#080b10]/90 px-4 py-3 text-[9px] font-black uppercase tracking-[0.18em] text-white/60 shadow-[0_0_30px_rgba(167,139,250,0.12)] backdrop-blur-xl transition-all duration-300 hover:border-[#a78bfa]/60 hover:bg-[#a78bfa]/10 hover:text-[#a78bfa] md:hidden"
        aria-label="About Sportora"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[#a78bfa] shadow-[0_0_10px_rgba(167,139,250,0.8)]" />
        ABOUT
      </Link>

      <Hero
        query={searchQuery}
        setQuery={setSearchQuery}
      />

      <SponsorsTicker />

      <TournamentsGrid query={searchQuery} limit={3} homepageFeatured />

      <RoleDashboard />

      {/* Final homepage closing section */}
      <section className="relative overflow-hidden border-t border-white/10 px-5 py-12 sm:px-8 lg:px-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00ff66]/[0.05] blur-[110px]"
        />

        <div className="relative mx-auto max-w-6xl">
          <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.28em] text-white/40">
            <span className="text-[#00ff66]">SPORTORA ECOSYSTEM</span>
            <span className="h-px w-12 bg-white/15" />
            <span>YOUR NEXT MOVE</span>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-[#00ff66]">
                THE ARENA IS ALWAYS MOVING
              </p>

              <h2 className="mt-5 max-w-4xl text-5xl font-black uppercase leading-[0.9] tracking-[-0.06em] text-white sm:text-6xl lg:text-7xl">
                THE GAME
                <br />
                DOESN&apos;T END HERE.
              </h2>

              <p className="mt-7 max-w-2xl text-base leading-7 text-white/55 sm:text-lg">
                Find your next tournament, build your competitive journey,
                and stay connected to everything happening across the
                Sportora ecosystem.
              </p>
            </div>

            <div className="grid gap-3">
              <Link
                href="/tournaments"
                className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.025] px-5 py-4 transition-all duration-300 hover:border-[#00ff66]/40 hover:bg-[#00ff66]/[0.07]"
              >
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                    01
                  </div>
                  <div className="mt-1 text-sm font-black uppercase text-white">
                    Discover Tournaments
                  </div>
                </div>
                <span className="text-xl text-white/30 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[#00ff66]">
                  →
                </span>
              </Link>

              <Link
                href="/"
                className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.025] px-5 py-4 transition-all duration-300 hover:border-[#00ff66]/40 hover:bg-[#00ff66]/[0.07]"
              >
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                    02
                  </div>
                  <div className="mt-1 text-sm font-black uppercase text-white">
                    Open Arena Hub
                  </div>
                </div>
                <span className="text-xl text-white/30 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[#00ff66]">
                  →
                </span>
              </Link>

              <Link
                href="/profile"
                className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.025] px-5 py-4 transition-all duration-300 hover:border-[#00ff66]/40 hover:bg-[#00ff66]/[0.07]"
              >
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                    03
                  </div>
                  <div className="mt-1 text-sm font-black uppercase text-white">
                    View Your Profile
                  </div>
                </div>
                <span className="text-xl text-white/30 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[#00ff66]">
                  →
                </span>
              </Link>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.28em] text-white/30">
              DISCOVER • COMPETE • ORGANIZE
            </span>

            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-white/25">
              SPORTORA.V2 / SPORTS ECOSYSTEM
            </span>
          </div>
        </div>
      </section>
      {/* SPORTORA FOOTER */}
      <footer className="relative overflow-hidden border-t border-white/10 bg-[#05070a] px-5 pb-6 pt-10 sm:px-8 lg:px-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#00ff66]/[0.035] blur-[100px]"
        />

        <div className="relative mx-auto max-w-6xl">
          <div className="grid gap-7 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#00ff66]/30 bg-[#00ff66]/[0.08] text-lg font-black text-[#00ff66]">
                  S
                </div>

                <div>
                  <div className="text-sm font-black tracking-[0.2em] text-white">
                    SPORTORA.V2
                  </div>
                  <div className="mt-1 text-[9px] font-black tracking-[0.22em] text-white/30">
                    SPORTS ECOSYSTEM
                  </div>
                </div>
              </div>

              <p className="mt-6 max-w-sm text-sm leading-7 text-white/45">
                India&apos;s intelligent sports ecosystem for discovering,
                competing, organizing, and operating tournaments.
              </p>

              <div className="mt-6 text-[10px] font-black uppercase tracking-[0.25em] text-[#00ff66]/70">
                DISCOVER • COMPETE • ORGANIZE
              </div>
            </div>

            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35">
                PLATFORM
              </div>

              <div className="mt-5 space-y-3">
                <Link
                  href="/tournaments"
                  className="block text-sm font-bold text-white/55 transition-colors hover:text-[#00ff66]"
                >
                  Tournaments
                </Link>

                <Link
                  href="/profile"
                  className="block text-sm font-bold text-white/55 transition-colors hover:text-[#00ff66]"
                >
                  Arena Hub
                </Link>

                <Link
                  href="/crew"
                  className="block text-sm font-bold text-white/55 transition-colors hover:text-[#00ff66]"
                >
                  Ground Crew
                </Link>

                <Link
                  href="/store"
                  className="block text-sm font-bold text-white/55 transition-colors hover:text-[#00ff66]"
                >
                  Sponsor Store
                </Link>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35">
                ECOSYSTEM
              </div>

              <div className="mt-5 space-y-3">
                <span className="block text-sm font-bold text-white/55">
                  Players
                </span>
                <span className="block text-sm font-bold text-white/55">
                  Organizers
                </span>
                <span className="block text-sm font-bold text-white/55">
                  Ground Crew
                </span>
                <span className="block text-sm font-bold text-white/55">
                  Admin
                </span>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35">
                COMPANY
              </div>

              <div className="mt-5 space-y-3">
                <Link
                  href="/about"
                  className="block text-sm font-bold text-white/55 transition-colors hover:text-[#00ff66]"
                >
                  About Sportora
                </Link>

                <Link
                  href="/vision"
                  className="block text-sm font-bold text-white/55 transition-colors hover:text-[#22d3ee]"
                >
                  Our Vision
                </Link>

                <Link
                  href="/contact"
                  className="block text-sm font-bold text-white/55 transition-colors hover:text-[#22d3ee]"
                >
                  Contact & Support
                </Link>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35">
                ACCOUNT
              </div>

              <div className="mt-5 space-y-3">
                <Link
                  href="/profile"
                  className="block text-sm font-bold text-white/55 transition-colors hover:text-[#00ff66]"
                >
                  My Profile
                </Link>

                <Link
                  href="/tournaments"
                  className="block text-sm font-bold text-white/55 transition-colors hover:text-[#00ff66]"
                >
                  Explore Arena
                </Link>

                <Link
                  href="/"
                  className="block text-sm font-bold text-white/55 transition-colors hover:text-[#00ff66]"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-14 border-t border-white/10 pt-6">
            <div className="flex flex-col gap-4 text-[10px] font-black uppercase tracking-[0.16em] text-white/25 sm:flex-row sm:items-center sm:justify-between">
              <span>
                © 2026 SPORTORA.V2 — ALL RIGHTS RESERVED
              </span>

              <div className="flex flex-wrap gap-5">
                <span className="transition-colors hover:text-white/50">
                  PRIVACY
                </span>

                <span className="transition-colors hover:text-white/50">
                  TERMS
                </span>

                <a
                  href="https://www.youtube.com/@SportoraOfficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-[#00ff66]"
                >
                  YOUTUBE
                </a>

                <span className="transition-colors hover:text-white/50">
                  INDIA / SPORTS NETWORK
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>

    </main>
  );
  </>
);
}
