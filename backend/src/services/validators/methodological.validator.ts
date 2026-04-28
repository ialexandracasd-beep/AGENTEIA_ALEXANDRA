// Reglas de negocio para validación metodológica
// Complementa la revisión de Gemini con verificaciones determinísticas

export interface DocumentMetadata {
  wordCount: number;
  hasReferences: boolean;
  referenceCount: number;
}

export function extractDocumentMetadata(text: string): DocumentMetadata {
  const words = text.trim().split(/\s+/).length;
  const referencePatterns = /\[\d+\]|\(\w+,\s*\d{4}\)/g;
  const references = text.match(referencePatterns) || [];

  return {
    wordCount: words,
    hasReferences: references.length > 0,
    referenceCount: references.length,
  };
}

export function validateMinimumLength(text: string, minWords = 500): boolean {
  const meta = extractDocumentMetadata(text);
  return meta.wordCount >= minWords;
}

export function validateHasBibliography(text: string): boolean {
  const bibliographyKeywords = [
    'referencias', 'bibliografía', 'bibliography', 'references', 'fuentes',
  ];
  const lowerText = text.toLowerCase();
  return bibliographyKeywords.some(kw => lowerText.includes(kw));
}
