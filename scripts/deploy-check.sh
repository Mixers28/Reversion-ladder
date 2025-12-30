#!/bin/bash

# Quick Deployment Check Script
# Run this before deploying to verify everything is ready

echo "🚀 WORTHY Deployment Pre-Check"
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the project root"
    exit 1
fi

echo "✓ Project root detected"
echo ""

# Check backend files
echo "📦 Checking Backend..."
if [ ! -f "backend/package.json" ]; then
    echo "❌ backend/package.json missing"
    exit 1
fi
echo "✓ backend/package.json exists"

if [ ! -f "backend/Procfile" ]; then
    echo "❌ backend/Procfile missing"
    exit 1
fi
echo "✓ backend/Procfile exists"

if [ ! -f "backend/src/data.json" ]; then
    echo "❌ backend/src/data.json missing"
    exit 1
fi
echo "✓ backend/src/data.json exists"

if [ ! -f "backend/tsconfig.json" ]; then
    echo "❌ backend/tsconfig.json missing"
    exit 1
fi
echo "✓ backend/tsconfig.json exists"

# Check schema file
echo ""
echo "🗄️  Checking Database Schema..."
if [ ! -f "schemas/orchestrator.schema.sql" ]; then
    echo "❌ schemas/orchestrator.schema.sql missing"
    exit 1
fi
echo "✓ orchestrator.schema.sql exists"

# Check frontend files
echo ""
echo "🎨 Checking Frontend..."
if [ ! -f "frontend/package.json" ]; then
    echo "❌ frontend/package.json missing"
    exit 1
fi
echo "✓ frontend/package.json exists"

if [ ! -f "frontend/next.config.js" ]; then
    echo "❌ frontend/next.config.js missing"
    exit 1
fi
echo "✓ frontend/next.config.js exists"

# Check environment examples
echo ""
echo "🔐 Checking Environment Files..."
if [ ! -f "backend/.env.example" ]; then
    echo "⚠️  backend/.env.example missing (optional)"
else
    echo "✓ backend/.env.example exists"
fi

if [ ! -f "frontend/.env.example" ]; then
    echo "⚠️  frontend/.env.example missing (optional)"
else
    echo "✓ frontend/.env.example exists"
fi

# Test backend build
echo ""
echo "🔨 Testing Backend Build..."
cd backend
if ! npm run build > /dev/null 2>&1; then
    echo "❌ Backend build failed"
    echo "   Run: cd backend && npm run build"
    exit 1
fi
echo "✓ Backend builds successfully"

# Check if data.json was copied
if [ ! -f "dist/routes/data.json" ]; then
    echo "❌ data.json not copied to dist/routes/"
    echo "   Check backend/package.json build script"
    exit 1
fi
echo "✓ data.json copied to dist/routes/"

cd ..

# Summary
echo ""
echo "================================"
echo "✅ All Pre-Deployment Checks Passed!"
echo ""
echo "Next Steps:"
echo "  1. Apply schema to Supabase:"
echo "     - Open Supabase SQL Editor"
echo "     - Paste schemas/orchestrator.schema.sql"
echo "     - Execute"
echo ""
echo "  2. Deploy Backend to Railway:"
echo "     - Go to railway.app"
echo "     - Import GitHub repo"
echo "     - Set Root Directory: /backend"
echo "     - Add environment variables:"
echo "       SUPABASE_URL, SUPABASE_KEY, PORT=3001"
echo ""
echo "  3. Deploy Frontend to Vercel:"
echo "     - Go to vercel.com"
echo "     - Import GitHub repo"
echo "     - Set Root Directory: /frontend"
echo "     - Add environment variables:"
echo "       NEXT_PUBLIC_API_URL=https://your-railway.up.railway.app/api"
echo ""
echo "See docs/DEPLOYMENT_RAILWAY_VERCEL.md for detailed instructions"
