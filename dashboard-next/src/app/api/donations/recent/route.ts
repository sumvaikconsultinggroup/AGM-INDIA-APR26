import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Donation from '@/models/Donations';
import Donate from '@/models/Donate';

function maskName(name?: string, anonymous?: boolean) {
  if (anonymous) return 'Anonymous Devotee';
  const trimmed = (name || '').trim();
  if (!trimmed) return 'Devotee';
  const [firstWord] = trimmed.split(/\s+/);
  return firstWord;
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const limitParam = Number(req.nextUrl.searchParams.get('limit') || 8);
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 20) : 8;

    const donations = await (Donation as any)
      .find({
        paymentStatus: { $in: ['completed', 'captured', 'paid'] },
      })
      .sort({ donatedAt: -1 })
      .limit(limit)
      .select('name amount donatedAt campaignId isAnonymous donationType')
      .lean();

    const campaignIds = donations.map((item: any) => item.campaignId).filter(Boolean);
    const campaigns = campaignIds.length
      ? await (Donate as any).find({ _id: { $in: campaignIds } }, 'title').lean()
      : [];
    const campaignMap = new Map(campaigns.map((item: any) => [String(item._id), item.title]));

    return NextResponse.json({
      success: true,
      data: donations.map((item: any) => ({
        id: item._id?.toString?.() || String(item._id),
        donorName: maskName(item.name, item.isAnonymous),
        amount: Number(item.amount || 0) / 100,
        donatedAt: item.donatedAt,
        campaignTitle: item.campaignId
          ? campaignMap.get(String(item.campaignId)) || 'General Donation'
          : 'General Donation',
        donationType: item.donationType || 'one_time',
        isAnonymous: Boolean(item.isAnonymous),
      })),
    });
  } catch (error) {
    console.error('Failed to fetch recent donations:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch recent donations',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
