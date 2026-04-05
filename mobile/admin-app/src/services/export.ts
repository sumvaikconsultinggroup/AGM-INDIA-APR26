import api from './api';
import { File, Paths } from 'expo-file-system';

export async function exportDonationRecords() {
  try {
    const response = await api.get('/donationsRecord');
    const records = response.data?.data || response.data || [];
    
    // Create CSV content
    const headers = 'ID,Amount,Date,Payment Method,Campaign\n';
    const rows = records.map((r: any) => 
      `${r._id},${r.amount || 0},${r.date || ''},${r.paymentMethod || ''},${r.campaignId || ''}`
    ).join('\n');
    
    const csv = headers + rows;
    const file = new File(Paths.document, 'donations_export.csv');
    
    // Create file if it doesn't exist, write content
    if (!file.exists) {
      file.create();
    }
    file.write(csv);
    
    // Return file URI so caller can decide how to handle/share.
    return file.uri;
  } catch (error) {
    throw new Error('Failed to export donation records');
  }
}
