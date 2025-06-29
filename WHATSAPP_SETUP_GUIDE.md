# WhatsApp Business API Integration Setup Guide

This guide will help you set up WhatsApp Business API integration for your e-commerce platform.

## Prerequisites

1. **Facebook Business Account**: You need a verified Facebook Business account
2. **Facebook Developer Account**: Access to Meta Developers platform
3. **Phone Number**: A phone number to register with WhatsApp Business API

## Step-by-Step Setup

### 1. Create Facebook App and WhatsApp Business Account

1. **Go to Meta Developers Console**
   - Visit: https://developers.facebook.com
   - Log in with your Facebook account

2. **Create a New App**
   - Click "Create App"
   - Choose "Business" as the app type
   - Fill in app details (name, email, etc.)

3. **Add WhatsApp Product**
   - In your app dashboard, click "+ Add Product"
   - Find "WhatsApp" and click "Set up"

4. **Configure WhatsApp Business Account**
   - Follow the setup wizard
   - Add your business phone number
   - Verify the phone number via SMS/call

### 2. Get API Credentials

After setup, you'll need these credentials:

#### Access Token
- Go to **App Dashboard → WhatsApp → Getting Started**
- Find "Temporary access token" (valid for 24 hours)
- For production, you'll need to generate a permanent token

#### Phone Number ID
- In **Getting Started**, look for the "From" phone number
- The ID is shown next to your phone number

#### Business Account ID
- Found in **WhatsApp → Getting Started**
- Or go to **WhatsApp Manager** and find it in settings

#### Webhook Verify Token
- You create this yourself when setting up webhooks
- Use any secure random string

### 3. Configure Environment Variables

Add these to your `.env` file:

```env
# WhatsApp Business API Configuration
WHATSAPP_ACCESS_TOKEN=your_temporary_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id_here
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token_here
WHATSAPP_API_VERSION=v18.0
```

### 4. Database Migration

The WhatsApp tables have been added to your schema. Run the migration:

```bash
npx prisma migrate dev
```

If you see permission errors, try:
```bash
npx prisma generate
```

### 5. Test the Integration

1. **Go to Admin Panel**
   - Navigate to `/admin/whatsapp`
   - Click "Setup Help" for detailed instructions

2. **Send Test Message**
   - Use the "Send Test Message" section
   - **Important**: You can only send to:
     - Verified test numbers in your Meta app
     - Numbers that have messaged your business first (24-hour window)

3. **Add Test Numbers**
   - In Meta Developers Console
   - Go to **WhatsApp → Configuration**
   - Add test phone numbers under "Recipient phone numbers"

### 6. Important Limitations (Test Environment)

- **Limited Recipients**: Only verified test numbers
- **24-Hour Rule**: Can only message users who contacted you first
- **Template Approval**: Marketing messages need approved templates
- **Rate Limits**: Limited messages per minute/hour

### 7. Message Types

#### Text Messages
- Simple text messages
- Can be sent within 24-hour window after user contact
- Max 4096 characters

#### Template Messages
- Pre-approved message templates
- Required for marketing/promotional messages
- Must be created and approved in WhatsApp Manager

#### Media Messages
- Images, videos, audio, documents
- Publicly accessible URLs required
- Follow WhatsApp media guidelines

### 8. Phone Number Format

All phone numbers must include country code:
- ✅ Correct: `+1234567890`
- ❌ Wrong: `1234567890` or `(123) 456-7890`

### 9. Create Message Templates

For marketing campaigns, you need approved templates:

1. **Go to WhatsApp Manager**
   - Visit: https://business.whatsapp.com
   - Select your business account

2. **Create Template**
   - Go to **Account Tools → Message Templates**
   - Click "Create Template"
   - Choose category (Marketing, Utility, Authentication)
   - Design your template with placeholders
   - Submit for approval (usually takes 24-48 hours)

### 10. Production Setup

To go live:

1. **App Review**
   - Submit your app for Meta review
   - Provide use case and demo
   - May take several weeks

2. **Permanent Access Token**
   - Generate system user access token
   - Set up proper authentication

3. **Webhooks**
   - Set up webhook endpoints
   - Handle delivery receipts, status updates

4. **Phone Number Verification**
   - Complete business verification
   - Get green checkmark status

### 11. Best Practices

- **Respect 24-hour window**: Only message users who contacted you first
- **Use templates for marketing**: Don't send promotional content as text messages
- **Monitor quality scores**: WhatsApp tracks your message quality
- **Handle opt-outs**: Respect user preferences
- **Keep messages relevant**: Avoid spam-like content

### 12. Common Issues and Solutions

#### "WhatsApp API configuration is missing"
- Check your `.env` file has all required variables
- Verify the access token is valid (temporary tokens expire)

#### "Invalid phone number format"
- Ensure numbers include country code with `+`
- Remove spaces, dashes, parentheses

#### "Cannot send to this number"
- Number must be in your test recipients list
- Or user must have messaged you first within 24 hours

#### "Template not found"
- Template must be approved by Meta
- Use exact template name as approved

### 13. Useful Links

- [Meta Developers Console](https://developers.facebook.com)
- [WhatsApp Business Manager](https://business.whatsapp.com)
- [WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp)
- [WhatsApp Business Policy](https://www.whatsapp.com/legal/business-policy)

## Features Included

✅ Campaign Management  
✅ Text Messages  
✅ Template Messages  
✅ Media Messages  
✅ Bulk Sending  
✅ Test Message Feature  
✅ Campaign Analytics  
✅ Failed Message Tracking  
✅ Delivery Status  
✅ Setup Guide  

## Next Steps

1. Set up your Meta developer account
2. Configure environment variables
3. Add test phone numbers
4. Create and approve message templates
5. Test the integration
6. Submit for app review when ready for production

For support, refer to Meta's documentation or contact their developer support team.
