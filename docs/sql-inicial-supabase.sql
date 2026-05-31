-- ============================================================
-- AgenteIA Alexandra — SQL inicial para Supabase
-- Columnas de students alineadas con docs/students/estudiantes_base.xlsx
-- Ejecutar en: Supabase → SQL Editor (es idempotente)
-- ============================================================


-- ============================================================
-- MIGRACIÓN: añadir id_drive a una tabla ya existente
-- Ejecutar solo si la tabla ya existe sin esa columna.
-- Es idempotente gracias a IF NOT EXISTS.
-- ============================================================

ALTER TABLE students ADD COLUMN IF NOT EXISTS id_drive TEXT;


-- ============================================================
-- 1. STUDENTS  (fuente: estudiantes_base.xlsx)
-- Para instalaciones frescas; no afecta si la tabla ya existe.
-- ============================================================

CREATE TABLE IF NOT EXISTS students (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Columnas del Excel
  nombre                TEXT        NOT NULL,
  correo_institucional  TEXT        NOT NULL,
  nombre_mama           TEXT,
  correo_mama           TEXT,
  nombre_papa           TEXT,
  correo_papa           TEXT,
  id_drive              TEXT,

  -- Metadatos de integración Google (gestionados por el sistema)
  drive_folder_id       TEXT,
  sheet_id              TEXT,
  sheet_url             TEXT,

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Clave lógica: no puede haber dos estudiantes con el mismo correo
CREATE UNIQUE INDEX IF NOT EXISTS students_correo_institucional_idx
  ON students (correo_institucional);


-- ============================================================
-- 2. STUDENT SHEETS
-- ============================================================

CREATE TABLE IF NOT EXISTS student_sheets (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id       UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  spreadsheet_id   TEXT NOT NULL,
  spreadsheet_url  TEXT NOT NULL,
  folder_id        TEXT NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 3. SHEET SUBMISSIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS sheet_submissions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id       UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  entrega          TEXT NOT NULL,
  fecha            DATE NOT NULL DEFAULT CURRENT_DATE,
  titulo           TEXT NOT NULL,
  link_documento   TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 4. STRUCTURE REVIEWS
-- ============================================================

CREATE TABLE IF NOT EXISTS structure_reviews (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id         UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  submission_id      UUID REFERENCES sheet_submissions(id) ON DELETE SET NULL,
  has_title          BOOLEAN NOT NULL DEFAULT FALSE,
  has_abstract       BOOLEAN NOT NULL DEFAULT FALSE,
  has_introduction   BOOLEAN NOT NULL DEFAULT FALSE,
  has_objectives     BOOLEAN NOT NULL DEFAULT FALSE,
  has_methodology    BOOLEAN NOT NULL DEFAULT FALSE,
  has_conclusions    BOOLEAN NOT NULL DEFAULT FALSE,
  has_bibliography   BOOLEAN NOT NULL DEFAULT FALSE,
  missing_elements   TEXT[]  NOT NULL DEFAULT '{}',
  score              NUMERIC(5,2) NOT NULL DEFAULT 0,
  observations       TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 5. AI REVIEWS  (Gemini)
-- ============================================================

CREATE TABLE IF NOT EXISTS ai_reviews (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id             UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  submission_id          UUID REFERENCES sheet_submissions(id) ON DELETE SET NULL,
  review_type            TEXT NOT NULL
                           CHECK (review_type IN ('structural', 'methodological', 'full')),
  coherence_score        NUMERIC(4,2),
  objectives_aligned     BOOLEAN,
  methodology_justified  BOOLEAN,
  results_consistent     BOOLEAN,
  feedback               TEXT,
  suggestions            TEXT[],
  overall_score          NUMERIC(5,2),
  document_url           TEXT,
  raw_response           JSONB,
  status                 TEXT NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 6. FINAL RESULTS
-- ============================================================

CREATE TABLE IF NOT EXISTS final_results (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id            UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  submission_id         UUID NOT NULL REFERENCES sheet_submissions(id) ON DELETE CASCADE,
  structural_score      NUMERIC(5,2),
  methodological_score  NUMERIC(5,2),
  final_score           NUMERIC(5,2),
  estado_estructural    TEXT,
  estado_metodologico   TEXT,
  observaciones         TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- FUNCIÓN + TRIGGERS: updated_at automático
-- DROP TRIGGER IF EXISTS garantiza idempotencia al re-ejecutar
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS students_updated_at      ON students;
DROP TRIGGER IF EXISTS final_results_updated_at ON final_results;

CREATE TRIGGER students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER final_results_updated_at
  BEFORE UPDATE ON final_results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- ÍNDICES para consultas frecuentes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_student_sheets_student_id     ON student_sheets(student_id);
CREATE INDEX IF NOT EXISTS idx_sheet_submissions_student_id  ON sheet_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_structure_reviews_student_id  ON structure_reviews(student_id);
CREATE INDEX IF NOT EXISTS idx_ai_reviews_student_id         ON ai_reviews(student_id);
CREATE INDEX IF NOT EXISTS idx_ai_reviews_status             ON ai_reviews(status);
CREATE INDEX IF NOT EXISTS idx_final_results_student_id      ON final_results(student_id);
