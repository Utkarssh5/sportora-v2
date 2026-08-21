'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Radio, ShieldCheck, Trophy, Zap, Plus, RotateCcw } from 'lucide-react';
import Navbar from '../../components/Navbar';

export default function LiveScorePage() {
  const [scoreA, setScoreA] = useState(18);
  const [scoreB, setScoreB] = useState(16);
  const [currentSet, setCurrentSet] = useState(3);

  return (
    <main className="min-h-screen bg-[#080B10] text-white selection:bg-[#00FF66] selection:text-black pt-28 pb-20 px-6">
      <Navbar />

      <div className="max-w-4xl mx-auto">
        
        {/* Live Indicator */}
        <div className="flex items-center justify-between mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-xs font-mono font-bold text-red-500">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span>LIVE MATCH SCORECARD (WEBSOCKET STREAM)</span>
          </div>

          <span className="text-xs font-mono text-gray-500">ARENA ID: #SPR-9982</span>
        </div>

        {/* Scoreboard Card */}
        <div className="clean-glass rounded-3xl p-8 border border-[#00FF66]/30 shadow-2xl relative overflow-hidden">
          
          <div className="text-center mb-8">
            <span className="text-xs font-bold text-[#00FF66] tracking-widest uppercase">
              JAIPUR BADMINTON OPEN • FINAL MATCH (SET {currentSet})
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Rajesh Smashers vs Jaipur Strikers
            </h1>
          </div>

          {/* Big Score Display */}
          <div className="grid grid-cols-2 gap-6 text-center my-8">
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
              <span className="text-sm font-bold text-gray-400 block mb-2">Team Smashers</span>
              <span className="text-7xl sm:text-8xl font-black text-[#00FF66]">{scoreA}</span>
              
              <div className="mt-6 flex justify-center gap-2">
                <button 
                  onClick={() => setScoreA(scoreA + 1)}
                  className="bg-[#00FF66] text-black p-3 rounded-full hover:bg-emerald-300 font-extrabold text-xs flex items-center gap-1 px-5"
                >
                  <Plus className="w-4 h-4" /> Point
                </button>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
              <span className="text-sm font-bold text-gray-400 block mb-2">Jaipur Strikers</span>
              <span className="text-7xl sm:text-8xl font-black text-cyan-400">{scoreB}</span>

              <div className="mt-6 flex justify-center gap-2">
                <button 
                  onClick={() => setScoreB(scoreB + 1)}
                  className="bg-cyan-400 text-black p-3 rounded-full hover:bg-cyan-300 font-extrabold text-xs flex items-center gap-1 px-5"
                >
                  <Plus className="w-4 h-4" /> Point
                </button>
              </div>
            </div>
          </div>

          {/* Reset Controls */}
          <div className="flex justify-center pt-4 border-t border-white/10">
            <button
              onClick={() => {
                setScoreA(0);
                setScoreB(0);
              }}
              className="text-xs font-bold text-gray-500 hover:text-white flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Scoreboard
            </button>
          </div>

        </div>

      </div>
    </main>
  );
}
