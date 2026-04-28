import { sheets } from '../../config/google';
import { logger } from '../../utils/logger';
import { SheetEntry } from '../../types/sheet.types';

const HEADERS = [
  'Entrega', 'Fecha', 'Título', 'Link Documento',
  'Estado Estructural', 'Estado Metodológico', 'Puntaje', 'Observaciones',
];

export async function createStudentSheet(studentName: string, folderId: string): Promise<string> {
  const response = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title: `Seguimiento - ${studentName}` },
      sheets: [
        {
          properties: { title: 'Entregas' },
          data: [{ rowData: [{ values: HEADERS.map(h => ({ userEnteredValue: { stringValue: h } })) }] }],
        },
      ],
    },
    fields: 'spreadsheetId',
  });

  const spreadsheetId = response.data.spreadsheetId!;
  logger.info(`Sheet created for ${studentName}: ${spreadsheetId}`);
  return spreadsheetId;
}

export async function appendReviewRow(spreadsheetId: string, entry: SheetEntry) {
  const values = [
    entry.entrega, entry.fecha, entry.titulo, entry.linkDocumento,
    entry.estadoEstructural, entry.estadoMetodologico,
    entry.puntaje.toString(), entry.observaciones,
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Entregas!A:H',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [values] },
  });
}

export async function getSheetData(spreadsheetId: string) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Entregas!A:H',
  });
  return response.data.values || [];
}
