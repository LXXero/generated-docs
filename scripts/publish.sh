#!/bin/bash
# One-Command Publishing System
# Automatically imports, builds, and deploys all projects
#
# Usage: npm run publish

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   🚀 ONE-COMMAND PUBLISH SYSTEM 🚀   ║${NC}"
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo ""

# Step 1: Check for files to import
if [ -d "import" ] && [ "$(ls -A import 2>/dev/null | grep -E '\.(tsx|html)$')" ]; then
    echo -e "${BLUE}📥 Step 1: Importing new projects...${NC}\n"
    npm run import
    echo ""
else
    echo -e "${YELLOW}📭 Step 1: No new files to import (skipping)${NC}\n"
fi

# Step 2: Build all projects
echo -e "${BLUE}🔨 Step 2: Building all projects...${NC}\n"
npm run build-all
echo ""

# Step 3: Deploy all projects
echo -e "${BLUE}🚀 Step 3: Deploying to server...${NC}\n"
npm run deploy-all
echo ""

# Step 4: Git commit and push (if there are changes)
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${BLUE}📝 Step 4: Committing changes to git...${NC}\n"
    git add -A

    # Generate commit message based on what changed
    CHANGED_PROJECTS=$(git diff --cached --name-only | grep "^projects/" | cut -d'/' -f2 | sort -u | tr '\n' ', ' | sed 's/,$//')

    if [ -n "$CHANGED_PROJECTS" ]; then
        COMMIT_MSG="Update projects: ${CHANGED_PROJECTS}

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
    else
        COMMIT_MSG="Update generated docs

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
    fi

    git commit -m "$COMMIT_MSG"
    git push
    echo ""
else
    echo -e "${YELLOW}📝 Step 4: No git changes to commit (skipping)${NC}\n"
fi

echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║        ✨ ALL DONE! ✨                ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "Your projects are live at: ${BLUE}https://dosmenu.com/generated-docs/${NC}"
echo ""
