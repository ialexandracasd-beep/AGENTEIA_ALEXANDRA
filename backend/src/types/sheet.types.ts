export interface StudentSheet {
  studentId: string;
  spreadsheetId: string;
  spreadsheetUrl: string;
  folderId: string;
  createdAt: string;
}

export interface SheetEntry {
  entrega: string;
  fecha: string;
  titulo: string;
  linkDocumento: string;
  estadoEstructural: string;
  estadoMetodologico: string;
  puntaje: number;
  observaciones: string;
}
