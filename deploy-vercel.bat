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

echo 🏗️  Building application...
npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed! Please fix errors and try again.
    pause
    exit /b 1
)

echo.
echo 🔐 Note: Make sure to set these environment variables in Vercel dashboard:
echo - DATABASE_URL
echo - WHATSAPP_ACCESS_TOKEN
echo - WHATSAPP_PHONE_NUMBER_ID
echo - WHATSAPP_BUSINESS_ACCOUNT_ID
echo - WHATSAPP_WEBHOOK_VERIFY_TOKEN
echo - NEXT_PUBLIC_SUPABASE_URL
echo - NEXT_PUBLIC_SUPABASE_ANON_KEY
echo - SUPABASE_SERVICE_ROLE_KEY
echo - JWT_SECRET
echo - NEXTAUTH_SECRET
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
