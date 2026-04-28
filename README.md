# AgenteIA Alexandra

Sistema de gestión y revisión metodológica automatizada para una profesora de metodología de la investigación. Integra Google Drive, Google Sheets, Supabase y Gemini 2.5 Flash para crear un flujo completo de seguimiento y retroalimentación académica.

---

## ¿Qué hace este sistema?

- Crea una carpeta en Google Drive por cada estudiante
- Genera una hoja de seguimiento individual en Google Sheets
- Asigna permisos automáticamente al estudiante
- Revisa documentos académicos con IA (Gemini 2.5 Flash):
  - **Revisión estructural:** verifica secciones presentes
  - **Revisión metodológica:** evalúa coherencia, rigor y alineación
- Guarda todos los resultados en Supabase
- Actualiza automáticamente la hoja del estudiante con el puntaje y observaciones

---

## Estructura del Proyecto

```
AgenteIA_Alexandra/
├── backend/                    # API REST - Node.js + TypeScript + Express
│   └── src/
│       ├── config/             # env, supabase, google, gemini
│       ├── controllers/        # students, sheets, review
│       ├── routes/             # rutas Express
│       ├── services/
│       │   ├── google/         # Drive y Sheets
│       │   ├── supabase/       # operaciones de base de datos
│       │   ├── ai/             # Gemini + prompts + schemas
│       │   ├── flows/          # orquestación de procesos
│       │   └── validators/     # Zod + validación de documentos
│       ├── types/              # interfaces TypeScript
│       └── utils/              # logger, response helpers
├── frontend/                   # Panel web - Next.js 14
│   ├── app/                    # páginas Next.js
│   ├── components/             # componentes React
│   └── lib/                    # cliente API
├── docs/                       # documentación técnica
│   ├── arquitectura.md
│   ├── flujos.md
│   └── checklist-metodologica.json
├── README.md
└── CLAUDE.md
```

---

## Instalación

### Requisitos

- Node.js 20+
- npm 9+
- Cuenta de Supabase
- Proyecto en Google Cloud con Drive API y Sheets API habilitadas
- API Key de Google AI (Gemini)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Editar .env con tus credenciales
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# Editar .env.local con la URL del backend
npm run dev
```

---

## Endpoints del API

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Estado del servidor |
| GET | `/api/students` | Listar estudiantes |
| POST | `/api/students` | Crear estudiante (+ Drive + Sheet) |
| GET | `/api/students/:id` | Ver estudiante |
| GET | `/api/sheets/:studentId` | Ver datos del sheet |
| POST | `/api/reviews` | Enviar documento a revisión |
| GET | `/api/reviews/student/:studentId` | Ver revisiones de un estudiante |

---

## Tablas Supabase necesarias

```sql
create table students (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null unique,
  "driveFolder" text,
  "sheetId" text,
  "createdAt" timestamp default now(),
  "updatedAt" timestamp default now()
);

create table reviews (
  id uuid default gen_random_uuid() primary key,
  "studentId" uuid references students(id),
  "documentUrl" text,
  "reviewType" text,
  structural jsonb,
  methodological jsonb,
  status text default 'pending',
  "createdAt" timestamp default now()
);
```

---

## Próximos pasos

1. Configurar credenciales en `.env` (backend) y `.env.local` (frontend)
2. Crear las tablas en Supabase
3. Obtener `refresh_token` de Google OAuth2
4. Correr backend con `npm run dev` en `/backend`
5. Correr frontend con `npm run dev` en `/frontend`
6. Probar el flujo completo: crear estudiante → enviar revisión → ver hoja actualizada
7. Agregar autenticación para la profesora
8. Implementar páginas `/students` y `/reviews` en el frontend
9. Agregar carga de documentos PDF desde Google Drive directamente
