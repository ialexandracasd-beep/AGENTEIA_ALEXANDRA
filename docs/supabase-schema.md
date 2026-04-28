# Supabase Schema — AgenteIA Alexandra

## Tablas

### `students`
Registro central de cada estudiante.

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | UUID PK | Generado automáticamente |
| `name` | TEXT NOT NULL | Nombre completo |
| `email` | TEXT NOT NULL UNIQUE | Correo institucional |
| `drive_folder_id` | TEXT | ID de la carpeta en Google Drive |
| `sheet_id` | TEXT | ID del Google Sheet individual |
| `sheet_url` | TEXT | URL directa al Google Sheet |
| `created_at` | TIMESTAMPTZ | Auto |
| `updated_at` | TIMESTAMPTZ | Auto (trigger) |

---

### `student_sheets`
Vincula cada estudiante con su Google Sheet de seguimiento. Complementa la referencia rápida en `students`.

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | UUID PK | |
| `student_id` | UUID FK → students | |
| `spreadsheet_id` | TEXT NOT NULL | ID del spreadsheet en Google |
| `spreadsheet_url` | TEXT NOT NULL | URL pública del spreadsheet |
| `folder_id` | TEXT NOT NULL | ID de la carpeta en Drive |
| `created_at` | TIMESTAMPTZ | Auto |

---

### `sheet_submissions`
Cada entrega de documento que hace un estudiante.

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | UUID PK | |
| `student_id` | UUID FK → students | |
| `entrega` | TEXT NOT NULL | Etiqueta de la entrega (ej. "Entrega 1") |
| `fecha` | DATE | Fecha de la entrega |
| `titulo` | TEXT NOT NULL | Título del documento |
| `link_documento` | TEXT | URL al documento en Drive |
| `created_at` | TIMESTAMPTZ | Auto |

---

### `structure_reviews`
Resultado de la validación estructural (determinística) de un documento.

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | UUID PK | |
| `student_id` | UUID FK → students | |
| `submission_id` | UUID FK → sheet_submissions | Opcional |
| `has_title` | BOOLEAN | |
| `has_abstract` | BOOLEAN | |
| `has_introduction` | BOOLEAN | |
| `has_objectives` | BOOLEAN | |
| `has_methodology` | BOOLEAN | |
| `has_conclusions` | BOOLEAN | |
| `has_bibliography` | BOOLEAN | |
| `missing_elements` | TEXT[] | Secciones faltantes |
| `score` | NUMERIC(5,2) | Puntaje 0–100 |
| `observations` | TEXT | Observaciones adicionales |
| `created_at` | TIMESTAMPTZ | Auto |

---

### `ai_reviews`
Resultado del análisis metodológico realizado por Gemini 2.5 Flash.

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | UUID PK | |
| `student_id` | UUID FK → students | |
| `submission_id` | UUID FK → sheet_submissions | Opcional |
| `review_type` | TEXT | `structural` \| `methodological` \| `full` |
| `coherence_score` | NUMERIC(4,2) | Coherencia 0–10 |
| `objectives_aligned` | BOOLEAN | Objetivos alineados con metodología |
| `methodology_justified` | BOOLEAN | Metodología justificada |
| `results_consistent` | BOOLEAN | Resultados consistentes |
| `feedback` | TEXT | Retroalimentación narrativa |
| `suggestions` | TEXT[] | Lista de sugerencias |
| `overall_score` | NUMERIC(5,2) | Puntaje global 0–100 |
| `document_url` | TEXT | URL del documento revisado |
| `raw_response` | JSONB | Respuesta cruda de Gemini |
| `status` | TEXT | `pending` \| `in_progress` \| `completed` \| `failed` |
| `created_at` | TIMESTAMPTZ | Auto |

---

### `final_results`
Resultado consolidado por entrega, combinando revisión estructural y metodológica.

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | UUID PK | |
| `student_id` | UUID FK → students | |
| `submission_id` | UUID FK → sheet_submissions | |
| `structural_score` | NUMERIC(5,2) | Puntaje estructural |
| `methodological_score` | NUMERIC(5,2) | Puntaje metodológico |
| `final_score` | NUMERIC(5,2) | Puntaje final combinado |
| `estado_estructural` | TEXT | Etiqueta legible del estado |
| `estado_metodologico` | TEXT | Etiqueta legible del estado |
| `observaciones` | TEXT | Resumen de observaciones |
| `created_at` | TIMESTAMPTZ | Auto |
| `updated_at` | TIMESTAMPTZ | Auto (trigger) |

---

## Relaciones

```
students
  ├── student_sheets   (1:1 por diseño)
  ├── sheet_submissions (1:N)
  │     ├── structure_reviews (1:1 por submission)
  │     ├── ai_reviews        (1:N — puede haber full + methodological)
  │     └── final_results     (1:1 por submission)
```

## Notas de implementación

- Todas las columnas de referencia entre TS y DB usan snake_case en la DB y camelCase en TypeScript.
- El mapeo se hace en `supabase.service.ts` mediante funciones `mapStudent()` etc.
- RLS (Row Level Security) se activará en una fase posterior cuando se implemente autenticación de la profesora.
