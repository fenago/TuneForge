import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getCurrentUser } from '@/libs/auth-middleware';
import User from '@/models/User';
import connectMongo from '@/libs/mongo';

// GET user profile
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Return user profile without sensitive data
    const profile = {
      id: user._id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      dashboardUrl: user.dashboardUrl,
      subscription: user.subscription,
      usage: user.usage,
      profile: user.profile,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      limits: {
        canCreateSongs: user.canCreateSongs(),
        remainingLimit: user.getRemainingLimit(),
      }
    };

    return NextResponse.json({
      success: true,
      user: profile
    });

  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Failed to get user profile' },
      { status: 500 }
    );
  }
}

// PUT update user profile
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, profile: profileData } = body;

    // Update allowed fields
    const updateData: any = {};
    
    if (name !== undefined) {
      updateData.name = name;
    }
    
    if (profileData) {
      if (profileData.bio !== undefined) {
        updateData['profile.bio'] = profileData.bio;
      }
      if (profileData.website !== undefined) {
        updateData['profile.website'] = profileData.website;
      }
      if (profileData.location !== undefined) {
        updateData['profile.location'] = profileData.location;
      }
      if (profileData.musicGenres !== undefined) {
        updateData['profile.musicGenres'] = profileData.musicGenres;
      }
      if (profileData.notifications !== undefined) {
        updateData['profile.notifications'] = profileData.notifications;
      }
      if (profileData.preferences !== undefined) {
        updateData['profile.preferences'] = profileData.preferences;
      }
    }

    await connectMongo;
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image,
        role: updatedUser.role,
        profile: updatedUser.profile,
        updatedAt: updatedUser.updatedAt,
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE user account (soft delete by deactivating)
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Don't allow admin users to delete their accounts
    if (user.role === 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin accounts cannot be deleted' },
        { status: 403 }
      );
    }

    await connectMongo;
    
    // Soft delete by updating status and removing sensitive data
    await User.findByIdAndUpdate(user._id, {
      $set: {
        'subscription.status': 'cancelled',
        'profile.notifications.email': false,
        'profile.notifications.marketing': false,
        'profile.notifications.updates': false,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Account deactivated successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { error: 'Failed to deactivate account' },
      { status: 500 }
    );
  }
}
