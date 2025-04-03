#!/bin/bash

# Ensure the script is executed with bash
set -euo pipefail

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the app
echo "Building the application..."
npm run build

# Create _redirects file for SPA routing
echo "Setting up routing for SPA..."
echo "/* /index.html 200" > build/_redirects
echo "Created _redirects file in build directory"

# Ensure all public assets are copied
echo "Ensuring all assets are copied..."
if [ -d "public" ]; then
  find public -type f -not -name "*.html" -exec cp {} build/ \;
  echo "Copied public assets to build directory"
fi

echo "Build completed successfully!" 