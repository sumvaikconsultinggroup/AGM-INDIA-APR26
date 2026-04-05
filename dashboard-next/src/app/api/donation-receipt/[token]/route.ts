import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Donation from '@/models/Donations';
import Donate from '@/models/Donate';
import { generateDonationReceiptPdf } from '@/lib/donations/receiptPdf';

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    await connectDB();
    const { token } = await params;

    const donation = await (Donation as any)
      .findOne({ receiptAccessToken: token })
      .lean();

    if (!donation) {
      return NextResponse.json(
        { success: false, message: 'Receipt not found' },
        { status: 404 }
      );
    }

    const campaign = donation.campaignId
      ? await (Donate as any).findById(donation.campaignId).select('title').lean()
      : null;

    const pdfBuffer = generateDonationReceiptPdf({
      donorName: donation.name || 'Donor',
      amountInInr: Number(donation.amount || 0) / 100,
      campaignTitle: campaign?.title || 'General Donation',
      transactionId: donation.paymentId || donation.orderId || 'N/A',
      receiptNumber: donation.receiptNumber || 'Receipt Pending',
      donationDate: donation.donatedAt || new Date(),
      panNumber: donation.panNumber,
    });

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="Donation-Receipt-${donation.receiptNumber || 'receipt'}.pdf"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error) {
    console.error('Receipt generation failed:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to generate donation receipt',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
