import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import connectMongo from '@/libs/mongoose';
import Song from '@/models/Song';
import User from '@/models/User';

export async function DELETE(request: NextRequest) {
  const startTime = Date.now();
  console.log('\n🗑️ =========================');
  console.log('🗑️ SONG DELETE START');
  console.log('🗑️ =========================');
  console.log('🗑️ Timestamp:', new Date().toISOString());

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

    // Get song ID from request body
    console.log('📥 Parsing request body...');
    const body = await request.json();
    const { songId } = body;
    
    if (!songId) {
      console.log('❌ No song ID provided');
      return NextResponse.json({ error: 'Song ID is required' }, { status: 400 });
    }
    
    console.log('🎵 Song ID to delete:', songId);

    // Find the song and verify ownership
    console.log('🔍 Finding song in database...');
    const song = await Song.findById(songId);
    
    if (!song) {
      console.log('❌ Song not found');
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }
    
    console.log('✅ Song found:', song.title);
    
    // Check if user owns the song
    if (song.userId.toString() !== user._id.toString()) {
      console.log('❌ User does not own this song');
      console.log('Song owner:', song.userId.toString());
      console.log('Current user:', user._id.toString());
      return NextResponse.json({ error: 'Not authorized to delete this song' }, { status: 403 });
    }
    
    console.log('✅ User ownership verified');

    // Delete the song
    console.log('🗑️ Deleting song from database...');
    await Song.findByIdAndDelete(songId);
    console.log('✅ Song deleted successfully');

    // Update user's song count (optional - for statistics)
    if (user.usage && user.usage.songsGenerated > 0) {
      user.usage.songsGenerated -= 1;
      await user.save();
      console.log('✅ User statistics updated');
    }

    const endTime = Date.now();
    console.log('🗑️ =========================');
    console.log('🗑️ SONG DELETE SUCCESS');
    console.log('🗑️ Duration:', endTime - startTime, 'ms');
    console.log('🗑️ Deleted song:', song.title);
    console.log('🗑️ =========================\n');

    return NextResponse.json({ 
      success: true,
      message: 'Song deleted successfully',
      deletedSong: {
        id: song._id,
        title: song.title
      }
    });
    
  } catch (error: any) {
    const endTime = Date.now();
    console.error('🗑️ =========================');
    console.error('🗑️ SONG DELETE FAILED');
    console.error('🗑️ Duration:', endTime - startTime, 'ms');
    console.error('🗑️ Error:', error);
    console.error('🗑️ Error message:', error?.message);
    console.error('🗑️ Error stack:', error?.stack);
    console.error('🗑️ =========================\n');
    
    return NextResponse.json({ 
      error: 'Failed to delete song',
      details: error.message 
    }, { status: 500 });
  }
}
