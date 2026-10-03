#!/usr/bin/env sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
python3 "$ROOT/scripts/generate_site_data.py" >/dev/null
PORT=${RC_TEST_PORT:-4199}
LOG="$ROOT/tests/.demo.log"
DATA="$ROOT/public-demo/data"
rm -f "$DATA/waitlist.jsonl" "$DATA/audit.jsonl" "$DATA/outbox.log" "$DATA/verification-events.jsonl" "$LOG"
RC_DEMO_EXPOSE_VERIFICATION=1 RC_DEMO_ADMIN_TOKEN='smoke-test-token' PORT="$PORT" node "$ROOT/public-demo/server.mjs" > "$LOG" 2>&1 &
PID=$!
trap 'kill "$PID" 2>/dev/null || true' EXIT INT TERM
sleep 1
BASE="http://127.0.0.1:$PORT"
curl -fsS "$BASE/api/health" | grep -q '"ok":true'
curl -fsS "$BASE/api/assets" | grep -q '99.9999%'
curl -fsS "$BASE/api/assets" | grep -q '0.025 mm'
curl -fsS "$BASE/api/assets/copper-powder" | grep -q '0004512'
curl -fsS "$BASE/api/passports/RC-DAP-NI-120NP1-DEMO" | grep -q '99.9807%'
for P in / /copper-powder /nickel-wire /digital-asset-passports /waitlist /participant-portal /asset-passport/RC-DAP-CU-03K07-DEMO /admin; do curl -fsS "$BASE$P" >/dev/null; done
RESP=$(curl -fsS -X POST "$BASE/api/waitlist" -H 'content-type: application/json' --data '{"first_name":"Smoke","last_name":"Test","email":"smoke@example.test","country":"Switzerland","participant_type":"Institution","material_interest":"Both","consent_updates":true,"privacy_ack":true,"no_offer_ack":true}')
printf '%s' "$RESP" | grep -q 'verification_pending'
URL=$(printf '%s' "$RESP" | python -c 'import json,sys; print(json.load(sys.stdin)["verification_url"])')
curl -fsS "$URL" | grep -q 'Email verified'
curl -fsS -H 'Authorization: Bearer smoke-test-token' "$BASE/api/admin/audit" | grep -q '"chain_valid":true'
curl -fsS -H 'Authorization: Bearer smoke-test-token' "$BASE/api/admin/waitlist" | grep -q 'smoke@example.test'
if curl -fsS -H 'Authorization: Bearer wrong-token' "$BASE/api/admin/audit" >/dev/null 2>&1; then echo 'admin auth gate failed' >&2; exit 1; fi
python "$ROOT/tests/static_audit.py"
find "$ROOT/wordpress" -name '*.php' -print0 | xargs -0 -n1 php -l >/dev/null
node --check "$ROOT/public-demo/server.mjs"
node --check "$ROOT/public-demo/public/assets/js/app.js"
echo 'SMOKE_TESTS=PASS'
