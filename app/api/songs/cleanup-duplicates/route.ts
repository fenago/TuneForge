import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import connectMongo from '@/libs/mongoose';
import Song from '@/models/Song';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  console.log('\n🧹 =========================');
  console.log('🧹 DUPLICATE CLEANUP START');
  console.log('🧹 =========================');
  console.log('🧹 Timestamp:', new Date().toISOString());

  try {
    // Check authentication
    console.log('🔐 Checking authentication...');
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.log('❌ Authentication failed - no session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log('✅ Authentication success:', session.user.email);

    // Connect to database
    console.log('🔌 Connecting to MongoDB...');
    await connectMongo();
    console.log('✅ MongoDB connected');

    // Get user from database
    console.log('👤 Finding user in database...');
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      console.log('❌ User not found in database');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    console.log('✅ User found:', user._id);

    // Find user's songs grouped by title and taskId
    console.log('🔍 Finding duplicate songs...');
    const songs = await Song.find({ userId: user._id }).sort({ createdAt: 1 }); // Oldest first
    
    const duplicateGroups: Record<string, any[]> = {};
    const duplicatesRemoved: any[] = [];
    
    // Group songs by title + taskId combination
    songs.forEach(song => {
      const key = `${song.title}_${song.taskId || 'no-task'}`;
      if (!duplicateGroups[key]) {
        duplicateGroups[key] = [];
      }
      duplicateGroups[key].push(song);
    });
    
    console.log('🔍 Found song groups:', Object.keys(duplicateGroups).length);
    
    // For each group, keep only the oldest song and mark others for deletion
    for (const [key, groupSongs] of Object.entries(duplicateGroups)) {
      if (groupSongs.length > 1) {
        console.log(`🧹 Found ${groupSongs.length} duplicates for: ${key}`);
        
        // Keep the first (oldest) song, remove the rest
        const [keepSong, ...removeSongs] = groupSongs;
        console.log(`✅ Keeping song: ${keepSong._id} (${keepSong.title})`);
        
        for (const removeSong of removeSongs) {
          console.log(`🗑️ Removing duplicate: ${removeSong._id} (${removeSong.title})`);
          await Song.findByIdAndDelete(removeSong._id);
          duplicatesRemoved.push({
            id: removeSong._id,
            title: removeSong.title,
            createdAt: removeSong.createdAt
          });
        }
      }
    }
    
    console.log('✅ Cleanup completed');
    console.log('🧹 =========================');
    console.log('🧹 DUPLICATE CLEANUP SUCCESS');
    console.log('🧹 Duplicates removed:', duplicatesRemoved.length);
    console.log('🧹 =========================\n');

    return NextResponse.json({
      success: true,
      message: 'Duplicate cleanup completed',
      duplicatesRemoved: duplicatesRemoved.length,
      removedSongs: duplicatesRemoved
    });
    
  } catch (error: any) {
    console.error('🧹 =========================');
    console.error('🧹 DUPLICATE CLEANUP FAILED');
    console.error('🧹 Error:', error);
    console.error('🧹 =========================\n');
    
    return NextResponse.json({ 
      error: 'Failed to cleanup duplicates',
      details: error.message 
    }, { status: 500 });
  }
}
