# WhatsApp Webhook Setup Guide

## Step-by-Step Webhook Configuration

### 1. **Webhook URL**
Your webhook endpoint is:
```
https://yourdomain.com/api/webhooks/whatsapp
```

For local development (using ngrok):
```
https://your-ngrok-url.ngrok.io/api/webhooks/whatsapp
```

### 2. **Verify Token**
Your verify token is already configured in your .env file:
```
whatsapp_webhook_verify_anjum_2025_secure_token_xyz789
```

### 3. **Setting up Webhooks in Meta Developers Console**

1. **Go to Meta Developers Console**
   - Visit: https://developers.facebook.com
   - Select your app

2. **Navigate to WhatsApp Configuration**
   - Go to **WhatsApp → Configuration**
   - Scroll down to **Webhooks** section

3. **Configure Webhook**
   - **Callback URL**: Enter your webhook URL
   - **Verify Token**: Enter `whatsapp_webhook_verify_anjum_2025_secure_token_xyz789`
   - Click **Verify and Save**

4. **Subscribe to Fields**
   Check these webhook fields:
   - ✅ **messages** - For message delivery status and incoming messages
   - ✅ **message_deliveries** - For delivery confirmations
   - ✅ **message_reads** - For read receipts

### 4. **For Local Development (Using ngrok)**

If you're testing locally, you need to expose your local server:

1. **Install ngrok**
   ```bash
   npm install -g ngrok
   ```

2. **Start your local server**
   ```bash
   npm run dev
   ```

3. **In another terminal, start ngrok**
   ```bash
   ngrok http 3000
   ```

4. **Use the ngrok URL**
   - Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
   - Your webhook URL becomes: `https://abc123.ngrok.io/api/webhooks/whatsapp`

### 5. **For Production Deployment**

1. **Deploy your app** to a hosting service (Vercel, Railway, Heroku, etc.)

2. **Use your production domain**
   - Example: `https://yourapp.vercel.app/api/webhooks/whatsapp`

3. **Update webhook URL** in Meta Developers Console

### 6. **Webhook Events You'll Receive**

Your webhook will receive these types of events:

#### Message Status Updates
```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "changes": [{
      "field": "messages",
      "value": {
        "statuses": [{
          "id": "message_id",
          "status": "delivered", // or "read", "failed"
          "timestamp": "1234567890",
          "recipient_id": "1234567890"
        }]
      }
    }]
  }]
}
```

#### Incoming Messages
```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "changes": [{
      "field": "messages",
      "value": {
        "messages": [{
          "from": "1234567890",
          "id": "message_id",
          "timestamp": "1234567890",
          "type": "text",
          "text": { "body": "Hello!" }
        }]
      }
    }]
  }]
}
```

### 7. **Testing Your Webhook**

1. **Check webhook verification**
   - Meta will send a GET request to verify your webhook
   - Your endpoint should return the challenge parameter

2. **Send a test message**
   - Send a WhatsApp message using your admin panel
   - Check your server logs for webhook events

3. **Monitor delivery status**
   - Watch for `delivered` and `read` status updates
   - These will automatically update your campaign statistics

### 8. **Troubleshooting**

#### Webhook Verification Failed
- ✅ Check that your verify token matches exactly
- ✅ Ensure your webhook endpoint is accessible
- ✅ Check server logs for errors

#### Not Receiving Webhooks
- ✅ Verify webhook URL is correct and accessible
- ✅ Check that you've subscribed to the right fields
- ✅ Ensure your endpoint returns 200 OK for POST requests

#### SSL Certificate Issues
- ✅ Use HTTPS URLs only (HTTP won't work)
- ✅ Ensure valid SSL certificate for production

### 9. **Security Considerations**

1. **Verify webhook signature** (recommended for production)
2. **Use HTTPS only**
3. **Keep verify token secure**
4. **Validate incoming data**

### 10. **Benefits of Webhooks**

✅ **Real-time delivery status** - Know when messages are delivered/read  
✅ **Automatic campaign updates** - Statistics update automatically  
✅ **Failed message tracking** - Handle bounced messages  
✅ **Incoming message handling** - Support replies and customer service  
✅ **Better user experience** - Real-time feedback  

### 11. **Next Steps After Setup**

1. Configure webhook URL in Meta console
2. Test with a message
3. Monitor logs for webhook events
4. Set up production deployment
5. Update webhook URL for production

---

**Your webhook is ready to use!** Just configure the URL in Meta Developers Console and you'll start receiving real-time updates.
