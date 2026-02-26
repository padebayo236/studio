"use server";

import {
  generateTaskDescription,
  type GenerateTaskDescriptionInput,
  type GenerateTaskDescriptionOutput,
} from "@/ai/flows/generate-task-description";

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
