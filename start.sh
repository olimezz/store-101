#!/bin/bash
set -e
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -d "$PROJECT_DIR/.node/bin" ]; then
  export PATH="$PROJECT_DIR/.node/bin:$PATH"
fi
cd "$PROJECT_DIR"
echo "Starting STORE 101 on http://localhost:3000..."
exec ./node_modules/.bin/next start -p 3000
