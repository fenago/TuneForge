import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: 'TuneForge <onboarding@resend.dev>',
      to: [email],
      subject: 'TuneForge Email Test - Success! 🎵',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #6366f1; margin: 0;">🎵 TuneForge</h1>
          </div>
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
            <h2 style="margin: 0 0 10px 0;">Email Test Successful!</h2>
            <p style="margin: 0; opacity: 0.9;">Your Resend integration is working perfectly.</p>
          </div>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1e293b; margin-top: 0;">✅ What this means:</h3>
            <ul style="color: #475569; line-height: 1.6;">
              <li>Resend API key is configured correctly</li>
              <li>Email sending functionality is operational</li>
              <li>Magic links are ready to work</li>
              <li>User authentication emails will be delivered</li>
            </ul>
          </div>
          
          <div style="text-align: center; padding: 20px 0;">
            <p style="color: #64748b; margin: 0;">
              Ready to create amazing music with TuneForge? 
              <br>
              <strong>Your authentication system is fully operational!</strong>
            </p>
          </div>
          
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
            <p style="color: #94a3b8; font-size: 14px; margin: 0;">
              This is a test email from TuneForge • Sent via Resend
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email', details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully!',
      emailId: data?.id,
    });

  } catch (error) {
    console.error('Email test error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}
