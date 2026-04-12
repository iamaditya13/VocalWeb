"use client";

// Output format: single file — source: website.htmlContent
// GitHub REST API supports CORS — no proxy needed, using native fetch directly.

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Eye,
  EyeOff,
  Github,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  CheckCircle2,
  Circle,
  AlertCircle,
  Info,
} from "lucide-react";
import { Skeleton } from "boneyard-js/react";
import { slugify, encodeFileContent } from "@/lib/deployUtils";

interface Props {
  htmlContent: string;
  websiteTitle: string;
  onClose: () => void;
}

type Status =
  | "idle"
  | "fetching-user"
  | "creating-repo"
  | "pushing-files"
  | "done"
  | "error";

const STEPS: { key: Status; label: string }[] = [
  { key: "fetching-user", label: "Authenticating with GitHub" },
  { key: "creating-repo", label: "Creating repository" },
  { key: "pushing-files", label: "Pushing files" },
];

const STEP_ORDER: Status[] = ["fetching-user", "creating-repo", "pushing-files", "done"];

function stepIndex(s: Status) {
  return STEP_ORDER.indexOf(s);
}

export function GitHubPushModal({ htmlContent, websiteTitle, onClose }: Props) {
  const [pat, setPat] = useState("");
  const [showPat, setShowPat] = useState(false);
  const [repoName, setRepoName] = useState(() => slugify(websiteTitle) || "my-website");
  const [isPrivate, setIsPrivate] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [repoUrl, setRepoUrl] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [inlineMessage, setInlineMessage] = useState<{ type: "error" | "info"; text: string } | null>(null);

  const isLoading = status !== "idle" && status !== "done" && status !== "error";

  const handlePush = async () => {
    setInlineMessage(null);
    if (!pat.trim()) {
      setInlineMessage({ type: "error", text: "Please enter your GitHub Personal Access Token." });
      return;
    }
    if (!repoName.trim()) {
      setInlineMessage({ type: "error", text: "Please enter a repository name." });
      return;
    }

    try {
      setStatus("fetching-user");
      const userRes = await fetch("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${pat}` },
      });
      if (!userRes.ok) {
        const body = await userRes.json().catch(() => ({}));
        throw new Error(body?.message || "Failed to authenticate with GitHub.");
      }
      const userData = await userRes.json();
      const owner: string = userData.login;

      setStatus("creating-repo");
      const createRes = await fetch("https://api.github.com/user/repos", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${pat}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: repoName, private: isPrivate, auto_init: false }),
      });
      if (!createRes.ok) {
        const body = await createRes.json().catch(() => ({}));
        throw new Error(body?.message || "Failed to create repository.");
      }

      setStatus("pushing-files");
      const pushRes = await fetch(
        `https://api.github.com/repos/${owner}/${repoName}/contents/index.html`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${pat}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: "Initial commit from Voice Web Builder",
            content: encodeFileContent(htmlContent),
          }),
        }
      );
      if (!pushRes.ok) {
        const body = await pushRes.json().catch(() => ({}));
        throw new Error(body?.message || "Failed to push files.");
      }

      setRepoUrl(`https://github.com/${owner}/${repoName}`);
      setStatus("done");
      setInlineMessage({ type: "info", text: "Repository created and files pushed successfully." });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setInlineMessage({ type: "error", text: msg });
      setStatus("error");
    }
  };

  const handleCopyUrl = () => {
    if (!repoUrl) return;
    navigator.clipboard.writeText(repoUrl);
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
            <Github size={16} className="text-zinc-900" />
            <h2 className="text-[15px] font-semibold text-zinc-900 tracking-tight">
              Push to GitHub
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
          {status === "done" && repoUrl ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-start gap-3 bg-zinc-50 border border-zinc-200 rounded-xl p-4">
                <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-[13px] font-semibold text-zinc-900">Repository created</p>
                  <p className="text-[12px] text-zinc-500">
                    Your website has been pushed to GitHub.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5">
                <span className="text-[12px] text-zinc-600 flex-1 truncate font-mono">
                  {repoUrl}
                </span>
                <button
                  onClick={handleCopyUrl}
                  className="text-zinc-400 hover:text-zinc-700 transition-colors"
                >
                  {copiedUrl ? (
                    <Check size={13} className="text-emerald-500" />
                  ) : (
                    <Copy size={13} />
                  )}
                </button>
                <a
                  href={repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-zinc-700 transition-colors"
                >
                  <ExternalLink size={13} />
                </a>
              </div>

              <div className="flex gap-2">
                <a
                  href={repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 text-white text-[13px] font-semibold py-2.5 rounded-xl hover:bg-zinc-800 transition-all"
                >
                  <ExternalLink size={13} />
                  View repository
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
              {/* PAT input */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-zinc-700">
                  Personal Access Token
                </label>
                <div className="relative">
                  <input
                    type={showPat ? "text" : "password"}
                    value={pat}
                    onChange={(e) => setPat(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    disabled={isLoading}
                    className="w-full text-[13px] border border-zinc-200 rounded-xl px-3 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 bg-white placeholder-zinc-300 font-mono disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPat((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                  >
                    {showPat ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Generate a token at{" "}
                  <a
                    href="https://github.com/settings/tokens/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-600 underline underline-offset-2 hover:text-zinc-900 transition-colors"
                  >
                    github.com/settings/tokens/new
                  </a>{" "}
                  — make sure to check the{" "}
                  <span className="font-medium text-zinc-600">repo</span> scope (required for
                  creating and pushing to repositories).
                </p>
              </div>

              {/* Repo name */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-zinc-700">Repository name</label>
                <input
                  type="text"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                  placeholder="my-website"
                  disabled={isLoading}
                  className="w-full text-[13px] border border-zinc-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 bg-white placeholder-zinc-300 font-mono disabled:opacity-50"
                />
              </div>

              {/* Visibility toggle */}
              <div className="flex items-center gap-3">
                <span className="text-[12px] font-medium text-zinc-700">Visibility</span>
                <div className="flex bg-zinc-100 rounded-lg p-0.5 gap-0.5">
                  {(["Public", "Private"] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      disabled={isLoading}
                      onClick={() => setIsPrivate(opt === "Private")}
                      className={`text-[11px] font-medium px-3 py-1 rounded-md transition-all ${
                        (opt === "Private") === isPrivate
                          ? "bg-white text-zinc-900 shadow-sm"
                          : "text-zinc-500 hover:text-zinc-700"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step progress — Boneyard skeleton wraps the status panel.
                  Before `npm run bones`: shows the fallback (manual step tracker).
                  After `npm run bones`: shows a pixel-perfect layout skeleton. */}
              <Skeleton
                name="github-push-status"
                loading={isLoading}
                className="min-h-[80px]"
                fallback={
                  <div className="space-y-2 rounded-xl border border-zinc-100 bg-zinc-50 p-3">
                    {STEPS.map((step) => {
                      const currentIdx = stepIndex(status);
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
                  </div>
                }
              >
                <></>
              </Skeleton>

              <AnimatePresence>
                {inlineMessage && (
                  <motion.div
                    key={inlineMessage.text}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className={`flex items-start gap-2 rounded-xl px-3 py-2.5 text-[12px] leading-relaxed ${
                      inlineMessage.type === "error"
                        ? "bg-red-50 border border-red-100 text-red-600"
                        : "bg-emerald-50 border border-emerald-100 text-emerald-700"
                    }`}
                  >
                    {inlineMessage.type === "error" ? (
                      <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
                    ) : (
                      <Info size={13} className="flex-shrink-0 mt-0.5" />
                    )}
                    {inlineMessage.text}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={handlePush}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-white text-[13px] font-semibold py-2.5 rounded-xl hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Github size={13} />
                )}
                {isLoading ? "Working..." : "Create & Push"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
