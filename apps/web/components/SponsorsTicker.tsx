'use client';

import { motion } from 'framer-motion';

const SPONSORS = [
  'YONEX',
  'RED BULL',
  'RAZORPAY',
  'PUMA',
  'DECATHLON',
  'GATORADE',
  'DREAM11',
  'LI-NING',
];

const ITEMS = [...SPONSORS, ...SPONSORS, ...SPONSORS];

export default function SponsorsTicker() {
  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-black/70 py-10 backdrop-blur-xl">
      {/* Ambient grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
          backgroundSize: '42px 42px',
        }}
      />

      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-32 w-[60%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00ff66]/5 blur-[80px]"
      />

      {/* Label */}
      <div className="relative z-10 mb-7 flex items-center justify-center gap-4 px-6">
        <span className="h-px w-10 bg-[#00ff66]/40" />

        <span className="flex items-center gap-2 text-[9px] font-black tracking-[0.35em] text-[#00ff66]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00ff66] shadow-[0_0_12px_#00ff66]" />
          SPORTORA NETWORK
        </span>

        <span className="h-px w-10 bg-[#00ff66]/40" />
      </div>

      {/* TOP — LEFT → RIGHT */}
      <div className="relative z-10 overflow-hidden">
        <motion.div
          initial={{ x: '-33.333%' }}
          animate={{ x: '0%' }}
          transition={{
            repeat: Infinity,
            duration: 28,
            ease: 'linear',
          }}
          className="flex w-max items-center gap-8 whitespace-nowrap"
        >
          {ITEMS.map((sponsor, index) => (
            <div
              key={`top-${sponsor}-${index}`}
              className="group flex items-center gap-8"
            >
              <span className="text-2xl font-black italic tracking-[-0.03em] text-white/65 transition-all duration-300 group-hover:text-white sm:text-3xl">
                {sponsor}
              </span>

              <span className="text-sm text-[#00ff66]/60">◆</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* BOTTOM — RIGHT → LEFT */}
      <div className="relative z-10 mt-5 overflow-hidden opacity-25">
        <motion.div
          initial={{ x: '0%' }}
          animate={{ x: '-33.333%' }}
          transition={{
            repeat: Infinity,
            duration: 34,
            ease: 'linear',
          }}
          className="flex w-max items-center gap-12 whitespace-nowrap"
        >
          {ITEMS.map((sponsor, index) => (
            <div
              key={`bottom-${sponsor}-${index}`}
              className="flex items-center gap-12"
            >
              <span className="text-xs font-bold tracking-[0.25em] text-white">
                {sponsor}
              </span>

              <span className="h-1 w-1 rounded-full bg-[#00ff66]" />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-24 bg-gradient-to-r from-black/90 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-24 bg-gradient-to-l from-black/90 to-transparent" />
    </section>
  );
}
