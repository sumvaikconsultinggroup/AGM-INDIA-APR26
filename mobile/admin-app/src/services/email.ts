import api from './api';

interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail(payload: EmailPayload) {
  const response = await api.post('/sendemail', payload);
  return response.data;
}
