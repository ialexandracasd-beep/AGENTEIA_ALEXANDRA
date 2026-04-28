import { google } from 'googleapis';
import { env } from './env';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: env.google.serviceAccountEmail,
    private_key: env.google.privateKey,
    project_id: env.google.projectId,
  },
  scopes: [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/spreadsheets',
  ],
});

export const drive = google.drive({ version: 'v3', auth });
export const sheets = google.sheets({ version: 'v4', auth });
