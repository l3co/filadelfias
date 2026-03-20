#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
APP_DIR=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)

NODE_BIN="${NODE_BIN:-node}"
NODE_MAJOR=$("$NODE_BIN" -p "process.versions.node.split('.')[0]" 2>/dev/null || echo "0")

run_local() {
  cd "$APP_DIR"
  exec npx playwright "$@"
}

run_docker_fallback() {
  if ! command -v docker >/dev/null 2>&1; then
    echo "Unsupported Node.js runtime for Playwright (detected v$NODE_MAJOR) and Docker is unavailable." >&2
    echo "Use Node 20 or 22, or install Docker to use the fallback runner." >&2
    exit 1
  fi

  CACHE_DIR="$APP_DIR/.docker-node22-cache"
  mkdir -p "$CACHE_DIR/npm" "$CACHE_DIR/ms-playwright"

  API_URL_IN_CONTAINER="${VITE_API_URL:-http://127.0.0.1:8010}"
  API_URL_IN_CONTAINER=$(printf '%s' "$API_URL_IN_CONTAINER" | sed 's|127\.0\.0\.1|host.docker.internal|g; s|localhost|host.docker.internal|g')
  BASE_URL_IN_CONTAINER="${BASE_URL:-http://127.0.0.1:4173}"

  docker run --rm \
    -e CI="${CI:-}" \
    -e BASE_URL="$BASE_URL_IN_CONTAINER" \
    -e VITE_API_URL="$API_URL_IN_CONTAINER" \
    -e PLAYWRIGHT_BROWSERS_PATH=/pwcache/ms-playwright \
    -e npm_config_cache=/pwcache/npm \
    -v "$APP_DIR:/src" \
    -v "$CACHE_DIR:/pwcache" \
    -w /tmp \
    --add-host=host.docker.internal:host-gateway \
    node:22-bookworm \
    sh -lc "
      set -eu
      rm -rf /tmp/app
      mkdir -p /tmp/app
      cd /src
      tar \
        --exclude='./node_modules' \
        --exclude='./.docker-node22-cache' \
        --exclude='./playwright-report' \
        --exclude='./test-results' \
        -cf - . | tar -C /tmp/app -xf -
      cd /tmp/app
      npm ci >/tmp/playwright-npm-ci.log
      node node_modules/.bin/playwright install --with-deps chromium >/tmp/playwright-install.log
      node node_modules/.bin/playwright \"\$@\"
      rm -rf /src/playwright-report.docker-next /src/playwright-report.docker-prev
      rm -rf /src/test-results.docker-next /src/test-results.docker-prev
      if [ -d /tmp/app/playwright-report ]; then
        cp -R /tmp/app/playwright-report /src/playwright-report.docker-next
        if [ -e /src/playwright-report ]; then
          mv /src/playwright-report /src/playwright-report.docker-prev
        fi
        mv /src/playwright-report.docker-next /src/playwright-report
        rm -rf /src/playwright-report.docker-prev || true
      fi
      if [ -d /tmp/app/test-results ]; then
        cp -R /tmp/app/test-results /src/test-results.docker-next
        if [ -e /src/test-results ]; then
          mv /src/test-results /src/test-results.docker-prev
        fi
        mv /src/test-results.docker-next /src/test-results
        rm -rf /src/test-results.docker-prev || true
      fi
    " sh "$@"
}

case "$NODE_MAJOR" in
  20|22)
    run_local "$@"
    ;;
  *)
    echo "Detected unsupported Node.js v$NODE_MAJOR for Playwright; using Docker Node 22 fallback." >&2
    run_docker_fallback "$@"
    ;;
esac
