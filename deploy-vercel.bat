@echo off
echo 🚀 Deploying WhatsApp Business API to Vercel with Supabase...
echo.

REM Check if Vercel CLI is installed
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 📦 Installing Vercel CLI...
    npm install -g vercel
)

echo 🔧 Generating Prisma client...
npx prisma generate

echo 🏗️  Building application locally...
npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed! Please fix errors and try again.
    pause
    exit /b 1
)

echo.
echo 🔐 Environment Variables for Vercel Dashboard:
echo Copy these to your Vercel project settings:
echo.
echo DATABASE_URL=postgres://postgres.kxinejschzdaiwbbdklk:ZgGmvXkPqwS3BaBD@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
echo NEXT_PUBLIC_SUPABASE_URL=https://kxinejschzdaiwbbdklk.supabase.co
echo NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4aW5lanNjaHpkYWl3YmJka2xrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMjgzNjIsImV4cCI6MjA2NjgwNDM2Mn0.VB_7DSH8RgAduK9oh_wXOLtSl3zlwj5OqS_MbjbICoY
echo SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4aW5lanNjaHpkYWl3YmJka2xrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTIyODM2MiwiZXhwIjoyMDY2ODA0MzYyfQ.4lKJELJ6A4_IyWqTvXKxe7IT-hzDrbJX7Z6JsDaAGe0
echo WHATSAPP_ACCESS_TOKEN=your_access_token_here
echo WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
echo WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id_here
echo WHATSAPP_WEBHOOK_VERIFY_TOKEN=whatsapp_webhook_verify_anjum_2025_secure_token_xyz789
echo JWT_SECRET=mysecretkey
echo NEXTAUTH_SECRET=mysecretkey
echo SSLCOMMERZ_STORE_ID=anjum685fefcf7abf8
echo SSLCOMMERZ_STORE_PASSWORD=anjum685fefcf7abf8@ssl
echo SSLCOMMERZ_IS_LIVE=false
echo.

echo 🌐 Deploying to Vercel...
vercel --prod

echo.
echo ✅ Deployment complete!
echo.
echo 📋 Next steps:
echo 1. Update your webhook URL in Meta Developers Console
echo 2. Test the webhook using the admin panel
echo 3. Send a test WhatsApp message
echo.
echo 🔗 Your webhook URL will be: https://your-app-name.vercel.app/api/webhooks/whatsapp
echo 🔑 Verify token: whatsapp_webhook_verify_anjum_2025_secure_token_xyz789

pause
