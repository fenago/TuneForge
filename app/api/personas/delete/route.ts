import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import connectMongo from '@/libs/mongoose';
import Persona from '@/models/Persona';
import User from '@/models/User';

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { personaId } = body;

    if (!personaId) {
      return NextResponse.json({ 
        error: 'Persona ID is required' 
      }, { status: 400 });
    }

    await connectMongo();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find and verify ownership
    const persona = await Persona.findOne({ 
      _id: personaId, 
      userId: user._id 
    });

    if (!persona) {
      return NextResponse.json({ 
        error: 'Persona not found or access denied' 
      }, { status: 404 });
    }

    // Delete the persona
    await Persona.findByIdAndDelete(personaId);

    console.log(`🎭 Persona deleted: ${persona.name} (${personaId})`);

    return NextResponse.json({
      success: true,
      message: 'Persona deleted successfully'
    });

  } catch (error) {
    console.error('Persona deletion error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete persona',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
