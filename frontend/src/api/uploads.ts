import client from './client';

export interface UploadResult {
  id: string;
  filename: string;
  url: string;
  mime_type: string;
  created_at: string;
}

export async function uploadFile(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await client.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
