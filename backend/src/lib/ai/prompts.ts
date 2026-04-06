export interface GenerateOptions {
  transcript: string;
  businessName: string;
  themeColor: string;
  sections: string[];
}

const SECTION_DESCRIPTIONS: Record<string, string> = {
  hero: "A compelling hero section with headline, subheadline, and CTA button",
  about: "An authentic about section telling the business story",
  services: "A clean services/offerings section with descriptions",
  gallery: "A gallery section with placeholder images and captions",
  testimonials: "Customer testimonials with names and review text",
  contact: "Contact information with address, phone, email, and hours",
  footer: "Footer with links, copyright, and social info",
};

export function buildSystemPrompt(): string {
  return `You are an elite web designer who builds stunning, production-ready business websites.

Your websites are:
- Clean, professional, and trustworthy
- Designed as if by a boutique agency — NOT a template
- Mobile-first and fully responsive
- Built with semantic HTML5 and embedded CSS only (NO JavaScript, NO external dependencies)
- Complete single-file HTML documents

DESIGN PHILOSOPHY:
- White backgrounds with subtle off-white section alternation
- Clean typography using system fonts or Google Fonts loaded via @import
- Generous whitespace and breathing room
- Subtle shadows and borders — never harsh
- Professional color usage — the brand color should accent, not overwhelm
- Real business-like photography placeholder sections using CSS gradients
- Every section should feel intentional and crafted

TECHNICAL REQUIREMENTS:
- Valid HTML5 doctype
- UTF-8 charset
- Viewport meta tag (required for mobile)
- Semantic elements: header, nav, main, section, article, footer
- CSS reset included
- All CSS embedded in <style> tags
- Mobile-first media queries
- Flexbox/Grid layouts
- Smooth CSS transitions on hover
- Accessible: proper alt attributes, ARIA labels where needed
- No external JavaScript
- No frameworks

CONTENT REQUIREMENTS:
- Write REAL, specific content based on the business description provided
- Do NOT use Lorem Ipsum — write actual business copy
- Match tone to business type (professional for law, warm for salon, casual for cafe)
- Include realistic testimonials with full names
- Write realistic contact details if not provided
- Use the business name prominently and consistently

OUTPUT:
Return ONLY the complete HTML document. No explanations, no markdown, no code fences.
Start directly with <!DOCTYPE html> and end with </html>.`;
}

export function buildUserPrompt(options: GenerateOptions): string {
  const sectionList = options.sections
    .map((s) => `- ${s.toUpperCase()}: ${SECTION_DESCRIPTIONS[s] || s}`)
    .join("\n");

  return `Create a complete, beautiful website for this business.

BUSINESS DESCRIPTION:
"${options.transcript}"

BUSINESS NAME: ${options.businessName}
PRIMARY BRAND COLOR: ${options.themeColor}

REQUIRED SECTIONS (in order):
${sectionList}

DESIGN INSTRUCTIONS:
1. The primary brand color (${options.themeColor}) should be used for:
   - Navigation background OR as an accent
   - CTA buttons
   - Section headings or decorative elements
   - Subtle use only — white should dominate

2. Typography:
   - Use @import for a premium Google Font (Inter, Playfair Display, or similar appropriate to the business)
   - Clear hierarchy: H1 > H2 > body text
   - Line heights of 1.6–1.8 for body text

3. Layout:
   - Max content width: 1100px centered
   - Consistent 80px vertical padding for sections
   - Alternating section backgrounds: white / #fafafa
   - Responsive grid for services and testimonials

4. Visual details:
   - CSS gradient placeholders for any image areas (using the brand color tastefully)
   - Smooth hover transitions on all interactive elements
   - Subtle box shadows on cards
   - Border radius on cards (8–16px)
   - Navigation with smooth scroll links

5. Content quality:
   - Write compelling, real copy based on the business description
   - Make testimonials sound genuine with specific details
   - Contact section should feel warm and inviting

Create a website that looks like it was built by a premium design agency. The result should make the business owner proud.`;
}

export function cleanHtmlOutput(raw: string): string {
  let html = raw.trim();
  // Strip accidental markdown code fences
  if (html.startsWith("```")) {
    html = html.replace(/^```(?:html)?\n?/, "").replace(/\n?```$/, "").trim();
  }
  return html;
}
