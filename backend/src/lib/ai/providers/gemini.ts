import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "../../logger";
import { GenerateOptions, buildSystemPrompt, buildUserPrompt, cleanHtmlOutput } from "../prompts";

export class GeminiProvider {
  private client: GoogleGenerativeAI;
  readonly name = "gemini" as const;

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set");
    }
    this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  async generateWebsite(options: GenerateOptions): Promise<string> {
    const model = this.client.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: buildSystemPrompt(),
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.7,
      },
    });

    const result = await model.generateContent(buildUserPrompt(options));
    const html = cleanHtmlOutput(result.response.text());

    if (!html.startsWith("<!DOCTYPE") && !html.startsWith("<html")) {
      throw new Error("Gemini: response is not valid HTML");
    }

    logger.info(`[Gemini] Generated ${html.length} bytes for ${options.businessName}`);
    return html;
  }
}
