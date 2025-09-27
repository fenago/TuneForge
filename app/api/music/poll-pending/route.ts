import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/libs/mongoose';
import GenerationTask from '@/models/GenerationTask';

export async function POST(request: NextRequest) {
  console.log('\n🔄 =========================');
  console.log('🔄 BACKGROUND POLLING START');
  console.log('🔄 =========================');
  console.log('🔄 Timestamp:', new Date().toISOString());

  let polledCount = 0;
  let completedCount = 0;
  let failedCount = 0;

  try {
    // Connect to database
    await connectMongo();
    console.log('✅ MongoDB connected');

    // Check if GenerationTask model exists, if not return early
    try {
      const testQuery = await GenerationTask.countDocuments({});
      console.log('✅ GenerationTask model accessible, found:', testQuery, 'documents');
    } catch (modelError) {
      console.log('⚠️ GenerationTask model not available yet:', modelError.message);
      return NextResponse.json({ 
        success: true, 
        message: 'GenerationTask model not ready yet, skipping polling',
        polled: 0 
      });
    }

    // Find tasks that need polling
    const now = new Date();
    const pendingTasks = await GenerationTask.find({
      status: { $in: ['pending', 'in_progress'] },
      $or: [
        { nextPollAt: { $lte: now } },
        { nextPollAt: { $exists: false } }
      ],
      pollAttempts: { $lt: 30 } // Don't poll forever
    }).limit(10); // Process max 10 tasks at once

    console.log(`🔄 Found ${pendingTasks.length} tasks to poll`);

    if (pendingTasks.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No pending tasks to poll',
        polled: 0 
      });
    }

    for (const task of pendingTasks) {
      try {
        console.log(`🔄 Polling task: ${task.taskId} (attempt ${task.pollAttempts + 1})`);
        
        // Check if task should be abandoned
        if (task.shouldAbandon()) {
          console.log(`⏰ Task ${task.taskId} has been running too long, marking as abandoned`);
          task.status = 'abandoned';
          task.failedAt = new Date();
          task.errorMessage = 'Task abandoned - exceeded maximum time limit';
          await task.save();
          failedCount++;
          continue;
        }

        // Make API call to check status
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
          throw new Error(`API returned ${response.status}: ${await response.text()}`);
        }

        const result = await response.json();
        
        // Update task polling metadata
        task.pollAttempts += 1;
        task.lastPolledAt = new Date();
        task.lastApiResponse = result;
        
        // Check if any songs are completed
        const completedSongs = result.data?.filter((song: any) => song.state === 'succeeded') || [];
        const failedSongs = result.data?.filter((song: any) => song.state === 'failed') || [];
        const allSongs = result.data || [];
        
        console.log(`🔄 Task ${task.taskId}: ${completedSongs.length} completed, ${failedSongs.length} failed, ${allSongs.length} total`);
        
        if (completedSongs.length > 0) {
          // Mark task as completed and save songs
          console.log(`✅ Task ${task.taskId} completed with ${completedSongs.length} songs`);
          
          task.status = 'completed';
          task.completedAt = new Date();
          
          // Save completed songs to database - Import models properly
          const Song = (await import('@/models/Song')).default;
          const User = (await import('@/models/User')).default;
          
          const savedSongIds = [];
          for (const song of completedSongs) {
            try {
              // Check if this song already exists in database (only by clipId - each song has unique clipId)
              const existingSong = await Song.findOne({ 
                clipId: song.clip_id
              });
              if (existingSong) {
                console.log(`✅ Song ${song.clip_id} already exists in database, skipping`);
                continue;
              }
              
              // Create song in database using internal API
              const songData = {
                taskId: task.taskId,
                clipId: song.clip_id,
                title: song.title,
                prompt: task.prompt,
                lyrics: song.lyrics,
                tags: task.tags,
                duration: parseFloat(song.duration) || 0,
                aiModel: song.mv,
                audioUrl: song.audio_url,
                videoUrl: song.video_url, // Add video URL
                imageUrl: song.image_url,
                created_at: song.created_at,
                status: 'completed'
              };
              
              const user = await User.findById(task.userId);
              if (user) {
                const newSong = new Song({
                  userId: task.userId,
                  title: songData.title,
                  description: songData.lyrics,
                  genre: 'pop', // Default, will be enhanced by song creation logic
                  mood: 'energetic', // Default
                  duration: songData.duration,
                  prompt: songData.prompt,
                  aiModel: songData.aiModel,
                  files: {
                    audioUrl: songData.audioUrl,
                    videoUrl: songData.videoUrl,
                    thumbnailUrl: songData.imageUrl,
                  },
                  status: songData.status,
                  tags: songData.tags ? songData.tags.split(',').map((t: string) => t.trim()) : [],
                  taskId: songData.taskId,
                  clipId: songData.clipId,
                  lyrics: songData.lyrics,
                  originalCreatedAt: songData.created_at ? new Date(songData.created_at) : null,
                });
                
                const savedSong = await newSong.save();
                savedSongIds.push(savedSong._id);
                console.log(`✅ Saved song: ${savedSong._id} (${savedSong.title})`);
                
                // Update user stats - but don't fail the whole operation if this fails
                try {
                  if (user.usage) {
                    user.usage.songsGenerated += 1;
                    user.usage.creditsUsed += 1;
                    await user.save();
                  }
                } catch (userUpdateError) {
                  console.error(`⚠️ Failed to update user stats:`, userUpdateError);
                }
              } else {
                console.error(`❌ User not found for task ${task.taskId}`);
              }
            } catch (songError) {
              console.error(`❌ Failed to save song ${song.clip_id}:`, songError);
            }
          }
          
          task.generatedSongIds = savedSongIds;
          completedCount++;
          
        } else if (allSongs.every((song: any) => song.state === 'failed')) {
          // All songs failed
          console.log(`❌ Task ${task.taskId} failed - all songs failed`);
          task.status = 'failed';
          task.failedAt = new Date();
          task.errorMessage = 'All songs in task failed';
          failedCount++;
          
        } else {
          // Still in progress, schedule next poll
          task.status = 'in_progress';
          task.nextPollAt = task.calculateNextPoll();
          console.log(`⏳ Task ${task.taskId} still in progress, next poll at: ${task.nextPollAt}`);
        }
        
        // Ensure task save completes before continuing
        await task.save();
        polledCount++;
        
        console.log(`✅ Task ${task.taskId} processing completed and saved`);
        
      } catch (error) {
        console.error(`❌ Error polling task ${task.taskId}:`, error);
        
        // Mark task as failed if too many poll attempts
        if (task.pollAttempts >= 30) {
          task.status = 'failed';
          task.failedAt = new Date();
          task.errorMessage = error instanceof Error ? error.message : 'Unknown polling error';
          await task.save();
          failedCount++;
        } else {
          // Schedule retry
          task.nextPollAt = task.calculateNextPoll();
          task.pollAttempts += 1;
          await task.save();
        }
      }
    }

    console.log('🔄 =========================');
    console.log('🔄 BACKGROUND POLLING END');
    console.log(`🔄 Polled: ${polledCount}, Completed: ${completedCount}, Failed: ${failedCount}`);
    console.log('🔄 =========================\n');

    return NextResponse.json({
      success: true,
      message: 'Background polling completed',
      polled: polledCount,
      completed: completedCount,
      failed: failedCount
    });

  } catch (error) {
    console.error('❌ Background polling error:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Always return valid JSON, never let this crash
    return NextResponse.json({ 
      success: false,
      error: 'Background polling failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      polled: 0,
      completed: 0,
      failed: 0
    }, { status: 500 });
  }
}
