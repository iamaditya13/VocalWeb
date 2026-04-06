"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, RotateCcw, ArrowRight, Type } from "lucide-react";
import { Waveform } from "./Waveform";

interface VoiceRecorderProps {
  onTranscriptReady: (text: string) => void;
  onSkip: (text: string) => void;
}

type RecordingState = "idle" | "listening" | "paused" | "done";

export function VoiceRecorder({ onTranscriptReady, onSkip }: VoiceRecorderProps) {
  const [state, setState] = useState<RecordingState>("idle");
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [showTextFallback, setShowTextFallback] = useState(false);
  const [supported, setSupported] = useState(true);
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(20).fill(2));
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: typeof window.SpeechRecognition; webkitSpeechRecognition?: typeof window.SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      setShowTextFallback(true);
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const startAudioVisualization = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const tick = () => {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const levels = Array.from(data.slice(0, 20)).map((v) =>
          Math.max(2, Math.min(32, (v / 255) * 32))
        );
        setAudioLevels(levels);
        animFrameRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      // Fallback: animate bars randomly
      const tick = () => {
        setAudioLevels((prev) =>
          prev.map((v) => Math.max(2, Math.min(32, v + (Math.random() - 0.5) * 6)))
        );
        animFrameRef.current = requestAnimationFrame(tick);
      };
      tick();
    }
  }, []);

  const stopVisualization = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setAudioLevels(Array(20).fill(2));
  }, []);

  const startRecording = useCallback(() => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: typeof window.SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      let final = "";
      let interim = "";
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          final += e.results[i][0].transcript + " ";
        } else {
          interim += e.results[i][0].transcript;
        }
      }
      setTranscript(final);
      setInterimText(interim);
    };

    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      if (e.error !== "aborted") {
        setState("done");
        stopVisualization();
      }
    };

    recognition.onend = () => {
      stopVisualization();
      setState((prev) => (prev === "listening" ? "done" : prev));
    };

    recognitionRef.current = recognition;
    recognition.start();
    setState("listening");
    startAudioVisualization();
  }, [startAudioVisualization, stopVisualization]);

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
    stopVisualization();
    setState("done");
  }, [stopVisualization]);

  const reset = useCallback(() => {
    recognitionRef.current?.abort();
    stopVisualization();
    setTranscript("");
    setInterimText("");
    setState("idle");
  }, [stopVisualization]);

  const handleContinue = () => {
    const full = (transcript + " " + interimText).trim();
    if (full.length < 10) return;
    onTranscriptReady(full);
  };

  if (showTextFallback) {
    return <TextFallback onSkip={onSkip} />;
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
      {/* Main recording area */}
      <div className="p-8 text-center">
        {/* Mic button */}
        <div className="relative inline-flex items-center justify-center mb-6">
          {/* Pulse rings */}
          <AnimatePresence>
            {state === "listening" && (
              <>
                {[1, 2, 3].map((ring) => (
                  <motion.div
                    key={ring}
                    className="absolute rounded-full border border-zinc-200"
                    initial={{ width: 64, height: 64, opacity: 0.6 }}
                    animate={{ width: 64 + ring * 28, height: 64 + ring * 28, opacity: 0 }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      delay: ring * 0.4,
                      ease: "easeOut",
                    }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>

          <motion.button
            onClick={state === "listening" ? stopRecording : startRecording}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center shadow-float transition-all duration-200 ${
              state === "listening"
                ? "bg-zinc-900 hover:bg-zinc-800"
                : "bg-zinc-900 hover:bg-zinc-800"
            }`}
          >
            {state === "listening" ? (
              <MicOff size={22} className="text-white" />
            ) : (
              <Mic size={22} className="text-white" />
            )}
          </motion.button>
        </div>

        {/* State label */}
        <div className="mb-4">
          <AnimatePresence mode="wait">
            {state === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="text-[15px] font-medium text-zinc-900">Click to start recording</p>
                <p className="text-[13px] text-zinc-400 mt-1">Speak clearly about your business</p>
              </motion.div>
            )}
            {state === "listening" && (
              <motion.div
                key="listening"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex items-center justify-center gap-2 text-[15px] font-medium text-zinc-900">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  Listening...
                </div>
                <p className="text-[13px] text-zinc-400 mt-1">Click the mic to stop</p>
              </motion.div>
            )}
            {state === "done" && (
              <motion.div
                key="done"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="text-[15px] font-medium text-zinc-900">Recording complete</p>
                <p className="text-[13px] text-zinc-400 mt-1">Review your transcript below</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Waveform */}
        <div className="flex items-center justify-center h-12 mb-4">
          <Waveform levels={audioLevels} active={state === "listening"} />
        </div>

        {/* Transcript display */}
        <AnimatePresence>
          {(transcript || interimText) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-left mb-4"
            >
              <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Transcript
              </div>
              <p className="text-[14px] text-zinc-700 leading-relaxed">
                {transcript}
                {interimText && (
                  <span className="text-zinc-400 italic">{interimText}</span>
                )}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom actions */}
      <div className="border-t border-zinc-100 px-6 py-4 flex items-center justify-between bg-zinc-50">
        <div className="flex items-center gap-3">
          {(state === "done" || transcript) && (
            <button
              onClick={reset}
              className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-500 hover:text-zinc-800 transition-colors"
            >
              <RotateCcw size={12} />
              Re-record
            </button>
          )}
          <button
            onClick={() => setShowTextFallback(true)}
            className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-500 hover:text-zinc-800 transition-colors"
          >
            <Type size={12} />
            Type instead
          </button>
        </div>

        <button
          onClick={handleContinue}
          disabled={!(transcript || interimText) || (transcript + interimText).trim().length < 10}
          className="flex items-center gap-2 bg-zinc-900 text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl hover:bg-zinc-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}

function TextFallback({ onSkip }: { onSkip: (text: string) => void }) {
  const [text, setText] = useState("");

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
      <div className="p-6">
        <label className="block text-[12px] font-semibold text-zinc-700 mb-3 uppercase tracking-wider">
          Describe your business
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tell us about your business — what you do, your services, hours, location, what makes you special..."
          className="w-full h-40 border border-zinc-200 rounded-xl p-4 text-[14px] text-zinc-700 placeholder:text-zinc-300 resize-none focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 transition-all"
        />
        <div className="text-[11px] text-zinc-400 mt-2 text-right">{text.length} characters</div>
      </div>
      <div className="border-t border-zinc-100 px-6 py-4 bg-zinc-50 flex justify-end">
        <button
          onClick={() => onSkip(text)}
          disabled={text.trim().length < 20}
          className="flex items-center gap-2 bg-zinc-900 text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl hover:bg-zinc-800 transition-all disabled:opacity-40"
        >
          Continue
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}
