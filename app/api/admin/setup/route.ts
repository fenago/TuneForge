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

    const normalizedEmail = email.toLowerCase().trim();

    // First, let's see if the user exists
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // Create the user if they don't exist
      user = new User({
        name: 'TuneForge Admin',
        email: normalizedEmail,
        role: UserRoles.ADMIN,
        emailVerified: new Date(),
        adminData: {
          permissions: ['all'],
          lastAdminAction: new Date(),
          adminNotes: 'Created via admin setup',
        },
        usage: {
          songsCreated: 0,
          songsThisMonth: 0,
          lastResetDate: new Date(),
          creditsRemaining: 0,
          totalCredits: 0,
        },
        subscription: {
          status: 'active',
          plan: 'MAX',
        },
        profile: {
          notifications: {
            email: true,
            marketing: false,
            updates: true,
          },
          preferences: {
            theme: 'light',
            language: 'en',
          },
        },
      });

      await user.save();

      return NextResponse.json({
        success: true,
        message: 'Admin user created successfully',
        action: 'created',
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          name: user.name,
        }
      });
    } else {
      // Update existing user to admin
      user.role = UserRoles.ADMIN;
      user.adminData = {
        permissions: ['all'],
        lastAdminAction: new Date(),
        adminNotes: 'Updated to admin via setup',
      };
      user.subscription = {
        ...user.subscription,
        status: 'active',
        plan: 'MAX',
      };

      await user.save();

      return NextResponse.json({
        success: true,
        message: 'Existing user updated to admin successfully',
        action: 'updated',
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          name: user.name,
        }
      });
    }

  } catch (error) {
    console.error('Admin setup error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to setup admin user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check all users and find the right one
export async function GET(request: NextRequest) {
  try {
    await connectMongo;

    // Get all users to debug
    const allUsers = await User.find({}).select('email name role createdAt').limit(10);
    
    // Look for users with similar emails
    const searchEmail = 'learningscieanceai1@gmail.com';
    const exactMatch = await User.findOne({ email: searchEmail });
    
    // Also search for variations
    const variations = [
      'learningscieanceai1@gmail.com',
      'learningscienceai1@gmail.com', 
      'learningscience92@gmail.com'
    ];
    
    const possibleMatches = await User.find({ 
      email: { $in: variations } 
    }).select('email name role createdAt');

    return NextResponse.json({
      searchEmail,
      exactMatch: exactMatch ? {
        id: exactMatch._id,
        email: exactMatch.email,
        role: exactMatch.role,
        name: exactMatch.name,
      } : null,
      possibleMatches: possibleMatches.map(user => ({
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        createdAt: user.createdAt,
      })),
      allUsers: allUsers.map(user => ({
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        createdAt: user.createdAt,
      })),
      totalUsers: await User.countDocuments(),
    });

  } catch (error) {
    console.error('Admin check error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check admin status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
