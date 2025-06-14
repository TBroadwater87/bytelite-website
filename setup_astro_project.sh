#!/bin/bash

# ByteLite Astro Project Setup Script for WSL 2
echo "🚀 Setting up ByteLite Astro project..."

# Check if running in WSL
if ! grep -qi microsoft /proc/version; then
    echo "⚠️  This script is designed for WSL 2. Proceeding anyway..."
fi

# Install Node.js LTS via NodeSource repository
echo "📦 Installing Node.js LTS..."
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm globally
echo "📦 Installing pnpm..."
npm install -g pnpm

# Install Astro CLI
echo "🌟 Installing Astro CLI..."
pnpm add -g astro

# Create project directory
echo "📁 Creating project directory..."
mkdir -p ~/projects/thebytelite
cd ~/projects/thebytelite

# Initialize Astro project with TypeScript
echo "🏗️  Scaffolding Astro project..."
pnpm create astro@latest . --template minimal --typescript strict --git --no-install

# Add required dependencies
echo "📚 Adding dependencies..."
pnpm add @astrojs/mdx @astrojs/image sharp
pnpm add -D @types/node

# Create directory structure
echo "📂 Creating directory structure..."
mkdir -p src/{components,layouts,pages/{news},styles,scripts}
mkdir -p public/{images,fonts}

# Final message
echo "✅ Setup complete!"
echo ""
echo "📍 Project location: ~/projects/thebytelite"
echo ""
echo "🚀 Next steps:"
echo "   cd ~/projects/thebytelite"
echo "   # Copy the provided files to their locations"
echo "   pnpm dev        # Start development server"
echo "   pnpm build      # Build for production"
echo "   pnpm preview    # Preview production build"
echo ""
echo "🌐 Development server will run at: http://localhost:4321"
