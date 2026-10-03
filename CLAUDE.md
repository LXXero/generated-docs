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
- `rsync --rsync-path="sudo rsync"` over the normal `ssh kh` account (the `~/git/zaxxon/DEPLOY.md` convention)
- Deploys to `/srv/www/dosmenu/generated-docs/project-name/` and runs `restorecon` (SELinux is enforcing)
- Uploads parent README.txt
- Purges Cloudflare cache (requires `CF_ZONE_ID` and `CF_API_TOKEN`)

### All-in-One (`scripts/deploy.sh`)
- Checks for files in `import/` and runs import if needed
- Builds all projects
- Deploys all projects
- Auto-commits and pushes to git

## Server Details

- **Host:** `${DEPLOY_SSH_HOST}` (default: `kh`, your normal account with sudo)
- **Base Path:** `/srv/www/dosmenu/generated-docs/`
- **Access:** rsync over SSH with `sudo rsync`; new directories get `restorecon` because SELinux is enforcing
- **Live URL:** https://dosmenu.com/generated-docs/
- History: the chrooted `claude` SFTP user did not survive the March 2026 kh rebuild, and because the old script discarded SFTP errors, deploys silently failed from then on (last successful upload 2026-02-13) until the switch to rsync

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

**Manual cleanup process:**

```bash
# 1. Look before you delete
ssh kh 'ls -la /srv/www/dosmenu/generated-docs/old-project-name/'

# 2. Remove the directory
ssh kh 'sudo rm -r /srv/www/dosmenu/generated-docs/old-project-name'

# 3. Verify cleanup
ssh kh 'ls /srv/www/dosmenu/generated-docs/ | grep old-project-name'
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

### Git Safety

**CRITICAL**: Never use `git add -f` (force flag) as it bypasses .gitignore and will commit `node_modules/`, `builds/`, and other ignored files to the repository.

- ✅ **Always use:** `git add .` or `git add projects/` (respects .gitignore)
- ❌ **Never use:** `git add -f .` (forces adding ignored files)

If you accidentally commit ignored files:
```bash
git reset --soft HEAD~1    # Undo commit, keep changes staged
git reset                   # Unstage everything
git add projects/           # Stage only what you need
git commit -m "message"
git push --force-with-lease origin main  # Fix remote
```

## Manual Commands

```bash
npm run import              # Process import/ directory
npm run build-all           # Build all projects
npm run build-project NAME  # Build specific project
npm run deploy-all          # Deploy all projects
npm run deploy              # Full pipeline (main command)
```

### Watchman glossary — words that already exist here

Reach for these before inventing anything. Each has a citable home.

| Term | Source | Use it for |
| --- | --- | --- |
| stratum, strata | NTP (RFC 5905) | the time-source hierarchy: GPS = stratum 0, down to relative timing |
| adaptive frequency hopping (AFH), channel map, channel classification | Bluetooth Core Spec | avoiding bad channels; the set of usable channels; per-channel quality assessment |
| channel blacklisting | 6TiSCH / TSCH literature | the same mechanism in the industrial-mesh vocabulary |
| TSCH, slotframe, timeslot | IEEE 802.15.4e | slotted time; the repeating slot schedule |
| reference-broadcast synchronization (RBS) | Elson, Girod & Estrin 2002 | receivers syncing off a broadcast's arrival time |
| look-ahead window | HOTP, RFC 4226 | tolerating counter/clock drift when rejoining |
| deterministic backoff | TDMA / MAC literature | ordered collision resolution instead of random backoff |
| hop set, dwell time, 20 dB bandwidth | 47 CFR 15.247 | the regulatory quantities, named as the rule names them |
| carrier sense, channel-activity detection (CAD) | radio / Semtech SX126x | listen-before-talk |
| repetition coding | coding theory | sending the same frame several times for reliability |
| supervision, supervised circuit, supervisory signal, trouble condition | NFPA 72 | a missing heartbeat is itself the alarm — the Watchman thesis |
| three-conductor circuit, conductors P, N and S | US 1,950,108 (Howe Mfg, filed 1927, granted 1934) | the whole Harrington circuit; the patents never name it beyond this, so this is the honest handle (short form: the P–N–S circuit). Do not write "Harrington's loop" or "Class-A loop" for the whole |
| box operating circuit (P–N), signaling circuit / signaling loop (S), signal circuit test relay | US 2,202,853 (Autocall Co., filed 1936, granted 1940) | the parts; "loop" attaches to S only, never the bundle |
| line side / return side; +L, +R, −L, −R terminals | US 1,950,108 | the positive/negative line and return convention |
| common wire c, trouble wire t, trouble-corrected wire o | US 2,202,853 | the 1936 trio = normal / trouble / restored; the citation behind "silence is itself an alarm" |
| supervisory signal, trouble signal, restoration, supervised circuit, Class A circuit | NFPA 72 | modern equivalents of the above — label them as equivalents, never as Harrington's terms (NFPA class designations postdate the patents) |
| proprietary supervising station | NFPA 72 | the modern equivalent of the plant-protection central panel, as against a municipal or central-station system |
| transmitter circuit (main / supervisory) | later Autocall usage, read from a C-957ACL terminal-block photo | UNVERIFIED — confirm before citing |
| cell, cell site | cellular radio | allowed in radio context; the global ban is on "cell" as a coinage for an environment |
| guard interval, retune | radio engineering | slot-edge margin; changing frequency |

Lint: `vale projects/watchman-fhss/index.html` (config in `.vale.ini`, rule in `styles/Terminology/`). It lowers the rate; it doesn't zero it.
