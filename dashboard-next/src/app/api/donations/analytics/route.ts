import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Donation from '@/models/Donations';
import Donate from '@/models/Donate';

function getDateRange(req: NextRequest) {
  const range = req.nextUrl.searchParams.get('range') || '7d';
  const startDateParam = req.nextUrl.searchParams.get('startDate');
  const endDateParam = req.nextUrl.searchParams.get('endDate');
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  end.setHours(23, 59, 59, 999);

  if (range === 'custom' && startDateParam && endDateParam) {
    const customStart = new Date(startDateParam);
    const customEnd = new Date(endDateParam);
    customStart.setHours(0, 0, 0, 0);
    customEnd.setHours(23, 59, 59, 999);
    return { range, start: customStart, end: customEnd };
  }

  if (range === 'today') {
    start.setHours(0, 0, 0, 0);
    return { range, start, end };
  }

  if (range === '30d') {
    start.setDate(start.getDate() - 29);
  } else {
    start.setDate(start.getDate() - 6);
  }

  start.setHours(0, 0, 0, 0);
  return { range, start, end };
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { range, start, end } = getDateRange(req);
    const match = {
      donatedAt: { $gte: start, $lte: end },
      paymentStatus: { $in: ['completed', 'captured', 'paid'] },
    };

    const [summaryResult, topDonorResult, campaignResult] = await Promise.all([
      Donation.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            totalAmountPaise: { $sum: '$amount' },
            donationsCount: { $sum: 1 },
            uniqueEmails: { $addToSet: '$email' },
            maxDonationPaise: { $max: '$amount' },
            subscriptionAmountPaise: {
              $sum: {
                $cond: [{ $eq: ['$donationType', 'subscription'] }, '$amount', 0],
              },
            },
            oneTimeAmountPaise: {
              $sum: {
                $cond: [{ $eq: ['$donationType', 'subscription'] }, 0, '$amount'],
              },
            },
          },
        },
      ]),
      Donation.aggregate([
        { $match: match },
        {
          $group: {
            _id: {
              email: { $ifNull: ['$email', 'unknown'] },
              phone: { $ifNull: ['$phone', ''] },
              name: { $ifNull: ['$name', 'Anonymous Donor'] },
            },
            totalAmountPaise: { $sum: '$amount' },
            donationCount: { $sum: 1 },
            lastDonationAt: { $max: '$donatedAt' },
          },
        },
        { $sort: { totalAmountPaise: -1, donationCount: -1 } },
        { $limit: 1 },
      ]),
      Donation.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$campaignId',
            totalAmountPaise: { $sum: '$amount' },
            donationsCount: { $sum: 1 },
          },
        },
        { $sort: { totalAmountPaise: -1 } },
      ]),
    ]);

    const summary = summaryResult[0] || {
      totalAmountPaise: 0,
      donationsCount: 0,
      uniqueEmails: [],
      maxDonationPaise: 0,
      subscriptionAmountPaise: 0,
      oneTimeAmountPaise: 0,
    };

    const uniqueDonorCount = (summary.uniqueEmails || []).filter(Boolean).length;
    const repeatDonorCount = await Donation.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $ifNull: ['$email', '$phone'] },
          donationCount: { $sum: 1 },
        },
      },
      { $match: { donationCount: { $gt: 1 }, _id: { $ne: null } } },
      { $count: 'count' },
    ]);

    const campaignModel = Donate as any;
    const campaigns = await campaignModel.find(
      { _id: { $in: campaignResult.map((item: any) => item._id).filter(Boolean) } },
      'title'
    ).lean();
    const campaignTitleMap = new Map(
      campaigns.map((campaign: any) => [String(campaign._id), campaign.title])
    );

    return NextResponse.json({
      success: true,
      message: 'Donation analytics fetched successfully',
      data: {
        range,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        totals: {
          totalAmount: summary.totalAmountPaise / 100,
          donationsCount: summary.donationsCount,
          uniqueDonors: uniqueDonorCount,
          repeatDonors: repeatDonorCount[0]?.count || 0,
          averageDonation: summary.donationsCount
            ? summary.totalAmountPaise / summary.donationsCount / 100
            : 0,
          maxDonation: summary.maxDonationPaise / 100,
          oneTimeAmount: summary.oneTimeAmountPaise / 100,
          subscriptionAmount: summary.subscriptionAmountPaise / 100,
        },
        topDonor: topDonorResult[0]
          ? {
              name: topDonorResult[0]._id.name,
              email: topDonorResult[0]._id.email,
              phone: topDonorResult[0]._id.phone,
              totalAmount: topDonorResult[0].totalAmountPaise / 100,
              donationCount: topDonorResult[0].donationCount,
              lastDonationAt: topDonorResult[0].lastDonationAt,
            }
          : null,
        campaigns: campaignResult.map((campaign: any) => ({
          campaignId: campaign._id || null,
          campaignTitle: campaignTitleMap.get(String(campaign._id)) || 'General Donation',
          totalAmount: campaign.totalAmountPaise / 100,
          donationsCount: campaign.donationsCount,
        })),
      },
    });
  } catch (error) {
    console.error('Donation analytics error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch donation analytics',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
