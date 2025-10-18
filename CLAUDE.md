# Multi-Project Publishing System

This is an automated system for publishing `.tsx` or `.html` files to a web server.

## Quick Reference

**Main Command:**
```bash
./deploy.sh
```
This does everything: import → build → deploy → git commit

## Project Structure

```
import/          # Drop new .tsx or .html files here
projects/        # Source projects (versioned)
builds/          # Build output (gitignored)
scripts/         # Automation scripts
```

## How It Works

### Smart Import (`scripts/import-project.ts`)
- Detects project titles from `<h1>` tags in source code
- Generates slugified project names
- Auto-creates project structure with all necessary files
- For TSX: generates `index.html`, `main.tsx`, `index.css`, `project.json`
- For HTML: just adds `project.json`

### Multi-Project Build (`scripts/build-projects.ts`)
- Builds all projects in `projects/` using Vite
- Outputs to `builds/project-name/`
- Generates `README.txt` from `project.json` metadata
- Sets base path to `/generated-docs/project-name/`

### Deployment (`scripts/deploy-projects.sh`)
- Uses SFTP (server is chrooted, no SSH access)
- Deploys to `/public_html/generated-docs/project-name/`
- Uploads parent README.txt
- Purges Cloudflare cache (requires `CF_ZONE_ID` and `CF_API_TOKEN`)

### All-in-One (`scripts/deploy.sh`)
- Checks for files in `import/` and runs import if needed
- Builds all projects
- Deploys all projects
- Auto-commits and pushes to git

## Server Details

- **SSH User:** `claude`
- **Host:** `${DEPLOY_SSH_HOST}` (default: `zx`)
- **Base Path:** `/public_html/generated-docs/`
- **Access:** SFTP only (chrooted environment)
- **Live URL:** https://dosmenu.com/generated-docs/

## Key Files

- `deploy.sh` - Symlink to `scripts/deploy.sh` (main command)
- `parent-README.txt` - Uploaded to server's parent directory
- `projects/*/project.json` - Per-project metadata

## Project Metadata Format

```json
{
  "name": "project-name",
  "title": "Pretty Project Title",
  "description": "Description of the project",
  "type": "tsx" | "html"
}
```

### Understanding `name` vs `title`

- **`name`**: The slugified directory/URL name (e.g., `sgi-web-browser-timeline`)
  - Used for directory structure and URLs
  - Changing this triggers automatic directory rename on next build
  - Affects the deployment path
  - **Leaves old directory on remote server!**

- **`title`**: The human-readable display title (e.g., "SGI Web Browser Timeline")
  - Used in README.txt on the server
  - Does NOT affect directory structure or URLs
  - Can be updated without triggering rename

**IMPORTANT for Claude**: When user requests to "update the name" or "update the title":
- **Always ask for clarification** which field they want to update (or both)
- Changing `name` will trigger directory rename and require manual cleanup of old remote directory
- Changing only `title` is safe and won't affect URLs

### Cleaning Up Old Remote Directories

When you rename a project (change the `name` field), the old directory remains on the server and must be manually cleaned up.

**Why not automated?** To prevent accidental deletions of content the user didn't intend to remove.

**Manual cleanup process using SFTP:**

```bash
# 1. List files in the old directory
sftp claude@zx <<'EOF'
ls /public_html/generated-docs/old-project-name/
bye
EOF

# 2. Remove each file one by one
sftp claude@zx <<'EOF'
rm /public_html/generated-docs/old-project-name/README.txt
rm /public_html/generated-docs/old-project-name/index.html
rm /public_html/generated-docs/old-project-name/index.css
rm /public_html/generated-docs/old-project-name/main.tsx
# ... remove any other files listed
bye
EOF

# 3. Remove the now-empty directory
sftp claude@zx <<'EOF'
rmdir /public_html/generated-docs/old-project-name
bye
EOF

# 4. Verify cleanup
sftp claude@zx <<'EOF'
ls /public_html/generated-docs/ | grep old-project-name
bye
EOF
```

**Note:** SFTP batch commands require removing files one-by-one before removing the directory.

## README.txt Format (for server)

```
Project Title Here
A description of the project.
```

First line is the title, second line is the description.

## Important Notes

- Title detection looks for `<h1>` tags first, falls back to filename
- All builds use Vite with React + Tailwind CSS
- Cloudflare cache is auto-purged on deploy
- Git commits are automated with descriptive messages
- The GitHub repo is named "generated-docs"

## Manual Commands

```bash
npm run import              # Process import/ directory
npm run build-all           # Build all projects
npm run build-project NAME  # Build specific project
npm run deploy-all          # Deploy all projects
npm run deploy              # Full pipeline (main command)
```
