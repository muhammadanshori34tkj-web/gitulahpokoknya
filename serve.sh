#!/usr/bin/env bash
set -euo pipefail
PORT="${1:-8000}"
cd "$(dirname "$0")"
printf 'Moklet Cyberwatch berjalan di http://localhost:%s\n' "$PORT"
python -m http.server "$PORT"
