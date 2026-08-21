'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { buildTournamentDiscoveryUrl } from '../lib/tournament-discovery';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';
import {
  ArrowDown,
  ArrowRight,
  Search,
  Sparkles,
  Zap,
} from 'lucide-react';

interface HeroProps {
  query: string;
  setQuery: (value: string) => void;
}

const STATS = [
  { value: '500+', label: 'TOURNAMENTS' },
  { value: '50K+', label: 'PLAYERS' },
  { value: '100+', label: 'VENUES' },
  { value: '24/7', label: 'LIVE ACTION' },
];

export default function Hero({ query, setQuery }: HeroProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothX = useSpring(mouseX, {
    stiffness: 80,
    damping: 20,
  });

  const smoothY = useSpring(mouseY, {
    stiffness: 80,
    damping: 20,
  });

  const parallaxX = useTransform(smoothX, [-500, 500], [-12, 12]);
  const parallaxY = useTransform(smoothY, [-500, 500], [-12, 12]);

  const scrollY = useMotionValue(0);

  const smoothScrollY = useSpring(scrollY, {
    stiffness: 80,
    damping: 25,
  });

  const backgroundY = useTransform(smoothScrollY, [0, 900], [0, 180]);
  const ringY = useTransform(smoothScrollY, [0, 900], [0, 260]);
  const contentY = useTransform(smoothScrollY, [0, 700], [0, -120]);
  const contentScale = useTransform(smoothScrollY, [0, 700], [1, 0.92]);
  const contentOpacity = useTransform(smoothScrollY, [0, 650], [1, 0.15]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();

      if (!rect) return;

      mouseX.set(event.clientX - (rect.left + rect.width / 2));
      mouseY.set(event.clientY - (rect.top + rect.height / 2));
    };

    const handleScroll = () => {
      scrollY.set(window.scrollY);
    };

    handleScroll();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [mouseX, mouseY, scrollY]);

  const scrollToTournaments = () => {
    router.push(buildTournamentDiscoveryUrl(query));
  };

  const exploreQuery = (value: string) => {
    setQuery(value);
    router.push(buildTournamentDiscoveryUrl(value));
  };

  return (
    <section
      ref={containerRef}
      className="relative min-h-[calc(100vh-76px)] overflow-hidden"
    >
      {/* Moving atmospheric glow */}
      <motion.div
        aria-hidden="true"
        style={{
          x: parallaxX,
          y: backgroundY,
        }}
        className="pointer-events-none absolute left-1/2 top-[38%] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00ff66]/10 blur-[120px]"
      />

      {/* Outer arena ring */}
      <motion.div
        aria-hidden="true"
        style={{
          y: ringY,
          x: parallaxX,
        }}
        className="pointer-events-none absolute left-1/2 top-[45%] -z-0 h-[650px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#00ff66]/10"
      />

      {/* Rotating ring */}
      <motion.div
        aria-hidden="true"
        style={{
          y: ringY,
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="pointer-events-none absolute left-1/2 top-[45%] -z-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#00ff66]/10"
      />

      {/* Dashed inner ring */}
      <motion.div
        aria-hidden="true"
        style={{
          y: ringY,
          x: parallaxX,
        }}
        animate={{ rotate: -360 }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="pointer-events-none absolute left-1/2 top-[45%] -z-0 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#00ff66]/15"
      />

      {/* AI badge */}
      <div className="relative z-20 mx-auto flex max-w-7xl justify-center px-6 pt-16 sm:pt-20 lg:pt-24">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="inline-flex items-center gap-2 rounded-full border border-[#00ff66]/20 bg-[#00ff66]/5 px-4 py-2 backdrop-blur-md"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00ff66] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00ff66]" />
          </span>

          <Sparkles className="h-3.5 w-3.5 text-[#00ff66]" />

          <span className="text-[10px] font-bold tracking-[0.22em] text-[#00ff66]">
            AI-POWERED SPORTS ARENA
          </span>
        </motion.div>
      </div>

      {/* Main hero content */}
      <motion.div
        style={{
          y: contentY,
          scale: contentScale,
          opacity: contentOpacity,
        }}
        className="relative z-20 mx-auto flex max-w-7xl flex-col items-center px-6 pt-10 text-center sm:pt-12 lg:pt-14"
      >
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7 }}
          className="mb-5 text-xs font-bold uppercase tracking-[0.35em] text-white/40"
        >
          DISCOVER • COMPETE • ORGANIZE
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.25,
            duration: 0.9,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{
            x: parallaxX,
          }}
          className="max-w-6xl text-6xl font-black leading-[0.88] tracking-[-0.06em] text-white sm:text-7xl md:text-8xl lg:text-[9.5rem]"
        >
          FIND YOUR
          <br />

          <span className="relative inline-block text-[#00ff66] sportora-text-glow">
            NEXT GAME

            <motion.span
              aria-hidden="true"
              className="absolute -right-5 top-0 h-3 w-3 rounded-full bg-[#00ff66] shadow-[0_0_25px_#00ff66] sm:-right-7 sm:h-4 sm:w-4"
              animate={{
                scale: [1, 1.4, 1],
                opacity: [1, 0.5, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
          </span>

          <span className="text-white/20">.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-8 max-w-2xl text-sm leading-7 text-white/40 sm:text-base sm:leading-8"
        >
          Discover tournaments. Build your team. Host events.
          <br className="hidden sm:block" />
          Enter India&apos;s intelligent sports ecosystem.
        </motion.p>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 35, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            delay: 0.65,
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mt-10 w-full max-w-2xl"
        >
          <div className="group relative">
            <div className="absolute -inset-1 rounded-2xl bg-[#00ff66]/10 opacity-0 blur-xl transition duration-500 group-focus-within:opacity-100" />

            <div className="relative flex items-center overflow-hidden rounded-2xl border border-white/10 bg-black/50 p-2 shadow-2xl backdrop-blur-2xl transition-all duration-300 group-focus-within:border-[#00ff66]/40">
              <Search className="ml-4 h-5 w-5 shrink-0 text-white/30 transition-colors group-focus-within:text-[#00ff66]" />

              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    scrollToTournaments();
                  }
                }}
                placeholder="Search tournaments, sports, cities..."
                className="min-w-0 flex-1 bg-transparent px-4 py-4 text-sm text-white outline-none placeholder:text-white/25"
              />

              <button
                onClick={scrollToTournaments}
                className="flex shrink-0 items-center gap-2 rounded-xl bg-[#00ff66] px-4 py-3 text-xs font-black text-black transition-all duration-300 hover:scale-[1.03] hover:bg-[#39ff88] sm:px-6"
              >
                <span className="hidden sm:inline">
                  EXPLORE
                </span>

                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs font-semibold tracking-wider text-white/25">
            <span>TRY</span>

            <button
              onClick={() => exploreQuery('Football')}
              className="text-sm font-bold text-white/50 transition-colors hover:text-[#00ff66]"
            >
              Football
            </button>

            <button
              onClick={() => exploreQuery('Cricket')}
              className="text-sm font-bold text-white/50 transition-colors hover:text-[#00ff66]"
            >
              Cricket
            </button>

            <button
              onClick={() => exploreQuery('Jaipur')}
              className="text-sm font-bold text-white/50 transition-colors hover:text-[#00ff66]"
            >
              Jaipur
            </button>

            <button
              onClick={() => exploreQuery('Badminton')}
              className="text-sm font-bold text-white/50 transition-colors hover:text-[#00ff66]"
            >
              Badminton
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="mt-16 grid w-full max-w-3xl grid-cols-2 divide-x divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md sm:grid-cols-4 sm:divide-y-0"
        >
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="px-4 py-5 sm:px-5"
            >
              <div className="text-xl font-black tracking-tight text-white sm:text-2xl">
                {stat.value}
              </div>

              <div className="mt-1 text-[8px] font-bold tracking-[0.2em] text-white/25">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.button
          onClick={scrollToTournaments}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.8 }}
          className="group mt-12 flex flex-col items-center gap-3 text-white/25 transition-colors hover:text-[#00ff66]"
        >
          <span className="flex items-center gap-2 text-[9px] font-bold tracking-[0.3em]">
            ENTER THE ARENA
            <Zap className="h-3 w-3" />
          </span>

          <motion.span
            animate={{ y: [0, 7, 0] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <ArrowDown className="h-4 w-4" />
          </motion.span>
        </motion.button>
      </motion.div>

      {/* Bottom transition */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#05070a] to-transparent" />
    </section>
  );
}
