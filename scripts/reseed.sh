#!/usr/bin/env bash
# Restore the repo to its pre-demo state: seeded defects present, tests skipped,
# no agent branches left behind. Safe to run repeatedly.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> resetting working tree to origin/main"
git fetch origin main --quiet
git checkout main --quiet
git reset --hard origin/main --quiet

echo "==> deleting local agent/* branches"
git branch --list 'agent/*' | tr -d ' ' | while read -r b; do
  [ -n "$b" ] && git branch -D "$b" --quiet || true
done

echo "==> verifying the baseline"
npm test

echo "==> done: 6 passing, 4 skipped is the expected baseline"
