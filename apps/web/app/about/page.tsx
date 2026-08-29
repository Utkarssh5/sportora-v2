'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowDown,
  ArrowRight,
  BrainCircuit,
  Globe2,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import { useRef } from 'react';

const roles = [
  {
    number: '01',
    title: 'PLAYER',
    subtitle: 'ENTER THE GAME',
    description:
      'Discover tournaments, build your competitive journey, and turn every match into part of your story.',
    icon: Trophy,
    accent: '#00ff66',
  },
  {
    number: '02',
    title: 'ORGANIZER',
    subtitle: 'CREATE THE ARENA',
    description:
      'Build verified tournaments, manage registrations, and bring the right competition to the right place.',
    icon: Sparkles,
    accent: '#22d3ee',
  },
  {
    number: '03',
    title: 'GROUND CREW',
    subtitle: 'MAKE IT HAPPEN',
    description:
      'Operate the real-world layer of sport — venues, officials, volunteers, match-day operations, and more.',
    icon: Users,
    accent: '#a78bfa',
  },
  {
    number: '04',
    title: 'ADMIN',
    subtitle: 'GUARD THE ECOSYSTEM',
    description:
      'Keep the network trusted through controlled verification, governance, moderation, and oversight.',
    icon: ShieldCheck,
    accent: '#fb923c',
  },
];

export default function AboutPage() {
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '28%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <main className="about-page min-h-screen overflow-hidden bg-[#030507] text-white">
      {/* AMBIENT FIELD */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,255,102,0.08),transparent_28%),radial-gradient(circle_at_80%_30%,rgba(34,211,238,0.07),transparent_25%),radial-gradient(circle_at_50%_90%,rgba(167,139,250,0.07),transparent_28%)]" />
        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:70px_70px]" />
      </div>

      {/* NAV */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-6 sm:px-10 lg:px-16">
        <Link
          href="/"
          className="group flex items-center gap-3"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#00ff66]/30 bg-[#00ff66]/10 text-sm font-black text-[#00ff66] transition-all duration-300 group-hover:rotate-6 group-hover:scale-105">
            S
          </span>
          <span className="text-xs font-black tracking-[0.22em] text-white">
            SPORTORA.V2
          </span>
        </Link>

        <Link
          href="/"
          className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-white/60 transition-all duration-300 hover:border-[#00ff66]/40 hover:bg-[#00ff66]/10 hover:text-[#00ff66]"
        >
          Back to Arena
        </Link>
      </nav>

      {/* HERO */}
      <section
        ref={heroRef}
        className="relative z-10 flex min-h-[88vh] items-center px-6 pb-20 pt-16 sm:px-10 lg:px-16"
      >
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="mx-auto w-full max-w-7xl"
        >
          <div className="max-w-5xl">
            <div className="mb-8 flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em]">
              <span className="text-[#22d3ee]">ABOUT SPORTORA</span>
              <span className="h-px w-16 bg-gradient-to-r from-[#22d3ee] to-transparent" />
              <span className="text-white/30">THE SPORTS NETWORK</span>
            </div>

            <h1 className="text-[clamp(4rem,11vw,10rem)] font-black uppercase leading-[0.78] tracking-[-0.075em]">
              <span className="block text-white">WE BUILD</span>
              <span className="block bg-gradient-to-r from-[#00ff66] via-[#22d3ee] to-[#a78bfa] bg-clip-text text-transparent">
                THE ARENA.
              </span>
            </h1>

            <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
              <p className="max-w-2xl text-lg leading-8 text-white/55 sm:text-xl">
                Sportora is building a connected sports ecosystem where
                discovering a tournament, organizing a competition, operating
                the ground, and competing in the arena become one continuous
                experience.
              </p>

              <div className="lg:justify-self-end">
                <div className="text-[9px] font-black uppercase tracking-[0.28em] text-white/30">
                  OUR BELIEF
                </div>
                <div className="mt-3 text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
                  SPORT SHOULD
                  <br />
                  FEEL CONNECTED.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-20 flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.22em] text-white/30">
            <ArrowDown className="h-4 w-4 animate-bounce text-[#00ff66]" />
            SCROLL TO ENTER THE SYSTEM
          </div>
        </motion.div>
      </section>

      {/* STATEMENT */}
      <section className="relative z-10 px-6 py-32 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-16 lg:grid-cols-[0.7fr_1.3fr]">
            <div className="text-[10px] font-black uppercase tracking-[0.28em] text-[#a78bfa]">
              WHY SPORTORA
            </div>

            <div>
              <h2 className="max-w-5xl text-4xl font-black uppercase leading-[0.95] tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
                SPORT IS BIGGER
                <br />
                THAN THE
                <br />
                <span className="text-white/25">SCOREBOARD.</span>
              </h2>

              <p className="mt-10 max-w-3xl text-base leading-8 text-white/50 sm:text-lg">
                Behind every tournament is a player. Behind every player is a
                journey. Behind every competition are organizers, venues,
                officials, volunteers, technology, and trust.
              </p>

              <p className="mt-6 max-w-3xl text-base leading-8 text-white/50 sm:text-lg">
                Sportora brings those moving parts together into one
                intelligent network — designed to make local sport easier to
                discover, easier to run, and easier to trust.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ECOSYSTEM FLOW */}
      <section className="relative z-10 px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.28em] text-[#22d3ee]">
                ONE NETWORK / FOUR WORLDS
              </div>
              <h2 className="mt-4 text-4xl font-black uppercase tracking-[-0.05em] sm:text-6xl">
                EVERY ROLE
                <br />
                <span className="text-white/25">CONNECTED.</span>
              </h2>
            </div>

            <p className="max-w-md text-sm leading-7 text-white/40">
              Sportora is designed around the people who make sport happen —
              not just the people watching the final score.
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-[12.5%] right-[12.5%] top-24 hidden h-px bg-gradient-to-r from-[#00ff66]/30 via-[#22d3ee]/40 to-[#fb923c]/30 lg:block" />

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {roles.map((role, index) => {
                const Icon = role.icon;

                return (
                  <motion.div
                    key={role.title}
                    initial={{ opacity: 0, y: 35 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{
                      duration: 0.65,
                      delay: index * 0.1,
                    }}
                    whileHover={{ y: -10 }}
                    className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.025] p-6 backdrop-blur-xl transition-colors duration-500 hover:border-white/20"
                  >
                    <div
                      className="absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-10 blur-3xl transition-opacity duration-500 group-hover:opacity-30"
                      style={{ backgroundColor: role.accent }}
                    />

                    <div className="relative">
                      <div className="flex items-center justify-between">
                        <span
                          className="text-[10px] font-black tracking-[0.2em]"
                          style={{ color: role.accent }}
                        >
                          {role.number}
                        </span>

                        <Icon
                          className="h-5 w-5 transition-transform duration-500 group-hover:rotate-12"
                          style={{ color: role.accent }}
                        />
                      </div>

                      <div className="mt-16">
                        <div className="text-2xl font-black tracking-tight text-white">
                          {role.title}
                        </div>
                        <div
                          className="mt-2 text-[9px] font-black uppercase tracking-[0.2em]"
                          style={{ color: role.accent }}
                        >
                          {role.subtitle}
                        </div>

                        <p className="mt-5 text-sm leading-7 text-white/45">
                          {role.description}
                        </p>
                      </div>

                      <div className="mt-8 h-px bg-white/10">
                        <motion.div
                          className="h-full"
                          style={{ backgroundColor: role.accent }}
                          initial={{ width: '0%' }}
                          whileInView={{ width: '100%' }}
                          viewport={{ once: true }}
                          transition={{
                            duration: 1,
                            delay: 0.3 + index * 0.1,
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* INTELLIGENCE */}
      <section className="relative z-10 px-6 py-32 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[40px] border border-[#22d3ee]/15 bg-gradient-to-br from-[#22d3ee]/[0.06] via-white/[0.02] to-[#a78bfa]/[0.05] p-8 sm:p-12 lg:p-16">
          <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#22d3ee]/30 bg-[#22d3ee]/10 text-[#22d3ee]">
                <BrainCircuit className="h-8 w-8" />
              </div>

              <div className="mt-8 text-[10px] font-black uppercase tracking-[0.28em] text-[#22d3ee]">
                INTELLIGENCE LAYER
              </div>

              <h2 className="mt-4 text-4xl font-black uppercase leading-[0.9] tracking-[-0.05em] sm:text-6xl">
                SPORT.
                <br />
                <span className="text-[#22d3ee]">INTELLIGENT.</span>
              </h2>
            </div>

            <div>
              <p className="text-lg leading-8 text-white/55">
                We use technology to reduce friction around sport — helping
                players discover relevant events, helping organizers build
                trustworthy competitions, and helping the ecosystem make
                better decisions.
              </p>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {[
                  ['01', 'DISCOVER', Globe2],
                  ['02', 'VERIFY', ShieldCheck],
                  ['03', 'CONNECT', Zap],
                ].map(([number, label, Icon]) => (
                  <div
                    key={label as string}
                    className="rounded-2xl border border-white/10 bg-black/20 p-5"
                  >
                    <Icon className="h-5 w-5 text-[#22d3ee]" />
                    <div className="mt-8 text-[9px] font-black tracking-[0.2em] text-white/25">
                      {number as string}
                    </div>
                    <div className="mt-1 text-sm font-black tracking-wider text-white">
                      {label as string}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VISION */}
      <section className="relative z-10 px-6 py-32 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl text-center">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#fb923c]">
            THE LONG GAME
          </div>

          <h2 className="mx-auto mt-6 max-w-6xl text-5xl font-black uppercase leading-[0.88] tracking-[-0.06em] sm:text-7xl lg:text-8xl">
            FROM LOCAL
            <br />
            <span className="bg-gradient-to-r from-[#fb923c] via-[#a78bfa] to-[#22d3ee] bg-clip-text text-transparent">
              TO LIMITLESS.
            </span>
          </h2>

          <p className="mx-auto mt-10 max-w-2xl text-base leading-8 text-white/45 sm:text-lg">
            Our vision is simple: make every athlete, every organizer, every
            venue, and every competition feel like part of the same connected
            sporting world.
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative z-10 px-6 pb-20 pt-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[40px] border border-[#00ff66]/20 bg-[#00ff66]/[0.045] px-6 py-20 text-center sm:px-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#00ff66]/30 bg-[#00ff66]/10 text-[#00ff66]">
            <Trophy className="h-6 w-6" />
          </div>

          <div className="mt-8 text-[10px] font-black uppercase tracking-[0.3em] text-[#00ff66]">
            YOUR ARENA IS WAITING
          </div>

          <h2 className="mx-auto mt-5 max-w-4xl text-5xl font-black uppercase leading-[0.85] tracking-[-0.06em] sm:text-7xl">
            DON&apos;T JUST
            <br />
            <span className="text-white/30">WATCH SPORT.</span>
            <br />
            <span className="text-[#00ff66]">LIVE IT.</span>
          </h2>

          <Link
            href="/tournaments"
            className="mt-10 inline-flex items-center gap-3 rounded-full bg-[#00ff66] px-8 py-4 text-xs font-black uppercase tracking-[0.18em] text-black transition-all duration-300 hover:scale-105 hover:bg-emerald-300 hover:shadow-[0_0_50px_rgba(0,255,102,0.3)]"
          >
            ENTER THE ARENA
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mx-auto mt-10 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-[9px] font-black uppercase tracking-[0.2em] text-white/25 sm:flex-row">
          <span>SPORTORA.V2 / ABOUT</span>
          <span>DISCOVER • COMPETE • ORGANIZE</span>
          <span>BUILT FOR THE SPORTS ECOSYSTEM</span>
        </div>
      </section>
    </main>
  );
}
