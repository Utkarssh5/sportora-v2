'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, MapPin, Calendar, Trophy, X, ArrowRight, 
  CheckCircle2, Clock, PhoneCall, FileText, UserCheck 
} from 'lucide-react';

interface TournamentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToJoin: () => void;
  tournament: any;
}

export default function TournamentDetailModal({ 
  isOpen, 
  onClose, 
  onProceedToJoin, 
  tournament 
}: TournamentDetailModalProps) {
  if (!isOpen || !tournament) return null;

  // Sport-wise video fallback
  const videoSource = tournament.videoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-badminton-players-in-a-court-41530-large.mp4';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg overflow-y-auto">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="clean-glass max-w-2xl w-full my-8 rounded-3xl overflow-hidden border border-[#00FF66]/50 shadow-2xl relative text-left"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/70 p-2 rounded-full text-white hover:bg-black z-20"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Video Banner Header */}
          <div className="relative h-56 sm:h-64 bg-black overflow-hidden">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover filter contrast-110 brightness-90"
            >
              <source src={videoSource} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-[#080B10] via-[#080B10]/40 to-transparent" />
            
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className="bg-[#00FF66] text-black text-xs font-black px-3 py-1 rounded-full uppercase">
                {tournament.sport}
              </span>
              <span className="bg-cyan-400 text-black text-xs font-black px-3 py-1 rounded-full uppercase flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> ADMIN VERIFIED
              </span>
            </div>

            <div className="absolute bottom-4 left-6 right-6">
              <div className="text-xs font-bold text-[#00FF66] flex items-center gap-1.5 mb-1">
                <CheckCircle2 className="w-4 h-4" /> AI Venue Compliance Certified • {tournament.riskScore || 98}% Security Score
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">{tournament.title}</h2>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-6 sm:p-8 space-y-6 max-h-[60vh] overflow-y-auto text-sm text-gray-300">
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                <span className="text-[10px] text-gray-500 font-bold uppercase block">Venue</span>
                <span className="font-bold text-white text-xs flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#00FF66]" /> {tournament.city}
                </span>
              </div>

              <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                <span className="text-[10px] text-gray-500 font-bold uppercase block">Date & Time</span>
                <span className="font-bold text-white text-xs flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" /> {tournament.date}
                </span>
              </div>

              <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                <span className="text-[10px] text-gray-500 font-bold uppercase block">Reporting</span>
                <span className="font-bold text-white text-xs flex items-center gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> 8:30 AM IST
                </span>
              </div>

              <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                <span className="text-[10px] text-gray-500 font-bold uppercase block">Entry Fee</span>
                <span className="font-black text-[#00FF66] text-xs mt-0.5 block">
                  {tournament.entryFee} / Player
                </span>
              </div>
            </div>

            {/* Prize Pool Breakdown */}
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
              <div className="flex items-center gap-2 text-xs font-bold text-[#00FF66] mb-3">
                <Trophy className="w-4 h-4" /> PRIZE POOL BREAKDOWN ({tournament.prizePool})
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-black/40 p-3 rounded-xl border border-[#00FF66]/30">
                  <div className="text-[10px] text-gray-400 uppercase font-bold">🥇 1st Place (Winner)</div>
                  <div className="font-black text-white text-base mt-0.5">₹30,000 + Trophy</div>
                </div>

                <div className="bg-black/40 p-3 rounded-xl border border-white/10">
                  <div className="text-[10px] text-gray-400 uppercase font-bold">🥈 2nd Place (Runner-Up)</div>
                  <div className="font-black text-white text-base mt-0.5">₹15,000 + Trophy</div>
                </div>

                <div className="bg-black/40 p-3 rounded-xl border border-white/10">
                  <div className="text-[10px] text-gray-400 uppercase font-bold">🥉 Semi-Finalists</div>
                  <div className="font-black text-white text-base mt-0.5">₹2,500 Each</div>
                </div>
              </div>
            </div>

            {/* Rules */}
            <div className="space-y-3">
              <h4 className="font-bold text-white text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" /> Tournament Rules & Regulations
              </h4>
              <ul className="list-disc list-inside text-xs text-gray-400 space-y-1.5 pl-1">
                <li>Official Match Equipment: Yonex AS-20 Feather Shuttles provided by venue.</li>
                <li>Knockout Format: Matches will be best of 3 sets (21 points each).</li>
                <li>Original Govt ID mandatory during morning desk reporting.</li>
                <li>Official Ground Referees assigned via Sportora Crew Marketplace.</li>
              </ul>
            </div>

            {/* Organizer */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-[#00FF66]" /> Organized By: Rajasthan Sports Association
                </div>
                <div className="text-xs text-gray-400 flex items-center gap-1.5 mt-1">
                  <PhoneCall className="w-3.5 h-3.5 text-gray-500" /> Official Desk: +91 98290 XXXXX (Verified ID)
                </div>
              </div>
            </div>

          </div>

          {/* Action Footer */}
          <div className="p-6 bg-black/60 border-t border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase block">REGISTER BEFORE</span>
              <span className="text-xs font-bold text-white">Aug 10, 2026 (Limited Slots)</span>
            </div>

            <button
              onClick={() => {
                onClose();
                onProceedToJoin();
              }}
              className="bg-[#00FF66] text-black font-extrabold px-8 py-3.5 rounded-full text-xs uppercase tracking-wider hover:bg-emerald-300 transition-all flex items-center gap-2 shadow-lg shadow-[#00FF66]/20"
            >
              REGISTER FOR TOURNAMENT <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
