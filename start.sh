#!/bin/bash
# File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/start.sh
# Description: Start the Livelong Focus Timer development server with cleanup
# Author: Libor Ballaty <libor@arionetworks.com>
# Created: 2025-09-30

set -e

echo "🚀 Starting LiveLong Development Server"
echo "=================================================="

# Function to cleanup existing processes
cleanup_existing() {
    echo "🧹 Cleaning up existing processes..."

    # Kill any existing processes on port 9000
    if lsof -ti:9000 >/dev/null 2>&1; then
        echo "📍 Found existing process on port 9000, terminating..."
        lsof -ti:9000 | xargs kill -9 2>/dev/null || true
        sleep 2
    fi

    # Kill any existing npm/node processes for this project
    pkill -f "next dev -p 9000" 2>/dev/null || true
    pkill -f "node.*next.*9000" 2>/dev/null || true

    echo "✅ Cleanup complete"
}

# Function to check dependencies
check_dependencies() {
    echo "📦 Checking dependencies..."

    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is not installed. Please install Node.js first."
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        echo "❌ npm is not installed. Please install npm first."
        exit 1
    fi

    echo "✅ Dependencies check passed"
}

# Function to install dependencies if needed
install_dependencies() {
    echo "📥 Installing dependencies..."
    cd web-app

    if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
        echo "📦 Installing npm packages..."
        npm install
    else
        echo "✅ Dependencies already installed"
    fi

    cd ..
}

# Function to reset cache
reset_cache() {
    echo "🗑️  Resetting cache..."
    cd web-app

    # Clear Next.js cache
    if [ -d ".next" ]; then
        rm -rf .next
        echo "✅ Next.js cache cleared"
    fi

    # Clear npm cache (optional, only if needed)
    if [ "$1" = "deep" ]; then
        npm cache clean --force
        echo "✅ npm cache cleared"
    fi

    cd ..
}

# Function to open browser
open_browser() {
    echo "🌐 Opening browser..."

    # Wait a moment for server to start
    sleep 3

    # Detect OS and open browser
    case "$(uname -s)" in
        Darwin*)    # macOS
            open http://localhost:9000
            ;;
        Linux*)     # Linux
            if command -v xdg-open > /dev/null; then
                xdg-open http://localhost:9000
            elif command -v gnome-open > /dev/null; then
                gnome-open http://localhost:9000
            fi
            ;;
        CYGWIN*|MINGW*|MSYS*)    # Windows
            start http://localhost:9000
            ;;
        *)
            echo "🔗 Please open http://localhost:9000 in your browser"
            ;;
    esac
}

# Function to start the development server
start_server() {
    echo "🎯 Starting development server..."
    cd web-app

    echo "📱 LiveLong will be available at:"
    echo "   🌐 Local:    http://localhost:9000"
    echo "   📲 Network:  http://$(hostname -I | awk '{print $1}' 2>/dev/null || echo 'localhost'):9000"
    echo ""
    echo "🧘 Features available:"
    echo "   • Pomodoro & Custom Focus Timers"
    echo "   • Japanese Longevity Exercises (Rajio Taiso, Shinrin-yoku)"
    echo "   • Breathing Guides (Box Breathing, 4-7-8, Deep Breathing)"
    echo "   • Exercise Series with Visual Instructions"
    echo "   • PWA Support for Mobile Installation"
    echo ""
    echo "🚀 Opening browser automatically..."
    echo "Press Ctrl+C to stop the server"
    echo "=================================================="

    # Open browser in background
    (open_browser) &

    # Start the development server
    npm run dev
}

# Main execution
main() {
    # Check for cache reset flag
    RESET_CACHE=""
    if [ "$1" = "reset" ] || [ "$1" = "clean" ] || [ "$1" = "--reset" ]; then
        RESET_CACHE="deep"
    fi

    cleanup_existing

    # Reset cache if requested
    if [ "$RESET_CACHE" = "deep" ]; then
        reset_cache deep
    else
        reset_cache
    fi

    check_dependencies
    install_dependencies
    start_server
}

# Handle Ctrl+C gracefully
trap 'echo ""; echo "🛑 Shutting down development server..."; exit 0' INT

# Run main function with parameters
main "$@"