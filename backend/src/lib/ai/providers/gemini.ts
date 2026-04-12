import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "../../logger";
import {
  GenerateOptions,
  buildHtmlSystemPrompt,
  buildHtmlUserPrompt,
  buildNextSystemPrompt,
  buildNextUserPrompt,
  cleanHtmlOutput,
  parseProjectFiles,
} from "../prompts";

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
      systemInstruction: buildHtmlSystemPrompt(),
      generationConfig: { maxOutputTokens: 8192, temperature: 0.75 },
    });

    const result = await model.generateContent(buildHtmlUserPrompt(options));
    const html = cleanHtmlOutput(result.response.text());

    if (!html.startsWith("<!DOCTYPE") && !html.startsWith("<html")) {
      throw new Error("Gemini: response is not valid HTML");
    }

    logger.info(`[Gemini] HTML ${html.length} bytes for ${options.businessName}`);
    return html;
  }

  async generateNextProject(options: GenerateOptions): Promise<Record<string, string>> {
    const model = this.client.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: buildNextSystemPrompt(),
      generationConfig: {
        maxOutputTokens: 16384,
        temperature: 0.7,
        responseMimeType: "application/json",
      },
    });

    const result = await model.generateContent(buildNextUserPrompt(options));
    const files = parseProjectFiles(result.response.text());

    logger.info(
      `[Gemini] NEXT project with ${Object.keys(files).length} files for ${options.businessName}`
    );
    return files;
  }
}
