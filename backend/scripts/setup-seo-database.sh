#!/bin/bash

# SEO Database Setup Script
# This script sets up the complete SEO system by:
# 1. Running migrations
# 2. Importing keywords
# 3. Importing locations
# 4. Generating initial page cache

set -e  # Exit on any error

echo "🚀 Starting SEO Database Setup..."
echo "================================"

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must be run from the backend directory"
    exit 1
fi

# Step 1: Run migrations
echo ""
echo "📦 Step 1: Running database migrations..."
npx prisma migrate deploy
echo "✅ Migrations complete"

# Step 2: Import keywords
echo ""
echo "🔑 Step 2: Importing SEO keywords..."
npx ts-node scripts/import-seo-keywords.ts
echo "✅ Keywords imported"

# Step 3: Import locations
echo ""
echo "📍 Step 3: Importing SEO locations..."
npx ts-node scripts/import-seo-locations.ts
echo "✅ Locations imported"

# Step 4: Verify data
echo ""
echo "🔍 Step 4: Verifying imported data..."
npx ts-node scripts/test-seo-data.ts

# Step 5: Generate initial pages (optional - can be skipped)
echo ""
echo "📄 Step 5: Generate initial page cache?"
echo "This will pre-generate ~5,000 pages and may take 10-30 minutes."
echo "You can skip this and let pages generate on-demand via ISR."
read -p "Generate now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Generating pages..."
    npx ts-node scripts/generate-seo-pages.ts
    echo "✅ Pages generated"
else
    echo "⏭️  Skipping page generation (pages will generate on-demand)"
fi

echo ""
echo "================================"
echo "✅ SEO Database Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Restart your backend server"
echo "2. Test the API: curl http://localhost:3000/seo-pages/keywords/top?limit=5"
echo "3. Test a landing page: http://localhost:3001/hair-salon"
echo ""
