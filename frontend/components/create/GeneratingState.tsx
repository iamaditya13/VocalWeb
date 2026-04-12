"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STAGES = [
  { label: "Analyzing your business description...", duration: 1800 },
  { label: "Understanding your industry...", duration: 1400 },
  { label: "Crafting your website structure...", duration: 2000 },
  { label: "Writing your content...", duration: 2200 },
  { label: "Applying your brand colors...", duration: 1200 },
  { label: "Optimizing for mobile...", duration: 1000 },
  { label: "Validating HTML structure...", duration: 800 },
  { label: "Final polish...", duration: 600 },
];

export function GeneratingState() {
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let elapsed = 0;
    const total = STAGES.reduce((s, st) => s + st.duration, 0);
    let stageIdx = 0;

    const advance = () => {
      if (stageIdx >= STAGES.length - 1) return;
      stageIdx++;
      setStageIndex(stageIdx);
    };

    let timeoutSum = 0;
    STAGES.forEach((stage, i) => {
      if (i === 0) return;
      timeoutSum += STAGES[i - 1].duration;
      setTimeout(advance, timeoutSum);
    });

    const interval = setInterval(() => {
      elapsed += 80;
      setProgress(Math.min(95, (elapsed / total) * 100));
    }, 80);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-10 text-center">
      {/* Animated logo */}
      <div className="flex items-center justify-center mb-8">
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-14 h-14 rounded-full border-2 border-zinc-100 border-t-zinc-900"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 bg-zinc-900 rounded-lg flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                <path d="M7 2C5.5 2 4 3 4 5v2c0 1.7 1.3 3 3 3s3-1.3 3-3V5c0-2-1.5-3-3-3z" fill="white" />
                <path d="M2 7c0 2.8 2.2 5 5 5s5-2.2 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Stage text */}
      <div className="h-8 mb-6 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={stageIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="text-[15px] font-medium text-zinc-700"
          >
            {STAGES[stageIndex].label}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      <div className="max-w-sm mx-auto mb-4">
        <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-zinc-900 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[11px] text-zinc-400">Building your website</span>
          <span className="text-[11px] font-medium text-zinc-500">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Stage dots */}
      <div className="flex justify-center gap-1.5 mt-6">
        {STAGES.map((_, i) => (
          <motion.div
            key={i}
            animate={{
              backgroundColor: i <= stageIndex ? "#18181b" : "#e4e4e7",
              scale: i === stageIndex ? 1.3 : 1,
            }}
            transition={{ duration: 0.2 }}
            className="w-1.5 h-1.5 rounded-full"
          />
        ))}
      </div>

      <p className="text-[12px] text-zinc-400 mt-6">
        This usually takes 5–15 seconds
      </p>
    </div>
  );
}
