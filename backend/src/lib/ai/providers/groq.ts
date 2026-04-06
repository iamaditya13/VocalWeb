import Groq from "groq-sdk";
import { logger } from "../../logger";
import { GenerateOptions, buildSystemPrompt, buildUserPrompt, cleanHtmlOutput } from "../prompts";

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
      temperature: 0.7,
      messages: [
        { role: "system", content: buildSystemPrompt() },
        { role: "user", content: buildUserPrompt(options) },
      ],
    });

    const raw = completion.choices[0]?.message?.content || "";
    const html = cleanHtmlOutput(raw);

    if (!html.startsWith("<!DOCTYPE") && !html.startsWith("<html")) {
      throw new Error("Groq: response is not valid HTML");
    }

    logger.info(`[Groq] Generated ${html.length} bytes for ${options.businessName}`);
    return html;
  }
}
