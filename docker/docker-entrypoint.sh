#!/bin/sh
# Wait for MPE (OPA) to be ready, then load policy domain and role data.
# Used when not relying on docker-compose's mpe-loader sidecar.

set -e

MPE_URL="${MPE_BASE_URL:-http://localhost:8181}"

echo "Waiting for MPE at $MPE_URL..."
until curl -sf "$MPE_URL/health" > /dev/null 2>&1; do
  sleep 1
done
echo "MPE is ready."

echo "Loading policy..."
curl -sf -X PUT "$MPE_URL/v1/policies/docs-domain" \
  -H 'Content-Type: text/plain' \
  --data-binary @/policies/docs-domain.rego

echo "Loading role data..."
curl -sf -X PUT "$MPE_URL/v1/data/roles" \
  -H 'Content-Type: application/json' \
  --data-binary @/policies/roles-data.json

echo "Policy domain loaded successfully."
