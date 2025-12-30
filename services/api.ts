
import { BackendProcessResponse, HighlightClip } from "../types";

export const processUrl = async (baseUrl: string, url: string): Promise<BackendProcessResponse> => {
  const response = await fetch(`${baseUrl}/process_url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });
  if (!response.ok) throw new Error('Backend failed to process URL');
  return response.json();
};

export const processUpload = async (baseUrl: string, file: File): Promise<BackendProcessResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${baseUrl}/process_upload`, {
    method: 'POST',
    body: formData
  });
  if (!response.ok) throw new Error('Backend failed to process upload');
  return response.json();
};

export const checkJobStatus = async (baseUrl: string, jobId: string): Promise<BackendProcessResponse> => {
  const response = await fetch(`${baseUrl}/status/${jobId}`);
  if (!response.ok) throw new Error('Failed to fetch job status');
  return response.json();
};
