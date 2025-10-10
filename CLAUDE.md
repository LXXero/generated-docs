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
