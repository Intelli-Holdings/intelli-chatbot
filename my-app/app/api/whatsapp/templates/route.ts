// app/api/whatsapp/templates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { TemplateCreationHandler } from '@/utils/template-creator';
import { currentUser, auth } from "@clerk/nextjs/server";

// Base URL for Meta Graph API
const META_GRAPH_API_BASE = 'https://graph.facebook.com/v23.0';

interface AppService {
  id: number;
  phone_number: string;
  phone_number_id: string;
  whatsapp_business_account_id: string;
  created_at: string;
  access_token: string;
  organizationId?: string;
  name?: string;
  status?: string;
}

async function fetchAppServices(organizationId: string, token: string): Promise<AppService[]> {
  try {
    if (!organizationId) {
      throw new Error('Organization ID is required');
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://dev-backend-intelliconcierge.onrender.com';
    
    // Fetch appservices from the backend API
    const response = await fetch(`${API_BASE_URL}/appservice/org/${organizationId}/appservices/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch app services: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const services = Array.isArray(data) ? data : (data.appServices || data || []);
  
    return services;
  } catch (error) {
    console.error('Error fetching app services:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId, getToken } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const wabaId = searchParams.get('wabaId');
    const accessToken = searchParams.get('accessToken');

    // If wabaId and accessToken are provided, use them directly (backward compatibility)
    if (wabaId && accessToken) {
      const response = await fetch(
        `${META_GRAPH_API_BASE}/${wabaId}/message_templates?limit=100`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch templates: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const templates = Array.isArray(data.data) ? data.data : [];
      return NextResponse.json({ data: templates });
    }

    // If organizationId is provided, fetch app services and use the first one
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Missing required parameters: either (wabaId and accessToken) or organizationId are required' },
        { status: 400 }
      );
    }

    const token = await getToken();
    const appServices = await fetchAppServices(organizationId, token as string);
    
    if (!appServices || appServices.length === 0) {
      return NextResponse.json(
        { error: 'No WhatsApp app services found for this organization' },
        { status: 404 }
      );
    }

    // Use the first app service
    const appService = appServices[0];
    
    if (!appService.whatsapp_business_account_id || !appService.access_token) {
      return NextResponse.json(
        { error: 'App service configuration incomplete (missing WABA ID or access token)' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${META_GRAPH_API_BASE}/${appService.whatsapp_business_account_id}/message_templates?limit=100`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${appService.access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to fetch templates: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const templates = Array.isArray(data.data) ? data.data : [];
    return NextResponse.json({ data: templates });
  } catch (error) {
    console.error('Error fetching WhatsApp templates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { templateData, wabaId, accessToken } = body;

    if (!templateData || !wabaId || !accessToken) {
      return NextResponse.json(
        { error: 'Missing required fields: templateData, wabaId, and accessToken are required' },
        { status: 400 }
      );
    }

    // Validate template data using your existing TemplateCreationHandler
    let formattedTemplate;
    try {
      formattedTemplate = TemplateCreationHandler.createTemplate(templateData);
    } catch (validationError) {
      return NextResponse.json(
        { error: `Template validation failed: ${validationError instanceof Error ? validationError.message : 'Unknown error'}` },
        { status: 400 }
      );
    }

    console.log('Creating template with formatted data:', JSON.stringify(formattedTemplate, null, 2));

    // Send template creation request to Meta API with proper authorization
    const response = await fetch(
      `${META_GRAPH_API_BASE}/${wabaId}/message_templates`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedTemplate),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error('Meta template creation error:', result);
      
      // Provide more specific error messages
      let errorMessage = result.error?.message || 'Failed to create template';
      
      if (result.error?.error_subcode === 2388084) {
        errorMessage = 'Template name already exists. Please use a different name.';
      } else if (result.error?.error_user_msg) {
        errorMessage = result.error.error_user_msg;
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      templateId: result.id,
      template: result,
    });
  } catch (error) {
    console.error('Error creating template:', error);
    
    // Handle connection errors
    if (error instanceof TypeError && error.message.includes('fetch failed')) {
      return NextResponse.json(
        { error: 'Failed to connect to Meta API. Please check your network connection.' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { templateId, templateData, wabaId, accessToken } = body;

    if (!templateId || !templateData || !wabaId || !accessToken) {
      return NextResponse.json(
        { error: 'Missing required fields: templateId, templateData, wabaId, and accessToken are required' },
        { status: 400 }
      );
    }

    // Note: Meta only allows updating certain fields of a template
    // Typically, you can only update templates that are in draft/rejected status
    const updatePayload = {
      components: templateData.components,
      category: templateData.category,
    };

    const response = await fetch(
      `${META_GRAPH_API_BASE}/${templateId}`,
      {
        method: 'POST', // Meta uses POST for updates
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error('Meta template update error:', result);
      
      let errorMessage = result.error?.message || 'Failed to update template';
      
      // Provide specific error for approved templates
      if (result.error?.error_subcode === 2388103) {
        errorMessage = 'Cannot edit approved templates. You can only edit templates in REJECTED status.';
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      template: result,
    });
  } catch (error) {
    console.error('Error updating template:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch failed')) {
      return NextResponse.json(
        { error: 'Failed to connect to Meta API. Please check your network connection.' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Support both query parameters (backward compatibility) and JSON body
    const { searchParams } = new URL(request.url);
    let templateName = searchParams.get('templateName');
    let wabaId = searchParams.get('wabaId');
    let accessToken = searchParams.get('accessToken');

    // If not in query params, try to get from body
    if (!templateName || !wabaId || !accessToken) {
      try {
        const body = await request.json();
        templateName = body.name || body.templateName || templateName;
        wabaId = body.wabaId || wabaId;
        accessToken = body.accessToken || accessToken;
      } catch (e) {
        // Body parsing failed, continue with query params
      }
    }

    if (!wabaId || !accessToken || !templateName) {
      return NextResponse.json(
        { 
          error: 'Missing required parameters',
          details: 'wabaId, accessToken, and template name are required'
        },
        { status: 400 }
      );
    }

    console.log(`Deleting template: ${templateName} from WABA: ${wabaId}`);

    // Delete by name (Meta's preferred method)
    const deleteUrl = `${META_GRAPH_API_BASE}/${wabaId}/message_templates?name=${encodeURIComponent(templateName)}`;

    const response = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Meta template deletion error:', result);
      
      let errorMessage = result.error?.message || 'Failed to delete template';
      
      // Provide specific error messages
      if (result.error?.error_subcode === 2388102) {
        errorMessage = 'Template not found or already deleted.';
      } else if (result.error?.error_subcode === 2388101) {
        errorMessage = 'Cannot delete an approved template that has been sent in the last 24 hours.';
      } else if (result.error?.code === 100) {
        errorMessage = 'Invalid template name or insufficient permissions.';
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: result.error
        },
        { status: response.status }
      );
    }

    console.log(`Template ${templateName} deleted successfully:`, result);

    return NextResponse.json({
      success: true,
      message: `Template "${templateName}" deleted successfully`,
      data: result
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch failed')) {
      return NextResponse.json(
        { error: 'Failed to connect to Meta API. Please check your network connection.' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Get specific template by ID
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('templateId');
    const wabaId = searchParams.get('wabaId');
    const accessToken = searchParams.get('accessToken');

    if (!templateId || !wabaId || !accessToken) {
      return NextResponse.json(
        { error: 'Missing required parameters: templateId, wabaId, and accessToken are required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${META_GRAPH_API_BASE}/${templateId}?fields=id,name,status,category,language,components,quality_score,rejected_reason`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Meta API error:', errorData);
      return NextResponse.json(
        { error: errorData.error?.message || 'Failed to fetch template' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching template:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch failed')) {
      return NextResponse.json(
        { error: 'Failed to connect to Meta API. Please check your network connection.' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}