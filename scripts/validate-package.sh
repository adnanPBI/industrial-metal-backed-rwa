#!/usr/bin/env sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$ROOT"
python3 scripts/generate_site_data.py >/dev/null
./tests/smoke.sh
# Remove local test records so packaging never includes acceptance-test personal data/tokens.
: > public-demo/data/audit.jsonl
: > public-demo/data/outbox.log
: > public-demo/data/verification-events.jsonl
: > public-demo/data/waitlist.jsonl
rm -f tests/.demo.log
find wordpress -name '*.php' -print0 | xargs -0 -n1 php -l >/dev/null
node --check public-demo/server.mjs
node --check public-demo/public/assets/js/app.js
python -m json.tool docs/site-data.json >/dev/null
python -m json.tool mobile/package.json >/dev/null
python -m json.tool contracts/package.json >/dev/null
if grep -RInE 'AKIA[0-9A-Z]{16}|BEGIN (RSA|OPENSSH|EC) PRIVATE KEY|sk_live_[A-Za-z0-9]+' . --exclude='validate-package.sh' >/tmp/rc-secret-scan.txt; then
  echo "Potential secret pattern found:" >&2
  cat /tmp/rc-secret-scan.txt >&2
  exit 1
fi
echo 'PACKAGE_VALIDATION=PASS'
