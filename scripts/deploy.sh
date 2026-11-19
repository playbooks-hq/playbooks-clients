#!/usr/bin/env bash
set -euo pipefail

case "${1:-staging}" in
  staging) source_branch=dev; target_branch=staging ;;
  production) source_branch=staging; target_branch=main ;;
  *) echo "Usage: scripts/deploy.sh [staging|production]" >&2; exit 2 ;;
esac
if (( $# > 1 )); then
  echo "Expected at most one deployment target." >&2
  exit 2
fi

# Promote the published source revision without switching the caller's worktree.
git fetch --no-tags origin "refs/heads/$source_branch" "refs/heads/$target_branch"
source_commit=$(git rev-parse "FETCH_HEAD^{commit}")
target_commit=$(git ls-remote --exit-code origin "refs/heads/$target_branch" | cut -f1)
if ! git merge-base --is-ancestor "$target_commit" "$source_commit"; then
  echo "Cannot fast-forward $target_branch to $source_branch. Reconcile the branches first." >&2
  exit 1
fi
git push origin "$source_commit:refs/heads/$target_branch"
