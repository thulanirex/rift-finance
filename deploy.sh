#!/bin/bash

echo "🚀 Rift Finance Hub - Quick Deploy Script"
echo "=========================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
    git branch -M main
fi

# Check if remote exists
if ! git remote | grep -q origin; then
    echo "❌ No git remote found!"
    echo "Please add your GitHub repository:"
    echo "git remote add origin https://github.com/YOUR_USERNAME/rift-finance-hub.git"
    exit 1
fi

# Add all files
echo "📝 Adding files to git..."
git add .

# Commit
echo "💾 Committing changes..."
git commit -m "Deploy: $(date +%Y-%m-%d\ %H:%M:%S)"

# Push to GitHub
echo "⬆️  Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅ Code pushed to GitHub!"
echo ""
echo "📋 Next Steps:"
echo "1. Deploy Backend to Render: https://dashboard.render.com"
echo "2. Deploy Frontend to Vercel: https://vercel.com/new"
echo ""
echo "📖 See DEPLOYMENT_GUIDE.md for detailed instructions"
