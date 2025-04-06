import OpenAI from "openai";

import { LogType } from "@shared/schema";

// Initialize OpenAI client
const apiKey: string = process.env.OPENAI_API_KEY ?? "sk-dummy-key";
const openai = new OpenAI({ apiKey });

// Interface for AI analysis response
interface AIAnalysisResponse {
  category: string;
  importance: "low" | "medium" | "high";
  suggestions: string[];
  keywords: string[];
  followUpActions?: string[];
}

/**
 * Analyzes handover log content using OpenAI to provide suggestions and categorization
 * @param content The handover log content to analyze
 * @param logType The type of log (statutory or non-statutory)
 * @returns AI analysis with suggestions and categorization
 */
export async function analyzeHandoverContent(
  content: string,
  logType: string
): Promise<AIAnalysisResponse | null> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.warn("OpenAI API key not set, skipping analysis");
      return null;
    }

    // System prompt based on log type
    let systemPrompt = "You are an industrial shift handover specialist AI.";
    if (logType === LogType.STATUTORY) {
      systemPrompt += " Focus on safety incidents, environmental records, equipment maintenance, and compliance issues.";
    } else {
      systemPrompt += " Focus on routine operations, shift performance, process deviations, and general remarks.";
    }

    // The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `${systemPrompt} Analyze the following shift handover log content and provide a JSON response with:
          1. A specific subcategory for this log
          2. Importance level (low/medium/high)
          3. List of suggestions for improvement or follow-up
          4. Key terms/keywords
          5. Recommended follow-up actions if any are needed`
        },
        {
          role: "user",
          content: content
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    return {
      category: result.category || result.subcategory,
      importance: result.importance as "low" | "medium" | "high",
      suggestions: result.suggestions || [],
      keywords: result.keywords || [],
      followUpActions: result.followUpActions || result.recommended_actions
    };
  } catch (error) {
    console.error("Error analyzing content with OpenAI:", error);
    return null;
  }
}

/**
 * Generates AI-assisted recommendations for shift handover based on previous logs
 * @param previousLogs Array of recent handover log content
 * @returns Recommendations string
 */
export async function generateHandoverRecommendations(
  previousLogs: string[]
): Promise<string | null> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.warn("OpenAI API key not set, skipping recommendations");
      return null;
    }

    // The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an industrial shift handover specialist AI. Based on the previous logs, provide recommendations for the current shift handover. Focus on: 
          1. Continuing issues that need attention
          2. Patterns or trends that might be developing
          3. Suggested follow-ups based on previous entries`
        },
        {
          role: "user",
          content: `Previous logs: ${previousLogs.join("\n\n")}`
        }
      ]
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error generating recommendations with OpenAI:", error);
    return null;
  }
}
