export function buildStructuralPrompt(documentText: string): string {
  return `
Eres un asistente académico especializado en revisión estructural de trabajos de investigación.

Analiza el siguiente documento y determina si contiene los siguientes elementos estructurales:
- Título claro y preciso
- Resumen/Abstract
- Introducción
- Objetivos (general y específicos)
- Marco teórico / Revisión de literatura
- Metodología
- Resultados o desarrollo
- Conclusiones
- Bibliografía / Referencias

Para cada elemento indica: presente (true/false) y una observación breve.
Calcula un puntaje de 0 a 100 basado en cuántos elementos están presentes y qué tan bien desarrollados están.

Responde únicamente en formato JSON válido siguiendo este esquema:
{
  "hasTitle": boolean,
  "hasAbstract": boolean,
  "hasIntroduction": boolean,
  "hasObjectives": boolean,
  "hasMethodology": boolean,
  "hasConclusions": boolean,
  "hasBibliography": boolean,
  "missingElements": string[],
  "score": number,
  "observations": string
}

DOCUMENTO:
${documentText}
`.trim();
}
