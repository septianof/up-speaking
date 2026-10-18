"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, type Transition } from "framer-motion";
import { Mascot, MascotMood } from "@/components/student/Mascot";
import { SparkleStar } from "@/components/student/LandingIcons";

interface MascotAction {
  speech: string;
  mood: MascotMood;
  durationMs: number;
  animate: {
    y: number[];
    rotate: number[];
    scaleX?: number[];
    scaleY?: number[];
    scale?: number[];
  };
  transition: Transition;
}

const MASCOT_ACTIONS: MascotAction[] = [
  // Aksi 1: Lompat Memutar 360° (Spin Flip Jump) + Say Hi!
  {
    speech: "Hi! 👋",
    mood: "cheer",
    durationMs: 850,
    animate: {
      y: [0, 8, -60, 4, 0],
      rotate: [0, -15, 360, 360, 0],
      scaleX: [1, 1.15, 0.88, 1.05, 1],
      scaleY: [1, 0.85, 1.15, 0.95, 1],
    },
    transition: { duration: 0.85, ease: "easeOut" },
  },
  // Aksi 2: Loncat-loncat Membal 2 Kali (Double Hop Bounce)
  {
    speech: "Let's Speak! 🚀",
    mood: "cheer",
    durationMs: 750,
    animate: {
      y: [0, -36, 0, -22, 0],
      rotate: [0, -10, 10, -5, 0],
      scaleX: [1, 0.92, 1.08, 0.96, 1],
      scaleY: [1, 1.08, 0.92, 1.04, 1],
    },
    transition: { duration: 0.75, ease: "easeInOut" },
  },
  // Aksi 3: Goyang Ceria & Kepak Sayap (Happy Wiggle & Flutter)
  {
    speech: "You rock! 🌟",
    mood: "wave",
    durationMs: 750,
    animate: {
      y: [0, -14, 0, -10, 0],
      rotate: [0, -18, 18, -14, 14, -6, 6, 0],
      scale: [1, 1.1, 0.95, 1.06, 1],
    },
    transition: { duration: 0.75, ease: "easeInOut" },
  },
];

const idleTransition: Transition = {
  duration: 4.5,
  repeat: Infinity,
  ease: "easeInOut",
};

export const HeroMascotInteractive: React.FC = () => {
  const [clickCount, setClickCount] = useState(0);
  const [isActing, setIsActing] = useState(false);
  const [actionKey, setActionKey] = useState(0);
  const [speechText, setSpeechText] = useState<string | null>(null);
  const [mood, setMood] = useState<MascotMood>("wave");
  const actionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const speechTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (actionTimerRef.current) clearTimeout(actionTimerRef.current);
      if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
    };
  }, []);

  const currentAction = MASCOT_ACTIONS[clickCount % MASCOT_ACTIONS.length];

  const handleTap = () => {
    const nextCount = clickCount + 1;
    const action = MASCOT_ACTIONS[clickCount % MASCOT_ACTIONS.length];
    setClickCount(nextCount);
    setActionKey((k) => k + 1);
    setIsActing(true);
    setMood(action.mood);
    setSpeechText(action.speech);

    if (actionTimerRef.current) clearTimeout(actionTimerRef.current);
    if (speechTimerRef.current) clearTimeout(speechTimerRef.current);

    // Kembalikan ke gerakan idle setelah durasi aksi selesai
    actionTimerRef.current = setTimeout(() => {
      setIsActing(false);
      setMood("wave");
    }, action.durationMs + 100);

    // Balon ucapan bertahan selama 2.2 detik
    speechTimerRef.current = setTimeout(() => {
      setSpeechText(null);
    }, 2200);
  };

  return (
    <div className="relative flex flex-col items-center select-none">
      {/* Balon Ucapan Muncul di Atas Maskot saat di-tap */}
      <AnimatePresence>
        {speechText && (
          <motion.div
            key={speechText + actionKey}
            initial={{ opacity: 0, y: 10, scale: 0.7 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.7 }}
            transition={{ type: "spring", stiffness: 450, damping: 22 }}
            className="absolute -top-12 sm:-top-14 z-30 px-4 py-1.5 rounded-2xl bg-white border-2 border-primary-300 shadow-md text-text-primary text-sm font-black flex items-center gap-1.5 whitespace-nowrap pointer-events-none"
          >
            <span>{speechText}</span>
            {/* Ekor balon ucapan */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[8px] border-t-primary-300" />
            <div className="absolute -bottom-[5.5px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[7px] border-t-white" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Partikel Sparkle Burst saat berakrobat */}
      <AnimatePresence>
        {actionKey > 0 && (
          <motion.div
            key={actionKey}
            className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ x: 0, y: 0, scale: 0, rotate: 0 }}
              animate={{ x: -50, y: -50, scale: 1.3, rotate: -40 }}
              transition={{ duration: 0.65, ease: "easeOut" }}
              className="absolute text-sun-400 w-5 h-5 drop-shadow-xs"
            >
              <SparkleStar />
            </motion.div>
            <motion.div
              initial={{ x: 0, y: 0, scale: 0, rotate: 0 }}
              animate={{ x: 50, y: -45, scale: 1.2, rotate: 35 }}
              transition={{ duration: 0.65, ease: "easeOut", delay: 0.05 }}
              className="absolute text-amber-400 w-5 h-5 drop-shadow-xs"
            >
              <SparkleStar />
            </motion.div>
            <motion.div
              initial={{ x: 0, y: 0, scale: 0 }}
              animate={{ x: 0, y: -70, scale: 1.1 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.08 }}
              className="absolute text-sun-300 w-4 h-4 drop-shadow-xs"
            >
              <SparkleStar />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tombol Interaktif Frameless untuk Maskot */}
      <button
        type="button"
        onClick={handleTap}
        aria-label="Interaksi dengan maskot Upi"
        className="relative p-2 flex flex-col items-center cursor-pointer select-none focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-400 rounded-full"
      >
        <motion.div
          key={actionKey}
          animate={
            isActing
              ? currentAction.animate
              : {
                  y: [0, -8, 0],
                  rotate: [-2, 2, -2],
                  scaleX: [1, 1.015, 1],
                  scaleY: [1, 0.985, 1],
                }
          }
          transition={isActing ? currentAction.transition : idleTransition}
        >
          <Mascot mood={mood} size={220} floating={false} />
        </motion.div>

        {/* Bayangan lantai dinamis di bawah kaki */}
        <motion.div
          animate={
            isActing
              ? { scale: [1, 0.55, 1], opacity: [0.22, 0.08, 0.22] }
              : { scale: [1, 0.9, 1], opacity: [0.18, 0.12, 0.18] }
          }
          transition={isActing ? currentAction.transition : idleTransition}
          className="w-32 h-3.5 rounded-full bg-slate-900/12 blur-[2px] -mt-2 pointer-events-none"
        />
      </button>
    </div>
  );
};
