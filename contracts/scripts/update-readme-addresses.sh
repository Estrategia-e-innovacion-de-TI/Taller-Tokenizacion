#!/usr/bin/env bash
# Actualiza la sección de addresses en README.md desde deployments/
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

JSON="${ROOT}/deployments/latest.json"
if [ ! -f "$JSON" ]; then
  JSON="${ROOT}/deployments/base-sepolia.json"
fi
if [ ! -f "$JSON" ]; then
  JSON="${ROOT}/deployments/ethereum-sepolia.json"
fi
ADDRESSES_MD="${ROOT}/deployments/ADDRESSES.md"
README="${ROOT}/README.md"

if [ ! -f "$JSON" ] && [ ! -f "$ADDRESSES_MD" ]; then
  echo "No hay deployments/*.json ni ADDRESSES.md — corre make deploy primero."
  exit 1
fi

NETWORK="unknown"
CHAIN_ID="?"
if [ -f "$JSON" ]; then
  NETWORK=$(jq -r '.network // "unknown"' "$JSON")
  CHAIN_ID=$(jq -r '.chainId // "?"' "$JSON")
fi

if [ -f "$ADDRESSES_MD" ]; then
  TABLE="$(cat "$ADDRESSES_MD")"
else
  COPW=$(jq -r .COPW "$JSON")
  RENT=$(jq -r .RENT "$JSON")
  DIST=$(jq -r .YieldDistributor "$JSON")
  SALE=$(jq -r .PropertySale "$JSON")
  TREASURY=$(jq -r .Treasury "$JSON")
  TABLE=$(cat <<EOF
| Contrato | Address |
|----------|----------|
| COPW | \`${COPW}\` |
| RENT | \`${RENT}\` |
| YieldDistributor | \`${DIST}\` |
| PropertySale | \`${SALE}\` |
| Treasury | \`${TREASURY}\` |
EOF
)
fi

DATE="$(date -u +"%Y-%m-%d %H:%M UTC")"
BLOCK=$(cat <<EOF
<!-- DEPLOYED_ADDRESSES_START -->
**Red:** ${NETWORK} (chainId \`${CHAIN_ID}\`) · actualizado: ${DATE}

${TABLE}

Para el frontend (\`frontend/.env\`):

\`\`\`env
VITE_COPW_ADDRESS=$(jq -r .COPW "$JSON" 2>/dev/null || echo "")
VITE_RENT_ADDRESS=$(jq -r .RENT "$JSON" 2>/dev/null || echo "")
VITE_DISTRIBUTOR_ADDRESS=$(jq -r .YieldDistributor "$JSON" 2>/dev/null || echo "")
VITE_SALE_ADDRESS=$(jq -r .PropertySale "$JSON" 2>/dev/null || echo "")
\`\`\`
<!-- DEPLOYED_ADDRESSES_END -->
EOF
)

if ! grep -q 'DEPLOYED_ADDRESSES_START' "$README"; then
  echo "README.md no tiene marcadores DEPLOYED_ADDRESSES_*"
  exit 1
fi

# Reemplaza bloque entre marcadores
tmp="$(mktemp)"
awk -v block="$BLOCK" '
  BEGIN {p=1}
  /<!-- DEPLOYED_ADDRESSES_START -->/ {
    print block
    p=0
    next
  }
  /<!-- DEPLOYED_ADDRESSES_END -->/ {p=1; next}
  p {print}
' "$README" > "$tmp"
mv "$tmp" "$README"

echo "README.md actualizado con addresses de deployments/"
