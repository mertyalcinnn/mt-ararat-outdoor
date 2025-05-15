#!/bin/bash

echo "=== MT ARARAT OUTDOOR - BUILD ERROR FIX SCRIPT ==="
echo "Running fixes for Next.js Server/Client Component issues..."

# Run the fix scripts
echo ""
echo "1. Fixing global error component..."
node fix-build-errors.js

echo ""
echo "2. Fixing components that should be client components..."
node fix-nextjs-components.js

echo ""
echo "3. Fixing functions that should have 'use server' directive..."
node fix-functions.js

echo ""
echo "4. Fixing 'use client' and generateStaticParams conflicts..."
node fix-static-params-conflicts.js

echo ""
echo "5. Fixing API routes and layout metadata conflicts..."
node fix-api-and-metadata.js

echo ""
echo "6. Fixing API routes with 'use server' and exports conflicts..."
node fix-server-exports.js

echo ""
echo "=== REBUILDING APPLICATION ==="
npm run clean
npm run build

echo ""
echo "Build process completed. If errors persist, please check BUILD-FIX.md for manual solutions."
