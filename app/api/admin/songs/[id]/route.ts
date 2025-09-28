import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import Song from "@/models/Song";

// GET - Get detailed song information
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('\n🎵 =========================');
    console.log('🎵 SONG DETAIL API REQUEST START');
    console.log('🎵 =========================');
    console.log('🎵 Song ID:', params.id);

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

    // Find the song with user information
    const song = await Song.findById(params.id).populate('userId', 'name email').lean() as any;
    if (!song) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }

    const songDetail = {
      id: song._id.toString(),
      title: song.title,
      description: song.description,
      prompt: song.prompt,
      genre: song.genre,
      mood: song.mood,
      duration: song.duration,
      aiModel: song.aiModel,
      files: song.files,
      status: song.status,
      tags: song.tags,
      playCount: song.playCount || 0,
      downloadCount: song.downloadCount || 0,
      shareCount: song.shareCount || 0,
      createdAt: song.createdAt,
      updatedAt: song.updatedAt,
      user: {
        id: song.userId._id.toString(),
        name: song.userId.name,
        email: song.userId.email
      },
      flagged: song.flagged || false,
      removed: song.removed || false,
      lyrics: song.lyrics,
      musicAnalysis: song.musicAnalysis
    };

    console.log('✅ Song details retrieved');
    console.log('🎵 =========================');
    console.log('🎵 SONG DETAIL API REQUEST END');
    console.log('🎵 =========================\n');

    return NextResponse.json({ song: songDetail });

  } catch (error) {
    console.error('❌ Song detail error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update song or perform admin actions
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('\n🎵 =========================');
    console.log('🎵 UPDATE SONG API REQUEST START');
    console.log('🎵 =========================');
    console.log('🎵 Song ID:', params.id);

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
    const { action, title, tags } = body;

    const song = await Song.findById(params.id);
    if (!song) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }

    // Handle different admin actions
    if (action === 'flag') {
      song.flagged = true;
      song.flaggedAt = new Date();
      song.flaggedBy = currentUser._id;
      console.log('🚩 Flagging song');
    } else if (action === 'unflag') {
      song.flagged = false;
      delete song.flaggedAt;
      delete song.flaggedBy;
      console.log('✅ Unflagging song');
    } else if (action === 'remove') {
      song.removed = true;
      song.removedAt = new Date();
      song.removedBy = currentUser._id;
      console.log('🚫 Removing song');
    } else if (action === 'restore') {
      song.removed = false;
      song.flagged = false;
      delete song.removedAt;
      delete song.removedBy;
      delete song.flaggedAt;
      delete song.flaggedBy;
      console.log('↩️ Restoring song');
    } else {
      // Regular update
      if (title !== undefined) song.title = title;
      if (tags !== undefined) song.tags = tags;
      console.log('📝 Updating song details');
    }

    song.updatedAt = new Date();
    await song.save();

    // Return updated song data for frontend
    let adminStatus = 'active';
    if (song.removed) {
      adminStatus = 'removed';
    } else if (song.flagged) {
      adminStatus = 'flagged';
    }

    const updatedSong = {
      id: song._id.toString(),
      title: song.title,
      status: adminStatus,
      flagged: song.flagged || false,
      removed: song.removed || false
    };

    console.log('✅ Song updated successfully');
    console.log('🎵 =========================');
    console.log('🎵 UPDATE SONG API REQUEST END');
    console.log('🎵 =========================\n');

    return NextResponse.json({ 
      message: "Song updated successfully",
      song: updatedSong
    });

  } catch (error) {
    console.error('❌ Update song error:', error);
    return NextResponse.json({ error: "Failed to update song" }, { status: 500 });
  }
}

// DELETE - Permanently delete song
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('\n🗑️ =========================');
    console.log('🗑️ DELETE SONG API REQUEST START');
    console.log('🗑️ =========================');
    console.log('🗑️ Song ID:', params.id);

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();

    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const song = await Song.findById(params.id);
    if (!song) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }

    console.log(`🎵 Deleting song: "${song.title}"`);

    // Delete the song
    await Song.findByIdAndDelete(params.id);
    console.log('✅ Song deleted permanently');

    console.log('🗑️ =========================');
    console.log('🗑️ DELETE SONG API REQUEST END');
    console.log('🗑️ =========================\n');

    return NextResponse.json({ 
      message: "Song deleted permanently",
      songTitle: song.title
    });

  } catch (error) {
    console.error('❌ Delete song error:', error);
    return NextResponse.json({ error: "Failed to delete song" }, { status: 500 });
  }
}
