# Instagram Messaging Integration Guide

This guide covers the complete Instagram messaging integration setup using both **Instagram Login** (direct) and **Facebook Login** (via Facebook Pages) methods.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Variables](#environment-variables)
4. [Authentication Methods](#authentication-methods)
5. [API Endpoints](#api-endpoints)
6. [Webhook Setup](#webhook-setup)
7. [Usage](#usage)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The Instagram integration supports two authentication methods:

### Method 1: Instagram Login (Direct)
- For Instagram Business or Creator accounts
- No Facebook Page required
- Uses Instagram Graph API directly
- Supports messaging, publishing, comments, and insights
- **Recommended for standalone Instagram accounts**

### Method 2: Facebook Login (via Facebook Page)
- For Instagram Professional accounts linked to a Facebook Page
- Uses Facebook Graph API
- Requires Page Admin access
- Full Instagram API access through Facebook
- **Required for advanced features like ads and tagging**

---

## Prerequisites

### For Instagram Login (Method 1):
1. **Instagram Business or Creator Account**
   - Your Instagram account must be converted to a Business or Creator account
   - Go to Settings → Account → Switch to Professional Account

2. **Instagram App Configuration**
   - Create a Facebook App at [developers.facebook.com](https://developers.facebook.com)
   - Add "Instagram Graph API" product
   - Configure Instagram Login settings
   - Add required permissions: `instagram_business_basic`, `instagram_business_manage_messages`, `instagram_business_manage_comments`, `instagram_business_content_publish`

3. **Webhook Configuration**
   - Set up webhook endpoint: `https://your-domain.com/api/webhooks/instagram`
   - Subscribe to `messages`, `messaging_postbacks`, `message_reads`, `message_deliveries` fields

### For Facebook Login (Method 2):
1. **Instagram Professional Account linked to Facebook Page**
   - Connect your Instagram account to a Facebook Page
   - Ensure you're the Page admin

2. **Facebook App Configuration**
   - Create a Facebook App
   - Add "Messenger" and "Instagram" products
   - Configure permissions: `pages_messaging`, `pages_show_list`, `manage_pages`, `instagram_business_basic`, `instagram_business_manage_messages`

---

## Environment Variables

Add these variables to your `.env.local` file:

```bash
# Instagram App Credentials
NEXT_PUBLIC_INSTAGRAM_APP_ID=your_instagram_app_id
NEXT_PUBLIC_INSTAGRAM_APP_SECRET=your_instagram_app_secret

# Instagram OAuth Redirect URI
NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI=https://your-domain.com/instagram-redirect

# Webhook Configuration
META_WEBHOOK_VERIFY_TOKEN=your_secure_random_token

# App Secret for Webhook Verification
INSTAGRAM_APP_SECRET=your_instagram_app_secret

# Facebook credentials (for Method 2)
NEXT_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id
NEXT_PUBLIC_FACEBOOK_APP_SECRET=your_facebook_app_secret
```

---

## Authentication Methods

### Method 1: Instagram Login Flow

1. **User clicks "Login with Instagram"**
   ```typescript
   // Initiates OAuth flow to Instagram
   https://api.instagram.com/oauth/authorize?
     client_id={INSTAGRAM_APP_ID}&
     redirect_uri={REDIRECT_URI}&
     response_type=code&
     scope=instagram_business_basic,instagram_business_manage_messages,...
   ```

2. **Instagram redirects to callback**
   - User redirected to: `https://your-domain.com/instagram-redirect?code=xxx`
   - Callback page extracts code and redirects to channels page

3. **Exchange code for access token**
   - Frontend calls `/api/instagram/exchange-token`
   - Backend exchanges code for short-lived token
   - Automatically exchanges short-lived for long-lived token (60 days)

4. **Fetch user info**
   - Call `/api/instagram/user-info` with access token
   - Retrieve Instagram Business Account ID and username

5. **Create channel package**
   - Call `/api/channels/create` with:
     ```json
     {
       "choice": "instagram",
       "data": {
         "instagram_business_account_id": "xxx",
         "access_token": "long_lived_token",
         "user_id": "xxx",
         "username": "xxx"
       },
       "organization_id": "xxx"
     }
     ```

### Method 2: Facebook Login Flow

1. **User clicks "Login with Facebook"**
   - Uses Facebook SDK to initiate OAuth
   - Requests Instagram-related permissions

2. **Exchange code for access token**
   - Call `/api/facebook/exchange-token`

3. **Fetch Facebook Pages**
   - Call Graph API: `/me/accounts?fields=id,name,access_token,instagram_business_account`
   - User selects a Page with connected Instagram account

4. **Create channel package**
   - Call `/api/channels/create` with Page and Instagram details

---

## API Endpoints

### `/api/instagram/exchange-token` (POST)

Exchange Instagram OAuth authorization code for access token.

**Request:**
```json
{
  "code": "authorization_code_from_instagram"
}
```

**Response:**
```json
{
  "access_token": "long_lived_access_token",
  "user_id": "instagram_user_id",
  "token_type": "long-lived",
  "expires_in": 5184000
}
```

### `/api/instagram/user-info` (POST)

Fetch Instagram user information and business account details.

**Request:**
```json
{
  "access_token": "user_access_token",
  "user_id": "optional_user_id"
}
```

**Response:**
```json
{
  "user_id": "17841465781405825",
  "username": "your_business_account",
  "account_type": "BUSINESS",
  "instagram_business_account_id": "17841465781405825"
}
```

### `/api/instagram/callback` (GET)

OAuth callback handler that processes Instagram's authorization response.

---

## Webhook Setup

### 1. Configure Webhook in Meta Developer Dashboard

1. Go to your app's dashboard
2. Navigate to "Instagram" → "Configuration"
3. Add webhook callback URL: `https://your-domain.com/api/webhooks/instagram`
4. Set verify token (same as `META_WEBHOOK_VERIFY_TOKEN` in env)
5. Subscribe to these fields:
   - `messages`
   - `messaging_postbacks`
   - `message_reads`
   - `message_deliveries`

### 2. Webhook Events

The webhook handler (`/api/webhooks/instagram/route.ts`) processes these events:

- **Incoming Messages**: `event.message`
- **Postbacks**: `event.postback`
- **Read Receipts**: `event.read`
- **Delivery Receipts**: `event.delivery`
- **Story Mentions**: `change.field === "story_insights"`
- **Comments**: `change.field === "comments"`

### 3. Webhook Verification

Instagram will send a GET request to verify your webhook:

```
GET /api/webhooks/instagram?
  hub.mode=subscribe&
  hub.verify_token=your_verify_token&
  hub.challenge=random_string
```

Your endpoint must return the `hub.challenge` value.

---

## Usage

### Frontend Integration

```tsx
import InstagramOnboarding from "@/components/InstagramOnboarding"

export default function ChannelsPage() {
  return <InstagramOnboarding />
}
```

The component provides:
- Toggle between Instagram Login and Facebook Login
- Step-by-step onboarding flow
- Error handling and status messages
- Automatic token exchange and channel creation

### Sending Messages

Use the Instagram Graph API to send messages:

```bash
curl -X POST \
  'https://graph.instagram.com/v21.0/me/messages' \
  -H 'Authorization: Bearer {ACCESS_TOKEN}' \
  -H 'Content-Type: application/json' \
  -d '{
    "recipient": {"id": "recipient_instagram_id"},
    "message": {"text": "Hello from your app!"}
  }'
```

---

## Troubleshooting

### Common Issues

#### 1. "No Instagram Business Account linked"
- **Solution**: Convert your Instagram account to a Business or Creator account in the Instagram app settings

#### 2. "Invalid OAuth redirect URI"
- **Solution**: Ensure the redirect URI in your app settings exactly matches `NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI`
- Check for trailing slashes and protocol (http vs https)

#### 3. "Token exchange failed"
- **Solution**: Verify `NEXT_PUBLIC_INSTAGRAM_APP_SECRET` is correct
- Ensure the authorization code hasn't expired (valid for ~60 seconds)

#### 4. "Webhook verification failed"
- **Solution**: Check that `META_WEBHOOK_VERIFY_TOKEN` matches the token in your app settings
- Ensure your webhook endpoint is publicly accessible

#### 5. "Invalid signature" on webhook
- **Solution**: Verify `INSTAGRAM_APP_SECRET` matches your app's secret
- Check that you're using the correct signature header (`x-hub-signature-256`)

### Debug Mode

Enable debug mode in the component by clicking "Show Debug" to see:
- Raw API responses
- Token details
- Flow state information
- Error messages

---

## Additional Resources

- [Instagram Graph API Documentation](https://developers.facebook.com/docs/instagram-api)
- [Instagram Basic Display API](https://developers.facebook.com/docs/instagram-basic-display-api)
- [Instagram Messaging API](https://developers.facebook.com/docs/messenger-platform/instagram)
- [Webhook Reference](https://developers.facebook.com/docs/graph-api/webhooks)

---
