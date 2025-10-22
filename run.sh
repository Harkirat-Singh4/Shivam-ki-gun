#!/bin/bash

# AI Sniper Detection System - Quick Start Script

echo "🎯 AI Sniper Detection System"
echo "================================"

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed or not in PATH"
    exit 1
fi

echo "✓ Python 3 found: $(python3 --version)"

# Check if model file exists
if [ ! -f "my_model.pt" ]; then
    echo "❌ Model file 'my_model.pt' not found!"
    echo "Please ensure the trained model is in the current directory."
    exit 1
fi

echo "✓ Model file found ($(du -h my_model.pt | cut -f1))"

# Install dependencies if requirements.txt exists
if [ -f "requirements.txt" ]; then
    echo "📦 Installing dependencies..."
    python3 -m pip install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✓ Dependencies installed"
fi

# Run system test
echo "🔍 Running system tests..."
python3 test_system.py
if [ $? -ne 0 ]; then
    echo "❌ System tests failed. Please check the output above."
    exit 1
fi

echo ""
echo "🚀 Starting AI Sniper Detection System..."
echo "📊 Dashboard will be available at: http://localhost:8000"
echo "🛑 Press Ctrl+C to stop the server"
echo ""

# Start the server
python3 start_server.py