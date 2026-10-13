"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export type MascotMood = "wave" | "happy" | "cheer" | "think" | "lost";

export interface MascotProps {
  mood?: MascotMood;
  size?: number;
  floating?: boolean;
  className?: string;
}

const BLUE = "#3D98D6";
const BLUE_DARK = "#2B82BF";
const BELLY = "#EFF6FC";
const SUN = "#FFC93C";
const ORANGE = "#F59E0B";
const CORAL = "#ED3937";
const INK = "#0F172A";

const Star: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <polygon
    transform={`translate(${x} ${y}) scale(${s})`}
    points="0,-9 2.6,-2.8 9,-2.8 3.8,1.4 5.8,8 0,4 -5.8,8 -3.8,1.4 -9,-2.8 -2.6,-2.8"
    fill={SUN}
    stroke={ORANGE}
    strokeWidth="1"
    strokeLinejoin="round"
  />
);

/**
 * "Upi" - maskot burung biru Up Speaking.
 * Dibuat sebagai SVG inline agar ringan dan tajam di semua layar.
 */
export const Mascot: React.FC<MascotProps> = ({
  mood = "happy",
  size = 200,
  floating = false,
  className,
}) => {
  const reduceMotion = useReducedMotion();
  const raiseRight = mood === "wave" || mood === "cheer";
  const raiseLeft = mood === "cheer";

  const body = (
    <svg
      viewBox="0 0 200 200"
      role="img"
      aria-label="Maskot Up Speaking"
      className="block h-auto w-full"
    >
      {/* Bayangan */}
      <ellipse cx="100" cy="186" rx="44" ry="6" fill="#0F172A" opacity="0.08" />

      {/* Kaki */}
      <ellipse cx="84" cy="180" rx="11" ry="5" fill={ORANGE} />
      <ellipse cx="116" cy="180" rx="11" ry="5" fill={ORANGE} />

      {/* Sayap kiri */}
      <g transform={raiseLeft ? "rotate(38 52 120)" : "rotate(-8 52 130)"}>
        <ellipse cx="40" cy="128" rx="14" ry="28" fill={BLUE_DARK} />
      </g>

      {/* Badan */}
      <ellipse cx="100" cy="115" rx="62" ry="64" fill={BLUE} />
      <ellipse cx="100" cy="132" rx="40" ry="42" fill={BELLY} />

      {/* Jambul */}
      <path d="M92 54 C86 40 94 30 100 40 C102 28 114 32 110 54 Z" fill={BLUE_DARK} />

      {/* Sayap kanan */}
      <g transform={raiseRight ? "rotate(-38 148 120)" : "rotate(8 148 130)"}>
        <ellipse cx="160" cy="128" rx="14" ry="28" fill={BLUE_DARK} />
      </g>

      {/* Pipi */}
      <ellipse cx="64" cy="120" rx="9" ry="6" fill={CORAL} opacity="0.25" />
      <ellipse cx="136" cy="120" rx="9" ry="6" fill={CORAL} opacity="0.25" />

      {/* Mata */}
      {mood === "cheer" ? (
        <>
          <path d="M68 102 Q80 90 92 102" stroke={INK} strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M108 102 Q120 90 132 102" stroke={INK} strokeWidth="5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="80" cy="100" r="14" fill="#fff" />
          <circle cx="120" cy="100" r="14" fill="#fff" />
          <circle cx={mood === "think" ? 85 : 82} cy={mood === "think" ? 96 : 102} r="7.5" fill={INK} />
          <circle cx={mood === "think" ? 125 : 118} cy={mood === "think" ? 96 : 102} r="7.5" fill={INK} />
          <circle cx={mood === "think" ? 87 : 85} cy={mood === "think" ? 93 : 99} r="2.6" fill="#fff" />
          <circle cx={mood === "think" ? 127 : 121} cy={mood === "think" ? 93 : 99} r="2.6" fill="#fff" />
        </>
      )}

      {/* Alis untuk mood "lost" */}
      {mood === "lost" && (
        <>
          <path d="M68 84 L90 90" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
          <path d="M132 84 L110 90" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
        </>
      )}

      {/* Paruh */}
      <path d="M90 114 L110 114 L100 128 Z" fill={SUN} stroke={SUN} strokeWidth="6" strokeLinejoin="round" />
      {(mood === "happy" || mood === "cheer" || mood === "wave") && (
        <path d="M93 128 Q100 140 107 128 Z" fill={ORANGE} stroke={ORANGE} strokeWidth="3" strokeLinejoin="round" />
      )}

      {/* Bintang saat bersorak */}
      {mood === "cheer" && (
        <>
          <Star x={30} y={50} s={1.1} />
          <Star x={172} y={44} s={1.3} />
          <Star x={158} y={16} s={0.8} />
          <Star x={44} y={20} s={0.7} />
        </>
      )}

      {/* Tanda tanya saat berpikir / tersesat */}
      {(mood === "think" || mood === "lost") && (
        <text
          x="158"
          y="44"
          fontSize="40"
          fontWeight="800"
          fill={SUN}
          stroke={ORANGE}
          strokeWidth="1.5"
          fontFamily="var(--font-baloo), sans-serif"
        >
          ?
        </text>
      )}
    </svg>
  );

  if (!floating || reduceMotion) {
    return (
      <div
        className={cn("inline-block", className)}
        style={{ width: size, maxWidth: "100%" }}
      >
        {body}
      </div>
    );
  }

  return (
    <motion.div
      className={cn("inline-block", className)}
      style={{ width: size, maxWidth: "100%" }}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      {body}
    </motion.div>
  );
};
