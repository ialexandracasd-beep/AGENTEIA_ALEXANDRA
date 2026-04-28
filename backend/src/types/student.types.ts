export interface Student {
  id: string;
  name: string;
  email: string;
  driveFolder?: string;
  sheetId?: string;
  sheetUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudentDto {
  name: string;
  email: string;
}
