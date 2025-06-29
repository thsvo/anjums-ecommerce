# 🌐 Supabase Migration Guide

## 🎯 **Database URL Selection**

For your Prisma configuration, **use the POSTGRES_PRISMA_URL** (the pooled connection):

```env
DATABASE_URL="postgres://postgres.kxinejschzdaiwbbdklk:ZgGmvXkPqwS3BaBD@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x"
```

### 🔍 **Why This URL?**

- **Port 6543**: Pooled connection (better for production, handles connection limits)
- **Port 5432**: Direct connection (use only for migrations or admin tasks)
- **supa=base-pooler.x**: Enables Supabase's connection pooling

## 🚀 **Step-by-Step Migration Process**

### **Step 1: Update Environment Variables** ✅
Your `.env` file has been updated with Supabase credentials.

### **Step 2: Run Database Migration**
```bash
.\migrate-to-supabase.bat
```

This script will:
- ✅ Push your Prisma schema to Supabase
- ✅ Create all tables, indexes, and constraints
- ✅ Update Prisma client for Supabase
- ✅ Run database seed (if exists)

### **Step 3: Test Locally**
```bash
npm run dev
```

Verify your application works with Supabase:
- Check admin panel: http://localhost:3000/admin
- Test WhatsApp campaigns: http://localhost:3000/admin/whatsapp
- Verify database connectivity

### **Step 4: Deploy to Vercel**
```bash
.\deploy-vercel.bat
```

## 📊 **Supabase Dashboard Access**

Access your database: https://supabase.com/dashboard/project/kxinejschzdaiwbbdklk

### **What to Check:**
1. **Table Editor**: Verify all tables were created
2. **API**: Check auto-generated REST API
3. **Auth**: Review authentication settings
4. **Storage**: For file uploads (if needed)

## 🔧 **Environment Variables Summary**

### **Database & Supabase**
```env
DATABASE_URL="postgres://postgres.kxinejschzdaiwbbdklk:ZgGmvXkPqwS3BaBD@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x"
NEXT_PUBLIC_SUPABASE_URL="https://kxinejschzdaiwbbdklk.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### **WhatsApp API** (Update with your values)
```env
WHATSAPP_ACCESS_TOKEN=your_permanent_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=whatsapp_webhook_verify_anjum_2025_secure_token_xyz789
```

### **Authentication**
```env
JWT_SECRET=mysecretkey
NEXTAUTH_SECRET=mysecretkey
NEXTAUTH_URL=http://localhost:3000
```

## 🔄 **Data Migration (If Needed)**

If you have existing data in your local database that you want to migrate:

### **Option 1: Export/Import via SQL**
```bash
# Export from local
pg_dump postgres://postgres:123456@localhost:5432/ecommerce_db > local_data.sql

# Import to Supabase (run this in SQL Editor on Supabase dashboard)
# Copy contents of local_data.sql and run in Supabase SQL Editor
```

### **Option 2: Manual Data Recreation**
- Create admin user using the admin creation script
- Re-add products through admin panel
- Recreate categories and other data

## 🚀 **Vercel Deployment Environment Variables**

When deploying to Vercel, add these environment variables in your Vercel dashboard:

```
DATABASE_URL=postgres://postgres.kxinejschzdaiwbbdklk:ZgGmvXkPqwS3BaBD@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x
NEXT_PUBLIC_SUPABASE_URL=https://kxinejschzdaiwbbdklk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4aW5lanNjaHpkYWl3YmJka2xrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMjgzNjIsImV4cCI6MjA2NjgwNDM2Mn0.VB_7DSH8RgAduK9oh_wXOLtSl3zlwj5OqS_MbjbICoY
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4aW5lanNjaHpkYWl3YmJka2xrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTIyODM2MiwiZXhwIjoyMDY2ODA0MzYyfQ.4lKJELJ6A4_IyWqTvXKxe7IT-hzDrbJX7Z6JsDaAGe0
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=whatsapp_webhook_verify_anjum_2025_secure_token_xyz789
JWT_SECRET=mysecretkey
NEXTAUTH_SECRET=mysecretkey
SSLCOMMERZ_STORE_ID=anjum685fefcf7abf8
SSLCOMMERZ_STORE_PASSWORD=anjum685fefcf7abf8@ssl
SSLCOMMERZ_IS_LIVE=false
```

## ⚠️ **Important Security Notes**

1. **Never commit your `.env` file** - It contains sensitive credentials
2. **Use environment-specific URLs** - Different URLs for development/production
3. **Rotate tokens regularly** - Especially WhatsApp access tokens
4. **Monitor usage** - Check Supabase dashboard for API usage

## 🎯 **Quick Start Commands**

```bash
# 1. Migrate to Supabase
.\migrate-to-supabase.bat

# 2. Test locally
npm run dev

# 3. Deploy to Vercel
.\deploy-vercel.bat
```

## 🔗 **Useful Links**

- **Supabase Dashboard**: https://supabase.com/dashboard/project/kxinejschzdaiwbbdklk
- **Supabase Docs**: https://supabase.com/docs
- **Prisma with Supabase**: https://supabase.com/docs/guides/integrations/prisma
- **Vercel Environment Variables**: https://vercel.com/docs/concepts/projects/environment-variables

---

Ready to migrate? Run `.\migrate-to-supabase.bat` to get started! 🚀
