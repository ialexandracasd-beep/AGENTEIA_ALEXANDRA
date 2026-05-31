# docs/students — Base de estudiantes

## estudiantes_base.xlsx

Coloca aquí manualmente el archivo Excel exportado desde tu máquina con la base de estudiantes.

Este archivo es la **fuente principal** de datos de estudiantes para el sistema.
Debe mantener siempre las mismas columnas para no romper la integración con el backend.

> No subas este archivo al repositorio si contiene datos reales de estudiantes.
> Añádelo a `.gitignore` cuando la integración esté activa.

## students-schema.json

Define los nombres y tipos de columnas esperados en `estudiantes_base.xlsx`.
Se completará cuando se establezca el formato definitivo del Excel.

## students-seed.json

Array de registros de ejemplo o semilla para inicializar la tabla de Supabase en entornos de prueba.
Se completa cuando se decida usar carga inicial desde código.
