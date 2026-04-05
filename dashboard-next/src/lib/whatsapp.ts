type WhatsAppResult = {
  success: boolean;
  skipped?: boolean;
  status?: number;
  error?: string;
};

export async function sendWhatsAppMessage(to: string, message: string): Promise<WhatsAppResult> {
  const apiUrl = process.env.WHATSAPP_API_URL;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!apiUrl || !accessToken || !to || !message) {
    return { success: false, skipped: true, error: 'WhatsApp provider is not configured' };
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        to,
        message,
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        error: await response.text(),
      };
    }

    return { success: true, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown WhatsApp error',
    };
  }
}
