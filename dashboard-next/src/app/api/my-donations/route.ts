import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import Donation from '@/models/Donations';
import Donate from '@/models/Donate';
import User from '@/models/User';

type LocalizedText = Record<string, string | undefined>;

function formatAmount(amountPaise: number) {
  return amountPaise / 100;
}

function resolveLocalizedText(language: string | null, localized?: LocalizedText | null, fallback?: string | null) {
  const code = (language || 'en').split('-')[0];
  return (
    localized?.[code] ||
    localized?.en ||
    localized?.hi ||
    fallback ||
    ''
  );
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const requestedLanguage = req.nextUrl.searchParams.get('lang');

    const authHeader = req.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length).trim()
      : undefined;
    const token =
      bearerToken ||
      req.cookies.get('auth_token')?.value ||
      req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string, {
      algorithms: ['HS256'],
    }) as { userId?: string; email?: string };

    if (!decoded?.userId) {
      return NextResponse.json(
        { success: false, message: 'Invalid token payload' },
        { status: 401 }
      );
    }

    const user = await User.findById(decoded.userId)
      .select('email username name profile.fullName')
      .lean();

    const email = (user?.email || decoded.email || '').toLowerCase().trim();
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'User email is unavailable' },
        { status: 400 }
      );
    }

    const donations = await (Donation as any)
      .find({
        email,
        paymentStatus: { $in: ['completed', 'captured', 'paid'] },
      })
      .sort({ donatedAt: -1 })
      .lean();

    const campaignIds = donations
      .map((item: any) => item.campaignId)
      .filter(Boolean);

    const campaigns = campaignIds.length
      ? await (Donate as any)
          .find(
            { _id: { $in: campaignIds } },
            'title titleTranslations backgroundImage'
          )
          .lean()
      : [];
    const campaignMap = new Map<string, any>(
      campaigns.map((item: any) => [String(item._id), item])
    );

    const totalAmountPaise = donations.reduce(
      (sum: number, item: any) => sum + Number(item.amount || 0),
      0
    );
    const subscriptionCount = donations.filter(
      (item: any) => item.donationType === 'subscription'
    ).length;

    return NextResponse.json({
      success: true,
      data: {
        totals: {
          donationsCount: donations.length,
          totalAmount: formatAmount(totalAmountPaise),
          subscriptionCount,
        },
        donations: donations.map((item: any) => {
          const campaign = item.campaignId ? campaignMap.get(String(item.campaignId)) : null;
          return {
            id: item._id?.toString?.() || String(item._id),
            amount: formatAmount(Number(item.amount || 0)),
            currency: item.currency || 'INR',
            donatedAt: item.donatedAt,
            paymentStatus: item.paymentStatus,
            paymentMethod: item.paymentMethod || null,
            donationType: item.donationType || 'one_time',
            campaignTitle:
              resolveLocalizedText(requestedLanguage, campaign?.titleTranslations, campaign?.title) ||
              'General Donation',
            campaignImage: campaign?.backgroundImage || null,
            receiptNumber: item.receiptNumber || null,
            hasReceipt: Boolean(item.receiptNumber),
            receiptUrl: item.receiptAccessToken
              ? `${req.nextUrl.origin}/api/donation-receipt/${item.receiptAccessToken}`
              : null,
            taxBenefitOptIn: Boolean(item.taxBenefitOptIn),
            panNumber: item.panNumber || null,
            isAnonymous: Boolean(item.isAnonymous),
            dedicationType: item.dedicationType || 'general',
            dedicatedTo: item.dedicatedTo || null,
            dedicationMessage: item.dedicationMessage || null,
          };
        }),
      },
    });
  } catch (error) {
    console.error('Failed to fetch donor history:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch donation history',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
