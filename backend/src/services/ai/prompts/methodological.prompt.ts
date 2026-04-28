export function buildMethodologicalPrompt(documentText: string): string {
  return `
Eres un experto en metodología de la investigación científica.

Analiza el siguiente trabajo de investigación y evalúa:
1. Coherencia entre objetivos y metodología
2. Justificación del enfoque metodológico (cuantitativo/cualitativo/mixto)
3. Consistencia entre resultados y conclusiones
4. Calidad de las referencias bibliográficas
5. Rigor científico general

Proporciona:
- Una puntuación de coherencia de 0 a 10
- Si los objetivos están bien alineados con la metodología (true/false)
- Si la metodología está justificada (true/false)
- Si los resultados son consistentes con el marco teórico (true/false)
- Retroalimentación detallada (máximo 300 palabras)
- Lista de 3 a 5 sugerencias concretas de mejora
- Puntaje global de 0 a 100

Responde únicamente en formato JSON válido:
{
  "coherenceScore": number,
  "objectivesAligned": boolean,
  "methodologyJustified": boolean,
  "resultsConsistent": boolean,
  "feedback": string,
  "suggestions": string[],
  "overallScore": number
}

DOCUMENTO:
${documentText}
`.trim();
}
