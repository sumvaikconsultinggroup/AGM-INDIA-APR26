import { NextRequest, NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import Donation from '@/models/Donations';
import Donate from '@/models/Donate';
import {
  buildDonationReceiptTemplatePayload,
  deliverDonationReceipt,
} from '@/lib/donations/receiptDelivery';

type TestReceiptRequest = {
  donationId?: string;
  phone?: string;
  donorName?: string;
  amount?: number | string;
  campaignTitle?: string;
  paymentId?: string;
  donationDate?: string;
  receiptNumber?: string;
  panNumber?: string;
  documentUrl?: string;
  languageCode?: string;
  dryRun?: boolean;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as TestReceiptRequest;
    const templateName =
      process.env.WHATSAPP_DONATION_RECEIPT_TEMPLATE || 'donation_80g_receipt_v1';

    let donationRecord: any = null;
    let campaignTitle = body.campaignTitle || 'General Donation';

    if (body.donationId) {
      if (!isValidObjectId(body.donationId)) {
        return NextResponse.json(
          { success: false, message: 'Invalid donationId' },
          { status: 400 }
        );
      }

      await connectDB();
      donationRecord = await (Donation as any).findById(body.donationId).lean();

      if (!donationRecord) {
        return NextResponse.json(
          { success: false, message: 'Donation not found' },
          { status: 404 }
        );
      }

      if (donationRecord.campaignId) {
        const campaign = await (Donate as any)
          .findById(donationRecord.campaignId)
          .select('title')
          .lean();
        if (campaign?.title) {
          campaignTitle = campaign.title;
        }
      }
    }

    const phone = body.phone || donationRecord?.phone;
    if (!phone) {
      return NextResponse.json(
        { success: false, message: 'Phone is required for WhatsApp test send' },
        { status: 400 }
      );
    }

    const receiptNumber =
      body.receiptNumber ||
      donationRecord?.receiptNumber ||
      `80G-TEST-${Date.now()}`;
    const donation = {
      name: body.donorName || donationRecord?.name || 'Donor',
      email: donationRecord?.email,
      phone,
      amount: Number(
        body.amount ?? (donationRecord ? Number(donationRecord.amount || 0) / 100 : 5100)
      ),
      paymentId: body.paymentId || donationRecord?.paymentId || donationRecord?.orderId || 'pay_TEST123',
      orderId: donationRecord?.orderId,
      donatedAt: body.donationDate || donationRecord?.donatedAt || new Date(),
      panNumber: body.panNumber || donationRecord?.panNumber || 'Not provided',
      receiptNumber,
      receiptAccessToken: donationRecord?.receiptAccessToken,
    };

    const templatePayload = buildDonationReceiptTemplatePayload({
      donation,
      campaignTitle,
      requestOrigin: req.nextUrl.origin,
      documentUrlOverride: body.documentUrl,
      languageCode: body.languageCode || 'en',
      callbackData: 'donation_80g_receipt_test',
    });

    if (!templatePayload.success) {
      return NextResponse.json(
        {
          success: false,
          message: templatePayload.error,
        },
        { status: 400 }
      );
    }

    if (body.dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        message: 'Donation receipt template payload prepared',
        data: templatePayload.payload,
      });
    }

    const delivery = await deliverDonationReceipt({
      donation,
      campaignTitle,
      requestOrigin: req.nextUrl.origin,
      documentUrlOverride: body.documentUrl,
      languageCode: body.languageCode || 'en',
      callbackData: 'donation_80g_receipt_test',
    });
    const result = delivery.whatsappResult;
    const status =
      result.success
        ? 200
        : 'status' in result && typeof result.status === 'number'
          ? result.status
          : 500;

    return NextResponse.json(
      {
        success: result.success,
        message: result.success
          ? 'Donation receipt template sent successfully'
          : 'Donation receipt template send failed',
        data: templatePayload.payload,
        email: delivery.emailResult,
        provider: result,
      },
      { status }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to send donation receipt test message',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
