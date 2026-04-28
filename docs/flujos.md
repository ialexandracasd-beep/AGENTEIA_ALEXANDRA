# Flujos del Sistema AgenteIA Alexandra

---

## 1. Crear Estudiante

**Trigger:** La profesora registra un nuevo estudiante desde el panel.

```
[Panel] → POST /api/students
  → Validar campos (nombre, email) con Zod
  → createStudent en Supabase
  → createStudentFolder en Google Drive (subcarpeta del folder raíz)
  → createStudentSheet en Google Sheets (dentro de la carpeta)
  → grantPermission (Drive: writer | Sheet: reader) al email del estudiante
  → updateStudentSheet en Supabase con folderId y sheetId
  → Retornar estudiante completo
```

**Resultado:** El estudiante tiene carpeta en Drive, sheet de seguimiento, y acceso configurado.

---

## 2. Crear Sheet Individual

**Trigger:** Parte del flujo de creación de estudiante (automático) o manualmente.

```
  → sheets.spreadsheets.create con nombre "Seguimiento - [Nombre]"
  → Crear hoja "Entregas" con columnas:
     Entrega | Fecha | Título | Link | Estado Estructural | Estado Metodológico | Puntaje | Observaciones
  → Mover hoja a carpeta del estudiante en Drive
  → Guardar spreadsheetId en Supabase
```

---

## 3. Asignar Permisos

**Trigger:** Automático al crear estudiante.

```
  → drive.permissions.create (folderId, email, role: 'writer')
  → drive.permissions.create (sheetId, email, role: 'reader')
```

El estudiante puede subir documentos a su carpeta pero solo leer su hoja de seguimiento.

---

## 4. Sincronizar con Supabase

**Trigger:** Después de crear o actualizar recursos en Google.

```
  → Guardar { id, name, email, driveFolder, sheetId } en tabla students
  → Guardar { id, studentId, reviewType, structural, methodological, status } en tabla reviews
```

Supabase es la fuente de verdad del estado del sistema.

---

## 5. Validar Estructura del Documento

**Trigger:** Al recibir un documento para revisión, antes de llamar a Gemini.

```
  → Verificar longitud mínima del texto (≥ 500 palabras)
  → Verificar presencia de sección de bibliografía
  → Si falla validación básica → retornar error sin gastar tokens de Gemini
```

---

## 6. Revisar con IA (Gemini 2.5 Flash)

**Trigger:** POST /api/reviews con el texto del documento.

```
  Revisión Estructural:
    → buildStructuralPrompt(documentText)
    → geminiModel.generateContent(prompt)
    → Parsear JSON de respuesta
    → Validar con Zod (structuralResultSchema)

  Revisión Metodológica:
    → buildMethodologicalPrompt(documentText)
    → geminiModel.generateContent(prompt)
    → Parsear JSON de respuesta
    → Validar con Zod (methodologicalResultSchema)
```

---

## 7. Consolidar Resultado

**Trigger:** Al finalizar la revisión con IA.

```
  → saveReviewResult en Supabase (guarda structural + methodological)
  → appendReviewRow en Google Sheet del estudiante:
     Fila: entrega | fecha | título | url | puntaje estructural | puntaje metodológico | puntaje final | observaciones
  → Retornar review completo al panel
```

**Resultado:** La profesora ve el resultado en el panel. El estudiante puede ver su sheet actualizado.
