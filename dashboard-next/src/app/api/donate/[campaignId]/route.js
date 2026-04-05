import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Donate from '@/models/Donate';
import mongoose from 'mongoose';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { campaignId } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid campaign ID format',
        },
        {
          status: 400,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            Pragma: 'no-cache',
            Expires: '0',
          },
        }
      );
    }

    // Find the campaign by ID
    const campaign = await Donate.findOne({
      _id: campaignId,
      isDeleted: false,
      isActive: true,
    }).lean();

    if (!campaign) {
      return NextResponse.json(
        {
          success: false,
          message: 'Campaign not found',
        },
        {
          status: 404,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            Pragma: 'no-cache',
            Expires: '0',
          },
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Campaign fetched successfully',
        data: campaign,
      },
      {
        status: 200,
        headers: {
          // Short cache time for campaign details since they can change frequently
          'Cache-Control': 'public, max-age=30, stale-while-revalidate=30',
          Vary: 'Accept-Encoding, Cookie',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching donation campaign:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch donation campaign',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { campaignId } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid campaign ID format' },
        { status: 400 }
      );
    }

    // Get update data
    const body = await req.json();
    const {
      title,
      description,
      additionalText,
      goal,
      achieved,
      donors,
      totalDays,
      isActive,
      backgroundImage,
    } = body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (additionalText !== undefined) updateData.additionalText = additionalText;
    if (goal !== undefined) updateData.goal = goal;
    if (achieved !== undefined) updateData.achieved = achieved;
    if (donors !== undefined) updateData.donors = donors;
    if (totalDays !== undefined) updateData.totalDays = totalDays;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (backgroundImage !== undefined) updateData.backgroundImage = backgroundImage;

    // Update the campaign
    const updatedCampaign = await Donate.findOneAndUpdate(
      { _id: campaignId, isDeleted: false },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedCampaign) {
      return NextResponse.json({ success: false, message: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Campaign updated successfully',
        data: updatedCampaign,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating donation campaign:', error);

    // Handle validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error',
          error: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update donation campaign',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { campaignId } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid campaign ID format' },
        { status: 400 }
      );
    }

    // Soft delete by setting isDeleted to true
    const deletedCampaign = await Donate.findOneAndUpdate(
      { _id: campaignId, isDeleted: false },
      { isDeleted: true, isActive: false },
      { new: true }
    );

    if (!deletedCampaign) {
      return NextResponse.json(
        { success: false, message: 'Campaign not found or already deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Campaign deleted successfully',
        data: deletedCampaign,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting donation campaign:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete donation campaign',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
