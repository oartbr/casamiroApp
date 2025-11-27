#!/bin/bash
# Bash script to clear Next.js cache

echo "Clearing Next.js cache..."

if [ -d ".next" ]; then
    rm -rf .next
    echo "✓ Cleared .next folder"
else
    echo "  .next folder not found"
fi

if [ -d "node_modules/.cache" ]; then
    rm -rf node_modules/.cache
    echo "✓ Cleared node_modules cache"
else
    echo "  node_modules cache not found"
fi

echo ""
echo "Cache cleared successfully! You can now run 'npm run dev' again."




