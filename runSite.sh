#!/bin/bash
echo "Starting Z3R Simulator Offline server on http://localhost:8000"
echo "Press Ctrl+C to stop the server"
if command -v python3 &> /dev/null; then
    python3 -m http.server 8000
else
    python -m http.server 8000
fi
