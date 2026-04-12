import { routeGeneration, GenerationResult } from "../lib/ai/provider-router";
import { GenerateOptions } from "../lib/ai/prompts";

export type { GenerateOptions, GenerationResult };

export async function generateWebsite(options: GenerateOptions): Promise<GenerationResult> {
  return routeGeneration(options);
}
