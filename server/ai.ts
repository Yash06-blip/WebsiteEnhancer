// Mock implementation of AI functionality
// This file provides placeholder functionality when an OpenAI API key is not available

export interface AIAnalysisResponse {
  category: string;
  importance: "low" | "medium" | "high";
  suggestions: string[];
  keywords: string[];
  followUpActions?: string[];
}

/**
 * Mock function that simulates analyzing handover content using AI
 * @param content The handover log content to analyze
 * @param logType The type of log (statutory or non-statutory)
 * @returns AI analysis with suggestions and categorization
 */
export async function analyzeHandoverContent(
  content: string,
  logType: string
): Promise<AIAnalysisResponse> {
  console.log(`[MOCK AI] Analyzing ${logType} handover content`);
  
  // Create mock analysis based on keywords in the content
  const hasEmergency = content.toLowerCase().includes("emergency") || content.toLowerCase().includes("urgent");
  const hasMaintenance = content.toLowerCase().includes("maintenance") || content.toLowerCase().includes("repair");
  const hasSafety = content.toLowerCase().includes("safety") || content.toLowerCase().includes("hazard");
  
  // Determine mock importance based on content
  let importance: "low" | "medium" | "high" = "low";
  if (hasEmergency) {
    importance = "high";
  } else if (hasSafety) {
    importance = "medium";
  }
  
  // Determine mock category
  let category = "General";
  if (hasEmergency || hasSafety) {
    category = "Safety";
  } else if (hasMaintenance) {
    category = "Maintenance";
  }
  
  // Mock suggestions
  const suggestions = [
    "Ensure proper documentation of all incidents in the shift log.",
    "Follow up with the maintenance team on any equipment issues.",
    "Check that all safety protocols were followed during the shift."
  ];
  
  // Mock keywords extracted from content
  const keywords = ["handover", "shift", "report"];
  if (hasEmergency) keywords.push("emergency", "urgent");
  if (hasMaintenance) keywords.push("maintenance", "repair");
  if (hasSafety) keywords.push("safety", "hazard");
  
  // Mock follow-up actions
  const followUpActions = [
    "Review the handover log with the incoming shift supervisor.",
    "Update the incident tracking system if necessary."
  ];
  
  // Simulated delay to mimic API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    category,
    importance,
    suggestions,
    keywords,
    followUpActions
  };
}

/**
 * Mock function that simulates generating AI-assisted recommendations
 * @param previousLogs Array of recent handover log content
 * @returns Recommendations string
 */
export async function generateHandoverRecommendations(
  previousLogs: string[]
): Promise<string> {
  console.log(`[MOCK AI] Generating recommendations based on ${previousLogs.length} logs`);
  
  // Simulated delay to mimic API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return mock recommendations
  return `
Based on recent handover logs, consider including the following in your handover:

1. Equipment status update for conveyor systems
2. Methane level readings from all active mining areas
3. Update on water drainage maintenance in section B
4. Status of pending safety inspections
5. Progress on current mining faces

Remember to include any incidents or near-misses that occurred during your shift.
  `;
}