'use server';
/**
 * @fileOverview An AI agent that analyzes monthly labor productivity reports and generates a concise summary with actionable insights.
 *
 * - generateProductivityInsights - A function that handles the generation of productivity insights.
 * - MonthlyReportInput - The input type for the generateProductivityInsights function.
 * - ProductivityInsightOutput - The return type for the generateProductivityInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MonthlyReportInputSchema = z.object({
  reportContent: z
    .string()
    .describe('The full text content of the monthly labor productivity report.'),
});
export type MonthlyReportInput = z.infer<typeof MonthlyReportInputSchema>;

const ProductivityInsightOutputSchema = z.object({
  summary: z
    .string()
    .describe('A concise overall summary of the monthly labor productivity report.'),
  topPerformers: z
    .array(z.string())
    .describe('A list of top-performing workers highlighted in the report, with reasons for their performance.'),
  areasForImprovement: z
    .array(z.string())
    .describe('A list of specific areas identified for improvement in labor efficiency or output, with actionable suggestions.'),
  unusualTrends: z
    .array(z.string())
    .describe('A list of any unusual or unexpected trends detected in the report (e.g., sudden drops/increases in productivity, unexpected high/low costs, unusual task completion rates).'),
  actionableInsights: z
    .array(z.string())
    .describe('A list of actionable insights that a farm manager can use to optimize farm operations.'),
});
export type ProductivityInsightOutput = z.infer<typeof ProductivityInsightOutputSchema>;

export async function generateProductivityInsights(
  input: MonthlyReportInput
): Promise<ProductivityInsightOutput> {
  return generateProductivityInsightsFlow(input);
}

const analyzeProductivityReportPrompt = ai.definePrompt({
  name: 'analyzeProductivityReportPrompt',
  input: {schema: MonthlyReportInputSchema},
  output: {schema: ProductivityInsightOutputSchema},
  prompt: `You are an AI assistant specialized in analyzing farm labor productivity reports. Your goal is to provide a concise summary with actionable insights, highlighting top-performing workers, identifying areas for improvement, and detecting unusual trends from the provided monthly labor productivity report.

Here is the monthly labor productivity report:
{{{reportContent}}}

Please analyze the report and provide the following:
1. A concise overall summary.
2. A list of top-performing workers, explaining why they are top performers based on the report.
3. A list of specific areas for improvement in labor efficiency or output, with actionable suggestions.
4. A list of any unusual or unexpected trends detected in the report (e.g., sudden drops/increases in productivity, unexpected high/low costs, unusual task completion rates).
5. A list of actionable insights that a farm manager can use to optimize farm operations.`,
});

const generateProductivityInsightsFlow = ai.defineFlow(
  {
    name: 'generateProductivityInsightsFlow',
    inputSchema: MonthlyReportInputSchema,
    outputSchema: ProductivityInsightOutputSchema,
  },
  async input => {
    const {output} = await analyzeProductivityReportPrompt(input);
    return output!;
  }
);
