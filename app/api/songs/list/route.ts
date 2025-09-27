import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import connectMongo from '@/libs/mongoose';
import Song from '@/models/Song';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  console.log('\n📚 =========================');
  console.log('📚 SONG LIST REQUEST START');
  console.log('📚 =========================');
  console.log('📚 Timestamp:', new Date().toISOString());

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

    // Fetch user's songs
    console.log('🎵 Fetching songs for user...');
    console.log('🎵 User ID to search for:', user._id);
    
    const songs = await Song.find({ userId: user._id })
      .sort({ createdAt: -1 }) // Most recent first
      .lean();
    
    console.log('🎵 Found songs:', songs.length);
    console.log('🎵 Raw song data:', JSON.stringify(songs, null, 2));
    
    songs.forEach((song, index) => {
      console.log(`🎵 Song ${index + 1}:`);
      console.log(`   - ID: ${song._id}`);
      console.log(`   - Title: ${song.title}`);
      console.log(`   - Duration: ${song.duration}s`);
      console.log(`   - Status: ${song.status}`);
      console.log(`   - Genre: ${song.genre}`);
      console.log(`   - Tags: ${song.tags}`);
      console.log(`   - Audio URL: ${song.files?.audioUrl ? 'Present' : 'Missing'}`);
      console.log(`   - Full files object:`, song.files);
    });

    // Return full song data for detailed metadata view
    const transformedSongs = songs.map(song => ({
      _id: song._id.toString(),
      title: song.title,
      description: song.description,
      genre: song.genre,
      mood: song.mood,
      duration: song.duration || 0,
      prompt: song.prompt,
      aiModel: song.aiModel || 'unknown',
      generationParams: song.generationParams || {},
      files: song.files || {},
      status: song.status,
      isPublic: song.isPublic,
      tags: song.tags || [],
      playCount: song.playCount || 0,
      downloadCount: song.downloadCount || 0,
      shareCount: song.shareCount || 0,
      taskId: song.taskId,
      clipId: song.clipId,
      lyrics: song.lyrics,
      originalCreatedAt: song.originalCreatedAt,
      generationTime: song.generationTime,
      generationAnalytics: song.generationAnalytics || {},
      musicAnalysis: song.musicAnalysis || {},
      createdAt: song.createdAt,
      updatedAt: song.updatedAt,
      // Backwards compatibility for existing UI
      id: song._id.toString(),
      audioUrl: song.files?.audioUrl || '',
      imageUrl: song.files?.thumbnailUrl || song.files?.imageUrl || '',
      model: song.aiModel || 'unknown'
    }));

    console.log('✅ Returning transformed songs:', transformedSongs.length);
    console.log('📚 =========================');
    console.log('📚 SONG LIST REQUEST END');
    console.log('📚 =========================\n');

    return NextResponse.json({ 
      success: true,
      songs: transformedSongs,
      count: transformedSongs.length
    });
    
  } catch (error: any) {
    console.error('❌ Song list error:', error);
    console.log('📚 =========================');
    console.log('📚 SONG LIST REQUEST ERROR');
    console.log('📚 =========================\n');
    
    return NextResponse.json({ 
      error: 'Failed to fetch songs',
      details: error.message 
    }, { status: 500 });
  }
}
