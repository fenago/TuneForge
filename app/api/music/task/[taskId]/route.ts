import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  const startTime = Date.now();
  console.log('\n🔍 =========================');
  console.log('🔍 TASK STATUS CHECK START');
  console.log('🔍 =========================');
  console.log('🔍 Timestamp:', new Date().toISOString());

  try {
    // Check authentication
    console.log('🔐 Checking authentication...');
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.log('❌ Authentication failed - no session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log('✅ Authentication success:', session.user.email);

    const { taskId } = params;
    console.log('🆔 Task ID received:', taskId);
    
    if (!taskId) {
      console.log('❌ No task ID provided');
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    // Get API key
    console.log('🔑 Checking API key...');
    const sunoApiKey = process.env.SUNOAPI_KEY;
    if (!sunoApiKey) {
      console.log('❌ Suno API key not configured');
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }
    console.log('✅ Suno API key found:', sunoApiKey.substring(0, 10) + '...');

    // Make the API call to get task status
    const taskUrl = `https://api.sunoapi.com/api/v1/suno/task/${taskId}`;
    console.log('🚀 Checking task status...');
    console.log('🚀 URL:', taskUrl);
    console.log('🚀 Method: GET');
    console.log('🚀 Headers: Authorization: Bearer [REDACTED]');

    const fetchStartTime = Date.now();
    const response = await fetch(taskUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sunoApiKey}`,
      },
    });
    const fetchEndTime = Date.now();

    console.log('📡 Suno task status response received');
    console.log('📡 Response time:', (fetchEndTime - fetchStartTime) + 'ms');
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Suno task status error:', errorText);
      console.error('❌ Error status:', response.status);
      return NextResponse.json({ 
        error: 'Failed to get task status', 
        details: errorText 
      }, { status: response.status });
    }

    const result = await response.json();
    console.log('✅ Suno task status response:', JSON.stringify(result, null, 2));
    
    // Log detailed information about each song in the result
    if (result.data && Array.isArray(result.data)) {
      console.log('🎵 Number of songs in response:', result.data.length);
      result.data.forEach((song: any, index: number) => {
        console.log(`🎵 Song ${index + 1}:`);
        console.log(`   - ID: ${song.clip_id}`);
        console.log(`   - Title: ${song.title}`);
        console.log(`   - State: ${song.state}`);
        console.log(`   - Duration: ${song.duration} seconds`);
        console.log(`   - Tags: ${song.tags}`);
        console.log(`   - Model: ${song.mv}`);
        console.log(`   - Audio URL: ${song.audio_url ? 'Present' : 'Missing'}`);
        console.log(`   - Video URL: ${song.video_url ? 'Present' : 'Missing'}`);
        console.log(`   - Image URL: ${song.image_url ? 'Present' : 'Missing'}`);
        console.log(`   - Created: ${song.created_at}`);
        
        if (song.duration < 30) {
          console.log(`⚠️  WARNING: Song ${index + 1} has suspiciously short duration: ${song.duration}s`);
        }
      });
    }
    
    // Save completed songs to database (with duplicate prevention)
    if (result.data && Array.isArray(result.data)) {
      const completedSongs = result.data.filter((song: any) => song.state === 'succeeded');
      
      if (completedSongs.length > 0) {
        console.log('💾 Checking for new completed songs to save...');
        
        try {
          const connectMongo = (await import('@/libs/mongoose')).default;
          const User = (await import('@/models/User')).default;
          const Song = (await import('@/models/Song')).default;
          
          await connectMongo();
          const user = await User.findOne({ email: session.user.email });
          
          if (user) {
            for (const song of completedSongs) {
              // Check if this song already exists in database (only by clipId - each song has unique clipId)
              const existingSong = await Song.findOne({ 
                clipId: song.clip_id
              });
              
              if (existingSong) {
                console.log('⏭️  Song already exists, skipping:', song.clip_id, song.title);
                continue;
              }
              
              console.log('💾 Saving new song:', song.clip_id, song.title);
              
              // Call our song creation API
              const songData = {
                taskId: taskId,
                clipId: song.clip_id, // Include the clip ID
                title: song.title,
                prompt: song.lyrics,
                lyrics: song.lyrics, // Also save as separate lyrics field
                tags: song.tags,
                duration: parseFloat(song.duration) || 0,
                aiModel: song.mv,
                audioUrl: song.audio_url,
                videoUrl: song.video_url, // Include video URL
                imageUrl: song.image_url,
                created_at: song.created_at, // Original creation timestamp
                status: 'completed'
              };
              
              const saveResponse = await fetch(`${request.nextUrl.origin}/api/songs/create`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Cookie': request.headers.get('cookie') || '', // Forward cookies for auth
                },
                body: JSON.stringify(songData),
              });
              
              if (saveResponse.ok) {
                console.log('✅ Song saved successfully:', song.clip_id, song.title);
              } else {
                console.error('❌ Failed to save song:', song.clip_id, song.title, await saveResponse.text());
              }
            }
          } else {
            console.log('❌ User not found for song saving');
          }
        } catch (error) {
          console.error('❌ Error saving songs to database:', error);
        }
      } else {
        console.log('💾 No completed songs to save yet');
      }
    }
    
    const totalTime = Date.now() - startTime;
    console.log('⏱️  Total request time:', totalTime + 'ms');
    console.log('🔍 =========================');
    console.log('🔍 TASK STATUS CHECK END');
    console.log('🔍 =========================\n');
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Task status error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
