import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import connectMongo from '@/libs/mongoose';
import User from '@/models/User';
import Song from '@/models/Song';

export async function POST(request: NextRequest) {
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

    // Check for pending tasks
    if (!user.pendingTasks || user.pendingTasks.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No pending tasks',
        completed: 0 
      });
    }

    const sunoApiKey = process.env.SUNOAPI_KEY;
    if (!sunoApiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    let completedCount = 0;
    const completedTasks = [];
    const stillPending = [];

    // Check each pending task
    for (const task of user.pendingTasks) {
      try {
        // Skip very old tasks (older than 1 hour)
        if (new Date().getTime() - new Date(task.createdAt).getTime() > 3600000) {
          continue;
        }

        const taskUrl = `https://api.sunoapi.com/api/v1/suno/task/${task.taskId}`;
        const response = await fetch(taskUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${sunoApiKey}`,
          },
        });

        if (!response.ok) {
          stillPending.push(task);
          continue;
        }

        const result = await response.json();
        
        if (result.data && Array.isArray(result.data)) {
          const completedSongs = result.data.filter((song: any) => song.state === 'succeeded');
          
          if (completedSongs.length > 0) {
            // Save completed songs
            for (const song of completedSongs) {
              // Check if song already exists
              const existingSong = await Song.findOne({ clipId: song.clip_id });
              if (existingSong) {
                continue;
              }
              
              // Create new song
              const newSong = new Song({
                userId: user._id,
                title: song.title || task.title,
                description: song.lyrics,
                genre: 'pop', // Default
                mood: 'energetic', // Default
                duration: parseFloat(song.duration) || 0,
                prompt: task.prompt,
                aiModel: song.mv || task.model,
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
              
              await newSong.save();
              completedCount++;
            }
            
            completedTasks.push(task.taskId);
          } else if (result.data.every((song: any) => song.state === 'failed')) {
            // Task failed
            completedTasks.push(task.taskId);
          } else {
            // Still in progress
            stillPending.push(task);
          }
        } else {
          stillPending.push(task);
        }
      } catch (error) {
        console.error(`Error checking task ${task.taskId}:`, error);
        stillPending.push(task);
      }
    }

    // Update user's pending tasks
    user.pendingTasks = stillPending;
    
    // Update user stats
    if (completedCount > 0 && user.usage) {
      user.usage.songsGenerated = (user.usage.songsGenerated || 0) + completedCount;
      user.usage.creditsUsed = (user.usage.creditsUsed || 0) + completedTasks.length;
    }
    
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Pending tasks checked',
      completed: completedCount,
      stillPending: stillPending.length,
      completedTasks: completedTasks
    });

  } catch (error) {
    console.error('Check pending error:', error);
    return NextResponse.json({ 
      error: 'Failed to check pending tasks',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
