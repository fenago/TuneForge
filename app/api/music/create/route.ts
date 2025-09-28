import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import { CreateMusicRequest, validateMusicRequest } from '@/lib/ai-music-api';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('\n🎵 =========================');
  console.log('🎵 MUSIC CREATION REQUEST START');
  console.log('🎵 =========================');
  console.log('🎵 Timestamp:', new Date().toISOString());
  
  try {
    // Check authentication
    console.log('🔐 Checking authentication...');
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.log('❌ Authentication failed - no session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log('✅ Authentication success:', session.user.email);

    // Parse request body
    console.log('📥 Parsing request body...');
    const body: CreateMusicRequest = await request.json();
    console.log('📥 Raw request body:', JSON.stringify(body, null, 2));
    
    // Validate request
    console.log('🔍 Validating request...');
    const validationErrors = validateMusicRequest(body);
    if (validationErrors.length > 0) {
      console.log('❌ Validation failed:', validationErrors);
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validationErrors 
      }, { status: 400 });
    }
    console.log('✅ Validation passed');

    // Prepare the request for the AI Music API
    console.log('🔧 Preparing Suno API request...');
    
    // Transform simple prompt into structured song format
    let structuredPrompt = body.prompt;
    if (!body.prompt.includes('[Verse]') && !body.prompt.includes('[Chorus]')) {
      console.log('🔧 Converting simple prompt to structured format...');
      console.log('🔧 Original prompt:', body.prompt);
      
      // Create a proper song structure
      structuredPrompt = `[Verse 1]
${body.prompt}
Let me tell you about this story
Something that's so meaningful to me

[Chorus]
This is the moment, this is the time
Everything's falling into place
This is the rhythm, this is the rhyme
Music that puts a smile on my face

[Verse 2]
${body.prompt}
Every detail matters so much
Every feeling needs to be expressed

[Chorus]
This is the moment, this is the time
Everything's falling into place
This is the rhythm, this is the rhyme
Music that puts a smile on my face

[Bridge]
Sometimes we need to take a step back
Look at the bigger picture here
Let the melody guide us forward
Make everything crystal clear

[Chorus]
This is the moment, this is the time
Everything's falling into place
This is the rhythm, this is the rhyme
Music that puts a smile on my face`;
      
      console.log('🔧 Structured prompt created:', structuredPrompt.substring(0, 200) + '...');
    }
    
    const musicRequest: any = {
      task_type: body.persona_id ? 'persona_music' : (body.task_type || 'create_music'),
      custom_mode: body.custom_mode,
      prompt: structuredPrompt,
      title: body.title,
      tags: body.tags,
      mv: body.mv || 'chirp-v3-5'
    };

    // Add persona_id if provided
    if (body.persona_id) {
      musicRequest.persona_id = body.persona_id;
      console.log('🎭 Using persona:', body.persona_id);
    }
    console.log('🔧 Final Suno request:', JSON.stringify(musicRequest, null, 2));

    // Make the API call using Suno API
    console.log('🔑 Checking API key...');
    const sunoApiKey = process.env.SUNOAPI_KEY;
    if (!sunoApiKey) {
      console.log('❌ Suno API key not configured');
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }
    console.log('✅ Suno API key found:', sunoApiKey.substring(0, 10) + '...');

    console.log('🚀 Sending request to Suno API...');
    console.log('🚀 URL: https://api.sunoapi.com/api/v1/suno/create');
    console.log('🚀 Method: POST');
    console.log('🚀 Headers: Content-Type: application/json, Authorization: Bearer [REDACTED]');
    console.log('🚀 Body:', JSON.stringify(musicRequest, null, 2));

    const sunoStartTime = Date.now();
    const response = await fetch('https://api.sunoapi.com/api/v1/suno/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sunoApiKey}`,
      },
      body: JSON.stringify(musicRequest),
    });
    const sunoEndTime = Date.now();
    
    console.log('📡 Suno API response received');
    console.log('📡 Response time:', (sunoEndTime - sunoStartTime) + 'ms');
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Suno API error response:', errorText);
      console.error('❌ Error status:', response.status);
      console.error('❌ Error headers:', Object.fromEntries(response.headers.entries()));
      return NextResponse.json({ 
        error: 'Music generation failed', 
        details: errorText 
      }, { status: response.status });
    }

    const result = await response.json();
    console.log('✅ Suno API success response:', JSON.stringify(result, null, 2));
    
    // Save task ID to enable background completion even if user leaves
    console.log('💾 Saving task for background completion...');
    try {
      const connectMongo = (await import('@/libs/mongoose')).default;
      const User = (await import('@/models/User')).default;
      const Persona = (await import('@/models/Persona')).default;
      
      await connectMongo();
      const user = await User.findOne({ email: session.user.email });
      
      if (user && result.task_id) {
        // Store task info in user document for later retrieval
        if (!user.pendingTasks) {
          user.pendingTasks = [];
        }
        
        user.pendingTasks.push({
          taskId: result.task_id,
          prompt: body.prompt,
          title: body.title,
          tags: body.tags,
          model: body.mv,
          personaId: body.persona_id,
          createdAt: new Date()
        });
        
        await user.save();

        // Update persona usage if persona was used
        if (body.persona_id) {
          try {
            const persona = await Persona.findOne({ 
              userId: user._id, 
              personaId: body.persona_id 
            });
            if (persona) {
              await persona.recordUsage();
              console.log('🎭 Persona usage recorded:', persona.name);
            }
          } catch (personaError) {
            console.error('❌ Failed to update persona usage:', personaError);
          }
        }
        
        console.log('✅ Task saved for background completion:', result.task_id);
      }
    } catch (taskError) {
      console.error('❌ Failed to save task info:', taskError);
    }
    
    const totalTime = Date.now() - startTime;
    console.log('⏱️  Total request time:', totalTime + 'ms');
    console.log('🎵 =========================');
    console.log('🎵 MUSIC CREATION REQUEST END');
    console.log('🎵 =========================\n');
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Music creation error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
