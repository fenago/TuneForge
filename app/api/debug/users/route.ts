import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/libs/mongo';
import User, { UserRoles } from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectMongo;

    // Get ALL users with full details
    const allUsers = await User.find({}).select('email name role subscription usage createdAt updatedAt');
    
    // Find the specific user we're looking for
    const targetUser = await User.findOne({ email: 'learningscienceai1@gmail.com' });
    
    return NextResponse.json({
      success: true,
      totalUsers: await User.countDocuments(),
      allUsers: allUsers.map(user => ({
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        subscription: user.subscription,
        usage: user.usage,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
      targetUser: targetUser ? {
        id: targetUser._id.toString(),
        email: targetUser.email,
        name: targetUser.name,
        role: targetUser.role,
        subscription: targetUser.subscription,
        usage: targetUser.usage,
        createdAt: targetUser.createdAt,
        updatedAt: targetUser.updatedAt,
      } : null,
    });

  } catch (error) {
    console.error('Debug users error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to get users',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST to force update the user role
export async function POST(request: NextRequest) {
  try {
    await connectMongo;

    const user = await User.findOne({ email: 'learningscienceai1@gmail.com' });
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found with email learningscienceai1@gmail.com'
      }, { status: 404 });
    }

    // Force update the role
    user.role = UserRoles.ADMIN;
    user.subscription = {
      ...user.subscription,
      status: 'active',
      plan: 'MAX',
    };
    user.adminData = {
      permissions: ['all'],
      lastAdminAction: new Date(),
      adminNotes: 'Force updated to admin via debug endpoint',
    };

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'User role force updated to ADMIN',
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        subscription: user.subscription,
        adminData: user.adminData,
      }
    });

  } catch (error) {
    console.error('Force update error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to force update user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
