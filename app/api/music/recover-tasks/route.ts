import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import connectMongo from '@/libs/mongoose';
import GenerationTask from '@/models/GenerationTask';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  console.log('\n🔄 =========================');
  console.log('🔄 TASK RECOVERY START');
  console.log('🔄 =========================');

  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongo();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find user's pending/in-progress tasks
    const userTasks = await GenerationTask.find({
      userId: user._id,
      status: { $in: ['pending', 'in_progress'] },
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours only
    }).sort({ createdAt: -1 });

    console.log(`🔄 Found ${userTasks.length} pending tasks for user ${user.email}`);

    let recoveredTasks = [];
    let completedTasks = [];

    for (const task of userTasks) {
      try {
        console.log(`🔄 Checking task ${task.taskId}...`);
        
        // Check current status via API
        const sunoApiKey = process.env.SUNOAPI_KEY;
        if (!sunoApiKey) {
          throw new Error('Suno API key not configured');
        }

        const taskUrl = `https://api.sunoapi.com/api/v1/suno/task/${task.taskId}`;
        const response = await fetch(taskUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${sunoApiKey}`,
          },
        });

        if (!response.ok) {
          console.log(`❌ Could not check task ${task.taskId}: ${response.status}`);
          continue;
        }

        const result = await response.json();
        const completedSongs = result.data?.filter((song: any) => song.state === 'succeeded') || [];
        
        if (completedSongs.length > 0) {
          console.log(`✅ Task ${task.taskId} has ${completedSongs.length} completed songs - saving now`);
          
          // Save songs immediately
          const Song = (await import('@/models/Song')).default;
          const savedSongIds = [];
          
          for (const song of completedSongs) {
            try {
              // Check if song already exists (only by clipId - each song has unique clipId)
              const existingSong = await Song.findOne({ 
                clipId: song.clip_id
              });
              
              if (existingSong) {
                console.log(`⏭️ Song already exists: ${song.clip_id}`);
                savedSongIds.push(existingSong._id);
                continue;
              }
              
              const newSong = new Song({
                userId: user._id,
                title: song.title,
                description: song.lyrics,
                genre: 'pop', // Default
                mood: 'energetic', // Default
                duration: parseFloat(song.duration) || 0,
                prompt: task.prompt,
                aiModel: song.mv,
                files: {
                  audioUrl: song.audio_url,
                  videoUrl: song.video_url,
                  thumbnailUrl: song.image_url,
                },
                status: 'completed',
                tags: task.tags ? task.tags.split(',').map((t: string) => t.trim()) : [],
                taskId: task.taskId,
                clipId: song.clip_id,
                lyrics: song.lyrics,
                originalCreatedAt: song.created_at ? new Date(song.created_at) : null,
              });
              
              const savedSong = await newSong.save();
              savedSongIds.push(savedSong._id);
              console.log(`✅ Recovered and saved song: ${savedSong.title}`);
              
            } catch (songError) {
              console.error(`❌ Failed to save song ${song.clip_id}:`, songError);
            }
          }
          
          // Update task status
          task.status = 'completed';
          task.completedAt = new Date();
          task.generatedSongIds = savedSongIds;
          await task.save();
          
          completedTasks.push({
            taskId: task.taskId,
            songsRecovered: savedSongIds.length,
            prompt: task.prompt
          });
          
          // Update user stats
          if (user.usage) {
            user.usage.songsGenerated += savedSongIds.length;
            user.usage.creditsUsed += 1; // Per task, not per song
            await user.save();
          }
          
        } else {
          // Task is still pending/in progress - ensure it will be polled
          task.status = 'in_progress';
          task.nextPollAt = new Date(Date.now() + 30000); // Poll in 30 seconds
          await task.save();
          
          recoveredTasks.push({
            taskId: task.taskId,
            status: 'in_progress',
            prompt: task.prompt
          });
        }
        
      } catch (error) {
        console.error(`❌ Error recovering task ${task.taskId}:`, error);
      }
    }

    console.log('🔄 =========================');
    console.log('🔄 TASK RECOVERY COMPLETE');
    console.log(`🔄 Recovered: ${recoveredTasks.length}, Completed: ${completedTasks.length}`);
    console.log('🔄 =========================\n');

    return NextResponse.json({
      success: true,
      message: 'Task recovery completed',
      recoveredTasks: recoveredTasks.length,
      completedTasks: completedTasks.length,
      details: {
        recovered: recoveredTasks,
        completed: completedTasks
      }
    });

  } catch (error) {
    console.error('❌ Task recovery error:', error);
    return NextResponse.json({ 
      error: 'Task recovery failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
