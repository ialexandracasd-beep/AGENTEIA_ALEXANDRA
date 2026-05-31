import * as dotenv from 'dotenv';
dotenv.config();

import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ColumnDef {
  name: string;   // Encabezado exacto en el Excel
  key: string;    // Nombre de columna en la DB (snake_case)
  type: string;
  description: string;
}

interface StudentsSchema {
  description: string;
  columns: ColumnDef[];
}

type StudentRow = Record<string, string | null>;

// ── Supabase standalone (no pasa por env.ts para no requerir credenciales Google) ──

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Error: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridas en backend/.env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Paths ─────────────────────────────────────────────────────────────────────

// backend/src/scripts → backend/src → backend → repo root → docs/students
const DOCS_DIR = path.resolve(__dirname, '..', '..', '..', 'docs', 'students');
const SCHEMA_PATH = path.join(DOCS_DIR, 'students-schema.json');
const BATCH_SIZE = 50;

// ── Helpers ───────────────────────────────────────────────────────────────────

function loadSchema(): StudentsSchema {
  if (!fs.existsSync(SCHEMA_PATH)) {
    throw new Error(`Esquema no encontrado en: ${SCHEMA_PATH}`);
  }
  return JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf-8')) as StudentsSchema;
}

function normalizeHeader(h: string): string {
  // Colapsa espacios múltiples y elimina espacios al inicio/final
  return h.replace(/\s+/g, ' ').trim().toUpperCase();
}

function readExcelRows(filePath: string, schema: StudentsSchema): StudentRow[] {
  const workbook = XLSX.readFile(filePath);
  const result: StudentRow[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    // header: 1 → array de arrays; defval: '' → celdas vacías como ''
    const rawRows = XLSX.utils.sheet_to_json<(string | number | undefined)[]>(
      sheet,
      { header: 1, defval: '' },
    );

    if (rawRows.length < 2) continue;

    // Primera fila = encabezados
    const headers = (rawRows[0] as unknown[]).map(h =>
      normalizeHeader(String(h ?? '')),
    );

    // Mapear índice de columna → clave DB
    const colMap = new Map<number, string>();
    for (const col of schema.columns) {
      const normalizedName = normalizeHeader(col.name);
      const idx = headers.indexOf(normalizedName);
      if (idx !== -1) colMap.set(idx, col.key);
    }

    if (colMap.size === 0) {
      console.log(`  ⚠  Hoja "${sheetName}": ningún encabezado coincidió con el esquema, saltando.`);
      continue;
    }

    let sheetCount = 0;
    for (let i = 1; i < rawRows.length; i++) {
      const raw = rawRows[i] as (string | number | undefined)[];
      const record: StudentRow = {};

      for (const [idx, dbCol] of colMap.entries()) {
        const val = raw[idx];
        const str = val != null ? String(val).trim() : '';
        record[dbCol] = str !== '' ? str : null;
      }

      // Filas sin los dos campos obligatorios se descartan
      if (!record['nombre'] || !record['correo_institucional']) continue;

      result.push(record);
      sheetCount++;
    }

    if (sheetCount > 0) {
      console.log(`    Hoja "${sheetName}": ${sheetCount} filas válidas`);
    }
  }

  return result;
}

async function upsertBatch(
  batch: StudentRow[],
): Promise<{ upserted: number; errorMsg?: string }> {
  const { data, error } = await supabase
    .from('students')
    .upsert(batch, { onConflict: 'correo_institucional' })
    .select('id');

  if (error) return { upserted: 0, errorMsg: error.message };
  return { upserted: (data ?? []).length };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('  AgenteIA Alexandra — Importar estudiantes');
  console.log('═══════════════════════════════════════════════\n');

  const schema = loadSchema();
  console.log(`Esquema: ${schema.columns.length} columnas mapeadas`);
  console.log(`Directorio: ${DOCS_DIR}\n`);

  const xlsxFiles = fs
    .readdirSync(DOCS_DIR)
    .filter(f => f.toLowerCase().endsWith('.xlsx'))
    .map(f => path.join(DOCS_DIR, f));

  if (xlsxFiles.length === 0) {
    console.log('No se encontraron archivos .xlsx en docs/students/');
    console.log('Coloca tu Excel en esa carpeta y vuelve a ejecutar npm run import:students');
    process.exit(0);
  }

  console.log(`Archivos encontrados: ${xlsxFiles.length}\n`);

  let totalRows = 0;
  let totalUpserted = 0;
  let totalErrors = 0;

  for (const filePath of xlsxFiles) {
    const filename = path.basename(filePath);
    console.log(`📄 ${filename}`);

    let rows: StudentRow[];
    try {
      rows = readExcelRows(filePath, schema);
    } catch (err) {
      console.error(`  ✗ No se pudo leer: ${(err as Error).message}`);
      continue;
    }

    if (rows.length === 0) {
      console.log('  Sin filas válidas (nombre + correo_institucional obligatorios)\n');
      continue;
    }

    console.log(`  Total válidos: ${rows.length}`);
    totalRows += rows.length;

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      const from = i + 1;
      const to = Math.min(i + BATCH_SIZE, rows.length);

      const { upserted, errorMsg } = await upsertBatch(batch);

      if (errorMsg) {
        console.error(`  ✗ Batch [${from}-${to}]: ${errorMsg}`);
        totalErrors += batch.length;
      } else {
        console.log(`  ✓ Batch [${from}-${to}]: ${upserted} upserted`);
        totalUpserted += upserted;
      }
    }
    console.log('');
  }

  console.log('───────────────────────────────────────────────');
  console.log(`  Filas leídas:      ${totalRows}`);
  console.log(`  Guardados en DB:   ${totalUpserted}`);
  console.log(`  Con error:         ${totalErrors}`);
  console.log('───────────────────────────────────────────────\n');

  if (totalErrors > 0) process.exit(1);
}

main().catch(err => {
  console.error('\nError fatal:', (err as Error).message);
  process.exit(1);
});
