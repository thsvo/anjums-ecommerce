# WhatsApp Business API Webhook Setup Guide

## Overview
This guide explains how to set up WhatsApp Business API webhooks for receiving messages and status updates.

## What You Need

### 1. Verify Token
- **What it is**: A secret string that you create to verify webhook requests
- **Current value**: `anjum685fefcf7abf8` (already set in your .env)
- **How to change**: Update `WHATSAPP_WEBHOOK_VERIFY_TOKEN` in your .env file
- **Security**: Keep this secret and don't share it publicly

### 2. Webhook URL (Callback URL)
- **What it is**: The public endpoint where WhatsApp sends events
- **Your webhook URL**: `{YOUR_DOMAIN}/api/webhooks/whatsapp`
- **Local development**: `http://localhost:3000/api/webhooks/whatsapp`
- **Production (Vercel)**: `https://your-app-name.vercel.app/api/webhooks/whatsapp`
- **Check your current URL**: Visit `/api/whatsapp/webhook-info` on your deployed site

## Setup Steps

### Step 1: Make Your Webhook Publicly Accessible

#### For Local Development (using ngrok):
1. Install ngrok: https://ngrok.com/
2. Run your Next.js app: `npm run dev`
3. In another terminal, run: `ngrok http 3000`
4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
5. Your webhook URL becomes: `https://abc123.ngrok.io/api/webhooks/whatsapp`

#### For Production:
1. Deploy your app to Vercel, Netlify, or any hosting service
2. Your webhook URL becomes: `https://yourdomain.com/api/webhooks/whatsapp`

### Step 2: Configure WhatsApp Business API

1. Go to [Facebook Developers Console](https://developers.facebook.com/)
2. Select your app
3. Navigate to **WhatsApp > Configuration**
4. In the **Webhook** section:
   - **Callback URL**: Enter your webhook URL (e.g., `https://abc123.ngrok.io/api/webhooks/whatsapp`)
   - **Verify Token**: Enter your verify token (`anjum685fefcf7abf8`)
   - Click **Verify and Save**

### Step 3: Subscribe to Webhook Events

1. In the same WhatsApp Configuration page
2. In the **Webhook fields** section, subscribe to:
   - `messages` (incoming messages)
   - `message_deliveries` (delivery receipts)
   - `message_reads` (read receipts)
   - `message_reactions` (message reactions)

### Step 4: Get Required IDs

#### Phone Number ID:
1. Go to **WhatsApp > API Setup**
2. Copy the **Phone Number ID** from the "From" dropdown
3. Update `WHATSAPP_PHONE_NUMBER_ID` in your .env

#### Business Account ID:
1. In the same page, look for **WhatsApp Business Account ID**
2. Update `WHATSAPP_BUSINESS_ACCOUNT_ID` in your .env

#### Access Token:
1. Generate or copy the **Access Token**
2. Update `WHATSAPP_ACCESS_TOKEN` in your .env

## Testing Your Webhook

### Method 1: Using the Test Endpoint
Visit: `http://localhost:3000/api/whatsapp/webhook-info`

### Method 2: Manual Test
Visit: `{YOUR_WEBHOOK_URL}?hub.mode=subscribe&hub.verify_token=anjum685fefcf7abf8&hub.challenge=test123`

Expected response: `test123`

### Method 3: Send a Test Message
1. Use WhatsApp Business API to send a message to a test number
2. Check your server logs to see webhook events

## Webhook Security (Optional)

For production, you can add webhook signature verification:
1. Generate a webhook secret in Facebook Developers Console
2. Add it to your .env as `WHATSAPP_WEBHOOK_SECRET`
3. The webhook will verify incoming requests are from WhatsApp

## Troubleshooting

### Common Issues:

1. **Webhook verification fails**
   - Check that your verify token matches exactly
   - Ensure the webhook URL is publicly accessible
   - Check server logs for errors

2. **HTTPS required**
   - WhatsApp requires HTTPS for production webhooks
   - Use ngrok for local development
   - Ensure SSL certificate is valid in production

3. **Webhook not receiving events**
   - Verify webhook fields are subscribed
   - Check that the phone number is verified
   - Ensure webhook returns 200 status code

4. **Access token issues**
   - Tokens expire, generate a new one if needed
   - Ensure proper permissions are granted

## Current Environment Variables

```env
WHATSAPP_ACCESS_TOKEN=your_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id_here
WHATSAPP_WEBHOOK_VERIFY_TOKEN=anjum685fefcf7abf8
WHATSAPP_WEBHOOK_SECRET=your_webhook_secret_here_optional
WHATSAPP_API_VERSION=v23.0
```

## What the Webhook Handles

Your webhook at `/api/webhooks/whatsapp` handles:

- **GET requests**: Webhook verification by WhatsApp
- **POST requests**: Incoming messages and status updates
- **Message types**: Text messages (can be extended for media, buttons, etc.)
- **Status updates**: Delivered, read, failed message statuses
- **Auto-replies**: Can be configured for specific keywords
- **Database logging**: Can save messages and statuses to database

## Next Steps

1. Update the placeholder values in your .env file
2. Deploy to production or use ngrok for testing
3. Configure the webhook in Facebook Developers Console
4. Test by sending messages to your WhatsApp Business number
5. Monitor server logs to see webhook events
6. Implement your business logic in the webhook handlers
