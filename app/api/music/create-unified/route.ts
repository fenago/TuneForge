/**
 * UNIFIED MUSIC CREATION API
 * 
 * Creates music using the unified metadata tracking system
 * Supports both SunoAPI.com and SunoAPI.org with consistent metadata
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Song from "@/models/Song";
import connectMongo from "@/libs/mongoose";
import { createUnifiedMusic, getUnifiedTaskStatus } from "@/lib/unified-ai-music-api";
import { validateUnifiedMetadata, generateMetadataReport } from "@/lib/metadata-validator";
import { createMetadataLog } from "@/lib/metadata-mappers";
import { UnifiedSongMetadata, APIProvider } from "@/types/unified-song";
import { authOptions } from "@/libs/next-auth";

export async function POST(req: NextRequest) {
  console.log('\n🎵 =========================');
  console.log('🎵 UNIFIED API ENDPOINT: Music creation started');
  console.log('🎵 =========================');
  
  try {
    // Authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    console.log('🎵 User ID:', userId);

    // Parse request
    const body = await req.json();
    const {
      prompt,
      title,
      tags,
      mv = "chirp-v3-5",
      custom_mode = true,
      is_instrumental = false,
      preferred_provider,
      persona_id,
      wait_for_completion = false
    } = body;

    console.log('🎵 Request data:');
    console.log('   - Prompt:', prompt?.substring(0, 100) + '...');
    console.log('   - Title:', title);
    console.log('   - Model:', mv);
    console.log('   - Preferred Provider:', preferred_provider);
    console.log('   - Wait for completion:', wait_for_completion);

    // Validation
    if (!prompt || !title || !tags) {
      return NextResponse.json(
        { error: "Missing required fields: prompt, title, tags" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectMongo();

    // Create music request
    const musicRequest = {
      task_type: (persona_id ? 'persona_music' : 'create_music') as 'persona_music' | 'create_music',
      custom_mode,
      prompt: prompt.trim(),
      title: title?.trim(),
      tags: tags.trim(),
      mv,
      is_instrumental,
      preferred_provider: preferred_provider as APIProvider,
      persona_id
    };

    console.log('🎵 Initiating music creation...');
    
    // Create music using unified API
    const createResponse = await createUnifiedMusic(musicRequest, userId);
    
    if (!createResponse.success) {
      console.error('❌ Music creation failed:', createResponse.message);
      return NextResponse.json(
        { error: createResponse.message },
        { status: 500 }
      );
    }

    console.log('✅ Music creation initiated successfully');
    console.log('✅ Task ID:', createResponse.task_id);
    console.log('✅ Provider:', createResponse.provider);

    // Create initial database record with unified metadata
    const initialMetadata: Partial<UnifiedSongMetadata> = {
      id: createResponse.task_id, // Temporary, will be updated with actual song ID
      title: title.trim(),
      user_id: userId,
      created_at: new Date(),
      
      // API tracking
      api_provider: createResponse.provider,
      api_task_id: createResponse.task_id,
      
      // Generation details
      prompt: prompt.trim(),
      tags: tags.trim(),
      lyrics: '',
      is_instrumental,
      
      // Technical details
      model_version: mv,
      duration: 0,
      audio_url: '',
      
      // Processing status
      status: 'pending',
      generation_start_time: new Date(),
      
      // Advanced features
      persona_id,
      is_variation: false,
      
      // Defaults
      is_featured: false,
      is_public: false,
      play_count: 0,
      download_count: 0,
      share_count: 0,
      generation_cost: createResponse.provider === 'sunoapi_com' ? 10 : 8,
    };

    // Validate initial metadata
    const validation = validateUnifiedMetadata(initialMetadata, createResponse.provider);
    initialMetadata.metadata_coverage_score = validation.coverage_score;
    initialMetadata.last_metadata_update = new Date();

    // Log metadata creation
    console.log(createMetadataLog(
      initialMetadata as UnifiedSongMetadata, 
      'creation', 
      createResponse.provider, 
      validation
    ));

    // Save to database with new unified fields
    const songDocument = new Song({
      userId,
      title: title.trim(),
      prompt: prompt.trim(),
      tags: tags.trim().split(',').map((t: string) => t.trim()),
      aiModel: mv,
      status: 'pending',
      
      // Unified metadata fields
      apiProvider: createResponse.provider,
      apiTaskId: createResponse.task_id,
      isInstrumental: is_instrumental,
      generationCost: initialMetadata.generation_cost,
      metadataCoverageScore: validation.coverage_score,
      lastMetadataUpdate: new Date(),
      generationStartTime: new Date(),
      
      // Legacy fields for compatibility
      taskId: createResponse.task_id,
      
      // Default values
      playCount: 0,
      downloadCount: 0,
      shareCount: 0,
      isPublic: false,
      isFeatured: false,
      isVariation: false,
    });

    if (persona_id) {
    }

    const savedSong = await songDocument.save();
    console.log('💾 Song saved to database:', savedSong._id);

    // If wait_for_completion is true, poll
    // For now, don't poll - just return the task ID
    console.log('⏳ Song generation initiated, polling disabled for now');
    // Return success response for async generation
    return NextResponse.json({
      success: true,
      message: "Music generation started successfully",
      task_id: createResponse.task_id,
      song_id: savedSong._id,
      provider: createResponse.provider,
      estimated_wait_time: createResponse.estimated_wait_time,
      metadata_coverage: validation.coverage_score,
      validation_issues: validation.warnings,
      database_id: savedSong._id
    });

  } catch (error) {
    console.error('❌ UNIFIED API: Fatal error:', error);
    
    return NextResponse.json(
      { 
        error: "Failed to create music", 
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for checking song status with unified metadata
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const taskId = url.searchParams.get('task_id');
    const songId = url.searchParams.get('song_id');

    if (!taskId && !songId) {
      return NextResponse.json(
        { error: "task_id or song_id required" },
        { status: 400 }
      );
    }

    await connectMongo();

    let song;
    if (songId) {
      song = await Song.findById(songId).lean();
    } else {
      song = await Song.findOne({ 
        $or: [
          { apiTaskId: taskId },
          { taskId: taskId } // Legacy support
        ]
      }).lean();
    }

    if (!song) {
      return NextResponse.json(
        { error: "Song not found" },
        { status: 404 }
      );
    }

    // Validate current metadata
    const validation = validateUnifiedMetadata(song as any, (song as any).apiProvider || 'sunoapi_com');
    
    return NextResponse.json({
      success: true,
      song: song,
      metadata: {
        provider: (song as any).apiProvider,
        coverage_score: (song as any).metadataCoverageScore || validation.coverage_score,
        validation: validation,
        last_updated: (song as any).lastMetadataUpdate,
      }
    });

  } catch (error) {
    console.error('❌ GET endpoint error:', error);
    return NextResponse.json(
      { error: "Failed to get song status" },
      { status: 500 }
    );
  }
}
