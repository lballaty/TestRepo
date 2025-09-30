#!/bin/bash
# File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/stop.sh
# Description: Stop all running Livelong Focus Timer development processes
# Author: Libor Ballaty <libor@arionetworks.com>
# Created: 2025-09-30

set -e

echo "🛑 Stopping LiveLong Development Server"
echo "=================================================="

# Function to stop processes
stop_processes() {
    echo "🔍 Looking for running processes..."

    # Check for processes on port 9000
    if lsof -ti:9000 >/dev/null 2>&1; then
        echo "📍 Found process on port 9000, terminating..."
        lsof -ti:9000 | xargs kill -TERM 2>/dev/null || true
        sleep 3

        # Force kill if still running
        if lsof -ti:9000 >/dev/null 2>&1; then
            echo "🔨 Force terminating stubborn processes..."
            lsof -ti:9000 | xargs kill -9 2>/dev/null || true
        fi
    else
        echo "✅ No process found on port 9000"
    fi

    # Kill any npm/node processes for this project
    if pkill -f "next dev -p 9000" 2>/dev/null; then
        echo "🔨 Terminated Next.js development processes"
    fi

    if pkill -f "node.*next.*9000" 2>/dev/null; then
        echo "🔨 Terminated Node.js processes for port 9000"
    fi

    # Kill any remaining npm processes in the project directory
    project_path=$(pwd)
    if pkill -f "npm.*$project_path" 2>/dev/null; then
        echo "🔨 Terminated npm processes in project directory"
    fi

    echo "✅ Process cleanup complete"
}

# Function to clean up temporary files
cleanup_temp_files() {
    echo "🧹 Cleaning up temporary files..."

    # Clean up Next.js cache and build files
    if [ -d "web-app/.next" ]; then
        rm -rf web-app/.next
        echo "🗑️  Removed .next cache directory"
    fi

    # Clean up any test artifacts
    if [ -d "web-app/test-results" ]; then
        rm -rf web-app/test-results
        echo "🗑️  Removed test results directory"
    fi

    # Clean up any playwright report files
    if [ -d "web-app/playwright-report" ]; then
        rm -rf web-app/playwright-report
        echo "🗑️  Removed playwright report directory"
    fi

    echo "✅ Temporary files cleanup complete"
}

# Function to show status
show_status() {
    echo "📊 Final Status Check:"

    if lsof -ti:9000 >/dev/null 2>&1; then
        echo "⚠️  Warning: Process still running on port 9000"
        echo "   Run: lsof -ti:9000 | xargs kill -9"
    else
        echo "✅ Port 9000 is free"
    fi

    if pgrep -f "next dev" >/dev/null 2>&1; then
        echo "⚠️  Warning: Next.js development processes still running"
        echo "   Run: pkill -f 'next dev'"
    else
        echo "✅ No Next.js development processes running"
    fi

    echo ""
    echo "🎯 LiveLong development server stopped successfully!"
    echo "   To start again, run: ./start.sh"
}

# Main execution
main() {
    stop_processes
    cleanup_temp_files
    show_status
}

# Run main function
main