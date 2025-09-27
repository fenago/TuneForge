import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('\n⏰ Polling trigger called');
  console.log('⏰ Origin:', request.nextUrl.origin);
  
  try {
    // Call the background polling endpoint
    const origin = request.nextUrl.origin;
    console.log('⏰ Calling:', `${origin}/api/music/poll-pending`);
    
    const pollResponse = await fetch(`${origin}/api/music/poll-pending`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('⏰ Poll response status:', pollResponse.status);
    console.log('⏰ Poll response headers:', Object.fromEntries(pollResponse.headers.entries()));

    if (!pollResponse.ok) {
      const errorText = await pollResponse.text();
      console.error('⏰ Polling response error:', errorText);
      throw new Error(`Polling failed: ${pollResponse.status} - ${errorText}`);
    }

    // Handle potential JSON parse errors
    let result;
    try {
      const responseText = await pollResponse.text();
      console.log('⏰ Raw polling response:', responseText);
      
      if (!responseText.trim()) {
        throw new Error('Empty response from polling endpoint');
      }
      
      result = JSON.parse(responseText);
      console.log('⏰ Polling trigger result:', result);
    } catch (jsonError) {
      console.error('⏰ JSON parse error:', jsonError);
      throw new Error(`Failed to parse polling response: ${jsonError instanceof Error ? jsonError.message : 'Unknown JSON error'}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Polling trigger executed',
      ...result
    });

  } catch (error) {
    console.error('⏰ Polling trigger error:', error);
    return NextResponse.json({ 
      error: 'Polling trigger failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Also allow POST method for flexibility
export async function POST(request: NextRequest) {
  return GET(request);
}
