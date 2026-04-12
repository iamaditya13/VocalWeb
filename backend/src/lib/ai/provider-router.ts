import { logger } from "../logger";
import { GenerateOptions } from "./prompts";
import { GeminiProvider } from "./providers/gemini";
import { GroqProvider } from "./providers/groq";
import { generateEmergencyTemplate } from "./emergency-template";

export type ProviderName = "gemini" | "groq" | "emergency";

export interface GenerationResult {
  html?: string;
  projectFiles?: Record<string, string>;
  framework: "HTML" | "NEXT";
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
  const framework = options.framework ?? "HTML";

  const tryProvider = async (
    name: "gemini" | "groq",
    provider: GeminiProvider | GroqProvider
  ): Promise<GenerationResult | null> => {
    try {
      logger.info(`[Router] Trying ${name} (${framework}) for ${options.businessName}`);
      if (framework === "NEXT") {
        const projectFiles = await provider.generateNextProject(options);
        return {
          projectFiles,
          framework,
          provider: name,
          latencyMs: Date.now() - start,
          fallbackUsed: name !== "gemini",
          retryCount: name === "gemini" ? 0 : 1,
        };
      } else {
        const html = await provider.generateWebsite(options);
        return {
          html,
          framework,
          provider: name,
          latencyMs: Date.now() - start,
          fallbackUsed: name !== "gemini",
          retryCount: name === "gemini" ? 0 : 1,
        };
      }
    } catch (err) {
      logger.warn(`[Router] ${name} failed: ${(err as Error).message}`);
      return null;
    }
  };

  const r1 = await tryProvider("gemini", getGemini());
  if (r1) return r1;

  const r2 = await tryProvider("groq", getGroq());
  if (r2) return r2;

  // Groq retry
  await new Promise((r) => setTimeout(r, 1500));
  const r3 = await tryProvider("groq", getGroq());
  if (r3) return { ...r3, retryCount: 2 };

  // Emergency fallback — HTML only
  logger.warn(`[Router] All providers failed, using emergency template for ${options.businessName}`);
  const html = generateEmergencyTemplate({
    businessName: options.businessName,
    themeColor: options.themeColor,
    services: options.sections.filter((s) => !["hero", "footer", "contact"].includes(s)),
  });

  return {
    html,
    framework: "HTML",
    provider: "emergency",
    latencyMs: Date.now() - start,
    fallbackUsed: true,
    retryCount: 3,
  };
}
