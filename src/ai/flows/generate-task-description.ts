'use server';
/**
 * @fileOverview An AI assistant that helps farm managers create detailed and comprehensive task descriptions.
 *
 * - generateTaskDescription - A function that generates a detailed task description.
 * - GenerateTaskDescriptionInput - The input type for the generateTaskDescription function.
 * - GenerateTaskDescriptionOutput - The return type for the generateTaskDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTaskDescriptionInputSchema = z.object({
  cropType: z
    .string()
    .describe(
      'The type of crop for which the task is being created (e.g., maize, rice, tomato, cassava).'
    ),
  taskType: z
    .string()
    .describe(
      'The category of the task (e.g., planting, weeding, harvesting, irrigation, fertilizer application).'
    ),
  fieldName: z
    .string()
    .optional()
    .describe(
      'The name of the field where the task will be performed, providing additional context.'
    ),
  additionalDetails: z
    .string()
    .optional()
    .describe(
      'Any specific instructions or details provided by the farm manager that should be included in the description.'
    ),
});
export type GenerateTaskDescriptionInput = z.infer<
  typeof GenerateTaskDescriptionInputSchema
>;

const GenerateTaskDescriptionOutputSchema = z.object({
  description: z.string().describe('The generated detailed task description.'),
});
export type GenerateTaskDescriptionOutput = z.infer<
  typeof GenerateTaskDescriptionOutputSchema
>;

export async function generateTaskDescription(
  input: GenerateTaskDescriptionInput
): Promise<GenerateTaskDescriptionOutput> {
  return generateTaskDescriptionFlow(input);
}

const generateTaskDescriptionPrompt = ai.definePrompt({
  name: 'generateTaskDescriptionPrompt',
  input: {schema: GenerateTaskDescriptionInputSchema},
  output: {schema: GenerateTaskDescriptionOutputSchema},
  prompt: `You are an expert agricultural assistant specializing in creating clear, detailed, and comprehensive task descriptions for farm workers.

Your goal is to generate a task description that is unambiguous, informative, and includes all necessary information for a worker to successfully complete the task. The description should specify actions, expected outcomes, and any important considerations.

Based on the following information, generate a detailed task description:

Crop Type: {{{cropType}}}
Task Type: {{{taskType}}}
{{#if fieldName}}Field Name: {{{fieldName}}}{{/if}}
{{#if additionalDetails}}Additional Details: {{{additionalDetails}}}{{/if}}

Please provide a detailed task description in the 'description' field of the JSON output. Consider common practices and essential steps for the specified crop type and task.`,
});

const generateTaskDescriptionFlow = ai.defineFlow(
  {
    name: 'generateTaskDescriptionFlow',
    inputSchema: GenerateTaskDescriptionInputSchema,
    outputSchema: GenerateTaskDescriptionOutputSchema,
  },
  async input => {
    const {output} = await generateTaskDescriptionPrompt(input);
    return output!;
  }
);
