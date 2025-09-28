import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import connectMongo from '@/libs/mongoose';
import Persona from '@/models/Persona';
import User from '@/models/User';

export async function GET(request: NextRequest) {
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

    // Get user's personas with proper sorting
    const personas = await Persona.find({ userId: user._id })
      .sort({ isFavorite: -1, lastUsedAt: -1, createdAt: -1 })
      .select('-__v')
      .lean();

    // Transform for frontend
    const transformedPersonas = personas.map(persona => ({
      id: persona._id,
      name: persona.name,
      description: persona.description,
      personaId: persona.personaId,
      voiceType: persona.voiceType,
      characteristics: persona.characteristics || [],
      sourceSongTitle: persona.sourceSongTitle,
      status: persona.status,
      usageCount: persona.usageCount || 0,
      isFavorite: persona.isFavorite || false,
      lastUsedAt: persona.lastUsedAt,
      createdAt: persona.createdAt,
      displayName: `${persona.name}${persona.usageCount > 0 ? ` (${persona.usageCount} songs)` : ' (New)'}`
    }));

    return NextResponse.json({
      success: true,
      personas: transformedPersonas,
      total: transformedPersonas.length
    });

  } catch (error) {
    console.error('Personas list error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch personas',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
