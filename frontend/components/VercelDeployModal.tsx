"use client";

// Output format: single file — source: website.htmlContent
// Vercel REST API supports CORS — no proxy needed, using native fetch directly.

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Eye,
  EyeOff,
  Copy,
  Check,
  Loader2,
  ExternalLink,
  Rocket,
  CheckCircle2,
  Circle,
} from "lucide-react";
import toast from "react-hot-toast";
import { Skeleton } from "boneyard-js/react";
import { slugify, pollVercelDeployment, type DeployStatus } from "@/lib/deployUtils";

interface Props {
  htmlContent: string;
  websiteTitle: string;
  onClose: () => void;
}

type UIStatus = "idle" | "creating" | "waiting" | "done" | "error";

const STEPS: { key: UIStatus; label: string }[] = [
  { key: "creating", label: "Creating deployment" },
  { key: "waiting", label: "Building and deploying" },
];

const DEPLOY_STATUS_LABELS: Record<DeployStatus, string> = {
  INITIALIZING: "Initializing...",
  ANALYZING: "Analyzing files...",
  BUILDING: "Building... (this may take ~30s)",
  DEPLOYING: "Deploying to edge...",
  READY: "Deployment ready.",
  ERROR: "Deployment failed.",
  CANCELED: "Deployment canceled.",
};

const STEP_ORDER: UIStatus[] = ["creating", "waiting", "done"];

function stepIndex(s: UIStatus) {
  return STEP_ORDER.indexOf(s);
}

export function VercelDeployModal({ htmlContent, websiteTitle, onClose }: Props) {
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [projectName, setProjectName] = useState(() => slugify(websiteTitle) || "my-website");
  const [uiStatus, setUiStatus] = useState<UIStatus>("idle");
  const [buildLabel, setBuildLabel] = useState("");
  const [liveUrl, setLiveUrl] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const isLoading = uiStatus !== "idle" && uiStatus !== "done" && uiStatus !== "error";

  const handleDeploy = async () => {
    if (!token.trim()) {
      toast.error("Please enter your Vercel API token.");
      return;
    }
    if (!projectName.trim()) {
      toast.error("Please enter a project name.");
      return;
    }

    try {
      setUiStatus("creating");
      setBuildLabel("Creating deployment...");

      const deployRes = await fetch("https://api.vercel.com/v13/deployments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: projectName,
          files: [{ file: "index.html", data: htmlContent }],
          projectSettings: { framework: null },
          target: "production",
        }),
      });

      if (!deployRes.ok) {
        const body = await deployRes.json().catch(() => ({}));
        throw new Error(
          body?.error?.message || body?.message || `Deployment request failed (${deployRes.status})`
        );
      }

      const deployData = await deployRes.json();
      const deploymentId: string = deployData.id;

      setUiStatus("waiting");
      setBuildLabel("Building... (this may take ~30s)");

      const deployedUrl = await pollVercelDeployment(
        deploymentId,
        token,
        (state: DeployStatus) => {
          setBuildLabel(DEPLOY_STATUS_LABELS[state] ?? "Building...");
        }
      );

      setLiveUrl(`https://${deployedUrl}`);
      setUiStatus("done");
      toast.success("Your site is live.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(msg);
      setUiStatus("error");
    }
  };

  const handleCopyUrl = () => {
    if (!liveUrl) return;
    navigator.clipboard.writeText(liveUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.2 }}
        className="relative bg-white rounded-2xl border border-zinc-200 shadow-xl w-full max-w-md p-6 space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Rocket size={15} className="text-zinc-900" />
            <h2 className="text-[15px] font-semibold text-zinc-900 tracking-tight">
              Deploy to Vercel
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-all"
          >
            <X size={14} />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* ── Success view ── */}
          {uiStatus === "done" && liveUrl ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Live card */}
              <div className="border border-zinc-200 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="text-[13px] font-semibold text-zinc-900">Your site is live</p>
                    <p className="text-[12px] text-zinc-500">
                      Deployed to Vercel production. Changes take effect instantly.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                  <span className="text-[12px] text-zinc-700 flex-1 truncate font-mono">
                    {liveUrl}
                  </span>
                  <button
                    onClick={handleCopyUrl}
                    className="text-zinc-400 hover:text-zinc-700 transition-colors flex-shrink-0"
                    title="Copy URL"
                  >
                    {copiedUrl ? (
                      <Check size={13} className="text-emerald-500" />
                    ) : (
                      <Copy size={13} />
                    )}
                  </button>
                  <a
                    href={liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-400 hover:text-zinc-700 transition-colors flex-shrink-0"
                    title="Open site"
                  >
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>

              <div className="flex gap-2">
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 text-white text-[13px] font-semibold py-2.5 rounded-xl hover:bg-zinc-800 transition-all"
                >
                  <ExternalLink size={13} />
                  Open site
                </a>
                <button
                  onClick={onClose}
                  className="flex-1 text-[13px] font-medium text-zinc-600 border border-zinc-200 py-2.5 rounded-xl hover:bg-zinc-50 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="form" className="space-y-4">
              {/* Token input */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-zinc-700">Vercel API Token</label>
                <div className="relative">
                  <input
                    type={showToken ? "text" : "password"}
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    disabled={isLoading}
                    className="w-full text-[13px] border border-zinc-200 rounded-xl px-3 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 bg-white placeholder-zinc-300 font-mono disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                  >
                    {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Get your token at{" "}
                  <a
                    href="https://vercel.com/account/tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-600 underline underline-offset-2 hover:text-zinc-900 transition-colors"
                  >
                    vercel.com/account/tokens
                  </a>
                </p>
              </div>

              {/* Project name */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-zinc-700">Project name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="my-website"
                  disabled={isLoading}
                  className="w-full text-[13px] border border-zinc-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 bg-white placeholder-zinc-300 font-mono disabled:opacity-50"
                />
              </div>

              {/* Step progress — Boneyard skeleton wraps the status panel.
                  Before `npm run bones`: shows the fallback (manual step tracker).
                  After `npm run bones`: shows a pixel-perfect layout skeleton. */}
              <Skeleton
                name="vercel-deploy-status"
                loading={isLoading}
                className="min-h-[80px]"
                fallback={
                  <div className="space-y-2 rounded-xl border border-zinc-100 bg-zinc-50 p-3">
                    {STEPS.map((step) => {
                      const currentIdx = stepIndex(uiStatus);
                      const stepIdx = stepIndex(step.key);
                      const isDone = currentIdx > stepIdx;
                      const isActive = currentIdx === stepIdx;
                      return (
                        <div key={step.key} className="flex items-center gap-2.5">
                          {isDone ? (
                            <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />
                          ) : isActive ? (
                            <Loader2 size={13} className="animate-spin text-zinc-500 flex-shrink-0" />
                          ) : (
                            <Circle size={13} className="text-zinc-300 flex-shrink-0" />
                          )}
                          <span
                            className={`text-[12px] ${
                              isDone
                                ? "text-zinc-400 line-through"
                                : isActive
                                ? "text-zinc-600"
                                : "text-zinc-300"
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                    {uiStatus === "waiting" && buildLabel && (
                      <p className="text-[11px] text-zinc-400 pl-[21px] pt-0.5">{buildLabel}</p>
                    )}
                  </div>
                }
                fixture={
                  <div className="space-y-2 rounded-xl border border-zinc-100 bg-zinc-50 p-3">
                    {STEPS.map((step) => (
                      <div key={step.key} className="flex items-center gap-2.5">
                        <Loader2 size={13} className="text-zinc-400 flex-shrink-0" />
                        <span className="text-[12px] text-zinc-600">{step.label}</span>
                      </div>
                    ))}
                    <p className="text-[11px] text-zinc-400 pl-[21px] pt-0.5">
                      Building... (this may take ~30s)
                    </p>
                  </div>
                }
              >
                <></>
              </Skeleton>

              {uiStatus === "error" && (
                <p className="text-[12px] text-red-500">
                  Deployment failed — check your token and try again.
                </p>
              )}

              <button
                onClick={handleDeploy}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-white text-[13px] font-semibold py-2.5 rounded-xl hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 size={13} className="animate-spin" /> : <Rocket size={13} />}
                {isLoading ? "Deploying..." : "Deploy"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
