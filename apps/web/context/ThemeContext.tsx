'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame } from 'lucide-react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const MOTIVATIONAL_QUOTES = [
  "CHAMPIONS ARE MADE WHEN NO ONE IS WATCHING",
  "SWITCHING ARENA VIBE REFUEL YOUR FIRE",
  "PUSH YOUR LIMITS TODAY TOMORROW IS YOURS",
  "LIGHT OR DARK THE COURT IS ALWAYS YOURS"
];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentQuote, setCurrentQuote] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('sportora-theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const randomQ = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
    setCurrentQuote(randomQ);
    
    // 1. Show Portal Blackout Overlay
    setIsTransitioning(true);

    const nextTheme = theme === 'dark' ? 'light' : 'dark';

    // 2. Switch theme midway at 2.5s
    setTimeout(() => {
      setTheme(nextTheme);
      localStorage.setItem('sportora-theme', nextTheme);
      document.documentElement.setAttribute('data-theme', nextTheme);
    }, 2500);

    // 3. Hide transition completely after 5 seconds
    setTimeout(() => {
      setIsTransitioning(false);
    }, 5000);
  };

  const words = currentQuote.split(" ");

  const overlayJSX = (
    <AnimatePresence>
      {isTransitioning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: '#080B10',
            zIndex: 999999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          {/* Opaque Crystal-Clear Quote Box Container */}
          <motion.div 
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-xl bg-[#121722] p-8 sm:p-14 rounded-[36px] border border-white/20 shadow-[0_0_150px_rgba(0,0,0,1)] flex flex-col items-center space-y-6 text-center"
          >
            <div className="w-16 h-16 bg-[#00FF66] text-black rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(0,255,102,0.6)] shrink-0">
              <Flame className="w-10 h-10 fill-black animate-bounce" />
            </div>

            <div className="text-[11px] font-mono font-black text-[#00FF66] tracking-[0.35em] uppercase">
              // SWITCHING ARENA VIBE //
            </div>

            {/* High-Contrast, Perfectly Spaced Words */}
            <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-3 text-xl sm:text-3xl font-black text-white italic tracking-wide uppercase">
              {words.map((word, i) => {
                let initialX = 0;
                let initialY = 0;
                if (i % 4 === 0) initialY = -70; // Top
                else if (i % 4 === 1) initialX = 70;  // Right
                else if (i % 4 === 2) initialY = 70;  // Bottom
                else initialX = -70; // Left

                return (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, x: initialX, y: initialY }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: 0.15 + i * 0.12,
                      type: 'spring',
                      stiffness: 150
                    }}
                    className="inline-block text-white px-1.5 drop-shadow-lg"
                  >
                    {word}
                  </motion.span>
                );
              })}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00FF66] animate-ping" />
              <span className="text-[10px] font-mono text-gray-400 tracking-widest uppercase">
                PREPARING 5-SECOND REFRESH...
              </span>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
      {mounted && createPortal(overlayJSX, document.body)}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
