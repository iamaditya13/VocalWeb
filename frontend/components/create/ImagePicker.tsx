"use client";

import { useState } from "react";
import { Search, Upload, X, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api";
import toast from "react-hot-toast";

interface UnsplashResult {
  id: string;
  url: string;
  thumb: string;
  alt: string;
  credit: { name: string; link: string };
}

interface ImagePickerProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export function ImagePicker({ images, onChange }: ImagePickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UnsplashResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [uploading, setUploading] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await apiClient.get(`/images/search`, { params: { q: query } });
      setResults(res.data.results || []);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e?.response?.data?.message || "Search failed.");
    } finally {
      setSearching(false);
    }
  };

  const toggle = (url: string) => {
    if (images.includes(url)) {
      onChange(images.filter((u) => u !== url));
    } else {
      if (images.length >= 12) {
        toast.error("Maximum 12 images.");
        return;
      }
      onChange([...images, url]);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image must be under 8MB.");
      return;
    }

    setUploading(true);
    try {
      const dataBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1] || "");
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await apiClient.post("/images/upload", {
        filename: file.name,
        contentType: file.type,
        dataBase64,
      });
      onChange([...images, res.data.url]);
      toast.success("Uploaded!");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e?.response?.data?.message || "Upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-[12px] font-semibold text-zinc-700 uppercase tracking-wider">
          Images
        </label>
        <span className="text-[11px] text-zinc-400">{images.length}/12 selected</span>
      </div>

      {/* Search + upload */}
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 border border-zinc-200 rounded-xl px-3 py-2 focus-within:border-zinc-400">
          <Search size={14} className="text-zinc-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="Search stock photos (e.g. cafe, salon)…"
            className="flex-1 text-[13px] text-zinc-900 placeholder:text-zinc-300 outline-none"
          />
          {searching && <Loader2 size={13} className="animate-spin text-zinc-400" />}
        </div>
        <label className="flex items-center gap-2 border border-zinc-200 rounded-xl px-3 py-2 text-[12px] font-medium text-zinc-600 hover:bg-zinc-50 cursor-pointer transition-all">
          {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
          Upload
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Selected thumbnails */}
      {images.length > 0 && (
        <div className="grid grid-cols-6 gap-2">
          {images.map((url) => (
            <div key={url} className="relative group aspect-square">
              <img src={url} alt="" className="w-full h-full object-cover rounded-lg border border-zinc-200" />
              <button
                type="button"
                onClick={() => onChange(images.filter((u) => u !== url))}
                className="absolute -top-1 -right-1 w-5 h-5 bg-zinc-900 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search results */}
      {results.length > 0 && (
        <div>
          <p className="text-[11px] text-zinc-400 mb-2">Click to add or remove</p>
          <div className="grid grid-cols-4 gap-2 max-h-[260px] overflow-y-auto">
            {results.map((r) => {
              const selected = images.includes(r.url);
              return (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => toggle(r.url)}
                  className={`relative aspect-[4/3] overflow-hidden rounded-lg border-2 transition-all ${
                    selected ? "border-zinc-900" : "border-transparent hover:border-zinc-300"
                  }`}
                >
                  <img src={r.thumb} alt={r.alt} className="w-full h-full object-cover" />
                  {selected && (
                    <div className="absolute inset-0 bg-zinc-900/40 flex items-center justify-center">
                      <span className="text-white text-[10px] font-semibold">SELECTED</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {results.length === 0 && images.length === 0 && (
        <p className="text-[11px] text-zinc-400">
          Search Unsplash for professional stock photos, or upload your own. Images will be used throughout the generated site.
        </p>
      )}
    </div>
  );
}
