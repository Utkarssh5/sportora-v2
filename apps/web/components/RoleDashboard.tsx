'use client';

import { useState } from 'react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from 'framer-motion';
import {
  Trophy,
  ShieldCheck,
  Users,
  Radio,
  PlusCircle,
  CheckCircle2,
  FileText,
  UserCheck,
  DollarSign,
  LayoutDashboard,
  Search,
  ArrowUpRight,
  Activity,
  Zap,
} from 'lucide-react';

type Role = 'player' | 'organizer' | 'crew' | 'admin';

const ROLE_DATA = {
  player: {
    label: 'PLAYER',
    number: '01',
    accent: '#00FF66',
    icon: Trophy,
    eyebrow: 'PLAYER ARENA HUB',
    title: 'PLAY THE GAME.',
    highlight: 'LIVE THE MOMENT.',
    description:
      'Discover local tournaments, build your competitive journey, and stay connected to every match that matters.',
    features: [
      {
        icon: Search,
        title: 'Find Tournaments',
        text: 'Filter by city, sport, or entry fee.',
      },
      {
        icon: Radio,
        title: 'My Live Scores',
        text: 'Real-time WebSocket score updates.',
      },
      {
        icon: CheckCircle2,
        title: 'Verified Venues',
        text: 'AI-assisted venue and event verification.',
      },
    ],
  },

  organizer: {
    label: 'ORGANIZER',
    number: '02',
    accent: '#22D3EE',
    icon: PlusCircle,
    eyebrow: 'TOURNAMENT CONTROL',
    title: 'BUILD THE EVENT.',
    highlight: 'RUN THE ARENA.',
    description:
      'Create tournaments, manage participants, configure prizes, and bring verified ground crew into your event.',
    features: [
      {
        icon: PlusCircle,
        title: 'Create Tournament',
        text: 'Set entry fee, prize pool, capacity, and dates.',
      },
      {
        icon: Users,
        title: 'Hire Ground Crew',
        text: 'Find referees, scorekeepers, and officials.',
      },
      {
        icon: ShieldCheck,
        title: 'AI Compliance',
        text: 'Automatic verification and event readiness.',
      },
    ],
  },

  crew: {
    label: 'GROUND CREW',
    number: '03',
    accent: '#FBBF24',
    icon: Users,
    eyebrow: 'CREW MARKETPLACE',
    title: 'OWN THE MOMENT.',
    highlight: 'GET PAID FOR IT.',
    description:
      'Turn your sports expertise into opportunities with verified assignments, certifications, and transparent payouts.',
    features: [
      {
        icon: UserCheck,
        title: 'Duty Requests',
        text: 'Accept nearby referee and official assignments.',
      },
      {
        icon: FileText,
        title: 'KYC & Badge',
        text: 'Keep certifications and verification current.',
      },
      {
        icon: DollarSign,
        title: 'Payout Ledger',
        text: 'Track direct bank and UPI transfer records.',
      },
    ],
  },

  admin: {
    label: 'ADMIN',
    number: '04',
    accent: '#F87171',
    icon: LayoutDashboard,
    eyebrow: 'PLATFORM CONTROL',
    title: 'WATCH EVERYTHING.',
    highlight: 'PROTECT THE GAME.',
    description:
      'Monitor platform health, review AI risk signals, manage approvals, and oversee the sports ecosystem.',
    features: [
      {
        icon: ShieldCheck,
        title: 'AI Flagged Audits',
        text: 'Review tournaments requiring risk attention.',
      },
      {
        icon: DollarSign,
        title: 'Platform Revenue',
        text: 'Track platform commission and financial metrics.',
      },
      {
        icon: Users,
        title: 'User Approvals',
        text: 'Review ground crew and organizer verification.',
      },
    ],
  },
};

const ROLES: Role[] = ['player', 'organizer', 'crew', 'admin'];

export default function RoleDashboard() {
  const [role, setRole] = useState<Role>('player');

  const { scrollYProgress } = useScroll();

  const sectionY = useTransform(
    scrollYProgress,
    [0.35, 0.75],
    [100, -30],
  );

  const sectionOpacity = useTransform(
    scrollYProgress,
    [0.35, 0.48],
    [0.2, 1],
  );

  const active = ROLE_DATA[role];
  const ActiveIcon = active.icon;

  return (
    <section className="relative overflow-hidden px-6 py-28 sm:py-40">
      {/* Huge background index */}
      <motion.div
        aria-hidden="true"
        style={{ y: sectionY }}
        className="pointer-events-none absolute -left-24 top-0 select-none text-[18rem] font-black leading-none tracking-[-0.1em] text-white/[0.02] sm:text-[28rem]"
      >
        {active.number}
      </motion.div>

      {/* Background glow */}
      <motion.div
        aria-hidden="true"
        animate={{
          background:
            role === 'player'
              ? 'radial-gradient(circle, rgba(0,255,102,0.10), transparent 65%)'
              : role === 'organizer'
                ? 'radial-gradient(circle, rgba(34,211,238,0.10), transparent 65%)'
                : role === 'crew'
                  ? 'radial-gradient(circle, rgba(251,191,36,0.10), transparent 65%)'
                  : 'radial-gradient(circle, rgba(248,113,113,0.10), transparent 65%)',
        }}
        transition={{ duration: 0.6 }}
        className="pointer-events-none absolute right-[-10%] top-[20%] h-[600px] w-[600px] rounded-full blur-[100px]"
      />

      <motion.div
        style={{
          y: sectionY,
          opacity: sectionOpacity,
        }}
        className="relative z-10 mx-auto max-w-7xl"
      >
        {/* Section heading */}
        <div className="mb-14 max-w-5xl">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-12 bg-[#00FF66]" />

            <span className="text-[10px] font-black tracking-[0.3em] text-[#00FF66]">
              ONE PLATFORM / FOUR EXPERIENCES
            </span>
          </div>

          <h2 className="text-5xl font-black uppercase leading-[0.88] tracking-[-0.06em] text-white sm:text-7xl md:text-8xl">
            ENTER YOUR
            <br />
            <span className="text-white/20">SPORTORA </span>
            <span className="text-[#00FF66] sportora-text-glow">
              WORLD.
            </span>
          </h2>

          <p className="mt-7 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">
            Whether you play, organize, officiate, or operate the platform —
            Sportora gives every role its own command center.
          </p>
        </div>

        {/* Role selector */}
        <div className="relative mb-8 overflow-x-auto">
          <div className="flex min-w-max gap-2 rounded-2xl border border-white/10 bg-white/[0.025] p-2 backdrop-blur-xl">
            {ROLES.map((item) => {
              const data = ROLE_DATA[item];
              const Icon = data.icon;
              const selected = role === item;

              return (
                <button
                  key={item}
                  onClick={() => setRole(item)}
                  className="relative flex items-center gap-3 rounded-xl px-5 py-3 text-left transition-all"
                >
                  {selected && (
                    <motion.div
                      layoutId="active-role"
                      className="absolute inset-0 rounded-xl bg-white"
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}

                  <span className="relative z-10 flex items-center gap-3">
                    <Icon
                      className="h-4 w-4"
                      style={{
                        color: selected ? '#080B10' : data.accent,
                      }}
                    />

                    <span
                      className={`text-[10px] font-black tracking-[0.18em] ${
                        selected ? 'text-black' : 'text-white/40'
                      }`}
                    >
                      {data.label}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic command center */}
        <AnimatePresence mode="wait">
          <motion.div
            key={role}
            initial={{
              opacity: 0,
              y: 40,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -30,
              scale: 0.98,
            }}
            transition={{
              duration: 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.025] backdrop-blur-2xl"
          >
            {/* Top line */}
            <div
              className="h-px w-full"
              style={{
                background: `linear-gradient(90deg, transparent, ${active.accent}, transparent)`,
              }}
            />

            <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
              {/* Identity panel */}
              <div className="relative overflow-hidden border-b border-white/10 p-8 sm:p-12 lg:border-b-0 lg:border-r">
                <div
                  aria-hidden="true"
                  className="absolute -right-10 -top-10 text-[13rem] font-black leading-none opacity-[0.035]"
                >
                  {active.number}
                </div>

                <div className="relative">
                  <div
                    className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border"
                    style={{
                      borderColor: `${active.accent}40`,
                      backgroundColor: `${active.accent}0D`,
                    }}
                  >
                    <ActiveIcon
                      className="h-7 w-7"
                      style={{ color: active.accent }}
                    />
                  </div>

                  <div
                    className="mb-4 flex items-center gap-2 text-[9px] font-black tracking-[0.3em]"
                    style={{ color: active.accent }}
                  >
                    <Activity className="h-3 w-3" />
                    {active.eyebrow}
                  </div>

                  <h3 className="text-4xl font-black uppercase leading-[0.9] tracking-[-0.05em] text-white sm:text-5xl">
                    {active.title}
                    <br />
                    <span style={{ color: active.accent }}>
                      {active.highlight}
                    </span>
                  </h3>

                  <p className="mt-7 max-w-md text-sm leading-7 text-white/55">
                    {active.description}
                  </p>

                  <div className="mt-10 flex items-center gap-3 text-[9px] font-black tracking-[0.25em] text-white/25">
                    <Zap
                      className="h-3.5 w-3.5"
                      style={{ color: active.accent }}
                    />
                    ROLE-OPTIMIZED EXPERIENCE
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="p-5 sm:p-8 lg:p-10">
                <div className="mb-7 flex items-center justify-between">
                  <div>
                    <div className="text-[9px] font-black tracking-[0.3em] text-white/25">
                      ACTIVE MODULES
                    </div>

                    <div className="mt-1 text-sm font-bold text-white">
                      Your Sportora toolkit
                    </div>
                  </div>

                  <div
                    className="rounded-full border px-3 py-1 text-[8px] font-black tracking-wider"
                    style={{
                      borderColor: `${active.accent}40`,
                      color: active.accent,
                    }}
                  >
                    ONLINE
                  </div>
                </div>

                <div className="space-y-3">
                  {active.features.map((feature, index) => {
                    const FeatureIcon = feature.icon;

                    return (
                      <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, x: 25 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: 0.12 + index * 0.08,
                          duration: 0.4,
                        }}
                        className="group flex items-center gap-5 rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.05]"
                      >
                        <div
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                          style={{
                            backgroundColor: `${active.accent}0D`,
                          }}
                        >
                          <FeatureIcon
                            className="h-5 w-5"
                            style={{ color: active.accent }}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-white">
                            {feature.title}
                          </h4>

                          <p className="mt-1 text-sm leading-6 text-white/50">
                            {feature.text}
                          </p>
                        </div>

                        <ArrowUpRight className="h-4 w-4 text-white/15 transition-all group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-white/60" />
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom status bar */}
            <div className="flex flex-col gap-3 border-t border-white/10 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-10">
              <span className="text-[8px] font-black tracking-[0.3em] text-white/20">
                SPORTORA ECOSYSTEM / {active.label}
              </span>

              <span className="flex items-center gap-2 text-[8px] font-black tracking-[0.2em] text-white/25">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    backgroundColor: active.accent,
                    boxShadow: `0 0 12px ${active.accent}`,
                  }}
                />
                SYSTEM READY
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
