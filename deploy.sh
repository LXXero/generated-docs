#!/bin/bash
# Radical Programming Timeline Deployment Script
# Deploys to webroot: /home/claude/public_html/radical-programming-timeline

set -e

# Parse arguments
FORCE_DEPLOY=false
if [[ "$1" == "-f" ]] || [[ "$1" == "--force" ]]; then
    FORCE_DEPLOY=true
fi

# Configuration
SSH_HOST="${DEPLOY_SSH_HOST:-zx}"
SSH_USER="claude"
# Path relative to chroot (/home/claude is the root)
REMOTE_BASE="/public_html/radical-programming-timeline"
BUILD_DIR="dist"
PUBLIC_URL="https://dosmenu.com/radical-programming-timeline/"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Radical Programming Timeline Deployment ===${NC}\n"

# Check if build directory exists
if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${RED}Error: Build directory not found. Run 'npm run build' first.${NC}"
    exit 1
fi

# Check if README.txt exists in build
if [ ! -f "$BUILD_DIR/README.txt" ]; then
    echo -e "${RED}Error: README.txt not found in build directory${NC}"
    exit 1
fi

echo -e "${YELLOW}Deployment Configuration:"
echo -e "SSH: ${SSH_USER}@${SSH_HOST}"
echo -e "Target: ${REMOTE_BASE}/"
echo -e "Public URL: ${PUBLIC_URL}${NC}\n"

echo -e "${GREEN}Creating remote directory if it doesn't exist...${NC}"
# Create the directory using SFTP (since no SSH access)
sftp "${SSH_USER}@${SSH_HOST}" << EOF
-mkdir ${REMOTE_BASE}
bye
EOF

echo -e "\n${GREEN}Uploading files to webroot...${NC}"
# Upload files directly to the project folder in webroot
scp -r ${BUILD_DIR}/* "${SSH_USER}@${SSH_HOST}:${REMOTE_BASE}/"

echo -e "\n${GREEN}=== Deployment Successful! ===${NC}\n"
echo -e "Deployed to: ${REMOTE_BASE}/"
echo -e "Public URL:  ${PUBLIC_URL}\n"

# List deployed files
echo -e "${GREEN}Verifying deployment...${NC}"
sftp "${SSH_USER}@${SSH_HOST}" << EOF
cd ${REMOTE_BASE}
!echo -e "\nFiles in directory:"
ls -l
bye
EOF

# Purge Cloudflare cache
if [ -n "$CF_ZONE_ID" ] && [ -n "$CF_API_TOKEN" ]; then
    echo -e "\n${GREEN}Purging Cloudflare cache...${NC}"
    PURGE_RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/purge_cache" \
         -H "Authorization: Bearer ${CF_API_TOKEN}" \
         -H "Content-Type: application/json" \
         --data '{"purge_everything":true}')

    if echo "$PURGE_RESPONSE" | grep -q '"success"[[:space:]]*:[[:space:]]*true'; then
        echo -e "${GREEN}✓ Cloudflare cache purged successfully${NC}"
    else
        echo -e "${YELLOW}⚠ Cloudflare cache purge failed${NC}"
        echo -e "${YELLOW}Response: $PURGE_RESPONSE${NC}"
    fi
else
    echo -e "\n${YELLOW}⚠ Cloudflare cache purge skipped (set CF_ZONE_ID and CF_API_TOKEN env vars)${NC}"
fi

echo -e "\n${GREEN}Done!${NC}"
