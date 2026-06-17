#!/bin/bash

# Auto-sync audit files to GitHub
# Run daily via cron: 0 23 * * * /Users/ellebrayton/Crazy\ Bowls\ and\ Wraps/audit/auto-sync.sh

AUDIT_DIR="/Users/ellebrayton/Crazy Bowls and Wraps/audit"
cd "$AUDIT_DIR"

# Check if there are changes
if [[ -z $(git status -s) ]]; then
    echo "$(date): No changes to commit" >> "$AUDIT_DIR/.sync-log"
    exit 0
fi

# Commit and push
git add -A
git commit -m "Auto-sync: $(date '+%Y-%m-%d %H:%M:%S')"
git push origin main

echo "$(date): Synced to GitHub" >> "$AUDIT_DIR/.sync-log"
