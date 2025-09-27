import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/libs/mongo';
import User, { UserRoles } from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectMongo;

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ 
      email: 'learningscieanceai1@gmail.com' 
    });

    if (existingAdmin) {
      // Update existing user to admin if not already
      if (existingAdmin.role !== UserRoles.ADMIN) {
        existingAdmin.role = UserRoles.ADMIN;
        existingAdmin.adminData = {
          permissions: ['all'],
          lastAdminAction: new Date(),
          adminNotes: 'Updated to admin role via init endpoint',
        };
        await existingAdmin.save();

        return NextResponse.json({
          success: true,
          message: 'Existing user updated to admin role',
          user: {
            id: existingAdmin._id,
            email: existingAdmin.email,
            role: existingAdmin.role,
            name: existingAdmin.name,
          }
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Admin user already exists',
        user: {
          id: existingAdmin._id,
          email: existingAdmin.email,
          role: existingAdmin.role,
          name: existingAdmin.name,
        }
      });
    }

    // Create new admin user
    const adminUser = new User({
      name: 'TuneForge Admin',
      email: 'learningscieanceai1@gmail.com',
      role: UserRoles.ADMIN,
      emailVerified: new Date(),
      adminData: {
        permissions: ['all'],
        lastAdminAction: new Date(),
        adminNotes: 'Created via admin init endpoint',
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

    await adminUser.save();

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      user: {
        id: adminUser._id,
        email: adminUser.email,
        role: adminUser.role,
        name: adminUser.name,
      }
    });

  } catch (error) {
    console.error('Admin init error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to initialize admin user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check admin status
export async function GET(request: NextRequest) {
  try {
    await connectMongo;

    const adminUser = await User.findOne({ 
      email: 'learningscieanceai1@gmail.com' 
    });

    if (!adminUser) {
      return NextResponse.json({
        exists: false,
        message: 'Admin user not found'
      });
    }

    return NextResponse.json({
      exists: true,
      user: {
        id: adminUser._id,
        email: adminUser.email,
        role: adminUser.role,
        name: adminUser.name,
        createdAt: adminUser.createdAt,
        dashboardUrl: adminUser.dashboardUrl,
      },
      stats: {
        totalUsers: await User.countDocuments(),
        adminUsers: await User.countDocuments({ role: UserRoles.ADMIN }),
        freeUsers: await User.countDocuments({ role: UserRoles.FREE }),
        paidUsers: await User.countDocuments({ role: UserRoles.PAID }),
        maxUsers: await User.countDocuments({ role: UserRoles.MAX }),
      }
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
