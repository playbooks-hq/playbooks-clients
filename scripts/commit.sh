#!/bin/bash
set -euo pipefail

if [ "$#" -ne 1 ] || [[ "$1" =~ ^[[:space:]]*$ ]]; then
  printf 'Usage: npm run commit -- "Commit message"\n' >&2
  exit 1
fi

cd "$(dirname "$0")/.."
branch=$(git symbolic-ref --quiet --short HEAD) || {
  printf 'Check out a branch before committing.\n' >&2
  exit 1
}

# Check the push target before creating a commit.
git rev-parse --abbrev-ref --symbolic-full-name '@{upstream}' >/dev/null 2>&1 || {
  printf 'Branch %s has no upstream. Set its upstream before using this helper.\n' "$branch" >&2
  exit 1
}

git status
git add --all
git commit -m "$1"
git push
