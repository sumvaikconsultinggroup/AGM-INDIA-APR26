import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import Donation from '@/models/Donations';
import Donate from '@/models/Donate';
import { deliverDonationReceipt } from '@/lib/donations/receiptDelivery';

function buildReceiptNumber(paymentId?: string) {
  const date = new Date();
  const yyyymmdd = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('');
  const suffix = String(paymentId || '').slice(-6).toUpperCase();
  return `80G-${yyyymmdd}-${suffix || Date.now()}`;
}

function buildReceiptAccessToken() {
  return crypto.randomBytes(24).toString('hex');
}

type ResendRequest = {
  donationId?: string;
  paymentId?: string;
  orderId?: string;
  documentUrl?: string;
  languageCode?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ResendRequest;
    await connectDB();

    let donationQuery: Record<string, unknown> | null = null;

    if (body.donationId) {
      if (!isValidObjectId(body.donationId)) {
        return NextResponse.json(
          { success: false, message: 'Invalid donationId' },
          { status: 400 }
        );
      }
      donationQuery = { _id: body.donationId };
    } else if (body.paymentId) {
      donationQuery = { paymentId: body.paymentId };
    } else if (body.orderId) {
      donationQuery = { orderId: body.orderId };
    }

    if (!donationQuery) {
      return NextResponse.json(
        { success: false, message: 'Provide donationId, paymentId, or orderId' },
        { status: 400 }
      );
    }

    const donation = await (Donation as any).findOne(donationQuery);
    if (!donation) {
      return NextResponse.json(
        { success: false, message: 'Donation record not found' },
        { status: 404 }
      );
    }

    let updated = false;
    if (!donation.receiptNumber) {
      donation.receiptNumber = buildReceiptNumber(donation.paymentId || donation.orderId);
      updated = true;
    }
    if (!donation.receiptAccessToken) {
      donation.receiptAccessToken = buildReceiptAccessToken();
      updated = true;
    }
    if (!donation.receiptIssuedAt) {
      donation.receiptIssuedAt = new Date();
      updated = true;
    }
    if (updated) {
      await donation.save();
    }

    const campaign = donation.campaignId
      ? await (Donate as any).findById(donation.campaignId).select('title').lean()
      : null;

    const delivery = await deliverDonationReceipt({
      donation: {
        _id: donation._id?.toString?.() || donation._id,
        name: donation.name,
        email: donation.email,
        phone: donation.phone,
        amount: Number(donation.amount || 0) / 100,
        paymentId: donation.paymentId,
        orderId: donation.orderId,
        donatedAt: donation.donatedAt,
        panNumber: donation.panNumber,
        receiptNumber: donation.receiptNumber,
        receiptAccessToken: donation.receiptAccessToken,
      },
      campaignTitle: campaign?.title,
      requestOrigin: req.nextUrl.origin,
      documentUrlOverride: body.documentUrl,
      languageCode: body.languageCode || 'en',
      callbackData: 'donation_80g_receipt_resend',
    });

    const updateFields: Record<string, unknown> = {};
    if (delivery.emailResult?.success) {
      updateFields.receiptEmailSentAt = new Date();
    }
    if (delivery.whatsappResult?.success) {
      updateFields.receiptWhatsappSentAt = new Date();
    }
    if (Object.keys(updateFields).length > 0) {
      await (Donation as any).findByIdAndUpdate(donation._id, updateFields).catch(() => {});
    }

    const ok = Boolean(delivery.emailResult?.success || delivery.whatsappResult?.success);

    return NextResponse.json(
      {
        success: ok,
        message: ok
          ? 'Donation receipt resend processed'
          : 'Donation receipt resend did not complete successfully',
        data: {
          donationId: donation._id,
          receiptNumber: donation.receiptNumber,
          receiptAccessToken: donation.receiptAccessToken,
        },
        email: delivery.emailResult,
        whatsapp: delivery.whatsappResult,
      },
      {
        status: ok ? 200 : 500,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to resend donation receipt',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
