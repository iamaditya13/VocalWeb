"use client";

import { motion } from "framer-motion";

interface WaveformProps {
  levels: number[];
  active: boolean;
}

export function Waveform({ levels, active }: WaveformProps) {
  return (
    <div className="flex items-center gap-0.5 h-10">
      {levels.map((level, i) => (
        <motion.div
          key={i}
          animate={{ height: active ? level : 3 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            duration: 0.1,
          }}
          className={`w-1 rounded-full transition-colors duration-300 ${
            active ? "bg-zinc-900" : "bg-zinc-200"
          }`}
          style={{ minHeight: 3 }}
        />
      ))}
    </div>
  );
}
