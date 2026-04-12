import Groq from "groq-sdk";
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

export class GroqProvider {
  private client: Groq;
  readonly name = "groq" as const;

  constructor() {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not set");
    }
    this.client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }

  async generateWebsite(options: GenerateOptions): Promise<string> {
    const completion = await this.client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 8000,
      temperature: 0.75,
      messages: [
        { role: "system", content: buildHtmlSystemPrompt() },
        { role: "user", content: buildHtmlUserPrompt(options) },
      ],
    });

    const raw = completion.choices[0]?.message?.content || "";
    const html = cleanHtmlOutput(raw);

    if (!html.startsWith("<!DOCTYPE") && !html.startsWith("<html")) {
      throw new Error("Groq: response is not valid HTML");
    }

    logger.info(`[Groq] HTML ${html.length} bytes for ${options.businessName}`);
    return html;
  }

  async generateNextProject(options: GenerateOptions): Promise<Record<string, string>> {
    const completion = await this.client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 16000,
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildNextSystemPrompt() },
        { role: "user", content: buildNextUserPrompt(options) },
      ],
    });

    const raw = completion.choices[0]?.message?.content || "";
    const files = parseProjectFiles(raw);

    logger.info(
      `[Groq] NEXT project with ${Object.keys(files).length} files for ${options.businessName}`
    );
    return files;
  }
}
