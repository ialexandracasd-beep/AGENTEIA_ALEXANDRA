import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const schema = z.object({
  PORT: z.string().default('3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Acepta una o varias URLs separadas por coma.
  // En Render setear: CORS_ORIGIN=https://agenteia-alexandra-nu.vercel.app,http://localhost:3000
  CORS_ORIGIN: z.string().default('http://localhost:3000,http://localhost:3001'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),

  SUPABASE_URL: z.string().url('SUPABASE_URL debe ser una URL válida'),
  SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY es requerida'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY es requerida'),

  GOOGLE_PROJECT_ID: z.string().min(1, 'GOOGLE_PROJECT_ID es requerido'),
  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string().email('GOOGLE_SERVICE_ACCOUNT_EMAIL debe ser un email válido'),
  GOOGLE_PRIVATE_KEY: z.string().min(1, 'GOOGLE_PRIVATE_KEY es requerida'),
  GOOGLE_DRIVE_ROOT_FOLDER_ID: z.string().min(1, 'GOOGLE_DRIVE_ROOT_FOLDER_ID es requerido'),
  GOOGLE_TEMPLATE_SHEET_ID: z.string().optional(),
  GOOGLE_TEACHER_EMAIL: z.string().email('GOOGLE_TEACHER_EMAIL debe ser un email válido').optional(),

  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY es requerida'),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
});

const result = schema.safeParse(process.env);

if (!result.success) {
  console.error('[env] Variables de entorno faltantes o inválidas:');
  result.error.issues.forEach((issue) => {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`);
  });
  process.exit(1);
}

const raw = result.data;

export const env = {
  port: Number(raw.PORT),
  nodeEnv: raw.NODE_ENV,
  // Lista de orígenes permitidos (split por coma, trim de espacios)
  corsOrigins: raw.CORS_ORIGIN.split(',').map(o => o.trim()).filter(Boolean),
  frontendUrl: raw.FRONTEND_URL,

  supabase: {
    url: raw.SUPABASE_URL,
    anonKey: raw.SUPABASE_ANON_KEY,
    serviceRoleKey: raw.SUPABASE_SERVICE_ROLE_KEY,
  },

  google: {
    projectId: raw.GOOGLE_PROJECT_ID,
    serviceAccountEmail: raw.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    privateKey: raw.GOOGLE_PRIVATE_KEY
      .replace(/^["']|["']$/g, '')   // quita comillas envolventes si Render las incluye
      .replace(/\\n/g, '\n')          // \n literal → salto de línea real
      .trim(),
    driveRootFolderId: raw.GOOGLE_DRIVE_ROOT_FOLDER_ID,
    templateSheetId: raw.GOOGLE_TEMPLATE_SHEET_ID,
    teacherEmail: raw.GOOGLE_TEACHER_EMAIL,
  },

  gemini: {
    apiKey: raw.GEMINI_API_KEY,
    model: raw.GEMINI_MODEL,
  },
};
