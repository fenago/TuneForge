/**
 * SIMPLE MUSIC CREATION API
 * 
 * Simplified endpoint for "Surprise Me" mode with minimal user input
 * Uses the unified metadata system with enhanced prompts
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { createUnifiedMusic } from "@/lib/unified-ai-music-api";
import { authOptions } from "@/libs/next-auth";
import Song from "@/models/Song";
import connectMongo from "@/libs/mongoose";

interface SimpleMusicRequest {
  mood: string;
  genre: string;
  inspiration?: string;
  surprise_mode?: boolean; // True if completely random
}

export async function POST(req: NextRequest) {
  console.log('\n✨ =========================');
  console.log('✨ SURPRISE ME API: Simple music creation started');
  console.log('✨ =========================');
  
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
    console.log('✨ User ID:', userId);

    // Parse request
    const body = await req.json();
    const { mood, genre, inspiration, surprise_mode = false } = body as SimpleMusicRequest;

    console.log('✨ Simple request:');
    console.log('   - Mood:', mood);
    console.log('   - Genre:', genre);
    console.log('   - Inspiration:', inspiration || 'none');
    console.log('   - Surprise Mode:', surprise_mode);

    // Validation
    if (!mood || !genre) {
      return NextResponse.json(
        { error: "Mood and genre are required" },
        { status: 400 }
      );
    }

    await connectMongo();

    // Generate enhanced parameters using AI logic
    const enhancedParams = generateEnhancedParams(mood, genre, inspiration, surprise_mode);
    
    console.log('✨ Enhanced parameters generated:');
    console.log('   - Title:', enhancedParams.title);
    console.log('   - Prompt:', enhancedParams.prompt.substring(0, 100) + '...');
    console.log('   - Tags:', enhancedParams.tags);
    console.log('   - Model:', enhancedParams.mv);

    // Create music using unified system
    const musicRequest = {
      task_type: 'create_music' as const,
      custom_mode: true,
      prompt: enhancedParams.prompt,
      title: enhancedParams.title,
      tags: enhancedParams.tags,
      mv: enhancedParams.mv as "chirp-v3-5" | "chirp-v4" | "chirp-v4-5" | "chirp-v4-5-plus",
      is_instrumental: enhancedParams.is_instrumental,
      preferred_provider: enhancedParams.preferred_provider as any
    };

    const createResponse = await createUnifiedMusic(musicRequest, userId);

    if (!createResponse.success) {
      console.error('❌ Simple music creation failed:', createResponse.message);
      return NextResponse.json(
        { error: createResponse.message },
        { status: 500 }
      );
    }

    console.log('✅ Simple music creation initiated successfully');
    console.log('✅ Task ID:', createResponse.task_id);
    console.log('✅ Provider:', createResponse.provider);

    // Save to database with simple mode flag
    const songDocument = new Song({
      userId,
      title: enhancedParams.title,
      prompt: enhancedParams.prompt,
      tags: enhancedParams.tags.split(',').map(t => t.trim()),
      aiModel: enhancedParams.mv,
      status: 'pending',
      genre: genre.toLowerCase(),
      mood: mood.toLowerCase(),
      
      // Unified metadata fields
      apiProvider: createResponse.provider,
      apiTaskId: createResponse.task_id,
      isInstrumental: enhancedParams.is_instrumental,
      generationCost: createResponse.provider === 'sunoapi_com' ? 10 : 8,
      metadataCoverageScore: 85, // Higher score for enhanced generation
      lastMetadataUpdate: new Date(),
      generationStartTime: new Date(),
      
      // Simple mode metadata
      description: `Generated in Surprise Me mode: ${mood} ${genre}${inspiration ? ` - ${inspiration}` : ''}`,
      
      // Legacy compatibility
      taskId: createResponse.task_id,
      
      // Defaults
      playCount: 0,
      downloadCount: 0,
      shareCount: 0,
      isPublic: false,
      isFeatured: false,
      isVariation: false,
    });

    const savedSong = await songDocument.save();
    console.log('💾 Simple song saved to database:', savedSong._id);

    return NextResponse.json({
      success: true,
      message: "Your surprise song is being created! ✨",
      task_id: createResponse.task_id,
      song_id: savedSong._id,
      provider: createResponse.provider,
      estimated_wait_time: createResponse.estimated_wait_time,
      enhanced_params: {
        title: enhancedParams.title,
        genre: genre,
        mood: mood,
        has_inspiration: !!inspiration
      },
      simple_mode: true
    });

  } catch (error) {
    console.error('❌ SURPRISE ME API: Fatal error:', error);
    
    return NextResponse.json(
      { 
        error: "Failed to create surprise song", 
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * Generates enhanced parameters from simple inputs
 */
function generateEnhancedParams(
  mood: string, 
  genre: string, 
  inspiration?: string, 
  surpriseMode: boolean = false
) {
  // Mood-based prompt enhancers
  const moodEnhancers: Record<string, string> = {
    happy: "uplifting, joyful, bright, cheerful",
    energetic: "powerful, driving, intense, dynamic",
    romantic: "heartfelt, tender, passionate, intimate", 
    calm: "peaceful, soothing, tranquil, meditative",
    sad: "melancholic, emotional, moving, reflective",
    mysterious: "enigmatic, atmospheric, dark, intriguing",
    epic: "cinematic, grand, heroic, triumphant"
  };

  // Genre-based musical elements
  const genreElements: Record<string, { instruments: string[], tempo: string, style: string }> = {
    pop: { instruments: ["vocals", "guitar", "synth", "drums"], tempo: "medium", style: "catchy, mainstream" },
    rock: { instruments: ["electric guitar", "bass", "drums", "vocals"], tempo: "medium-fast", style: "powerful, distorted" },
    "hip-hop": { instruments: ["beats", "bass", "rap vocals"], tempo: "medium", style: "rhythmic, urban" },
    electronic: { instruments: ["synthesizer", "drum machine", "digital effects"], tempo: "varied", style: "synthetic, modern" },
    jazz: { instruments: ["piano", "saxophone", "bass", "drums"], tempo: "varied", style: "improvisational, smooth" },
    classical: { instruments: ["strings", "piano", "orchestra"], tempo: "varied", style: "orchestral, elegant" },
    country: { instruments: ["acoustic guitar", "fiddle", "vocals"], tempo: "medium", style: "storytelling, authentic" },
    blues: { instruments: ["guitar", "harmonica", "vocals"], tempo: "slow-medium", style: "soulful, emotional" }
  };

  const genreInfo = genreElements[genre.toLowerCase()] || genreElements.pop;
  const moodDesc = moodEnhancers[mood.toLowerCase()] || mood;

  // Generate title
  let title: string;
  if (inspiration) {
    // Extract meaningful words from inspiration
    const cleanInspiration = inspiration
      .replace(/^(A song about|Music for|Soundtrack for|Background music for)/i, '')
      .trim();
    title = generateTitleFromInspiration(cleanInspiration, mood, genre);
  } else {
    title = generateRandomTitle(mood, genre);
  }

  // Generate comprehensive prompt
  const promptParts = [
    `Create a ${moodDesc} ${genre.toLowerCase()} song`,
    inspiration ? `about ${inspiration.toLowerCase()}` : '',
    `with ${genreInfo.instruments.slice(0, 3).join(', ')}`,
    `in a ${genreInfo.style} style`,
    `at a ${genreInfo.tempo} tempo`
  ].filter(Boolean);

  const prompt = promptParts.join(' ');

  // Generate tags
  const baseTags = [genre.toLowerCase(), mood, genreInfo.style.split(', ')[0]];
  const inspirationTags = inspiration ? extractTagsFromInspiration(inspiration) : [];
  const instrumentTags = genreInfo.instruments.slice(0, 2);
  
  const allTags = [...baseTags, ...inspirationTags, ...instrumentTags].slice(0, 8);
  const tags = allTags.join(', ');

  // Select model based on complexity
  const modelVersions = ['chirp-v3-5', 'chirp-v4', 'chirp-v4-5'];
  const mv = surpriseMode 
    ? modelVersions[Math.floor(Math.random() * modelVersions.length)]
    : 'chirp-v4'; // Default to good quality

  // Determine if instrumental
  const is_instrumental = inspiration?.toLowerCase().includes('instrumental') || 
                         inspiration?.toLowerCase().includes('background') ||
                         genre.toLowerCase() === 'classical' && Math.random() < 0.3;

  // Provider preference for simple mode
  const preferred_provider = Math.random() < 0.6 ? 'sunoapi_org' : 'sunoapi_com';

  return {
    title,
    prompt,
    tags,
    mv,
    is_instrumental,
    preferred_provider
  };
}

/**
 * Generates creative titles from inspiration
 */
function generateTitleFromInspiration(inspiration: string, mood: string, genre: string): string {
  const titleTemplates: Record<string, string[]> = {
    happy: ["Sunshine {inspiration}", "Dancing {inspiration}", "Bright {inspiration}"],
    energetic: ["Power {inspiration}", "Thunder {inspiration}", "Electric {inspiration}"],
    romantic: ["Love {inspiration}", "Heart {inspiration}", "Sweet {inspiration}"],
    calm: ["Peaceful {inspiration}", "Quiet {inspiration}", "Serene {inspiration}"]
  };

  const templates = titleTemplates[mood.toLowerCase()] || ["{inspiration}"];
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  const words = inspiration.split(' ');
  const keyWord = words.find(w => w.length > 3) || words[0] || 'Song';
  
  return template.replace('{inspiration}', keyWord.charAt(0).toUpperCase() + keyWord.slice(1));
}

/**
 * Generates random titles for surprise mode
 */
function generateRandomTitle(mood: string, genre: string): string {
  const randomTitles: Record<string, string[]> = {
    happy: ["Sunshine Boulevard", "Golden Days", "Bright Horizons", "Joyful Journey"],
    energetic: ["Thunder Strike", "Power Drive", "Electric Nights", "High Voltage"],
    romantic: ["Moonlight Serenade", "Heart's Desire", "Love's Melody", "Sweet Dreams"],
    calm: ["Peaceful Waters", "Quiet Moments", "Tranquil Dawn", "Serene Skies"]
  };

  const titles = randomTitles[mood.toLowerCase()] || ["Untitled Song"];
  return titles[Math.floor(Math.random() * titles.length)];
}

/**
 * Extracts relevant tags from inspiration text
 */
function extractTagsFromInspiration(inspiration: string): string[] {
  const tagMap: Record<string, string[]> = {
    'road trip': ['adventure', 'travel', 'freedom'],
    'video game': ['gaming', 'epic', 'action'],
    'work out': ['fitness', 'motivation', 'energy'],
    'studying': ['focus', 'ambient', 'concentration'],
    'rainy day': ['cozy', 'introspective', 'weather'],
    'friendship': ['heartwarming', 'unity', 'social'],
    'celebration': ['party', 'festive', 'joy'],
    'dreams': ['aspirational', 'hopeful', 'inspiring'],
    'love': ['romantic', 'emotional', 'heartfelt'],
    'night': ['nocturnal', 'mysterious', 'atmospheric']
  };

  const lowerInspiration = inspiration.toLowerCase();
  const foundTags: string[] = [];

  for (const [key, tags] of Object.entries(tagMap)) {
    if (lowerInspiration.includes(key)) {
      foundTags.push(...tags);
    }
  }

  return foundTags.slice(0, 3); // Limit to 3 inspiration tags
}
