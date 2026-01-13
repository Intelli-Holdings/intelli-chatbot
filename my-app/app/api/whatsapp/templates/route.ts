// app/api/whatsapp/templates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://dev-backend-intelliconcierge.onrender.com';

const TEMPLATE_FILTER_KEYS = [
  'search',
  'template_type',
  'language',
  'category',
  'is_active',
  'status',
];

const buildHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
});

const parseResponse = async (response: Response) => {
  const rawText = await response.text();
  if (!rawText) return {};
  try {
    return JSON.parse(rawText);
  } catch {
    return { detail: rawText };
  }
};

export async function GET(request: NextRequest) {
  try {
    const { userId, getToken } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId =
      searchParams.get('organizationId') || searchParams.get('organization');
    const sync = searchParams.get('sync') === 'true';
    const appserviceId =
      searchParams.get('appserviceId') || searchParams.get('appservice_id');
    const appservicePhoneNumber =
      searchParams.get('appservicePhoneNumber') ||
      searchParams.get('appservice_phone_number');

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    const token = await getToken();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (sync) {
      const syncResponse = await fetch(
        `${API_BASE_URL}/broadcast/whatsapp/templates/sync_from_meta/`,
        {
          method: 'POST',
          headers: buildHeaders(token),
          body: JSON.stringify({
            organization: organizationId,
            appservice_id: appserviceId,
            appservice_phone_number: appservicePhoneNumber,
          }),
        }
      );

      const syncData = await parseResponse(syncResponse);
      if (!syncResponse.ok) {
        const message =
          syncData.error ||
          syncData.detail ||
          syncData.message ||
          'Failed to sync templates';
        return NextResponse.json(
          { error: message, raw: syncData },
          { status: syncResponse.status }
        );
      }
    }

    const listUrl = new URL(`${API_BASE_URL}/broadcast/whatsapp/templates/`);
    listUrl.searchParams.set('organization', organizationId);
    TEMPLATE_FILTER_KEYS.forEach((key) => {
      const value = searchParams.get(key);
      if (value) {
        listUrl.searchParams.set(key, value);
      }
    });

    const response = await fetch(listUrl.toString(), {
      method: 'GET',
      headers: buildHeaders(token),
    });

    const data = await parseResponse(response);

    if (!response.ok) {
      const message =
        data.error ||
        data.detail ||
        data.message ||
        'Failed to fetch templates';
      return NextResponse.json(
        { error: message, raw: data },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching WhatsApp templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, getToken } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = await getToken();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const organizationId = body.organizationId || body.organization;
    const templateData = body.templateData || body.template_data;

    if (!organizationId || !templateData) {
      return NextResponse.json(
        { error: 'organizationId and templateData are required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/broadcast/whatsapp/templates/create_on_meta/`,
      {
        method: 'POST',
        headers: buildHeaders(token),
        body: JSON.stringify({
          organization: organizationId,
          template_data: templateData,
          appservice_id: body.appserviceId || body.appservice_id,
          appservice_phone_number:
            body.appservicePhoneNumber || body.appservice_phone_number,
          description: body.description,
        }),
      }
    );

    const data = await parseResponse(response);

    if (!response.ok) {
      const message =
        data.error ||
        data.detail ||
        data.message ||
        'Failed to create template';
      return NextResponse.json(
        { error: message, raw: data },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, getToken } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = await getToken();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const organizationId = body.organizationId || body.organization;
    const templateId = body.templateId || body.id;
    const templateData = body.templateData || body.template_data;

    if (!organizationId || !templateId || !templateData) {
      return NextResponse.json(
        { error: 'organizationId, templateId, and templateData are required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/broadcast/whatsapp/templates/${templateId}/update_on_meta/`,
      {
        method: 'POST',
        headers: buildHeaders(token),
        body: JSON.stringify({
          organization: organizationId,
          template_data: templateData,
          appservice_id: body.appserviceId || body.appservice_id,
          appservice_phone_number:
            body.appservicePhoneNumber || body.appservice_phone_number,
        }),
      }
    );

    const data = await parseResponse(response);

    if (!response.ok) {
      const message =
        data.error ||
        data.detail ||
        data.message ||
        'Failed to update template';
      return NextResponse.json(
        { error: message, raw: data },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId, getToken } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = await getToken();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const organizationId = body.organizationId || body.organization;
    const templateId = body.templateId || body.id;

    if (!organizationId || !templateId) {
      return NextResponse.json(
        { error: 'organizationId and templateId are required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/broadcast/whatsapp/templates/${templateId}/delete_on_meta/`,
      {
        method: 'POST',
        headers: buildHeaders(token),
        body: JSON.stringify({
          organization: organizationId,
          appservice_id: body.appserviceId || body.appservice_id,
          appservice_phone_number:
            body.appservicePhoneNumber || body.appservice_phone_number,
        }),
      }
    );

    const data = await parseResponse(response);

    if (!response.ok) {
      const message =
        data.error ||
        data.detail ||
        data.message ||
        'Failed to delete template';
      return NextResponse.json(
        { error: message, raw: data },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
