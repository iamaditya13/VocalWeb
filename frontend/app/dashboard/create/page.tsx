"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { VoiceRecorder } from "@/components/voice/VoiceRecorder";
import { WebsiteConfig } from "@/components/create/WebsiteConfig";
import { GeneratingState } from "@/components/create/GeneratingState";
import { apiClient } from "@/lib/api";
import toast from "react-hot-toast";

type Step = "record" | "configure" | "generating";

export default function CreatePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("record");
  const [transcript, setTranscript] = useState("");
  const [config, setConfig] = useState({
    businessName: "",
    themeColor: "#18181b",
    sections: ["hero", "about", "services", "gallery", "testimonials", "contact", "footer"],
  });

  const handleTranscriptReady = (text: string) => {
    setTranscript(text);
    // Auto-extract business name if possible
    const nameMatch = text.match(/(?:called|named|my\s+(?:business|salon|shop|store|restaurant|studio|clinic|gym)\s+(?:is\s+)?(?:called\s+)?)\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
    if (nameMatch) {
      setConfig((c) => ({ ...c, businessName: nameMatch[1] }));
    }
    setStep("configure");
  };

  const handleGenerate = async () => {
    if (!transcript.trim()) {
      toast.error("Please record or type your business description first.");
      return;
    }
    if (!config.businessName.trim()) {
      toast.error("Please enter your business name.");
      return;
    }

    setStep("generating");

    try {
      const response = await apiClient.post("/websites/generate", {
        transcript,
        businessName: config.businessName,
        themeColor: config.themeColor,
        sections: config.sections,
      });

      const websiteId = response.data.id;
      toast.success("Website generated!");
      router.push(`/dashboard/websites/${websiteId}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || "Generation failed. Please try again.");
      setStep("configure");
    }
  };

  const steps = [
    { key: "record", label: "Describe" },
    { key: "configure", label: "Configure" },
    { key: "generating", label: "Generate" },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step indicator */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              {i > 0 && <div className="w-8 h-px bg-zinc-200" />}
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                    step === s.key
                      ? "bg-zinc-900 text-white"
                      : steps.findIndex((x) => x.key === step) > i
                      ? "bg-emerald-500 text-white"
                      : "bg-zinc-100 text-zinc-400"
                  }`}
                >
                  {steps.findIndex((x) => x.key === step) > i ? "✓" : i + 1}
                </div>
                <span
                  className={`text-[12px] font-medium ${
                    step === s.key ? "text-zinc-900" : "text-zinc-400"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div>
          <h1 className="text-[24px] font-bold text-zinc-900 tracking-tight">
            {step === "record" && "Tell us about your business"}
            {step === "configure" && "Configure your website"}
            {step === "generating" && "Building your website..."}
          </h1>
          <p className="text-[14px] text-zinc-500 mt-1">
            {step === "record" && "Click the microphone and speak naturally. Describe what you do, who you serve, your hours, location — anything."}
            {step === "configure" && "Review your details and customize the look before we generate."}
            {step === "generating" && "Our AI is crafting a beautiful, responsive website based on your description."}
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === "record" && (
          <motion.div
            key="record"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <VoiceRecorder
              onTranscriptReady={handleTranscriptReady}
              onSkip={(text) => {
                setTranscript(text);
                setStep("configure");
              }}
            />
          </motion.div>
        )}

        {step === "configure" && (
          <motion.div
            key="configure"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <WebsiteConfig
              transcript={transcript}
              config={config}
              onChange={setConfig}
              onBack={() => setStep("record")}
              onGenerate={handleGenerate}
            />
          </motion.div>
        )}

        {step === "generating" && (
          <motion.div
            key="generating"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <GeneratingState />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
