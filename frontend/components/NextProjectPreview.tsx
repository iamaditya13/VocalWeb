"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, Loader2, FileCode, Eye } from "lucide-react";

interface NextProjectPreviewProps {
  files: Record<string, string>;
  businessName: string;
}

export function NextProjectPreview({ files, businessName }: NextProjectPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"preview" | "code">("preview");
  const [selectedFile, setSelectedFile] = useState<string>(() => {
    const keys = Object.keys(files);
    return keys.find((k) => k.endsWith("app/page.tsx")) || keys[0] || "";
  });
  const [booting, setBooting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== "preview") return;
    if (!containerRef.current) return;

    let cancelled = false;
    setBooting(true);
    setError(null);

    (async () => {
      try {
        const sdk = (await import("@stackblitz/sdk")).default;
        if (cancelled || !containerRef.current) return;

        // StackBlitz expects a flat { path: contents } map — which we already have.
        await sdk.embedProject(
          containerRef.current,
          {
            title: `${businessName} — Next.js Preview`,
            description: "Generated Next.js project",
            template: "node",
            files,
          },
          {
            openFile: "app/page.tsx",
            view: "preview",
            hideNavigation: false,
            height: 640,
          }
        );
      } catch (err) {
        console.error("StackBlitz embed failed:", err);
        if (!cancelled) setError("Failed to boot live preview.");
      } finally {
        if (!cancelled) setBooting(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mode, files, businessName]);

  const fileList = Object.keys(files).sort();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex bg-zinc-100 rounded-xl p-1 gap-1">
          <button
            onClick={() => setMode("preview")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
              mode === "preview" ? "bg-white text-zinc-900 shadow-elegant" : "text-zinc-500"
            }`}
          >
            <Eye size={12} /> Live preview
          </button>
          <button
            onClick={() => setMode("code")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
              mode === "code" ? "bg-white text-zinc-900 shadow-elegant" : "text-zinc-500"
            }`}
          >
            <FileCode size={12} /> Code ({fileList.length})
          </button>
        </div>
      </div>

      {mode === "preview" ? (
        <div className="bg-zinc-100 rounded-2xl border border-zinc-200 p-3">
          {booting && (
            <div className="h-[640px] flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-400 mx-auto mb-3" />
                <p className="text-[12px] text-zinc-500">Booting Next.js WebContainer…</p>
                <p className="text-[11px] text-zinc-400 mt-1">
                  First boot takes ~30s while dependencies install
                </p>
              </div>
            </div>
          )}
          {error && <div className="text-red-500 text-[13px] p-6">{error}</div>}
          <div ref={containerRef} className={booting ? "hidden" : "min-h-[640px]"} />
          <p className="text-[10px] text-zinc-400 mt-2 text-center">
            Live preview powered by StackBlitz WebContainers
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-3">
          <div className="col-span-1 bg-white border border-zinc-200 rounded-xl p-3 max-h-[620px] overflow-y-auto">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Files
            </p>
            <ul className="space-y-0.5">
              {fileList.map((f) => (
                <li key={f}>
                  <button
                    onClick={() => setSelectedFile(f)}
                    className={`w-full text-left text-[11px] font-mono px-2 py-1 rounded transition-colors ${
                      selectedFile === f
                        ? "bg-zinc-900 text-white"
                        : "text-zinc-600 hover:bg-zinc-100"
                    }`}
                  >
                    {f}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-3 bg-zinc-950 border border-zinc-200 rounded-xl p-4 overflow-auto max-h-[620px]">
            <pre className="text-[11px] text-zinc-200 font-mono whitespace-pre">
              {files[selectedFile] || ""}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
