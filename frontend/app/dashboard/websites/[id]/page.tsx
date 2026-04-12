"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence as ModalAnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Download,
  ExternalLink,
  RotateCcw,
  Copy,
  Check,
  Globe,
  Smartphone,
  Monitor,
  Loader2,
  Github,
  Rocket,
} from "lucide-react";
import { useState } from "react";
import { apiClient } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import { Skeleton } from "boneyard-js/react";
import Link from "next/link";
import { GitHubPushModal } from "@/components/GitHubPushModal";
import { VercelDeployModal } from "@/components/VercelDeployModal";
import { NextProjectPreview } from "@/components/NextProjectPreview";

export default function WebsiteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [copied, setCopied] = useState(false);
  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const [showVercelModal, setShowVercelModal] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["website", id],
    queryFn: () => apiClient.get(`/websites/${id}`).then((r) => r.data),
    refetchInterval: (query) =>
      query.state.status === "success" && query.state.data?.status === "generating" ? 2000 : false,
  });

  const website = data?.data;

  const regenerateMutation = useMutation({
    mutationFn: () => apiClient.post(`/websites/${id}/regenerate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["website", id] });
      toast.success("Regenerating your website...");
    },
    onError: () => toast.error("Regeneration failed. Please try again."),
  });

  const publishMutation = useMutation({
    mutationFn: () => apiClient.post(`/websites/${id}/publish`),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["website", id] });
      toast.success("Website published!");
      const url = res.data?.liveUrl;
      if (url) navigator.clipboard.writeText(url);
    },
    onError: () => toast.error("Publishing failed."),
  });

  const handleDownload = () => {
    if (!website?.htmlContent) return;
    const blob = new Blob([website.htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${website.businessName?.toLowerCase().replace(/\s+/g, "-") || "website"}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded!");
  };

  const handleCopy = () => {
    if (!website?.liveUrl) return;
    navigator.clipboard.writeText(website.liveUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Link copied!");
  };

  if (error && !isLoading) return <div className="text-zinc-500 p-8">Website not found.</div>;
  if (!website) return <div className="text-zinc-500 p-8">Loading...</div>;

  return (
    <Skeleton name="website-detail" loading={isLoading} className="min-h-[600px]">
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 transition-all"
          >
            <ArrowLeft size={14} />
          </button>
          <div>
            <h1 className="text-[20px] font-bold text-zinc-900 tracking-tight">
              {website.businessName}
            </h1>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-[12px] text-zinc-400">
                Created {formatDistanceToNow(new Date(website.createdAt), { addSuffix: true })}
              </span>
              {website.regenerationCount > 0 && (
                <span className="text-[11px] text-zinc-400">
                  · {website.regenerationCount} regeneration{website.regenerationCount !== 1 ? "s" : ""}
                </span>
              )}
              <StatusBadge status={website.status} />
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {website.liveUrl ? (
            <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              <span className="text-[12px] font-medium text-zinc-600 max-w-[180px] truncate">
                {website.liveUrl}
              </span>
              <button onClick={handleCopy} className="text-zinc-400 hover:text-zinc-700 ml-1 transition-colors">
                {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
              </button>
              <a href={website.liveUrl} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-zinc-700 transition-colors">
                <ExternalLink size={12} />
              </a>
            </div>
          ) : (
            <button
              onClick={() => publishMutation.mutate()}
              disabled={publishMutation.isPending || website.status !== "ready"}
              className="flex items-center gap-2 border border-zinc-200 text-zinc-700 text-[12px] font-medium px-4 py-2 rounded-xl hover:bg-zinc-50 transition-all disabled:opacity-50"
            >
              {publishMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Globe size={12} />}
              Publish live
            </button>
          )}

          <button
            onClick={handleDownload}
            disabled={website.status !== "ready"}
            className="flex items-center gap-2 border border-zinc-200 text-zinc-700 text-[12px] font-medium px-4 py-2 rounded-xl hover:bg-zinc-50 transition-all disabled:opacity-50"
          >
            <Download size={12} />
            Download HTML
          </button>

          <button
            onClick={() => setShowGitHubModal(true)}
            disabled={website.status !== "ready"}
            className="flex items-center gap-2 border border-zinc-200 text-zinc-700 text-[12px] font-medium px-4 py-2 rounded-xl hover:bg-zinc-50 transition-all disabled:opacity-50"
          >
            <Github size={12} />
            Push to GitHub
          </button>

          <button
            onClick={() => setShowVercelModal(true)}
            disabled={website.status !== "ready"}
            className="flex items-center gap-2 border border-zinc-200 text-zinc-700 text-[12px] font-medium px-4 py-2 rounded-xl hover:bg-zinc-50 transition-all disabled:opacity-50"
          >
            <Rocket size={12} />
            Deploy to Vercel
          </button>

          <button
            onClick={() => regenerateMutation.mutate()}
            disabled={regenerateMutation.isPending || website.status === "generating"}
            className="flex items-center gap-2 bg-zinc-900 text-white text-[12px] font-semibold px-4 py-2 rounded-xl hover:bg-zinc-800 transition-all disabled:opacity-50"
          >
            {regenerateMutation.isPending ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <RotateCcw size={12} />
            )}
            Regenerate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Preview */}
        <div className="lg:col-span-2 space-y-3">
          {/* Viewport toggle */}
          <div className="flex items-center gap-2">
            <div className="flex bg-zinc-100 rounded-xl p-1 gap-1">
              {[
                { key: "desktop", icon: Monitor, label: "Desktop" },
                { key: "mobile", icon: Smartphone, label: "Mobile" },
              ].map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  onClick={() => setViewport(key as "desktop" | "mobile")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                    viewport === key
                      ? "bg-white text-zinc-900 shadow-elegant"
                      : "text-zinc-500 hover:text-zinc-700"
                  }`}
                >
                  <Icon size={12} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Preview frame */}
          <div className="bg-zinc-100 rounded-2xl border border-zinc-200 p-3">
            {/* Browser bar */}
            <div className="bg-white rounded-xl border border-zinc-200 mb-2 px-4 py-2 flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-200" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-200" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-200" />
              </div>
              <div className="flex-1 bg-zinc-50 rounded-md px-3 py-1">
                <span className="text-[11px] text-zinc-400 font-mono">
                  {website.liveUrl || `preview-${website.id}.vocalweb.ai`}
                </span>
              </div>
            </div>

            {/* iframe */}
            <div
              className={`mx-auto transition-all duration-300 ${
                viewport === "mobile" ? "max-w-[375px]" : "w-full"
              }`}
            >
              {website.status === "generating" ? (
                <div className="h-[520px] bg-white rounded-xl border border-zinc-200 flex items-center justify-center">
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      className="w-8 h-8 border-2 border-zinc-100 border-t-zinc-900 rounded-full mx-auto mb-3"
                    />
                    <p className="text-[13px] text-zinc-400">Generating your website...</p>
                  </div>
                </div>
              ) : website.status === "failed" ? (
                <div className="h-[520px] bg-white rounded-xl border border-red-100 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-[14px] text-zinc-600 mb-4">Generation failed.</p>
                    <button
                      onClick={() => regenerateMutation.mutate()}
                      className="text-[13px] font-medium bg-zinc-900 text-white px-4 py-2 rounded-lg"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              ) : website.framework === "NEXT" && website.projectFiles ? (
                <NextProjectPreview
                  files={website.projectFiles as Record<string, string>}
                  businessName={website.businessName}
                />
              ) : (
                <iframe
                  srcDoc={website.htmlContent}
                  className="w-full h-[520px] rounded-xl border border-zinc-200 bg-white"
                  sandbox="allow-same-origin"
                  title={`Preview of ${website.businessName}`}
                />
              )}
            </div>
          </div>
        </div>

        {/* Sidebar info */}
        <div className="space-y-4">
          {/* Details */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4">
            <h2 className="text-[13px] font-semibold text-zinc-900">Details</h2>

            <div className="space-y-3">
              <DetailRow label="Status">
                <StatusBadge status={website.status} />
              </DetailRow>
              <DetailRow label="Theme color">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: website.themeColor }}
                  />
                  <span className="text-[12px] font-mono text-zinc-600">{website.themeColor}</span>
                </div>
              </DetailRow>
              <DetailRow label="Sections">
                <span className="text-[12px] text-zinc-600">
                  {website.sections?.length || 7} sections
                </span>
              </DetailRow>
              <DetailRow label="Validation">
                <span className={`text-[12px] font-medium ${website.validationPassed ? "text-emerald-600" : "text-red-500"}`}>
                  {website.validationPassed ? "Passed" : "Failed"}
                </span>
              </DetailRow>
            </div>
          </div>

          {/* Transcript */}
          {website.transcript && (
            <div className="bg-white border border-zinc-200 rounded-2xl p-5">
              <h2 className="text-[13px] font-semibold text-zinc-900 mb-3">Original transcript</h2>
              <p className="text-[12px] text-zinc-500 leading-relaxed line-clamp-6">
                {website.transcript}
              </p>
            </div>
          )}

          {/* HTML size */}
          {website.htmlContent && (
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 flex items-center justify-between">
              <span className="text-[12px] text-zinc-500">File size</span>
              <span className="text-[12px] font-semibold text-zinc-900">
                {(new Blob([website.htmlContent]).size / 1024).toFixed(1)} KB
              </span>
            </div>
          )}
        </div>
      </div>

      {/* GitHub Push Modal */}
      <ModalAnimatePresence>
        {showGitHubModal && (
          <GitHubPushModal
            htmlContent={website.htmlContent ?? ""}
            websiteTitle={website.businessName ?? "my-website"}
            onClose={() => setShowGitHubModal(false)}
          />
        )}
      </ModalAnimatePresence>

      {/* Vercel Deploy Modal */}
      <ModalAnimatePresence>
        {showVercelModal && (
          <VercelDeployModal
            htmlContent={website.htmlContent ?? ""}
            websiteTitle={website.businessName ?? "my-website"}
            onClose={() => setShowVercelModal(false)}
          />
        )}
      </ModalAnimatePresence>
    </div>
    </Skeleton>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    generating: "bg-amber-50 text-amber-700 border border-amber-100",
    ready: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    failed: "bg-red-50 text-red-600 border border-red-100",
  } as Record<string, string>;

  return (
    <span className={`inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full ${config[status] || config.ready}`}>
      {status === "generating" ? "Generating" : status === "ready" ? "Ready" : "Failed"}
    </span>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[11px] text-zinc-400">{label}</span>
      {children}
    </div>
  );
}

