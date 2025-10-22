#!/bin/bash

echo "=================================================="
echo "  AI SNIPER DETECTION SYSTEM - INTERFACE STARTUP"
echo "=================================================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

echo "✓ Python 3 found"

# Check if requirements are installed
echo "📦 Checking dependencies..."

# Install requirements if needed
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate

echo "Installing/updating dependencies..."
pip install -q -r requirements.txt

echo "✓ Dependencies ready"
echo ""

# Check for model file
if [ -f "my_model.pt" ]; then
    echo "✓ Model file found: my_model.pt"
else
    echo "⚠ Warning: Model file 'my_model.pt' not found. Running in DEMO MODE."
fi

echo ""
echo "=================================================="
echo "  STARTING SERVER..."
echo "=================================================="
echo ""
echo "🌐 Interface will be available at:"
echo "   http://localhost:5000"
echo ""
echo "Press CTRL+C to stop the server"
echo "=================================================="
echo ""

# Start the Flask server
python3 app.py
