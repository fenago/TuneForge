import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get API key
    const sunoApiKey = process.env.SUNOAPI_KEY;
    if (!sunoApiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    // Make the API call to get credits
    const response = await fetch('https://api.sunoapi.com/api/v1/get-credits', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sunoApiKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Suno API error:', errorText);
      return NextResponse.json({ 
        error: 'Failed to get credits', 
        details: errorText 
      }, { status: response.status });
    }

    const result = await response.json();
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Credits error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
