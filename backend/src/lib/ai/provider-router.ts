import { logger } from "../logger";
import { GenerateOptions } from "./prompts";
import { GeminiProvider } from "./providers/gemini";
import { GroqProvider } from "./providers/groq";
import { generateEmergencyTemplate } from "./emergency-template";

export type ProviderName = "gemini" | "groq" | "emergency";

export interface GenerationResult {
  html: string;
  provider: ProviderName;
  latencyMs: number;
  fallbackUsed: boolean;
  retryCount: number;
}

let gemini: GeminiProvider | null = null;
let groq: GroqProvider | null = null;

function getGemini(): GeminiProvider {
  if (!gemini) gemini = new GeminiProvider();
  return gemini;
}

function getGroq(): GroqProvider {
  if (!groq) groq = new GroqProvider();
  return groq;
}

export async function routeGeneration(options: GenerateOptions): Promise<GenerationResult> {
  const start = Date.now();

  // ── 1. Try Gemini (primary) ──────────────────────────────────────────────
  try {
    logger.info(`[Router] Trying Gemini for ${options.businessName}`);
    const html = await getGemini().generateWebsite(options);
    return {
      html,
      provider: "gemini",
      latencyMs: Date.now() - start,
      fallbackUsed: false,
      retryCount: 0,
    };
  } catch (geminiErr) {
    logger.warn(`[Router] Gemini failed: ${(geminiErr as Error).message}`);
  }

  // ── 2. Try Groq (fallback) ───────────────────────────────────────────────
  try {
    logger.info(`[Router] Falling back to Groq for ${options.businessName}`);
    const html = await getGroq().generateWebsite(options);
    return {
      html,
      provider: "groq",
      latencyMs: Date.now() - start,
      fallbackUsed: true,
      retryCount: 1,
    };
  } catch (groqErr) {
    logger.warn(`[Router] Groq failed: ${(groqErr as Error).message}. Retrying once…`);
  }

  // ── 3. Groq retry ────────────────────────────────────────────────────────
  try {
    await new Promise((r) => setTimeout(r, 1500));
    logger.info(`[Router] Groq retry for ${options.businessName}`);
    const html = await getGroq().generateWebsite(options);
    return {
      html,
      provider: "groq",
      latencyMs: Date.now() - start,
      fallbackUsed: true,
      retryCount: 2,
    };
  } catch (retryErr) {
    logger.error(`[Router] All providers failed: ${(retryErr as Error).message}`);
  }

  // ── 4. Emergency template (never fails) ──────────────────────────────────
  logger.warn(`[Router] Serving emergency template for ${options.businessName}`);
  const html = generateEmergencyTemplate({
    businessName: options.businessName,
    themeColor: options.themeColor,
    services: options.sections.filter((s) => !["hero", "footer", "contact"].includes(s)),
  });

  return {
    html,
    provider: "emergency",
    latencyMs: Date.now() - start,
    fallbackUsed: true,
    retryCount: 3,
  };
}
