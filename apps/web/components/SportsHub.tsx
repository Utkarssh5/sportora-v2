'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, ShieldCheck, Zap, ArrowUpRight, Play, Radio, 
  Terminal, BarChart3, Users, Flame, ChevronRight
} from 'lucide-react';

const CATEGORIES = [
  { id: 'cricket', name: 'CRICKET ARENA', count: '42 Matches', video: 'https://assets.mixkit.co/videos/preview/mixkit-cricket-batsman-hitting-a-ball-41569-large.mp4' },
  { id: 'badminton', name: 'BADMINTON PRO', count: '18 Matches', video: 'https://assets.mixkit.co/videos/preview/mixkit-two-people-playing-badminton-in-a-court-41528-large.mp4' },
  { id: 'football', name: 'FOOTBALL LEAGUE', count: '29 Matches', video: 'https://assets.mixkit.co/videos/preview/mixkit-soccer-player-kicking-a-ball-41523-large.mp4' },
  { id: 'esports', name: 'E-SPORTS DISPATCH', count: '55 Matches', video: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-controller-playing-video-games-41548-large.mp4' },
];

export default function SportsHub() {
  const [selected, setSelected] = useState(CATEGORIES[0]);

  return (
    <div className="min-h-screen bg-[#0B0E14] text-[#ECEFF1] pt-16 pb-12 font-sans relative overflow-hidden">
      
      {/* Background Video Layer with Scanline Effect */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selected.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover filter grayscale contrast-150"
          >
            <source src={selected.video} type="video/mp4" />
          </video>
          <div className="absolute inset-0 video-scanline" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/80 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 relative z-10 pt-6">
        
        {/* Top Service Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#232B3B] pb-4 mb-6">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-gray-500">REGION:</span>
            <span className="text-[#FF9900] bg-[#FF9900]/10 px-2 py-0.5 border border-[#FF9900]/20">ap-south-1 (Jaipur Node)</span>
            <span className="text-gray-500 ml-2">SYSTEM STATUS:</span>
            <span className="text-[#00E5FF] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-ping" /> OPERATIONAL
            </span>
          </div>

          <div className="flex items-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelected(cat)}
                className={`text-xs font-mono px-3 py-1 border transition-all ${
                  selected.id === cat.id
                    ? 'bg-[#FF9900] text-black font-bold border-[#FF9900]'
                    : 'bg-[#151922] text-gray-400 border-[#232B3B] hover:border-gray-500'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Hero Banner Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mb-8">
          
          {/* Main Hero Header (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#FF9900] mb-3">
                <Flame className="w-4 h-4 fill-[#FF9900]" /> TOURNAMENT INFRASTRUCTURE ENGINE
              </div>

              <h1 className="font-sports text-5xl sm:text-7xl font-bold tracking-tight uppercase leading-none text-white mb-4">
                AUTOMATED <span className="text-[#FF9900]">SPORTS</span> DISPATCH & COMPLIANCE.
              </h1>

              <p className="text-sm md:text-base text-gray-400 max-w-2xl font-normal leading-relaxed">
                Deploy tournaments with zero risk. Automated ground NOC validation, instant referee dispatch, real-time live scoring, and ledger-verified payouts.
              </p>
            </div>

            {/* Quick Action Prompt */}
            <div className="mt-8 bg-[#151922] border border-[#232B3B] p-2 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-[#FF9900] ml-2 shrink-0" />
              <input
                type="text"
                placeholder={`Type command or prompt: "Deploy ${selected.name} tournament in Jaipur"`}
                className="w-full bg-transparent text-sm text-white placeholder-gray-500 outline-none font-mono"
              />
              <button className="bg-[#FF9900] hover:bg-[#e68a00] text-black font-mono text-xs font-bold px-5 py-2.5 flex items-center gap-1 transition-colors">
                RUN COMMAND <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Real-time Stream Console (4 Cols) */}
          <div className="lg:col-span-4 aws-card p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#232B3B] mb-4">
                <span className="text-xs font-mono text-gray-400 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-[#00E5FF] animate-pulse" /> LIVE STREAM LOGS
                </span>
                <span className="text-[10px] font-mono text-gray-500">ID: #4092</span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="bg-[#0B0E14] p-3 border border-[#232B3B]">
                  <div className="text-gray-500 flex justify-between mb-1">
                    <span>SEMI FINAL #1</span>
                    <span className="text-[#00E5FF]">LIVE</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-white">
                    <span>Apex Strikers</span>
                    <span className="text-[#FF9900]">112 / 4</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Royal Panthers</span>
                    <span>98 / 8</span>
                  </div>
                </div>

                <div className="bg-[#0B0E14] p-3 border border-[#232B3B]">
                  <div className="text-gray-500 flex justify-between mb-1">
                    <span>GROUND CREW DISPATCH</span>
                    <span className="text-emerald-400 font-bold">MATCHED</span>
                  </div>
                  <div className="text-gray-300">
                    2 Official Referees assigned to Jaipur Arena #3
                  </div>
                </div>
              </div>
            </div>

            <button className="w-full mt-4 bg-[#232B3B] hover:bg-[#2E384D] text-xs font-mono text-white py-2 flex items-center justify-center gap-1 transition-colors">
              VIEW ALL ACTIVE LOGS <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* AWS Style Interactive Service Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="aws-card p-5 group cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <Trophy className="w-6 h-6 text-[#FF9900]" />
              <span className="text-[10px] font-mono bg-[#FF9900]/10 text-[#FF9900] px-1.5 py-0.5 border border-[#FF9900]/20">SERVICE</span>
            </div>
            <h3 className="font-sports text-xl font-bold text-white group-hover:text-[#FF9900] transition-colors">
              Tournament Engine
            </h3>
            <p className="text-xs text-gray-400 mt-1 font-normal leading-relaxed">
              Create, configure brackets, and manage entry fees with automated risk scores.
            </p>
            <div className="mt-4 pt-3 border-t border-[#232B3B] text-[11px] font-mono text-gray-500 flex items-center justify-between">
              <span>Risk Assessment</span>
              <span className="text-emerald-400">0% Fraud Flag</span>
            </div>
          </div>

          <div className="aws-card aws-card-cyan p-5 group cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <Users className="w-6 h-6 text-[#00E5FF]" />
              <span className="text-[10px] font-mono bg-[#00E5FF]/10 text-[#00E5FF] px-1.5 py-0.5 border border-[#00E5FF]/20">MARKETPLACE</span>
            </div>
            <h3 className="font-sports text-xl font-bold text-white group-hover:text-[#00E5FF] transition-colors">
              Ground Crew On-Demand
            </h3>
            <p className="text-xs text-gray-400 mt-1 font-normal leading-relaxed">
              Hire verified umpires, scorekeepers, and medical crew by sport & city.
            </p>
            <div className="mt-4 pt-[#232B3B] pt-3 border-t border-[#232B3B] text-[11px] font-mono text-gray-500 flex items-center justify-between">
              <span>Verified Personnel</span>
              <span className="text-[#00E5FF]">100% KYC Approved</span>
            </div>
          </div>

          <div className="aws-card aws-card-purple p-5 group cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <BarChart3 className="w-6 h-6 text-[#9D4EDD]" />
              <span className="text-[10px] font-mono bg-[#9D4EDD]/10 text-[#9D4EDD] px-1.5 py-0.5 border border-[#9D4EDD]/20">REAL-TIME</span>
            </div>
            <h3 className="font-sports text-xl font-bold text-white group-hover:text-[#9D4EDD] transition-colors">
              Digital Scorecard
            </h3>
            <p className="text-xs text-gray-400 mt-1 font-normal leading-relaxed">
              WebSocket live scoring feeds for spectator views, points, and sets.
            </p>
            <div className="mt-4 pt-3 border-t border-[#232B3B] text-[11px] font-mono text-gray-500 flex items-center justify-between">
              <span>Latency</span>
              <span className="text-[#9D4EDD]">&lt; 120ms</span>
            </div>
          </div>

          <div className="aws-card p-5 group cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <span className="text-[10px] font-mono bg-emerald-400/10 text-emerald-400 px-1.5 py-0.5 border border-emerald-400/20">SECURITY</span>
            </div>
            <h3 className="font-sports text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
              Compliance & Ledger
            </h3>
            <p className="text-xs text-gray-400 mt-1 font-normal leading-relaxed">
              Govt ID verification, venue NOC check, and automated entry payouts.
            </p>
            <div className="mt-4 pt-3 border-t border-[#232B3B] text-[11px] font-mono text-gray-500 flex items-center justify-between">
              <span>Ledger Status</span>
              <span className="text-emerald-400">Encrypted</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
