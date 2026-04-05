type DonationReceiptDetails = {
  donorName: string;
  amountInInr: number;
  campaignTitle: string;
  transactionId: string;
  receiptNumber: string;
  donationDate: Date;
  panNumber?: string;
};

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;

function escapePdfText(value: string) {
  return String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function formatAmount(amountInInr: number) {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountInInr || 0);
}

function formatDonationDate(value: Date) {
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function pdfText(text: string, x: number, y: number, font = 'F1', size = 12, color = '0 0 0') {
  return [`BT`, `${color} rg`, `/${font} ${size} Tf`, `1 0 0 1 ${x} ${y} Tm`, `(${escapePdfText(text)}) Tj`, `ET`].join('\n');
}

function pdfWrappedText(
  text: string,
  x: number,
  y: number,
  width = 470,
  font = 'F1',
  size = 12,
  color = '0 0 0',
  lineHeight = 16
) {
  const words = String(text || '').split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';
  const approxCharsPerLine = Math.max(24, Math.floor(width / (size * 0.55)));

  words.forEach((word) => {
    const next = currentLine ? `${currentLine} ${word}` : word;
    if (next.length > approxCharsPerLine) {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = next;
    }
  });

  if (currentLine) lines.push(currentLine);

  return lines
    .map((line, index) => pdfText(line, x, y - index * lineHeight, font, size, color))
    .join('\n');
}

function rect(x: number, y: number, width: number, height: number, fillRgb: string) {
  return [`q`, `${fillRgb} rg`, `${x} ${y} ${width} ${height} re`, `f`, `Q`].join('\n');
}

function line(x1: number, y1: number, x2: number, y2: number, strokeRgb: string, width = 1) {
  return [`q`, `${strokeRgb} RG`, `${width} w`, `${x1} ${y1} m`, `${x2} ${y2} l`, `S`, `Q`].join('\n');
}

function buildPdfBuffer(contentStream: string) {
  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    `3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R /F3 7 0 R >> >> >> endobj`,
    `4 0 obj << /Length ${Buffer.byteLength(contentStream, 'utf8')} >> stream\n${contentStream}\nendstream endobj`,
    '5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
    '6 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj',
    '7 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique >> endobj',
  ];

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];

  objects.forEach((object) => {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += `${object}\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';

  for (let index = 1; index <= objects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf, 'utf8');
}

export function generateDonationReceiptPdf(details: DonationReceiptDetails) {
  const amountText = `Rs. ${formatAmount(details.amountInInr)}`;
  const donationDate = formatDonationDate(details.donationDate);
  const donorName = details.donorName || 'Donor';
  const purpose = details.campaignTitle || 'General Donation';
  const transactionId = details.transactionId || 'N/A';
  const receiptNumber = details.receiptNumber || 'Receipt Pending';
  const panNumber = details.panNumber || 'Not provided';

  const contentParts = [
    rect(0, 806, PAGE_WIDTH, 18, '0.89 0.49 0.10'),
    rect(0, 786, PAGE_WIDTH, 12, '0.43 0.05 0.10'),
    pdfText('AvdheshanandG Mission', 48, 748, 'F2', 24, '0.43 0.05 0.10'),
    pdfText('Donation Receipt / 80G Acknowledgement', 48, 722, 'F2', 14, '0.55 0.43 0.14'),
    pdfWrappedText(
      'This is to acknowledge with thanks the donation received by AvdheshanandG Mission.',
      48,
      698,
      500,
      'F1',
      11,
      '0.25 0.25 0.25',
      15
    ),

    rect(42, 620, 511, 78, '0.99 0.97 0.93'),
    line(42, 620, 553, 620, '0.88 0.74 0.44', 1),
    pdfText(`Receipt Number: ${receiptNumber}`, 58, 670, 'F2', 12, '0.43 0.05 0.10'),
    pdfText(`Receipt Date: ${donationDate}`, 58, 648, 'F1', 12, '0.20 0.20 0.20'),
    pdfText(`Transaction Reference: ${transactionId}`, 58, 626, 'F1', 12, '0.20 0.20 0.20'),

    pdfText('Donor Details', 48, 586, 'F2', 13, '0.43 0.05 0.10'),
    line(48, 580, 300, 580, '0.88 0.74 0.44', 1),
    pdfText(`Name: ${donorName}`, 58, 552, 'F1', 12, '0.10 0.10 0.10'),
    pdfText(`PAN: ${panNumber}`, 58, 530, 'F1', 12, '0.10 0.10 0.10'),

    pdfText('Donation Details', 320, 586, 'F2', 13, '0.43 0.05 0.10'),
    line(320, 580, 548, 580, '0.88 0.74 0.44', 1),
    pdfText(`Amount: ${amountText}`, 330, 552, 'F1', 12, '0.10 0.10 0.10'),
    pdfWrappedText(`Purpose: ${purpose}`, 330, 530, 210, 'F1', 12, '0.10 0.10 0.10', 16),

    rect(42, 420, 511, 88, '0.99 0.98 0.96'),
    pdfWrappedText(
      `This is to acknowledge with thanks the donation of ${amountText} received from ${donorName} towards ${purpose}.`,
      58,
      480,
      470,
      'F1',
      12,
      '0.15 0.15 0.15',
      18
    ),
    pdfWrappedText(
      'This receipt is generated electronically for donor reference and mission records.',
      58,
      444,
      470,
      'F3',
      11,
      '0.32 0.32 0.32',
      15
    ),

    pdfText('For AvdheshanandG Mission', 48, 350, 'F2', 12, '0.43 0.05 0.10'),
    pdfText('Authorized Signatory', 48, 330, 'F1', 11, '0.20 0.20 0.20'),
    line(48, 318, 180, 318, '0.40 0.40 0.40', 0.8),

    line(42, 110, 553, 110, '0.88 0.74 0.44', 1),
    pdfWrappedText(
      'With regards, AvdheshanandG Mission Team',
      48,
      88,
      500,
      'F1',
      10,
      '0.20 0.20 0.20',
      14
    ),
  ];

  return buildPdfBuffer(contentParts.join('\n'));
}
