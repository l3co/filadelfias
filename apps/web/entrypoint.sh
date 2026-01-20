#!/bin/bash
set -e

echo "🚀 Starting web application..."
exec npm run preview -- --host --port 5173
