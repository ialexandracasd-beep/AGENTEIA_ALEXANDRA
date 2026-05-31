export interface DriveAuditFileInfo {
  id: string;
  name: string;
  webViewLink?: string;
}

export interface DriveAuditFileWithMime extends DriveAuditFileInfo {
  mimeType: string;
}

export interface DriveAuditChecks {
  hasAnyFile: boolean;
  hasSpreadsheet: boolean;
  hasPdf: boolean;
}

export type DriveAuditStatus = 'approved' | 'findings' | 'empty';

export interface DriveAuditResult {
  folderId: string;
  fileCount: number;
  spreadsheets: DriveAuditFileInfo[];
  pdfs: DriveAuditFileInfo[];
  otherFiles: DriveAuditFileWithMime[];
  checks: DriveAuditChecks;
  status: DriveAuditStatus;
  runAt: string;
}
