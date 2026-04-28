import { z } from 'zod';

export const structuralResultSchema = z.object({
  hasTitle: z.boolean(),
  hasAbstract: z.boolean(),
  hasIntroduction: z.boolean(),
  hasObjectives: z.boolean(),
  hasMethodology: z.boolean(),
  hasConclusions: z.boolean(),
  hasBibliography: z.boolean(),
  missingElements: z.array(z.string()),
  score: z.number().min(0).max(100),
  observations: z.string().optional(),
});

export const methodologicalResultSchema = z.object({
  coherenceScore: z.number().min(0).max(10),
  objectivesAligned: z.boolean(),
  methodologyJustified: z.boolean(),
  resultsConsistent: z.boolean(),
  feedback: z.string(),
  suggestions: z.array(z.string()),
  overallScore: z.number().min(0).max(100),
});

export type StructuralResultParsed = z.infer<typeof structuralResultSchema>;
export type MethodologicalResultParsed = z.infer<typeof methodologicalResultSchema>;
