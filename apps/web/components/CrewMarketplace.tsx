'use client';

import { motion } from 'framer-motion';
import { Users, ShieldCheck, Star, Zap } from 'lucide-react';

const MOCK_CREW = [
  {
    id: 'c1',
    name: 'Rajesh Sharma',
    role: 'Senior Badminton Referee',
    rating: 4.9,
    matchesCount: 84,
    city: 'Jaipur',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'c2',
    name: 'Vikramaditya Singh',
    role: 'BCCI Level-1 Cricket Umpire',
    rating: 4.8,
    matchesCount: 120,
    city: 'Jaipur / Delhi',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'c3',
    name: 'Ananya Verma',
    role: 'Official Digital Scorekeeper',
    rating: 5.0,
    matchesCount: 45,
    city: 'Gurgaon',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
  },
];

export default function CrewMarketplace() {
  return (
    <section id="crew" className="py-20 px-6 max-w-7xl mx-auto border-t border-white/10">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 tracking-widest uppercase mb-3">
          <Users className="w-4 h-4" /> ON-DEMAND MARKETPLACE
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
          HIRE VERIFIED GROUND CREW
        </h2>
        <p className="text-gray-400 mt-4 text-base">
          Book KYC-verified referees, scorekeepers, and umpires near your tournament venue in minutes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {MOCK_CREW.map((crew) => (
          <motion.div
            key={crew.id}
            whileHover={{ y: -6 }}
            className="clean-glass rounded-3xl p-6 text-center border border-white/10 hover:border-cyan-400/50 transition-all relative flex flex-col items-center justify-between"
          >
            <div>
              <div className="relative w-24 h-24 mx-auto mb-4">
                <img
                  src={crew.avatar}
                  alt={crew.name}
                  className="w-full h-full object-cover rounded-full border-2 border-cyan-400"
                />
                <ShieldCheck className="w-6 h-6 text-cyan-400 fill-black absolute bottom-0 right-0" />
              </div>

              <h3 className="text-xl font-bold text-white">{crew.name}</h3>
              <p className="text-xs text-cyan-400 font-semibold mt-1">{crew.role}</p>
              <p className="text-xs text-gray-500 mt-0.5">{crew.city}</p>

              <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-300">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> {crew.rating}
                </span>
                <span>•</span>
                <span>{crew.matchesCount} Matches Done</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-6 w-full py-3 bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-full hover:bg-cyan-300 transition-colors flex items-center justify-center gap-1.5"
            >
              <Zap className="w-4 h-4 fill-black" /> Hire For Event
            </motion.button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
