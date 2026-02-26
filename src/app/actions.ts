"use server";

import {
  generateTaskDescription,
  type GenerateTaskDescriptionInput,
  type GenerateTaskDescriptionOutput,
} from "@/ai/flows/generate-task-description";
import {
  generateProductivityInsights,
  type MonthlyReportInput,
  type ProductivityInsightOutput,
} from "@/ai/flows/generate-productivity-insights";


export async function generateTaskDescriptionAction(
  input: GenerateTaskDescriptionInput
): Promise<GenerateTaskDescriptionOutput> {
  try {
    const output = await generateTaskDescription(input);
    return output;
  } catch (error) {
    console.error("Error generating task description:", error);
    // In a real app, you'd handle this more gracefully
    throw new Error("Failed to generate task description with AI.");
  }
}

export async function generateProductivityInsightsAction(
  input: MonthlyReportInput
): Promise<ProductivityInsightOutput> {
  try {
    const output = await generateProductivityInsights(input);
    return output;
  } catch (error) {
    console.error("Error generating productivity insights:", error);
    throw new Error("Failed to generate productivity insights with AI.");
  }
}
