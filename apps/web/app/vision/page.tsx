'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowDown,
  ArrowRight,
  BrainCircuit,
  Globe2,
  Network,
  Rocket,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import { useRef } from 'react';

const futureLayers = [
  {
    step: '01',
    title: 'CONNECT',
    text: 'Every player, organizer, venue, official and competition becomes part of one connected sporting network.',
    icon: Network,
  },
  {
    step: '02',
    title: 'INTELLIGENT',
    text: 'AI transforms how tournaments are discovered, verified, managed and experienced.',
    icon: BrainCircuit,
  },
  {
    step: '03',
    title: 'TRUSTED',
    text: 'Verification and controlled workflows create a safer, more reliable sports ecosystem.',
    icon: ShieldCheck,
  },
  {
    step: '04',
    title: 'LIMITLESS',
    text: 'Local competitions can grow into a connected sporting world without geographical boundaries.',
    icon: Globe2,
  },
];

const journey = [
  ['TODAY', 'Discover the game.'],
  ['NEXT', 'Connect the ecosystem.'],
  ['FUTURE', 'Intelligence everywhere.'],
  ['BEYOND', 'Sport without boundaries.'],
];

export default function VisionPage() {
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '35%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <main className="vision-page min-h-screen overflow-hidden bg-[#02030a] text-white">
      {/* FUTURE FIELD */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(34,211,238,0.11),transparent_26%),radial-gradient(circle_at_85%_20%,rgba(139,92,246,0.12),transparent_28%),radial-gradient(circle_at_50%_80%,rgba(0,255,102,0.05),transparent_30%)]" />

        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:80px_80px]" />

        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.12, 0.22, 0.12],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute left-1/2 top-[18%] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#22d3ee]/10 blur-[120px]"
        />
      </div>

      {/* NAV */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-6 sm:px-10 lg:px-16">
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#22d3ee]/30 bg-[#22d3ee]/10 text-sm font-black text-[#22d3ee] transition-all duration-300 group-hover:rotate-6 group-hover:scale-105">
            S
          </span>

          <span className="text-xs font-black tracking-[0.22em]">
            SPORTORA.V2
          </span>
        </Link>

        <Link
          href="/"
          className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-white/50 transition-all hover:border-[#22d3ee]/40 hover:bg-[#22d3ee]/10 hover:text-[#22d3ee]"
        >
          Back to Arena
        </Link>
      </nav>

      {/* HERO */}
      <section
        ref={heroRef}
        className="relative z-10 flex min-h-[92vh] items-center px-6 pb-24 pt-20 sm:px-10 lg:px-16"
      >
        <motion.div
          style={{ y, opacity }}
          className="mx-auto w-full max-w-7xl"
        >
          <div className="text-[10px] font-black uppercase tracking-[0.32em] text-[#22d3ee]">
            THE SPORTORA VISION
          </div>

          <h1 className="mt-8 text-[clamp(4rem,12vw,11rem)] font-black uppercase leading-[0.76] tracking-[-0.08em]">
            <span className="block">THE FUTURE</span>
            <span className="block bg-gradient-to-r from-[#22d3ee] via-[#8b5cf6] to-[#00ff66] bg-clip-text text-transparent">
              IS PLAYING.
            </span>
          </h1>

          <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_0.7fr] lg:items-end">
            <p className="max-w-2xl text-lg leading-8 text-white/50 sm:text-xl">
              We imagine a world where sport is not fragmented across
              platforms, spreadsheets, messages and disconnected communities.
              It is one living network.
            </p>

            <div className="lg:justify-self-end">
              <div className="text-[9px] font-black uppercase tracking-[0.25em] text-white/25">
                THE NORTH STAR
              </div>

              <div className="mt-3 text-2xl font-black uppercase leading-tight sm:text-3xl">
                ONE WORLD.
                <br />
                <span className="text-[#22d3ee]">EVERY GAME.</span>
              </div>
            </div>
          </div>

          <div className="mt-20 flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.25em] text-white/25">
            <ArrowDown className="h-4 w-4 animate-bounce text-[#22d3ee]" />
            SCROLL INTO THE FUTURE
          </div>
        </motion.div>
      </section>

      {/* BIG STATEMENT */}
      <section className="relative z-10 px-6 py-36 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8b5cf6]">
            OUR NORTH STAR
          </div>

          <h2 className="mt-8 max-w-6xl text-5xl font-black uppercase leading-[0.86] tracking-[-0.06em] sm:text-7xl lg:text-9xl">
            FROM
            <br />
            <span className="text-white/20">DISCONNECTED</span>
            <br />
            TO
            <br />
            <span className="bg-gradient-to-r from-[#22d3ee] to-[#8b5cf6] bg-clip-text text-transparent">
              ONE NETWORK.
            </span>
          </h2>

          <div className="mt-14 grid gap-10 lg:grid-cols-2">
            <p className="text-base leading-8 text-white/45 sm:text-lg">
              The sports world already has incredible athletes, organizers,
              venues and communities. What is missing is the connective layer
              that lets them work together seamlessly.
            </p>

            <p className="text-base leading-8 text-white/45 sm:text-lg">
              Sportora aims to become that layer — starting with local
              tournaments and growing into an intelligent infrastructure for
              sport.
            </p>
          </div>
        </div>
      </section>

      {/* FUTURE LAYERS */}
      <section className="relative z-10 px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00ff66]">
              THE BLUEPRINT
            </div>

            <h2 className="mt-5 text-4xl font-black uppercase tracking-[-0.05em] sm:text-6xl">
              BUILDING IT
              <br />
              <span className="text-white/20">LAYER BY LAYER.</span>
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {futureLayers.map((layer, index) => {
              const Icon = layer.icon;

              return (
                <motion.div
                  key={layer.step}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.7, delay: index * 0.08 }}
                  whileHover={{ scale: 1.015 }}
                  className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.025] p-7 transition-all duration-500 hover:border-[#22d3ee]/30 sm:p-9"
                >
                  <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[#22d3ee]/[0.04] blur-3xl transition-all duration-500 group-hover:bg-[#8b5cf6]/10" />

                  <div className="relative flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#22d3ee]/20 bg-[#22d3ee]/[0.06] text-[#22d3ee]">
                      <Icon className="h-5 w-5" />
                    </div>

                    <span className="text-[10px] font-black tracking-[0.25em] text-white/20">
                      {layer.step}
                    </span>
                  </div>

                  <div className="relative mt-20">
                    <h3 className="text-3xl font-black uppercase tracking-tight">
                      {layer.title}
                    </h3>

                    <p className="mt-5 max-w-xl text-sm leading-7 text-white/40">
                      {layer.text}
                    </p>
                  </div>

                  <motion.div
                    className="relative mt-8 h-px bg-gradient-to-r from-[#22d3ee] to-transparent"
                    initial={{ scaleX: 0, transformOrigin: 'left' }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.25 }}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* JOURNEY */}
      <section className="relative z-10 px-6 py-36 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-16 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#fb923c]">
                THE JOURNEY
              </div>

              <h2 className="mt-5 text-4xl font-black uppercase leading-[0.9] tracking-[-0.05em] sm:text-6xl">
                SMALL
                <br />
                START.
                <br />
                <span className="text-white/20">MASSIVE</span>
                <br />
                VISION.
              </h2>
            </div>

            <div className="relative">
              <div className="absolute left-4 top-3 bottom-3 w-px bg-gradient-to-b from-[#22d3ee] via-[#8b5cf6] to-[#00ff66]" />

              <div className="space-y-12">
                {journey.map(([label, text], index) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="relative flex gap-7"
                  >
                    <div className="relative z-10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 bg-[#02030a]">
                      <span className="h-2 w-2 rounded-full bg-[#22d3ee] shadow-[0_0_15px_rgba(34,211,238,0.9)]" />
                    </div>

                    <div>
                      <div className="text-[9px] font-black tracking-[0.25em] text-[#22d3ee]">
                        {label}
                      </div>

                      <div className="mt-2 text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
                        {text}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ECOSYSTEM FUTURE */}
      <section className="relative z-10 px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl rounded-[40px] border border-[#8b5cf6]/20 bg-gradient-to-br from-[#8b5cf6]/10 via-white/[0.02] to-[#22d3ee]/[0.06] p-8 sm:p-12 lg:p-16">
          <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 text-[#a78bfa]">
                <Rocket className="h-8 w-8" />
              </div>

              <div className="mt-8 text-[10px] font-black uppercase tracking-[0.3em] text-[#a78bfa]">
                BEYOND THE PLATFORM
              </div>

              <h2 className="mt-5 text-4xl font-black uppercase leading-[0.88] tracking-[-0.05em] sm:text-6xl">
                WE&apos;RE NOT
                <br />
                BUILDING
                <br />
                <span className="text-[#a78bfa]">ANOTHER APP.</span>
              </h2>
            </div>

            <div>
              <p className="text-lg leading-8 text-white/50">
                We are building infrastructure for the next generation of
                sport — where data, people, places and competition can move
                together.
              </p>

              <div className="mt-10 grid grid-cols-2 gap-3">
                {[
                  ['ATHLETES', Users],
                  ['VENUES', Globe2],
                  ['COMPETITIONS', Trophy],
                  ['INTELLIGENCE', BrainCircuit],
                ].map(([label, Icon]) => (
                  <div
                    key={label as string}
                    className="group rounded-2xl border border-white/10 bg-black/20 p-5 transition-all hover:border-[#8b5cf6]/30"
                  >
                    <Icon className="h-5 w-5 text-[#a78bfa]" />
                    <div className="mt-8 text-[9px] font-black tracking-[0.16em] text-white/30">
                      {label as string}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL */}
      <section className="relative z-10 px-6 pb-20 pt-36 text-center sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <Zap className="mx-auto h-8 w-8 text-[#00ff66]" />

          <div className="mt-8 text-[10px] font-black uppercase tracking-[0.3em] text-[#00ff66]">
            THE FUTURE STARTS HERE
          </div>

          <h2 className="mt-6 text-6xl font-black uppercase leading-[0.8] tracking-[-0.07em] sm:text-8xl lg:text-[10rem]">
            BUILD
            <br />
            <span className="bg-gradient-to-r from-[#22d3ee] via-[#8b5cf6] to-[#00ff66] bg-clip-text text-transparent">
              WHAT&apos;S NEXT.
            </span>
          </h2>

          <p className="mx-auto mt-10 max-w-xl text-base leading-7 text-white/40">
            The game is evolving. The ecosystem is evolving. Sportora is here
            to build what comes next.
          </p>

          <Link
            href="/tournaments"
            className="mt-10 inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-xs font-black uppercase tracking-[0.18em] text-black transition-all duration-300 hover:scale-105 hover:bg-[#22d3ee] hover:shadow-[0_0_50px_rgba(34,211,238,0.3)]"
          >
            EXPLORE THE FUTURE
            <ArrowRight className="h-4 w-4" />
          </Link>

          <div className="mx-auto mt-16 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-[9px] font-black uppercase tracking-[0.2em] text-white/20 sm:flex-row">
            <span>SPORTORA.V2 / VISION</span>
            <span>ONE WORLD • EVERY GAME</span>
            <span>THE FUTURE IS PLAYING</span>
          </div>
        </div>
      </section>
    </main>
  );
}
