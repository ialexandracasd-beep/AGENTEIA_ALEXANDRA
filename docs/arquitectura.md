# Arquitectura del Sistema AgenteIA Alexandra

## Visión General

Sistema de revisión académica automatizada para una profesora de metodología de la investigación. Cada estudiante tiene una carpeta en Google Drive, una hoja de seguimiento individual en Google Sheets, y todos los datos se sincronizan en Supabase. La revisión de documentos se realiza con Gemini 2.5 Flash.

---

## Capas del Sistema

```
[Frontend Next.js]
      ↓ HTTP (fetch)
[Backend Express + TypeScript]
      ↓
  ┌───┴────────────────────────────┐
  │  Flows (orquestación)          │
  └───┬──────────────┬─────────────┘
      ↓              ↓
[Google APIs]    [Supabase]
 - Drive          - students
 - Sheets         - reviews
      ↓
[Gemini 2.5 Flash]
 - Revisión estructural
 - Revisión metodológica
```

---

## Módulos Principales

### `services/google/`
- `drive.service.ts` — Crear carpetas, asignar permisos, listar archivos
- `sheets.service.ts` — Crear hojas individuales, agregar filas, leer datos

### `services/supabase/`
- `supabase.service.ts` — CRUD de estudiantes y resultados de revisión

### `services/ai/`
- `gemini.service.ts` — Ejecuta prompts contra Gemini 2.5 Flash
- `prompts/` — Prompts específicos para revisión estructural y metodológica
- `schemas/` — Validación Zod de las respuestas de Gemini

### `services/flows/`
- `create-student.flow.ts` — Orquesta creación en Drive, Sheets y Supabase
- `review-submission.flow.ts` — Orquesta revisión IA + guardar en Supabase + actualizar Sheet

### `services/validators/`
- `structural.validator.ts` — Validación de inputs con Zod
- `methodological.validator.ts` — Reglas determinísticas de validación de documentos

---

## Base de Datos Supabase (tablas esperadas)

```sql
-- students
id, name, email, driveFolder, sheetId, createdAt, updatedAt

-- reviews
id, studentId, documentUrl, reviewType, structural (jsonb),
methodological (jsonb), status, createdAt
```

---

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Backend | Node.js 20 + TypeScript + Express |
| Frontend | Next.js 14 + React 18 |
| Base de datos | Supabase (PostgreSQL) |
| Almacenamiento | Google Drive API v3 |
| Seguimiento | Google Sheets API v4 |
| IA | Gemini 2.5 Flash (Google AI) |
| Validación | Zod |
| Logs | Winston |
