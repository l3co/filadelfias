#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
APP_DIR=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)

NODE_BIN="${NODE_BIN:-node}"
NODE_MAJOR=$("$NODE_BIN" -p "process.versions.node.split('.')[0]" 2>/dev/null || echo "0")

run_local() {
  cd "$APP_DIR"
  exec npx bddgen "$@"
}

run_docker_fallback() {
  if ! command -v docker >/dev/null 2>&1; then
    echo "Unsupported Node.js runtime for bddgen (detected v$NODE_MAJOR) and Docker is unavailable." >&2
    echo "Use Node 20 or 22, or install Docker to use the fallback generator." >&2
    exit 1
  fi

  CACHE_DIR="$APP_DIR/.docker-node22-cache"
  mkdir -p "$CACHE_DIR/npm"

  docker run --rm \
    -e npm_config_cache=/pwcache/npm \
    -v "$APP_DIR:/src" \
    -v "$CACHE_DIR:/pwcache" \
    -w /tmp \
    node:22-bookworm \
    sh -lc "
      set -eu
      rm -rf /tmp/app
      mkdir -p /tmp/app
      cd /src
      tar --exclude='./node_modules' --exclude='./.docker-node22-cache' -cf - . | tar -C /tmp/app -xf -
      cd /tmp/app
      npm ci >/tmp/bddgen-npm-ci.log
      node node_modules/.bin/bddgen test \"\$@\"
      rm -rf /src/.features-gen
      cp -R /tmp/app/.features-gen /src/.features-gen
    " sh "$@"
}

case "$NODE_MAJOR" in
  20|22)
    run_local "$@"
    ;;
  *)
    echo "Detected unsupported Node.js v$NODE_MAJOR for playwright-bdd generation; using Docker Node 22 fallback." >&2
    run_docker_fallback "$@"
    ;;
esac
