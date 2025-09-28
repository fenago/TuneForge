import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import connectMongo from '@/libs/mongoose';
import Song from '@/models/Song';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('\n💾 =========================');
  console.log('💾 SONG CREATION START');
  console.log('💾 =========================');
  console.log('💾 Timestamp:', new Date().toISOString());

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

    // Parse request body
    console.log('📥 Parsing request body...');
    const body = await request.json();
    console.log('📥 Raw request body:', JSON.stringify(body, null, 2));

    // Extract and normalize genre from tags
    let genre = 'pop'; // default
    let mood = 'energetic'; // default
    
    if (body.tags) {
      const tags = body.tags.toLowerCase().split(',').map((t: string) => t.trim());
      
      // Find matching genre
      const validGenres = ['pop', 'rock', 'hip-hop', 'electronic', 'jazz', 'classical', 
        'country', 'r&b', 'reggae', 'folk', 'blues', 'metal', 
        'punk', 'indie', 'ambient', 'house', 'techno', 'dubstep'];
      const foundGenre = tags.find((tag: string) => validGenres.includes(tag));
      if (foundGenre) genre = foundGenre;
      
      // Find matching mood
      const validMoods = ['happy', 'sad', 'energetic', 'calm', 'romantic', 'aggressive',
        'mysterious', 'uplifting', 'melancholic', 'epic', 'dreamy', 'dark'];
      const foundMood = tags.find((tag: string) => validMoods.includes(tag));
      if (foundMood) mood = foundMood;
    }

    // Helper function to extract file format from URL
    const getFileFormat = (url: string): string => {
      if (!url) return '';
      const extension = url.split('.').pop()?.toLowerCase();
      return extension || '';
    };

    // Helper function to generate tempo based on genre
    const generateTempo = (genre: string): number => {
      const tempoRanges: Record<string, [number, number]> = {
        'electronic': [120, 140],
        'rock': [110, 140], 
        'pop': [100, 130],
        'hip-hop': [80, 120],
        'jazz': [80, 200],
        'classical': [60, 120],
        'country': [90, 140],
        'r&b': [70, 120],
        'reggae': [60, 90],
        'folk': [80, 120],
        'blues': [70, 120],
        'metal': [120, 180],
        'punk': [150, 200],
        'indie': [90, 140],
        'ambient': [60, 100],
        'house': [120, 130],
        'techno': [120, 150],
        'dubstep': [140, 150]
      };
      
      const range = tempoRanges[genre] || [90, 140];
      return Math.floor(Math.random() * (range[1] - range[0]) + range[0]);
    };

    // Helper function to generate musical key
    const generateKey = (): string => {
      const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      return keys[Math.floor(Math.random() * keys.length)];
    };

    // Helper function to generate realistic music analysis values
    const generateMusicAnalysis = (genre: string, mood: string) => {
      // Base values influenced by genre and mood
      const genreMultipliers: Record<string, any> = {
        'electronic': { energy: 0.8, danceability: 0.9, acousticness: 0.1 },
        'rock': { energy: 0.9, danceability: 0.6, acousticness: 0.2 },
        'jazz': { energy: 0.5, danceability: 0.4, acousticness: 0.8 },
        'classical': { energy: 0.4, danceability: 0.2, acousticness: 0.9 },
        'pop': { energy: 0.7, danceability: 0.8, acousticness: 0.3 },
        'hip-hop': { energy: 0.8, danceability: 0.9, speechiness: 0.7 },
      };

      const moodMultipliers: Record<string, any> = {
        'happy': { valence: 0.8, energy: 0.7 },
        'sad': { valence: 0.2, energy: 0.3 },
        'energetic': { energy: 0.9, valence: 0.7 },
        'calm': { energy: 0.2, valence: 0.5 },
        'aggressive': { energy: 0.95, loudness: -5 },
      };

      const base = genreMultipliers[genre] || {};
      const moodBase = moodMultipliers[mood] || {};
      
      return {
        energy: Math.min(1, (base.energy || 0.5) + (moodBase.energy || 0)),
        valence: moodBase.valence || Math.random() * 0.6 + 0.2,
        danceability: base.danceability || Math.random() * 0.5 + 0.3,
        acousticness: base.acousticness || Math.random() * 0.4 + 0.1,
        instrumentalness: Math.random() * 0.8,
        liveness: Math.random() * 0.3,
        speechiness: base.speechiness || Math.random() * 0.3,
        genreConfidence: Math.random() * 0.3 + 0.7, // High confidence
        moodConfidence: Math.random() * 0.2 + 0.8, // Very high confidence
        loudness: moodBase.loudness || (Math.random() * 10 - 15), // -15 to -5 dB
        modality: Math.random() > 0.5 ? 1 : 0, // Major or minor
        timeSignature: Math.random() > 0.8 ? 3 : 4, // Mostly 4/4, some 3/4
      };
    };

    // Create comprehensive song document
    const songData = {
      userId: user._id,
      title: body.title || body.prompt?.substring(0, 50) || 'Untitled Song',
      description: body.description || body.prompt,
      genre: genre.toLowerCase(),
      mood: mood.toLowerCase(),
      duration: body.duration || 180,
      prompt: body.prompt || 'AI Generated Song',
      aiModel: body.aiModel || body.mv || 'chirp-v3-5',
      
      generationParams: {
        style: body.style || genre,
        tempo: body.tempo || generateTempo(genre),
        key: body.key || generateKey(),
        instruments: body.instruments || [],
      },
      
      files: {
        audioUrl: body.audioUrl,
        videoUrl: body.videoUrl, // Now capturing video URL
        thumbnailUrl: body.imageUrl,
        fileFormats: {
          audio: getFileFormat(body.audioUrl),
          video: getFileFormat(body.videoUrl),
          thumbnail: getFileFormat(body.imageUrl),
        },
        // File sizes will be populated later if needed
        fileSizes: {
          audio: body.audioFileSize,
          video: body.videoFileSize,
          thumbnail: body.thumbnailFileSize,
        },
        quality: {
          audioBitrate: body.audioBitrate || 128, // Default 128kbps
          videoResolution: body.videoResolution,
          thumbnailDimensions: {
            width: body.thumbnailWidth,
            height: body.thumbnailHeight,
          },
        },
      },
      
      status: body.status || 'generating',
      tags: body.tags ? body.tags.split(',').map((t: string) => t.trim()) : [],
      
      // Enhanced metadata from API
      taskId: body.taskId,
      clipId: body.clipId || body.clip_id, // Suno clip ID
      lyrics: body.lyrics, // Separate lyrics field
      originalCreatedAt: body.created_at ? new Date(body.created_at) : null,
      generationTime: body.generationTime,
      
      // Generation analytics (will be populated by polling logic)
      generationAnalytics: {
        pollingAttempts: body.pollingAttempts,
        totalWaitTime: body.totalWaitTime,
        apiResponseCode: body.apiResponseCode,
        apiResponseTime: body.apiResponseTime,
      },
      
      // Music analysis (enhanced with realistic values)
      musicAnalysis: generateMusicAnalysis(genre, mood),
    };

    console.log('📄 Normalized song data:', JSON.stringify(songData, null, 2));

    // Create and save the song
    console.log('💾 Creating new song document...');
    const song = new Song(songData);
    
    console.log('💾 Saving song to database...');
    const savedSong = await song.save();
    console.log('✅ Song saved successfully with ID:', savedSong._id);

    // Update user's song count and usage
    console.log('👤 Updating user statistics...');
    user.usage.songsGenerated += 1;
    user.usage.creditsUsed += 1;
    await user.save();
    console.log('✅ User statistics updated');

    const endTime = Date.now();
    console.log('💾 =========================');
    console.log('💾 SONG CREATION SUCCESS');
    console.log('💾 Duration:', endTime - startTime, 'ms');
    console.log('💾 Song ID:', savedSong._id);
    console.log('💾 =========================\n');

    return NextResponse.json({ 
      success: true,
      songId: savedSong._id,
      message: 'Song created successfully'
    });
    
  } catch (error: any) {
    const endTime = Date.now();
    console.error('💾 =========================');
    console.error('💾 SONG CREATION FAILED');
    console.error('💾 Duration:', endTime - startTime, 'ms');
    console.error('💾 Error:', error);
    console.error('💾 Error message:', error?.message);
    console.error('💾 Error stack:', error?.stack);
    
    // Check for validation errors
    if (error?.name === 'ValidationError') {
      console.error('💾 Validation errors:', error?.errors);
    }
    
    console.error('💾 =========================\n');
    
    return NextResponse.json({ 
      error: 'Failed to create song',
      details: error.message,
      errorType: error.name || 'UnknownError'
    }, { status: 500 });
  }
}
