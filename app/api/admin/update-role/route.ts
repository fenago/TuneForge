import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/libs/mongo';
import User, { UserRoles } from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectMongo;

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find and update the user
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update to admin role
    user.role = UserRoles.ADMIN;
    user.adminData = {
      permissions: ['all'],
      lastAdminAction: new Date(),
      adminNotes: 'Updated to admin role via API',
    };
    user.subscription = {
      ...user.subscription,
      status: 'active',
      plan: 'MAX',
    };

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'User role updated to ADMIN successfully',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
      }
    });

  } catch (error) {
    console.error('Update role error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update user role',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
