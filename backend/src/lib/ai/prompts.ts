export type Framework = "HTML" | "NEXT";

export interface GenerateOptions {
  transcript: string;
  businessName: string;
  themeColor: string;
  sections: string[];
  framework?: Framework;
  images?: string[];
}

const SECTION_DESCRIPTIONS: Record<string, string> = {
  hero: "A bold, full-bleed hero with a strong headline, supporting line, and primary + secondary CTAs",
  about: "An authentic about section with two-column layout (text + image) telling the business story",
  services: "A clean services/offerings grid (3 or 4 cards) with icons or images, titles, and descriptions",
  gallery: "A gallery/work section using a responsive grid of real images with hover effects",
  testimonials: "Customer testimonials in a card grid with avatars, names, roles, and quotes",
  contact: "Contact section with address, phone, email, hours, and a visible primary CTA",
  footer: "Footer with brand, quick links, social icons, and copyright",
};

function imageBlock(images?: string[]): string {
  if (!images || images.length === 0) {
    return `IMAGES:
- Use high-quality stock photography via Unsplash source URLs like:
  https://images.unsplash.com/photo-<id>?auto=format&fit=crop&w=1600&q=80
- Pick photos that match the business domain (cafe, salon, law firm, etc.)
- Use <img> with descriptive alt text, loading="lazy", and proper aspect ratios`;
  }
  return `IMAGES TO USE (use every single one at least once, in the order given):
${images.map((u, i) => `${i + 1}. ${u}`).join("\n")}
- Use <img> with descriptive alt text, loading="lazy", object-fit: cover`;
}

// ─── Shared design philosophy ────────────────────────────────────────────────
const DESIGN_SYSTEM = `DESIGN SYSTEM (non-negotiable):
- Modern, editorial, agency-grade aesthetic — think Linear, Vercel, Stripe, Apple
- Generous whitespace: sections padded 96–128px vertically on desktop
- Typography: premium Google Font pair (e.g. "Inter" + "Playfair Display", or "DM Sans" + "Fraunces")
  · Hero h1: 64–80px desktop, 40–48px mobile, tight tracking (-0.02em), weight 700–800
  · Section h2: 40–56px, weight 600–700
  · Body: 16–18px, line-height 1.65, color #3f3f46
- Color usage: the brand color is an ACCENT — backgrounds should be #ffffff and #fafafa, text #09090b
- Real imagery everywhere — no gradient placeholders, no emoji icons as substitutes for images
- Subtle depth: shadows like "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" on cards
- Buttons: rounded-xl (12px), 14–16px text, 14px vertical padding, hover transitions
- Layout: max content width 1200px, CSS grid for services/gallery/testimonials
- Mobile-first responsive — test mentally at 375px, 768px, 1280px
- Micro-interactions: transform/opacity transitions on hover (150–250ms ease)
- Accessibility: semantic HTML, alt on every image, sufficient color contrast`;

// ─── HTML SYSTEM PROMPT ──────────────────────────────────────────────────────
export function buildHtmlSystemPrompt(): string {
  return `You are a world-class product designer and front-end engineer who builds stunning, production-ready marketing websites.
You produce work that would ship at a top design agency. No templated look. No generic bootstrap feel.

${DESIGN_SYSTEM}

TECHNICAL REQUIREMENTS:
- Single complete HTML5 document (starts with <!DOCTYPE html>, ends with </html>)
- UTF-8 charset, viewport meta tag
- Semantic elements: header, nav, main, section, article, footer
- CSS reset + embedded styles in <style> tag
- @import Google Fonts from fonts.googleapis.com
- NO JavaScript, NO external scripts, NO CDN frameworks, NO Tailwind
- Real <img> tags for photos (never CSS gradient fake photos)

CONTENT REQUIREMENTS:
- Write REAL, specific copy based on the business description — no Lorem Ipsum ever
- Match tone to business type
- Realistic testimonials with believable names and specific details
- Include realistic hours, address, phone if not given

OUTPUT:
Return ONLY the HTML document. No markdown fences, no commentary.`;
}

export function buildHtmlUserPrompt(options: GenerateOptions): string {
  const sectionList = options.sections
    .map((s) => `- ${s.toUpperCase()}: ${SECTION_DESCRIPTIONS[s] || s}`)
    .join("\n");

  return `Design and build a complete, beautiful marketing website for this business.

BUSINESS: ${options.businessName}
BRAND COLOR: ${options.themeColor} (use as accent — for CTAs, hover states, small decorative touches; NOT as section backgrounds)

DESCRIPTION:
"""
${options.transcript}
"""

REQUIRED SECTIONS (in this order):
${sectionList}

${imageBlock(options.images)}

Make it look like it was built by a premium design studio. The business owner should feel proud to share this.`;
}

// ─── NEXT.JS + TAILWIND SYSTEM PROMPT ────────────────────────────────────────
export function buildNextSystemPrompt(): string {
  return `You are a world-class product designer and senior Next.js engineer. You build stunning, production-ready marketing sites using Next.js 14 (App Router) + TypeScript + Tailwind CSS.

${DESIGN_SYSTEM}

TECHNICAL STACK (mandatory, exact versions):
- Next.js 14 App Router (app/ directory)
- React 18, TypeScript
- Tailwind CSS 3
- lucide-react for icons
- next/image for all images
- next/font/google for fonts

PROJECT STRUCTURE (return ALL of these files):
- package.json
- tsconfig.json
- next.config.mjs
- tailwind.config.ts
- postcss.config.mjs
- app/layout.tsx
- app/page.tsx
- app/globals.css
- components/Hero.tsx
- components/About.tsx (if requested)
- components/Services.tsx (if requested)
- components/Gallery.tsx (if requested)
- components/Testimonials.tsx (if requested)
- components/Contact.tsx (if requested)
- components/Footer.tsx

RULES:
- Each component is a clean, typed React function component
- All copy is real, specific content for the business
- Use Tailwind utility classes — no inline styles, no CSS modules
- Use next/image with remotePatterns already configured in next.config.mjs
- Use lucide-react icons tastefully

OUTPUT FORMAT:
Return ONE JSON object and NOTHING else. No markdown code fences, no commentary, no explanations.
Schema:
{
  "files": {
    "package.json": "<file contents as string>",
    "app/page.tsx": "<file contents as string>",
    ...
  }
}

The JSON must be parseable with JSON.parse. Escape newlines as \\n and quotes as \\" inside string values.`;
}

export function buildNextUserPrompt(options: GenerateOptions): string {
  const sectionList = options.sections
    .map((s) => `- ${s.toUpperCase()}: ${SECTION_DESCRIPTIONS[s] || s}`)
    .join("\n");

  return `Build a complete Next.js 14 + Tailwind marketing site for this business.

BUSINESS: ${options.businessName}
BRAND COLOR: ${options.themeColor} (use as Tailwind custom color / accent — NOT as section backgrounds)

DESCRIPTION:
"""
${options.transcript}
"""

SECTIONS (create a component for each and compose them in app/page.tsx in this order):
${sectionList}

${imageBlock(options.images)}

In next.config.mjs, include remotePatterns for images.unsplash.com and any hosts used above.
In tailwind.config.ts, extend theme.colors.brand to the brand color.
In app/layout.tsx, load a premium Google Font pair via next/font/google.

Return ONLY the JSON object with the "files" key. No prose, no fences.`;
}

// ─── Back-compat exports used by existing providers ──────────────────────────
export function buildSystemPrompt(options?: GenerateOptions): string {
  return options?.framework === "NEXT" ? buildNextSystemPrompt() : buildHtmlSystemPrompt();
}

export function buildUserPrompt(options: GenerateOptions): string {
  return options.framework === "NEXT" ? buildNextUserPrompt(options) : buildHtmlUserPrompt(options);
}

export function cleanHtmlOutput(raw: string): string {
  let html = raw.trim();
  if (html.startsWith("```")) {
    html = html.replace(/^```(?:html)?\n?/, "").replace(/\n?```$/, "").trim();
  }
  return html;
}

export function cleanJsonOutput(raw: string): string {
  let s = raw.trim();
  if (s.startsWith("```")) {
    s = s.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
  }
  const firstBrace = s.indexOf("{");
  const lastBrace = s.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    s = s.slice(firstBrace, lastBrace + 1);
  }
  return s;
}

export function parseProjectFiles(raw: string): Record<string, string> {
  const cleaned = cleanJsonOutput(raw);
  const parsed = JSON.parse(cleaned);
  if (!parsed || typeof parsed !== "object" || !parsed.files || typeof parsed.files !== "object") {
    throw new Error("Invalid project files payload: missing 'files' object");
  }
  const files: Record<string, string> = {};
  for (const [path, content] of Object.entries(parsed.files)) {
    if (typeof content !== "string") continue;
    files[path] = content;
  }
  if (Object.keys(files).length === 0) {
    throw new Error("Invalid project files payload: empty files");
  }
  return files;
}
