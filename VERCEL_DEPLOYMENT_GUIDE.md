# Vercel Deployment Guide for WhatsApp Business API

## Step-by-Step Deployment to Vercel

### 1. **Prepare Your Project**

Make sure your project is ready:
- ✅ All environment variables configured
- ✅ Database accessible from internet (use cloud database)
- ✅ Code committed to Git repository

### 2. **Set Up Cloud Database (Important!)**

Vercel serverless functions need a cloud database. You have options:

#### Option A: Railway (Recommended - Free tier available)
1. Go to [railway.app](https://railway.app)
2. Create account and new project
3. Add PostgreSQL service
4. Copy the connection string
5. Update your `DATABASE_URL`

#### Option B: Neon (PostgreSQL)
1. Go to [neon.tech](https://neon.tech)
2. Create free account
3. Create database
4. Copy connection string

#### Option C: Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create project
3. Go to Settings → Database
4. Copy connection string

### 3. **Deploy to Vercel**

#### Method 1: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables
vercel env add DATABASE_URL
vercel env add WHATSAPP_ACCESS_TOKEN
vercel env add WHATSAPP_PHONE_NUMBER_ID
vercel env add WHATSAPP_BUSINESS_ACCOUNT_ID
vercel env add WHATSAPP_WEBHOOK_VERIFY_TOKEN

# Redeploy with environment variables
vercel --prod
```

#### Method 2: Using Vercel Dashboard

1. **Go to**: [vercel.com](https://vercel.com)
2. **Sign up/Login** with GitHub
3. **Import your repository**
4. **Configure environment variables** (see section below)
5. **Deploy**

### 4. **Configure Environment Variables in Vercel**

In your Vercel dashboard, go to Project Settings → Environment Variables and add:

```
DATABASE_URL=your_cloud_database_url_here
JWT_SECRET=mysecretkey
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=mysecretkey
SSLCOMMERZ_STORE_ID=anjum685fefcf7abf8
SSLCOMMERZ_STORE_PASSWORD=anjum685fefcf7abf8@ssl
SSLCOMMERZ_IS_LIVE=false
WHATSAPP_ACCESS_TOKEN=EAAKTdn6gFyABO5nhMk8HTbnspSixXGEtbyRMDbE5IH5Ldz7pMzYDpCDzC4Gg1dZBv7UnEwd0glqZCTchXhfl3TXJ3nnTma67Da4oEgpxY2P93G43eS3UcFiC51QwS142t8ZAGkgrZBjcAfy7QrsN5w6JZBA6inZAixmJm0E8T5noXp3ly8gEidc0GqeKcaSWfdTmEns7bLJYn3YZBc1NhYAOhrKJaiUSGRAalk2HXQVyC1V5RxhSu0I9YjWsg7ZBfzgZD
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id_here
WHATSAPP_WEBHOOK_VERIFY_TOKEN=whatsapp_webhook_verify_anjum_2025_secure_token_xyz789
WHATSAPP_API_VERSION=v18.0
```

### 5. **Update Your Webhook URL**

Once deployed, your webhook URL will be:
```
https://your-app-name.vercel.app/api/webhooks/whatsapp
```

**Configure this in Meta Developers Console:**
1. Go to Facebook Developers → Your App → WhatsApp → Configuration
2. Update webhook URL to: `https://your-app-name.vercel.app/api/webhooks/whatsapp`
3. Verify token: `whatsapp_webhook_verify_anjum_2025_secure_token_xyz789`
4. Save

### 6. **Run Database Migration on Cloud Database**

After setting up cloud database:

```bash
# Update your local .env with cloud database URL
DATABASE_URL=your_cloud_database_url

# Run migration
npx prisma migrate deploy

# Or push schema
npx prisma db push
```

### 7. **Test Your Deployment**

1. **Visit your deployed app**: `https://your-app-name.vercel.app`
2. **Go to admin panel**: `https://your-app-name.vercel.app/admin/whatsapp`
3. **Test webhook**: Use the "Test Webhook" feature
4. **Send test message**: Try the WhatsApp test functionality

### 8. **Advantages of Vercel over ngrok**

✅ **Permanent URL** - No need to restart/reconnect  
✅ **HTTPS by default** - Secure connections  
✅ **Global CDN** - Fast worldwide access  
✅ **Automatic deployments** - Updates on git push  
✅ **Serverless** - Scales automatically  
✅ **Free tier** - No cost for small projects  
✅ **Professional** - Production-ready infrastructure  

### 9. **Deployment Checklist**

- [ ] Cloud database set up and accessible
- [ ] All environment variables configured in Vercel
- [ ] Database migration run on cloud database
- [ ] Webhook URL updated in Meta Developers Console
- [ ] Test webhook verification works
- [ ] Test WhatsApp message sending
- [ ] Admin panel accessible and functional

### 10. **Troubleshooting**

#### Database Connection Issues
- ✅ Ensure cloud database allows external connections
- ✅ Check DATABASE_URL format
- ✅ Verify database credentials

#### Webhook Issues
- ✅ Check webhook URL is accessible: `https://your-app.vercel.app/api/webhooks/whatsapp`
- ✅ Verify token matches exactly
- ✅ Check Vercel function logs for errors

#### Environment Variables
- ✅ All variables set in Vercel dashboard
- ✅ Redeploy after adding variables
- ✅ No typos in variable names

### 11. **Useful Commands**

```bash
# Deploy to Vercel
vercel

# Deploy to production
vercel --prod

# Check deployment logs
vercel logs

# Set environment variable
vercel env add VARIABLE_NAME

# List environment variables
vercel env ls
```

### 12. **Next Steps After Deployment**

1. **Update webhook URL** in Meta console
2. **Test all functionality**
3. **Monitor Vercel logs** for any issues
4. **Set up custom domain** (optional)
5. **Configure production settings**

Your WhatsApp Business API will now be running on a professional, scalable platform with permanent HTTPS URLs!
