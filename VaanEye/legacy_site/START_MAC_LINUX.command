#!/bin/bash
cd "$(dirname "$0")"
echo "VaanEye local server starting on http://localhost:8080"
( sleep 2; open http://localhost:8080/index.html 2>/dev/null || xdg-open http://localhost:8080/index.html 2>/dev/null ) &
python3 -m http.server 8080
