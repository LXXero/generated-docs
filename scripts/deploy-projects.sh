#!/bin/bash
# Multi-Project Deployment Script
# Deploys all projects or specific projects to the server
#
# Usage:
#   ./scripts/deploy-projects.sh                # Deploy all built projects
#   ./scripts/deploy-projects.sh project-name   # Deploy specific project
#   ./scripts/deploy-projects.sh -f            # Force deploy all
#   ./scripts/deploy-projects.sh project-name -f # Force deploy specific

set -e

# Configuration
SSH_HOST="${DEPLOY_SSH_HOST:-zx}"
SSH_USER="claude"
REMOTE_PARENT="/public_html/generated-docs"
BUILDS_DIR="builds"
PARENT_README="parent-README.txt"
BASE_URL="https://dosmenu.com/generated-docs"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Parse arguments
SPECIFIC_PROJECT=""
FORCE_DEPLOY=false

for arg in "$@"; do
    if [[ "$arg" == "-f" ]] || [[ "$arg" == "--force" ]]; then
        FORCE_DEPLOY=true
    else
        SPECIFIC_PROJECT="$arg"
    fi
done

echo -e "${GREEN}=== Multi-Project Deployment System ===${NC}\n"

# Check if builds directory exists
if [ ! -d "$BUILDS_DIR" ]; then
    echo -e "${RED}Error: Builds directory not found. Run 'npm run build-all' first.${NC}"
    exit 1
fi

# Function to deploy a single project
deploy_project() {
    local project_name="$1"
    local build_path="${BUILDS_DIR}/${project_name}"
    local remote_path="${REMOTE_PARENT}/${project_name}"
    local public_url="${BASE_URL}/${project_name}/"

    echo -e "\n${BLUE}▶ Deploying: ${project_name}${NC}"

    # Check if build exists
    if [ ! -d "$build_path" ]; then
        echo -e "${RED}   Error: Build not found at ${build_path}${NC}"
        return 1
    fi

    # Check if README.txt exists
    if [ ! -f "$build_path/README.txt" ]; then
        echo -e "${RED}   Error: README.txt not found in build${NC}"
        return 1
    fi

    echo -e "${YELLOW}   Target: ${remote_path}/${NC}"
    echo -e "${YELLOW}   URL: ${public_url}${NC}"

    # Create remote directories
    echo -e "${GREEN}   Creating remote directories...${NC}"
    sftp "${SSH_USER}@${SSH_HOST}" << EOF > /dev/null 2>&1
-mkdir ${REMOTE_PARENT}
-mkdir ${remote_path}
bye
EOF

    # Upload project files
    echo -e "${GREEN}   Uploading files...${NC}"
    scp -r ${build_path}/* "${SSH_USER}@${SSH_HOST}:${remote_path}/"

    echo -e "${GREEN}   ✓ Deployed successfully${NC}"
    echo -e "     ${public_url}"
}

# Ensure parent directory structure exists
echo -e "${GREEN}Setting up parent directory...${NC}"
sftp "${SSH_USER}@${SSH_HOST}" << EOF > /dev/null 2>&1
-mkdir ${REMOTE_PARENT}
bye
EOF

# Upload parent README
if [ -f "$PARENT_README" ]; then
    echo -e "${GREEN}Uploading parent README...${NC}"
    scp "${PARENT_README}" "${SSH_USER}@${SSH_HOST}:${REMOTE_PARENT}/README.txt"
fi

# Deploy projects
if [ -n "$SPECIFIC_PROJECT" ]; then
    # Deploy specific project
    deploy_project "$SPECIFIC_PROJECT"
else
    # Deploy all projects
    if [ ! -d "$BUILDS_DIR" ] || [ -z "$(ls -A $BUILDS_DIR)" ]; then
        echo -e "${RED}No built projects found in ${BUILDS_DIR}/${NC}"
        exit 1
    fi

    projects=($(ls -1 "$BUILDS_DIR"))
    echo -e "Found ${#projects[@]} project(s) to deploy:\n"
    for project in "${projects[@]}"; do
        echo "  - $project"
    done
    echo ""

    for project in "${projects[@]}"; do
        deploy_project "$project"
    done
fi

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
    fi
else
    echo -e "\n${YELLOW}⚠ Cloudflare cache purge skipped (set CF_ZONE_ID and CF_API_TOKEN)${NC}"
fi

echo -e "\n${GREEN}=== Deployment Complete! ===${NC}\n"
