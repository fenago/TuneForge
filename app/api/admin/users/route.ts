import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import Song from "@/models/Song";

export async function GET(req: NextRequest) {
  try {
    console.log('\n👥 =========================');
    console.log('👥 ADMIN USERS API REQUEST START');
    console.log('👥 =========================');
    console.log('👥 Timestamp:', new Date().toISOString());

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.log('❌ No session found');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log('✅ Session found for:', session.user.email);

    // Connect to database
    await connectMongo();
    console.log('✅ Connected to MongoDB');

    // Check if user is admin
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser || currentUser.role !== 'ADMIN') {
      console.log('❌ User is not admin:', currentUser?.role);
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    console.log('✅ Admin access confirmed');

    // Fetch all users with minimal data for list view
    const users = await User.find({})
      .select('name email role createdAt lastLoginAt subscription.status subscription.plan adminData')
      .sort({ createdAt: -1 })
      .lean();

    console.log('✅ Found users:', users.length);

    // Get song counts for all users
    const songCounts = await Song.aggregate([
      {
        $group: {
          _id: "$userId",
          count: { $sum: 1 }
        }
      }
    ]);

    // Create a map for quick lookup
    const songCountMap = new Map();
    songCounts.forEach(item => {
      songCountMap.set(item._id.toString(), item.count);
    });

    console.log('✅ Calculated song counts for users');

    // Transform users for frontend
    const transformedUsers = users.map(user => {
      const userId = user._id.toString();
      const songsGenerated = songCountMap.get(userId) || 0;
      
      // Calculate total spent (placeholder - you'd need billing data)
      const totalSpent = 0; // TODO: Add real billing calculation

      // Determine status
      let status = 'active';
      if (user.subscription?.status === 'cancelled' || user.subscription?.status === 'past_due') {
        status = 'inactive';
      }
      // You can add suspended logic based on your business rules

      return {
        id: userId,
        name: user.name || 'Unknown User',
        email: user.email,
        role: user.role || 'FREE',
        signupDate: user.createdAt,
        totalSpent,
        songsGenerated,
        lastActive: user.lastLoginAt || user.createdAt,
        status,
        avatar: null as string | null // Add if you have user avatars
      };
    });

    console.log('✅ Transformed users for frontend');
    console.log('👥 =========================');
    console.log('👥 ADMIN USERS API REQUEST END');
    console.log('👥 =========================\n');

    return NextResponse.json({
      users: transformedUsers,
      total: transformedUsers.length
    });

  } catch (error) {
    console.error('❌ ADMIN USERS API Error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST endpoint for creating users (if needed)
export async function POST(req: NextRequest) {
  try {
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

    const { name, email, role } = await req.json();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Create new user
    const newUser = new User({
      name,
      email,
      role: role || 'FREE',
      subscription: {
        status: 'active',
        plan: role === 'ADMIN' ? 'MAX' : 'FREE'
      }
    });

    await newUser.save();

    return NextResponse.json({
      message: "User created successfully",
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('❌ Create user error:', error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
