@echo off
echo 🌐 Migrating Database to Supabase...
echo.

echo ⚠️  WARNING: This will push your schema to Supabase database
echo ⚠️  Make sure you have a backup of any important local data
echo.
set /p continue="Continue? (y/N): "
if /i not "%continue%"=="y" goto :abort

echo.
echo 🔄 Step 1: Regenerating Prisma client for Supabase...
npx prisma generate

echo.
echo 🚀 Step 2: Pushing schema to Supabase database...
echo This will create all tables, indexes, and constraints in your Supabase database
npx prisma db push

echo.
echo 🌱 Step 3: Checking if seed script exists...
if exist "scripts\seed.js" (
    echo Running database seed...
    node scripts\seed.js
) else if exist "prisma\seed.js" (
    echo Running Prisma seed...
    npx prisma db seed
) else (
    echo No seed script found, skipping...
)

echo.
echo ✅ Migration to Supabase complete!
echo.
echo 📋 What was done:
echo ✓ Schema pushed to Supabase PostgreSQL
echo ✓ All tables, indexes, and relations created
echo ✓ Prisma client updated for Supabase
echo ✓ Database seeded (if seed script exists)
echo.
echo 🔗 Check your Supabase dashboard:
echo https://supabase.com/dashboard/project/kxinejschzdaiwbbdklk
echo.
echo 📋 Next steps:
echo 1. Test your application: npm run dev
echo 2. Verify tables in Supabase dashboard
echo 3. Deploy to Vercel: .\deploy-vercel.bat
echo.
goto :end

:abort
echo Migration aborted.
goto :end

:end
pause
