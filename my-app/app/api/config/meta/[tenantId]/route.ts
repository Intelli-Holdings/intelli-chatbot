import { NextRequest, NextResponse } from 'next/server';
import { env } from '../../../../../env.mjs';

export async function GET(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const { tenantId } = params;

    // In a real application, you would query your database here
    // For now, we'll return the environment variables as a fallback
    
    // This is where you would implement tenant-specific config retrieval
    // Example:
    // const config = await db.query('SELECT * FROM tenant_meta_configs WHERE tenant_id = ?', [tenantId]);
    
    // For development/demo purposes, return environment config
    if (env.NEXT_PUBLIC_FACEBOOK_APP_ID) {
      return NextResponse.json({
        appId: env.NEXT_PUBLIC_FACEBOOK_APP_ID,
        appSecret: env.NEXT_PUBLIC_FACEBOOK_APP_SECRET,
        // Note: For production, access tokens and WABA IDs should be stored securely per tenant
        // These values should come from your database based on the tenantId
        accessToken: '', // This should be fetched from your backend/database
        whatsappBusinessAccountId: '', // This should be fetched from your backend/database
      });
    }

    return NextResponse.json(
      { error: 'Meta configuration not found for this tenant' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error fetching Meta config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
