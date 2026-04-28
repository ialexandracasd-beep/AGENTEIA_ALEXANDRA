import { geminiModel } from '../../config/gemini';
import { buildStructuralPrompt } from './prompts/structural.prompt';
import { buildMethodologicalPrompt } from './prompts/methodological.prompt';
import { structuralResultSchema, methodologicalResultSchema } from './schemas/review.schema';
import { StructuralResult, MethodologicalResult } from '../../types/review.types';
import { logger } from '../../utils/logger';

export async function runStructuralReview(documentText: string): Promise<StructuralResult> {
  const prompt = buildStructuralPrompt(documentText);
  const result = await geminiModel.generateContent(prompt);
  const text = result.response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Gemini did not return valid JSON for structural review');

  const parsed = structuralResultSchema.parse(JSON.parse(jsonMatch[0]));
  logger.info(`Structural review completed. Score: ${parsed.score}`);
  return parsed as StructuralResult;
}

export async function runMethodologicalReview(documentText: string): Promise<MethodologicalResult> {
  const prompt = buildMethodologicalPrompt(documentText);
  const result = await geminiModel.generateContent(prompt);
  const text = result.response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Gemini did not return valid JSON for methodological review');

  const parsed = methodologicalResultSchema.parse(JSON.parse(jsonMatch[0]));
  logger.info(`Methodological review completed. Score: ${parsed.overallScore}`);
  return parsed as MethodologicalResult;
}
