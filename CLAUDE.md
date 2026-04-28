# CLAUDE.md — Contexto del Proyecto AgenteIA Alexandra

## Nombre del Proyecto
**AgenteIA Alexandra**

## Objetivo
Sistema de revisión metodológica automatizada para una profesora universitaria de metodología de la investigación. El sistema gestiona estudiantes, carpetas en Google Drive, hojas de seguimiento individuales en Google Sheets, y ejecuta revisiones académicas con Gemini 2.5 Flash.

---

## Stack Tecnológico

| Componente | Tecnología |
|------------|-----------|
| Backend | Node.js 20 + TypeScript + Express |
| Frontend | Next.js 14 + React 18 |
| Base de datos | Supabase (PostgreSQL) |
| Almacenamiento | Google Drive API v3 |
| Seguimiento académico | Google Sheets API v4 |
| Inteligencia Artificial | Gemini 2.5 Flash (`gemini-2.5-flash`) |
| Validación de esquemas | Zod |
| Logs | Winston |
| Autenticación Google | OAuth2 con refresh_token |

---

## Estructura de Carpetas Relevante

```
backend/src/
  config/           → env.ts, supabase.ts, google.ts, gemini.ts
  controllers/      → students, sheets, review
  routes/           → index.ts + rutas individuales
  services/
    google/         → drive.service.ts, sheets.service.ts
    supabase/       → supabase.service.ts
    ai/             → gemini.service.ts, prompts/, schemas/
    flows/          → create-student.flow.ts, review-submission.flow.ts
    validators/     → structural.validator.ts, methodological.validator.ts
  types/            → student.types.ts, review.types.ts, sheet.types.ts
  utils/            → logger.ts, response.ts
  app.ts            → setup de Express
  server.ts         → punto de entrada

frontend/
  app/              → layout.tsx, page.tsx
  components/       → StudentCard.tsx, ReviewPanel.tsx
  lib/              → api.ts (cliente HTTP)

docs/
  arquitectura.md
  flujos.md
  checklist-metodologica.json
```

---

## Reglas de Desarrollo

1. **No mezclar responsabilidades.** Cada archivo tiene un propósito único: config, service, controller, flow, validator o util.
2. **Los flows orquestan, los services ejecutan.** Los flows combinan múltiples services. Los services solo conocen su propio dominio.
3. **Zod para validar todo input externo.** Validar en validators antes de llegar a controllers. Validar respuestas de Gemini con schemas Zod.
4. **Respuestas de API consistentes.** Usar `sendSuccess`, `sendError`, `sendNotFound` de `utils/response.ts`.
5. **Prompts en archivos separados.** Nunca escribir prompts inline en gemini.service.ts. Siempre en `services/ai/prompts/`.
6. **No agregar lógica extra no pedida.** Sin features no solicitadas, sin abstracciones prematuras.
7. **No comentarios obvios.** Solo comentar el "por qué" si no es evidente del código.
8. **TypeScript estricto.** No usar `any`. Definir tipos en `types/`.

---

## Cómo Responder y Generar Código

- Respuestas cortas y directas. Sin teoría larga innecesaria.
- Cuando se pida código, generarlo completo y funcional para ese archivo.
- Mantener consistencia con la estructura ya definida.
- Si hay que agregar un nuevo servicio, crearlo en la subcarpeta correcta de `services/`.
- Si hay que agregar un endpoint, crear ruta + controller + service por separado.
- Cuando se modifique un flow, revisar que los types siguen siendo coherentes.
- Nombrar funciones en camelCase, archivos en kebab-case, tipos en PascalCase.

---

## Variables de Entorno Clave (backend/.env)

```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REFRESH_TOKEN
GOOGLE_DRIVE_ROOT_FOLDER_ID
GEMINI_API_KEY
GEMINI_MODEL=gemini-2.5-flash
```

---

## Estado Actual del Proyecto

- [x] Estructura de carpetas y archivos base creada
- [x] Backend con Express + TypeScript configurado
- [x] Config de Supabase, Google APIs y Gemini lista
- [x] Services de Drive, Sheets, Supabase y Gemini creados
- [x] Flows: create-student y review-submission implementados
- [x] Controllers y routes para students, sheets y reviews
- [x] Frontend base Next.js con layout, página home y componentes iniciales
- [x] Documentación: arquitectura, flujos y checklist metodológico
- [ ] Credenciales configuradas (pendiente por el usuario)
- [ ] Tablas creadas en Supabase (pendiente por el usuario)
- [ ] Autenticación para la profesora (pendiente)
- [ ] Páginas `/students` y `/reviews` en el frontend (pendiente)
- [ ] Ingesta de documentos PDF desde Drive (pendiente)
