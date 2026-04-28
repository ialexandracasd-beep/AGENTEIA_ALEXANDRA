export type ReviewStatus = 'pending' | 'in_progress' | 'completed' | 'failed';
export type ReviewType = 'structural' | 'methodological' | 'full';

export interface StructuralResult {
  hasTitle: boolean;
  hasAbstract: boolean;
  hasIntroduction: boolean;
  hasObjectives: boolean;
  hasMethodology: boolean;
  hasConclusions: boolean;
  hasBibliography: boolean;
  missingElements: string[];
  score: number;
  observations?: string;
}

export interface MethodologicalResult {
  coherenceScore: number;
  objectivesAligned: boolean;
  methodologyJustified: boolean;
  resultsConsistent: boolean;
  feedback: string;
  suggestions: string[];
  overallScore: number;
}

export interface ReviewResult {
  id: string;
  studentId: string;
  documentUrl: string;
  reviewType: ReviewType;
  structural?: StructuralResult;
  methodological?: MethodologicalResult;
  status: ReviewStatus;
  createdAt: string;
}
