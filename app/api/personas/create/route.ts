import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import connectMongo from '@/libs/mongoose';
import Persona from '@/models/Persona';
import Song from '@/models/Song';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  console.log('\n🎭 =========================');
  console.log('🎭 PERSONA CREATION START');
  console.log('🎭 =========================');

  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { name, description, sourceClipId, sourceSongTitle } = body;

    // Validate inputs
    if (!name || !description || !sourceClipId) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, description, sourceClipId' 
      }, { status: 400 });
    }

    if (name.length > 50) {
      return NextResponse.json({ 
        error: 'Persona name must be 50 characters or less' 
      }, { status: 400 });
    }

    if (description.length > 200) {
      return NextResponse.json({ 
        error: 'Description must be 200 characters or less' 
      }, { status: 400 });
    }

    await connectMongo();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify the source clip belongs to the user
    const sourceSong = await Song.findOne({ 
      userId: user._id, 
      clipId: sourceClipId 
    });

    if (!sourceSong) {
      return NextResponse.json({ 
        error: 'Source song not found or does not belong to you' 
      }, { status: 404 });
    }

    // Check if user already has a persona with this name
    const existingPersona = await Persona.findOne({ 
      userId: user._id, 
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });

    if (existingPersona) {
      return NextResponse.json({ 
        error: 'You already have a persona with this name' 
      }, { status: 409 });
    }

    // Call Suno API to create persona
    const sunoApiKey = process.env.SUNOAPI_KEY;
    if (!sunoApiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    console.log('🎭 Creating persona with Suno API...');
    console.log('🎭 Name:', name);
    console.log('🎭 Description:', description);
    console.log('🎭 Source Clip:', sourceClipId);

    const personaRequest = {
      name: name.trim(),
      description: description.trim(),
      continue_clip_id: sourceClipId
    };

    const sunoResponse = await fetch('https://api.sunoapi.com/api/v1/suno/persona', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sunoApiKey}`,
      },
      body: JSON.stringify(personaRequest),
    });

    if (!sunoResponse.ok) {
      const errorText = await sunoResponse.text();
      console.error('🎭 Suno persona creation failed:', errorText);
      return NextResponse.json({ 
        error: 'Failed to create persona with Suno API', 
        details: errorText 
      }, { status: sunoResponse.status });
    }

    const sunoResult = await sunoResponse.json();
    console.log('🎭 Suno persona created:', sunoResult);

    // Save persona to database
    const newPersona = new Persona({
      userId: user._id,
      name: name.trim(),
      description: description.trim(),
      personaId: sunoResult.persona_id,
      sourceClipId,
      sourceSongTitle: sourceSongTitle || sourceSong.title,
      status: 'ready'
    });

    // Extract characteristics
    newPersona.extractCharacteristics();
    
    const savedPersona = await newPersona.save();

    console.log('🎭 Persona saved to database:', savedPersona._id);
    console.log('🎭 =========================');
    console.log('🎭 PERSONA CREATION SUCCESS');
    console.log('🎭 =========================\n');

    return NextResponse.json({
      success: true,
      message: 'Persona created successfully',
      persona: {
        id: savedPersona._id,
        name: savedPersona.name,
        description: savedPersona.description,
        personaId: savedPersona.personaId,
        voiceType: savedPersona.voiceType,
        characteristics: savedPersona.characteristics,
        sourceSongTitle: savedPersona.sourceSongTitle,
        createdAt: savedPersona.createdAt
      }
    });

  } catch (error) {
    console.error('🎭 Persona creation error:', error);
    return NextResponse.json({ 
      error: 'Failed to create persona',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
