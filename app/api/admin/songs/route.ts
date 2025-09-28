import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import Song from "@/models/Song";

export async function GET(req: NextRequest) {
  try {
    console.log('\n🎵 =========================');
    console.log('🎵 ADMIN SONGS API REQUEST START');
    console.log('🎵 =========================');
    console.log('🎵 Timestamp:', new Date().toISOString());

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

    // Get URL search params for filtering
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || 'all';
    const genre = url.searchParams.get('genre') || 'all';
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';

    // Build match criteria
    const matchCriteria: any = {};
    
    if (search) {
      matchCriteria.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filtering (we'll map our database fields to admin status concepts)
    if (status !== 'all') {
      switch (status) {
        case 'active':
          matchCriteria.status = 'completed';
          break;
        case 'flagged':
          // You could add a 'flagged' field to your Song model
          matchCriteria.flagged = true;
          break;
        case 'removed':
          // You could add a 'removed' field to your Song model  
          matchCriteria.removed = true;
          break;
      }
    }

    if (genre !== 'all') {
      matchCriteria.tags = { $regex: genre, $options: 'i' };
    }

    // Fetch songs with user information
    const pipeline = [
      { $match: matchCriteria },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          genre: 1,
          mood: 1,
          duration: 1,
          prompt: 1,
          aiModel: 1,
          'files.audioUrl': 1,
          'files.thumbnailUrl': 1,
          status: 1,
          isPublic: 1,
          tags: 1,
          playCount: 1,
          downloadCount: 1,
          shareCount: 1,
          createdAt: 1,
          updatedAt: 1,
          flagged: { $ifNull: ['$flagged', false] },
          removed: { $ifNull: ['$removed', false] },
          'user._id': 1,
          'user.name': 1,
          'user.email': 1
        }
      },
      { $sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit }
    ];

    const songs = await Song.aggregate(pipeline as any);
    
    // Get total count for pagination
    const totalCountPipeline = [
      { $match: matchCriteria },
      { $count: "total" }
    ];
    const totalCountResult = await Song.aggregate(totalCountPipeline);
    const totalSongs = totalCountResult[0]?.total || 0;

    console.log('✅ Found songs:', songs.length);
    console.log('✅ Total songs:', totalSongs);

    // Transform songs for frontend
    const transformedSongs = songs.map(song => {
      // Determine admin status
      let adminStatus = 'active';
      if (song.removed) {
        adminStatus = 'removed';
      } else if (song.flagged) {
        adminStatus = 'flagged';
      } else if (song.status === 'completed') {
        adminStatus = 'active';
      }

      return {
        id: song._id.toString(),
        title: song.title || 'Untitled',
        user: {
          id: song.user._id.toString(),
          name: song.user.name || 'Unknown User',
          email: song.user.email
        },
        tags: Array.isArray(song.tags) ? song.tags.join(', ') : (song.tags || song.genre || 'untagged'),
        createdAt: song.createdAt,
        duration: song.duration || 0,
        model: song.aiModel || 'unknown',
        audioUrl: song.files?.audioUrl || '',
        imageUrl: song.files?.thumbnailUrl || null,
        status: adminStatus,
        plays: song.playCount || 0,
        downloads: song.downloadCount || 0
      };
    });

    // Calculate statistics
    const stats = {
      totalSongs: totalSongs,
      activeSongs: await Song.countDocuments({ status: 'completed', removed: { $ne: true }, flagged: { $ne: true } }),
      flaggedSongs: await Song.countDocuments({ flagged: true }),
      removedSongs: await Song.countDocuments({ removed: true }),
      totalPlays: await Song.aggregate([
        { $group: { _id: null, total: { $sum: "$playCount" } } }
      ]).then(result => result[0]?.total || 0),
      totalDownloads: await Song.aggregate([
        { $group: { _id: null, total: { $sum: "$downloadCount" } } }
      ]).then(result => result[0]?.total || 0)
    };

    console.log('✅ Calculated statistics');
    console.log('🎵 =========================');
    console.log('🎵 ADMIN SONGS API REQUEST END');
    console.log('🎵 =========================\n');

    return NextResponse.json({
      songs: transformedSongs,
      pagination: {
        page,
        limit,
        total: totalSongs,
        totalPages: Math.ceil(totalSongs / limit)
      },
      stats
    });

  } catch (error) {
    console.error('❌ ADMIN SONGS API Error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
