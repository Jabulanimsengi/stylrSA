#!/bin/bash
# Bash script to clear Next.js cache
# Run this script when you encounter ChunkLoadError

echo "Clearing Next.js cache..."

if [ -d ".next" ]; then
    rm -rf .next
    echo "✓ Removed .next folder"
else
    echo "ℹ .next folder not found"
fi

if [ -d "node_modules/.cache" ]; then
    rm -rf node_modules/.cache
    echo "✓ Removed node_modules cache"
else
    echo "ℹ node_modules cache not found"
fi

echo ""
echo "Cache cleared! Now restart your dev server with: npm run dev"

