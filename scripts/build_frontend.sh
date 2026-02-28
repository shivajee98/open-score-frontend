#!/bin/bash
# Build and package frontend for deployment
set -e

ROOT="/home/shivajee/Desktop/open_score"
APP="frontend"
DEST="$ROOT/backend/public"

# Generate Build/Version Info
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
GIT_HASH=$(cd "$ROOT/backend" && git rev-parse --short HEAD)
VERSION_INFO="{\"version\": \"$TIMESTAMP\", \"commit\": \"$GIT_HASH\"}"

# Save to Frontend Out (for static verify)
mkdir -p "$ROOT/$APP/out"
echo "$VERSION_INFO" > "$ROOT/$APP/out/version.json"

# Save to Backend Public (for API verify)
echo "$VERSION_INFO" > "$ROOT/backend/public/api_version.json"

echo "🔨 Building $APP..."
cd "$ROOT/$APP"

# Temporarily rename .env.local to prevent it from leaking into the production build
if [ -f .env.local ]; then
    echo "⚠️  Temporarily hiding .env.local for production build"
    mv .env.local .env.local.temp
fi

npm run build

if [ -f .env.local.temp ]; then
    echo "✅ Restoring .env.local"
    mv .env.local.temp .env.local
fi

# Ensure version.json is still there after build
echo "$VERSION_INFO" > "$ROOT/$APP/out/version.json"

echo "📦 Zipping to $DEST/${APP}_dist.zip..."
cd "$ROOT/$APP/out"
rm -f "$DEST/${APP}_dist.zip"
zip -r "$DEST/${APP}_dist.zip" .

# Commit and Push
echo "🚀 Committing and Pushing to Backend Repo..."
cd "$ROOT/backend"
git add .
git commit -m "chore: update $APP build $TIMESTAMP" || echo "Nothing to commit"
git push -f origin main

echo "✅ $APP ready! Size: $(du -h "$DEST/${APP}_dist.zip" | cut -f1)"

echo "⏳ Waiting 10 seconds for GitHub to sync..."
sleep 10

echo "🌐 Triggering Deployment Phase 1 (Update Script)..."
curl -sL "https://api.msmeloan.sbs/deploy_v2.php?key=openscore_deploy_2026"

echo "⏳ Waiting 5 seconds..."
sleep 5

echo "🌐 Triggering Deployment Phase 2 (Apply Changes)..."
curl -sL "https://api.msmeloan.sbs/deploy_v2.php?key=openscore_deploy_2026"

echo "----------------------------------------"
echo "🔍 VERIFYING DEPLOYMENT..."

# Poll for Version Update
MAX_RETRIES=10
COUNT=0
URL="https://openscore.msmeloan.sbs/version.json"
EXPECTED_HASH="$GIT_HASH"

while [ $COUNT -lt $MAX_RETRIES ]; do
    REMOTE_JSON=$(curl -s "$URL")
    REMOTE_HASH=$(echo "$REMOTE_JSON" | grep -o '"commit": "[^"]*"' | cut -d'"' -f4)
    
    if [[ "$REMOTE_HASH" == "$EXPECTED_HASH" ]]; then
        echo "✅ SUCCESS: Live version matches local build ($REMOTE_HASH)"
        echo "✨ View at: https://openscore.msmeloan.sbs/"
        exit 0
    else
        echo "⏳ ($COUNT/$MAX_RETRIES) Waiting for update... (Remote: $REMOTE_HASH vs Local: $EXPECTED_HASH)"
        sleep 5
    fi
    COUNT=$((COUNT+1))
done

echo "❌ ERROR: Deployment verification timed out. Live version mismatch."
echo "Remote Content: $REMOTE_JSON"
exit 1
