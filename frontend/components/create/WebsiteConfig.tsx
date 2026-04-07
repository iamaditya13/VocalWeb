"use client";

import { ArrowLeft, ArrowRight, Check } from "lucide-react";

const SECTIONS = [
  { id: "hero", label: "Hero / Banner" },
  { id: "about", label: "About Us" },
  { id: "services", label: "Services" },
  { id: "gallery", label: "Gallery" },
  { id: "testimonials", label: "Testimonials" },
  { id: "contact", label: "Contact" },
  { id: "footer", label: "Footer" },
];

const COLORS = [
  { value: "#18181b", label: "Charcoal" },
  { value: "#1e40af", label: "Navy" },
  { value: "#065f46", label: "Emerald" },
  { value: "#7c2d12", label: "Rust" },
  { value: "#4a044e", label: "Plum" },
  { value: "#1a1a2e", label: "Midnight" },
  { value: "#374151", label: "Slate" },
  { value: "#92400e", label: "Amber" },
];

interface WebsiteConfigProps {
  transcript: string;
  config: {
    businessName: string;
    themeColor: string;
    sections: string[];
  };
  onChange: (config: WebsiteConfigProps["config"]) => void;
  onBack: () => void;
  onGenerate: () => void;
}

export function WebsiteConfig({
  transcript,
  config,
  onChange,
  onBack,
  onGenerate,
}: WebsiteConfigProps) {
  const toggleSection = (id: string) => {
    const required = ["hero", "footer"];
    if (required.includes(id)) return;

    onChange({
      ...config,
      sections: config.sections.includes(id)
        ? config.sections.filter((s) => s !== id)
        : [...config.sections, id],
    });
  };

  return (
    <div className="space-y-4">
      {/* Transcript preview */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5">
        <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
          Your description
        </div>
        <p className="text-[14px] text-zinc-600 leading-relaxed line-clamp-3">{transcript}</p>
      </div>

      {/* Business name */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5">
        <label className="block text-[12px] font-semibold text-zinc-700 uppercase tracking-wider mb-3">
          Business name *
        </label>
        <input
          type="text"
          value={config.businessName}
          onChange={(e) => onChange({ ...config, businessName: e.target.value })}
          placeholder="e.g. Bloom Salon, Joe's Auto, Green Leaf Bakery"
          className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-[14px] text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 transition-all"
        />
      </div>

      {/* Brand color */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5">
        <label className="block text-[12px] font-semibold text-zinc-700 uppercase tracking-wider mb-3">
          Brand color
        </label>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => onChange({ ...config, themeColor: color.value })}
              title={color.label}
              className={`w-8 h-8 rounded-xl transition-all ${
                config.themeColor === color.value
                  ? "ring-2 ring-offset-2 ring-zinc-900 scale-110"
                  : "hover:scale-105"
              }`}
              style={{ backgroundColor: color.value }}
            />
          ))}
          {/* Custom color */}
          <label
            className="w-8 h-8 rounded-xl border-2 border-dashed border-zinc-200 flex items-center justify-center cursor-pointer hover:border-zinc-400 transition-all overflow-hidden"
            title="Custom color"
          >
            <input
              type="color"
              value={config.themeColor}
              onChange={(e) => onChange({ ...config, themeColor: e.target.value })}
              className="opacity-0 absolute"
            />
            <div
              className="w-full h-full"
              style={{
                background: !COLORS.find((c) => c.value === config.themeColor)
                  ? config.themeColor
                  : "repeating-linear-gradient(45deg, #e4e4e7 0, #e4e4e7 2px, white 0, white 50%) center/8px 8px",
              }}
            />
          </label>
        </div>
      </div>

      {/* Sections */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5">
        <label className="block text-[12px] font-semibold text-zinc-700 uppercase tracking-wider mb-3">
          Website sections
        </label>
        <div className="flex flex-wrap gap-2">
          {SECTIONS.map((section) => {
            const isRequired = ["hero", "footer"].includes(section.id);
            const isSelected = config.sections.includes(section.id);
            return (
              <button
                key={section.id}
                onClick={() => toggleSection(section.id)}
                disabled={isRequired}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all ${
                  isSelected
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400"
                } ${isRequired ? "opacity-60 cursor-default" : "cursor-pointer"}`}
              >
                <span className="flex items-center gap-1.5">
                  {isSelected && <Check size={11} strokeWidth={2.5} />}
                  {section.label}
                  {isRequired && " *"}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-zinc-400 mt-3">* Required sections</p>
      </div>

      {/* Preview */}
      <div
        className="h-2 rounded-full transition-colors duration-300"
        style={{ backgroundColor: config.themeColor }}
      />

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[13px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft size={13} />
          Back
        </button>
        <button
          onClick={onGenerate}
          disabled={!config.businessName.trim()}
          className="flex items-center gap-2 bg-zinc-900 text-white text-[13px] font-semibold px-6 py-3 rounded-xl hover:bg-zinc-800 transition-all disabled:opacity-40 shadow-sm"
        >
          Generate website
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}
