import { logger } from "../lib/logger";

export interface ValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
  score: number;
}

export function validateHTML(html: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. DOCTYPE check
  if (!html.includes("<!DOCTYPE html") && !html.includes("<!doctype html")) {
    errors.push("Missing HTML5 DOCTYPE declaration");
  }

  // 2. HTML root element
  if (!/<html[\s>]/i.test(html)) {
    errors.push("Missing <html> root element");
  }

  // 3. Head section
  if (!/<head[\s>]/i.test(html)) {
    errors.push("Missing <head> section");
  }

  // 4. Title
  if (!/<title[\s>]/i.test(html)) {
    errors.push("Missing <title> tag");
  }

  // 5. Viewport meta (critical for mobile)
  if (!/meta[^>]+viewport/i.test(html)) {
    errors.push("Missing viewport meta tag — mobile responsiveness broken");
  }

  // 6. Charset meta
  if (!/meta[^>]+charset/i.test(html) && !/meta[^>]+utf-8/i.test(html)) {
    warnings.push("Missing charset meta tag");
  }

  // 7. Body element
  if (!/<body[\s>]/i.test(html)) {
    errors.push("Missing <body> element");
  }

  // 8. Closing tags
  if (!/<\/html>/i.test(html)) {
    errors.push("Missing closing </html> tag");
  }
  if (!/<\/body>/i.test(html)) {
    warnings.push("Missing closing </body> tag");
  }

  // 9. Header or nav
  if (!/<header[\s>]/i.test(html) && !/<nav[\s>]/i.test(html)) {
    warnings.push("No header or navigation section found");
  }

  // 10. Footer
  if (!/<footer[\s>]/i.test(html)) {
    errors.push("Missing footer section");
  }

  // 11. At least one h1
  if (!/<h1[\s>]/i.test(html)) {
    warnings.push("No H1 heading found — important for SEO");
  }

  // 12. CSS present
  if (!/<style[\s>]/i.test(html) && !/<link[^>]+stylesheet/i.test(html)) {
    errors.push("No CSS found — website will have no styling");
  }

  // 13. Responsive media queries or viewport width
  if (!/max-width|min-width|@media/i.test(html)) {
    warnings.push("No responsive CSS media queries found");
  }

  // 14. No script tags with external sources (security)
  const externalScripts = html.match(/<script[^>]+src=[^>]+>/gi) || [];
  if (externalScripts.length > 0) {
    warnings.push("External script tags found — these are blocked in preview for security");
  }

  // 15. Content length check
  if (html.length < 3000) {
    errors.push("Generated HTML is too short — content may be incomplete");
  }

  // 16. Check for Lorem Ipsum (should use real content)
  if (/lorem ipsum/i.test(html)) {
    warnings.push("Lorem Ipsum placeholder text found in content");
  }

  // Score calculation (0-100)
  const maxErrors = 8;
  const maxWarnings = 7;
  const errorPenalty = Math.min(errors.length, maxErrors) * 10;
  const warningPenalty = Math.min(warnings.length, maxWarnings) * 3;
  const score = Math.max(0, 100 - errorPenalty - warningPenalty);

  const passed = errors.length === 0;

  if (passed) {
    logger.info(`Validation passed (score: ${score}, warnings: ${warnings.length})`);
  } else {
    logger.warn(`Validation failed: ${errors.join(", ")}`);
  }

  return { passed, errors, warnings, score };
}

export function repairHTML(html: string): string {
  let repaired = html;

  // Add DOCTYPE if missing
  if (!repaired.includes("<!DOCTYPE")) {
    repaired = `<!DOCTYPE html>\n${repaired}`;
  }

  // Add viewport if missing
  if (!/meta[^>]+viewport/i.test(repaired)) {
    repaired = repaired.replace(
      /<head([^>]*)>/i,
      `<head$1>\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">`
    );
  }

  // Add charset if missing
  if (!/meta[^>]+charset/i.test(repaired)) {
    repaired = repaired.replace(
      /<head([^>]*)>/i,
      `<head$1>\n  <meta charset="UTF-8">`
    );
  }

  // Ensure closing html tag
  if (!/<\/html>/i.test(repaired)) {
    if (/<\/body>/i.test(repaired)) {
      repaired = repaired + "\n</html>";
    } else {
      repaired = repaired + "\n</body>\n</html>";
    }
  }

  return repaired;
}
