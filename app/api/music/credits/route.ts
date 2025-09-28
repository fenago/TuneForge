import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/libs/next-auth'

export async function GET(request: NextRequest) {
  console.log('\n');
  console.log('CREDITS API REQUEST START');
  console.log('==========================');

  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.log('No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Session found for:', session.user.email);

    // Get both API keys
    const sunoComApiKey = process.env.SUNOAPI_KEY; // SunoAPI.com key
    const sunoOrgApiKey = process.env.SUNOAPIORG_KEY; // SunoAPI.org key
    
    console.log('SunAPI.com key:', sunoComApiKey ? `${sunoComApiKey.substring(0, 15)}...` : 'NOT FOUND')
    console.log('SunAPI.org key:', sunoOrgApiKey ? `${sunoOrgApiKey.substring(0, 15)}...` : 'NOT FOUND')

    const results: any = {
      sunoapi_com: { error: 'API key not configured' },
      sunoapi_org: { error: 'API key not configured' }
    }

    // Fetch credits from SunoAPI.com
    if (sunoComApiKey) {
      console.log('Fetching from SunoAPI.com: https://api.sunoapi.com/api/v1/get-credits');
      try {
        const comResponse = await fetch('https://api.sunoapi.com/api/v1/get-credits', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${sunoComApiKey}`,
            'Content-Type': 'application/json'
          },
        });

        if (comResponse.ok) {
          const comData = await comResponse.json();
          console.log('SunAPI.com Response:', JSON.stringify(comData, null, 2));
          
          results.sunoapi_com = {
            success: true,
            credits: comData.credits || 0,
            extra_credits: comData.extra_credits || 0,
            total: (comData.credits || 0) + (comData.extra_credits || 0),
            raw_response: comData
          }
        } else {
          const errorText = await comResponse.text();
          console.error('SunAPI.com error:', comResponse.status, errorText);
          results.sunoapi_com = {
            success: false,
            error: `${comResponse.status}: ${errorText}`,
            credits: 0,
            extra_credits: 0,
            total: 0
          }
        }
      } catch (error) {
        console.error('SunAPI.com fetch error:', error);
        results.sunoapi_com = {
          success: false,
          error: error instanceof Error ? error.message : String(error),
          credits: 0,
          extra_credits: 0,
          total: 0
        }
      }
    }

    // Fetch credits from SunoAPI.org
    if (sunoOrgApiKey) {
      console.log('Fetching from SunoAPI.org: https://api.sunoapi.org/api/v1/generate/credit');
      try {
        const orgResponse = await fetch('https://api.sunoapi.org/api/v1/generate/credit', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${sunoOrgApiKey}`,
            'Content-Type': 'application/json'
          },
        });

        if (orgResponse.ok) {
          const orgData = await orgResponse.json();
          console.log('SunAPI.org Response:', JSON.stringify(orgData, null, 2));
          
          // SunoAPI.org returns { code: 200, msg: "success", data: 100 }
          if (orgData.code === 200) {
            results.sunoapi_org = {
              success: true,
              credits: orgData.data || 0,
              extra_credits: 0, // SunoAPI.org doesn't have extra_credits
              total: orgData.data || 0,
              raw_response: orgData
            }
          } else {
            results.sunoapi_org = {
              success: false,
              error: orgData.msg || 'Unknown error',
              credits: 0,
              extra_credits: 0,
              total: 0
            }
          }
        } else {
          const errorText = await orgResponse.text();
          console.error('SunAPI.org error:', orgResponse.status, errorText);
          results.sunoapi_org = {
            success: false,
            error: `${orgResponse.status}: ${errorText}`,
            credits: 0,
            extra_credits: 0,
            total: 0
          }
        }
      } catch (error) {
        console.error('SunAPI.org fetch error:', error);
        results.sunoapi_org = {
          success: false,
          error: error instanceof Error ? error.message : String(error),
          credits: 0,
          extra_credits: 0,
          total: 0
        }
      }
    }

    // Calculate grand total
    const grandTotal = results.sunoapi_com.total + results.sunoapi_org.total;
    
    console.log('FINAL CREDITS SUMMARY:');
    console.log(`   SunoAPI.com: ${results.sunoapi_com.total} credits`);
    console.log(`   SunoAPI.org: ${results.sunoapi_org.total} credits`);
    console.log(`   GRAND TOTAL: ${grandTotal} credits`);
    console.log('==========================');

    return NextResponse.json({
      success: true,
      grand_total: grandTotal,
      providers: results,
      timestamp: new Date().toISOString(),
      summary: {
        sunoapi_com_total: results.sunoapi_com.total,
        sunoapi_org_total: results.sunoapi_org.total,
        combined_total: grandTotal
      }
    });

  } catch (error) {
    console.error('Credits API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch credits',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
