'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, CreditCard, CheckCircle2, X, ArrowRight, Smartphone } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: {
    title: string;
    entryFee: string;
    city: string;
    date: string;
    venue: string;
  } | null;
}

export default function CheckoutModal({ isOpen, onClose, tournament }: CheckoutModalProps) {
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [loading, setLoading] = useState(false);
  
  const [playerName, setPlayerName] = useState('');
  const [phone, setPhone] = useState('');
  const [teamName, setTeamName] = useState('');

  if (!isOpen || !tournament) return null;

  function handleProceedToPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!playerName || !phone) return;
    setStep('payment');
  }

  function handleSimulatePayment() {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('success');
    }, 1500);
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="clean-glass max-w-lg w-full p-6 sm:p-8 rounded-3xl border border-[#00FF66]/50 shadow-2xl relative text-left"
        >
          <button
            onClick={() => {
              setStep('details');
              onClose();
            }}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          {/* STEP 1: PLAYER DETAILS */}
          {step === 'details' && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#00FF66] mb-1">
                <ShieldCheck className="w-4 h-4" /> AI COMPLIANCE VERIFIED
              </div>
              <h3 className="text-2xl font-black text-white">{tournament.title}</h3>
              <p className="text-xs text-gray-400 mt-1">{tournament.venue} • {tournament.date}</p>

              <form onSubmit={handleProceedToPayment} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Player / Captain Name</label>
                  <input
                    type="text"
                    required
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#00FF66]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-1">WhatsApp Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#00FF66]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Team / Club Name (Optional)</label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g. Jaipur Smashers"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#00FF66]"
                  />
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-bold block">TOTAL ENTRY FEE</span>
                    <span className="text-xl font-black text-[#00FF66]">{tournament.entryFee}</span>
                  </div>

                  <button
                    type="submit"
                    className="bg-[#00FF66] text-black font-extrabold px-6 py-3 rounded-full text-xs uppercase tracking-wider hover:bg-emerald-300 transition-all flex items-center gap-1.5"
                  >
                    PROCEED TO PAY <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 2: PAYMENT */}
          {step === 'payment' && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-[#00FF66]/10 border border-[#00FF66]/30 flex items-center justify-center mx-auto mb-4 text-[#00FF66]">
                <CreditCard className="w-8 h-8" />
              </div>

              <h3 className="text-2xl font-black text-white">SECURE PAYMENT CHECKOUT</h3>
              <p className="text-xs text-gray-400 mt-1">Sportora Payment Gateway (Razorpay Verified)</p>

              <div className="my-6 bg-white/5 p-4 rounded-2xl text-left space-y-2 text-xs">
                <div className="flex justify-between text-gray-300">
                  <span>Player:</span>
                  <span className="font-bold text-white">{playerName}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Event:</span>
                  <span className="font-bold text-white">{tournament.title}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Amount Payable:</span>
                  <span className="font-black text-[#00FF66] text-sm">{tournament.entryFee}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <button 
                  onClick={handleSimulatePayment}
                  disabled={loading}
                  className="bg-white/10 border border-white/20 hover:border-[#00FF66] p-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-white transition-all"
                >
                  <Smartphone className="w-4 h-4 text-[#00FF66]" /> UPI / GPay
                </button>
                <button 
                  onClick={handleSimulatePayment}
                  disabled={loading}
                  className="bg-white/10 border border-white/20 hover:border-[#00FF66] p-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-white transition-all"
                >
                  <CreditCard className="w-4 h-4 text-cyan-400" /> Card / NetBanking
                </button>
              </div>

              <button
                onClick={handleSimulatePayment}
                disabled={loading}
                className="w-full py-3.5 bg-[#00FF66] text-black font-extrabold text-xs uppercase tracking-wider rounded-full hover:bg-emerald-300 transition-all flex items-center justify-center gap-1.5"
              >
                {loading ? 'Processing Transaction...' : `PAY ${tournament.entryFee} NOW`}
              </button>
            </div>
          )}

          {/* STEP 3: SUCCESS */}
          {step === 'success' && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-[#00FF66] text-black flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <span className="text-xs font-bold text-[#00FF66] tracking-widest uppercase">REGISTRATION SUCCESSFUL!</span>
              <h3 className="text-2xl font-black text-white mt-1">MATCH PASS GENERATED</h3>

              <div className="my-6 bg-white/5 border border-[#00FF66]/40 p-5 rounded-2xl text-left space-y-2 text-xs relative overflow-hidden">
                <div className="text-[10px] text-gray-500 font-mono">TICKET PASS ID: #SPR-2026-9941</div>
                <div className="font-bold text-white text-lg">{tournament.title}</div>
                <div className="text-gray-300">{playerName} • {phone}</div>
                <div className="text-[#00FF66] font-semibold pt-2 border-t border-white/10">
                  Status: Entry Confirmed (QR Ticket Sent on WhatsApp)
                </div>
              </div>

              <button
                onClick={() => {
                  setStep('details');
                  onClose();
                }}
                className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-full transition-all"
              >
                DONE / BACK TO ARENA
              </button>
            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
