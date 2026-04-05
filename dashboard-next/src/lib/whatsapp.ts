type WhatsAppResult = {
  success: boolean;
  skipped?: boolean;
  status?: number;
  error?: string;
  data?: unknown;
};

type TemplatePayload = {
  to: string;
  templateName: string;
  languageCode?: string;
  bodyValues?: string[];
  headerValues?: string[];
  buttonValues?: Record<string, string[]>;
  fileName?: string;
  callbackData?: string;
};

function getNormalizedPhone(to: string) {
  const digits = String(to || '').replace(/\D/g, '');
  if (!digits) return null;
  if (digits.startsWith('91') && digits.length >= 12) return digits;
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

export async function sendWhatsAppMessage(to: string, message: string): Promise<WhatsAppResult> {
  const apiUrl =
    process.env.WHATSAPP_API_URL ||
    'https://api.whatsappbiz.com/v1/public/message/';
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const apiKey = process.env.WHATSAPP_API_KEY;
  const normalizedPhone = getNormalizedPhone(to);

  if (!apiUrl || !normalizedPhone || !message) {
    return { success: false, skipped: true, error: 'WhatsApp provider is not configured' };
  }

  try {
    const isVaibiStyleApi = Boolean(apiKey) || apiUrl.includes('whatsappbiz.com');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    let body: Record<string, unknown>;

    if (isVaibiStyleApi) {
      headers.Authorization = `Basic ${apiKey || accessToken || ''}`;
      body = {
        fullPhoneNumber: normalizedPhone,
        callbackData: 'agm_platform_notification',
        type: 'Text',
        data: {
          message,
        },
      };
    } else {
      if (!accessToken) {
        return { success: false, skipped: true, error: 'WhatsApp provider token is missing' };
      }
      headers.Authorization = `Bearer ${accessToken}`;
      body = {
        to: normalizedPhone,
        message,
      };
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const responseText = await response.text();

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        error: responseText,
      };
    }

    let parsed: unknown = responseText;
    try {
      parsed = responseText ? JSON.parse(responseText) : null;
    } catch {}

    return { success: true, status: response.status, data: parsed };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown WhatsApp error',
    };
  }
}

export async function sendWhatsAppTemplateMessage({
  to,
  templateName,
  languageCode = 'en',
  bodyValues = [],
  headerValues = [],
  buttonValues,
  fileName,
  callbackData = 'agm_platform_template',
}: TemplatePayload): Promise<WhatsAppResult> {
  const apiUrl =
    process.env.WHATSAPP_API_URL ||
    'https://api.whatsappbiz.com/v1/public/message/';
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const apiKey = process.env.WHATSAPP_API_KEY;
  const normalizedPhone = getNormalizedPhone(to);

  if (!apiUrl || !normalizedPhone || !templateName) {
    return { success: false, skipped: true, error: 'WhatsApp template provider is not configured' };
  }

  try {
    const isVaibiStyleApi = Boolean(apiKey) || apiUrl.includes('whatsappbiz.com');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (isVaibiStyleApi) {
      headers.Authorization = `Basic ${apiKey || accessToken || ''}`;
    } else if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    } else {
      return { success: false, skipped: true, error: 'WhatsApp provider token is missing' };
    }

    const templateBody: Record<string, unknown> = {
      name: templateName,
      languageCode,
    };

    if (headerValues.length > 0) {
      templateBody.headerValues = headerValues;
    }
    if (fileName) {
      templateBody.fileName = fileName;
    }
    if (bodyValues.length > 0) {
      templateBody.bodyValues = bodyValues;
    }
    if (buttonValues && Object.keys(buttonValues).length > 0) {
      templateBody.buttonValues = buttonValues;
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        fullPhoneNumber: normalizedPhone,
        callbackData,
        type: 'Template',
        template: templateBody,
      }),
    });

    const responseText = await response.text();
    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        error: responseText,
      };
    }

    let parsed: unknown = responseText;
    try {
      parsed = responseText ? JSON.parse(responseText) : null;
    } catch {}

    return { success: true, status: response.status, data: parsed };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown WhatsApp template error',
    };
  }
}
