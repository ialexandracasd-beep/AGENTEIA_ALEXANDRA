export interface Student {
  id: string;
  nombre: string;
  correo_institucional: string;
  nombre_mama: string | null;
  correo_mama: string | null;
  nombre_papa: string | null;
  correo_papa: string | null;
  drive_folder_id: string | null;
  sheet_id: string | null;
  sheet_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateStudentDto {
  nombre: string;
  correo_institucional: string;
  nombre_mama?: string | null;
  correo_mama?: string | null;
  nombre_papa?: string | null;
  correo_papa?: string | null;
}
