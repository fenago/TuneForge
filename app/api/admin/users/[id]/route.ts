import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import Song from "@/models/Song";

// GET - View user details
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('\n👤 =========================');
    console.log('👤 USER DETAIL API REQUEST START');
    console.log('👤 =========================');
    console.log('👤 User ID:', params.id);

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();

    // Check if user is admin
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Find the user
    const user = await User.findById(params.id).lean() as any;
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's songs
    const songs = await Song.find({ userId: params.id })
      .select('title genre createdAt duration')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Get song statistics
    const songStats = await Song.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: null,
          totalSongs: { $sum: 1 },
          totalDuration: { $sum: "$duration" },
          avgDuration: { $avg: "$duration" },
          genres: { $addToSet: "$genre" }
        }
      }
    ]);

    const stats = songStats[0] || {
      totalSongs: 0,
      totalDuration: 0,
      avgDuration: 0,
      genres: []
    };

    const userDetail = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,
      subscription: user.subscription,
      adminData: user.adminData,
      stats: {
        totalSongs: stats.totalSongs,
        totalDuration: Math.round(stats.totalDuration || 0),
        avgDuration: Math.round(stats.avgDuration || 0),
        genres: stats.genres,
        accountAge: Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      },
      recentSongs: songs.map(song => ({
        id: song._id.toString(),
        title: song.title,
        genre: song.genre,
        duration: song.duration,
        createdAt: song.createdAt
      }))
    };

    console.log('✅ User details retrieved');
    console.log('👤 =========================');
    console.log('👤 USER DETAIL API REQUEST END');
    console.log('👤 =========================\n');

    return NextResponse.json({ user: userDetail });

  } catch (error) {
    console.error('❌ User detail error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update user details
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('\n✏️ =========================');
    console.log('✏️ UPDATE USER API REQUEST START');
    console.log('✏️ =========================');
    console.log('✏️ User ID:', params.id);

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();

    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, role, status, action } = body;

    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Handle different update actions
    if (action === 'suspend') {
      user.subscription = user.subscription || {};
      user.subscription.status = 'suspended';
      user.adminData = user.adminData || {};
      user.adminData.suspendedAt = new Date();
      user.adminData.suspendedBy = currentUser._id;
      console.log('🚫 Suspending user');
    } else if (action === 'activate') {
      user.subscription = user.subscription || {};
      user.subscription.status = 'active';
      if (user.adminData?.suspendedAt) {
        delete user.adminData.suspendedAt;
        delete user.adminData.suspendedBy;
      }
      console.log('✅ Activating user');
    } else {
      // Regular update
      if (name !== undefined) user.name = name;
      if (email !== undefined) {
        // Check if email is already taken
        const existingUser = await User.findOne({ email, _id: { $ne: params.id } });
        if (existingUser) {
          return NextResponse.json({ error: "Email already in use" }, { status: 400 });
        }
        user.email = email;
      }
      if (role !== undefined) user.role = role;
      console.log('📝 Updating user details');
    }

    user.updatedAt = new Date();
    await user.save();

    // Return updated user data
    const updatedUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      signupDate: user.createdAt,
      lastActive: user.lastLoginAt || user.createdAt,
      status: user.subscription?.status === 'suspended' ? 'suspended' : 'active'
    };

    console.log('✅ User updated successfully');
    console.log('✏️ =========================');
    console.log('✏️ UPDATE USER API REQUEST END');
    console.log('✏️ =========================\n');

    return NextResponse.json({ 
      message: "User updated successfully",
      user: updatedUser
    });

  } catch (error) {
    console.error('❌ Update user error:', error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

// DELETE - Delete user
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('\n🗑️ =========================');
    console.log('🗑️ DELETE USER API REQUEST START');
    console.log('🗑️ =========================');
    console.log('🗑️ User ID:', params.id);

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();

    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Prevent self-deletion
    if (currentUser._id.toString() === params.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's song count for logging
    const songCount = await Song.countDocuments({ userId: params.id });
    console.log(`🎵 User has ${songCount} songs that will be deleted`);

    // Delete user's songs first
    await Song.deleteMany({ userId: params.id });
    console.log('✅ Deleted user songs');

    // Delete the user
    await User.findByIdAndDelete(params.id);
    console.log('✅ Deleted user account');

    console.log('🗑️ =========================');
    console.log('🗑️ DELETE USER API REQUEST END');
    console.log('🗑️ =========================\n');

    return NextResponse.json({ 
      message: "User and associated data deleted successfully",
      deletedSongs: songCount
    });

  } catch (error) {
    console.error('❌ Delete user error:', error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
