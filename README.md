# Generated Docs - Multi-Project Publishing System

An automated conveyor belt system for publishing interactive visualizations and documentation. Drop in a `.tsx` or `.html` file, and it handles everything: importing, building, deploying, and version control.

**Live at:** https://dosmenu.com/generated-docs/

## Features

- **Smart Import**: Automatically detects project titles from source code
- **Multi-Project Support**: Manage and deploy multiple projects simultaneously
- **Automated Building**: Vite-based builds for React/TSX projects
- **One-Command Deploy**: Import → Build → Deploy → Git Commit in one step
- **SFTP Deployment**: Works with chrooted servers (no SSH access needed)
- **Cloudflare Integration**: Auto-purges CDN cache on deploy

## Quick Start

### The One Command

Drop your file in `import/` and run:

```bash
./deploy.sh
```

That's it! Your project is now:
- ✅ Imported with proper structure
- ✅ Built with Vite
- ✅ Deployed to server
- ✅ Committed to git
- ✅ Live on the web

## Project Structure

```
generated-docs/
├── import/                          # Drop files here (.tsx or .html)
├── projects/                        # Source projects (versioned in git)
│   ├── radical-programming-timeline/
│   │   ├── index.tsx               # Your component
│   │   ├── index.html              # Auto-generated entry point
│   │   ├── main.tsx                # Auto-generated React bootstrap
│   │   ├── index.css               # Auto-generated Tailwind CSS
│   │   └── project.json            # Auto-generated metadata
│   └── another-project/
├── builds/                          # Build output (gitignored)
│   ├── radical-programming-timeline/
│   │   ├── index.html
│   │   ├── README.txt              # Auto-generated for server
│   │   └── assets/
│   └── another-project/
├── scripts/
│   ├── deploy.sh                   # Main deploy script
│   ├── import-project.ts           # Import processor
│   ├── build-projects.ts           # Build system
│   └── deploy-projects.sh          # Deployment to server
├── deploy.sh -> scripts/deploy.sh  # Symlink for convenience
└── package.json
```

## Workflow Details

### 1. Import Files

Drop your `.tsx` or `.html` file in the `import/` directory:

```bash
cp my-cool-viz.tsx import/
```

The import system will:
- Scan for `<h1>` tags to extract the project title
- Generate a slugified project name (e.g., "Cool Viz" → `cool-viz`)
- Create project structure in `projects/cool-viz/`
- For TSX: Auto-generate `index.html`, `main.tsx`, and `index.css`
- Create `project.json` with metadata

### 2. Build Projects

Build all projects or specific ones:

```bash
npm run build-all              # Build everything
npm run build-project my-viz   # Build specific project
```

Builds are output to `builds/project-name/` with:
- Compiled HTML, CSS, JS assets
- Auto-generated `README.txt` for server directory listing

### 3. Deploy to Server

Deploy all or specific projects:

```bash
npm run deploy-all             # Deploy everything
./scripts/deploy-projects.sh my-viz  # Deploy specific project
```

Deployment:
- Uses SFTP (works with chrooted servers)
- Uploads to `/public_html/generated-docs/project-name/`
- Updates parent README.txt
- Purges Cloudflare cache
- No SSH access required

### 4. All-in-One Deploy

The main command does everything:

```bash
./deploy.sh
# or
npm run deploy
```

This will:
1. Import any files in `import/` directory
2. Build all projects
3. Deploy to server
4. Commit and push to git

## Manual Commands

For finer control:

| Command | Description |
|---------|-------------|
| `npm run deploy` | **Main command** - Import, build, deploy, commit |
| `npm run import` | Process files from import/ directory |
| `npm run build-all` | Build all projects |
| `npm run build-project <name>` | Build specific project |
| `npm run deploy-all` | Deploy all built projects |
| `./scripts/deploy-projects.sh <name>` | Deploy specific project |

## Configuration

### Environment Variables

Set these for full functionality:

```bash
export DEPLOY_SSH_HOST=your-server-alias  # SSH host (default: zx)
export CF_ZONE_ID=your-cloudflare-zone-id
export CF_API_TOKEN=your-cloudflare-token
```

### Server Setup

The server expects:
- SFTP access (user: `claude`)
- Base path: `/public_html/generated-docs/`
- No SSH access required (chrooted environment)

### Project Metadata

Each project has a `project.json`:

```json
{
  "name": "radical-programming-timeline",
  "title": "RADICAL PROGRAMMING TIMELINE!",
  "description": "Interactive RADICAL PROGRAMMING TIMELINE!",
  "type": "tsx"
}
```

This metadata:
- Generates the `README.txt` for the server
- Sets the HTML `<title>` tag
- Is auto-detected from your source code's `<h1>` tag

## How Title Detection Works

The import system looks for:
1. `<h1>` tags in JSX/HTML (e.g., `<h1>RADICAL PROGRAMMING TIMELINE!</h1>`)
2. `title:` properties in the code
3. Falls back to filename if nothing found

Example:
- Input file: `whatever.tsx` with `<h1>RADICAL PROGRAMMING TIMELINE!</h1>`
- Detected title: "RADICAL PROGRAMMING TIMELINE!"
- Project name: `radical-programming-timeline`

## Server Directory Structure

Deployed projects appear as:

```
/public_html/generated-docs/
├── README.txt                          # Parent directory description
├── radical-programming-timeline/
│   ├── README.txt                      # Project description
│   ├── index.html
│   └── assets/
├── another-project/
│   ├── README.txt
│   ├── index.html
│   └── assets/
```

Each `README.txt` is formatted for directory listings:
```
Project Title Here
A description of the project.
```

## Tech Stack

- **Build Tool**: Vite 5.x
- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: SFTP via OpenSSH
- **CDN**: Cloudflare
- **Version Control**: Git/GitHub

## Development

### Adding Dependencies

```bash
npm install some-package
```

Dependencies are shared across all projects since they use the same `package.json`.

### Testing Locally

```bash
npm run build-project my-project
cd builds/my-project
python3 -m http.server 8000
# Open http://localhost:8000
```

### Cleaning Builds

```bash
rm -rf builds/*
npm run build-all
```

## Troubleshooting

**Import not detecting title?**
- Ensure your source has `<h1>Project Title</h1>` in the JSX
- Check that the h1 tag is properly closed
- The title should be static text, not a variable

**Build failing?**
- Check TypeScript errors in your component
- Ensure all imports are valid
- Verify React/Lucide icons are imported correctly

**Deploy failing?**
- Verify `DEPLOY_SSH_HOST` is set
- Check SSH key authentication is configured
- Ensure SFTP access to the server

**Cloudflare not purging?**
- Set `CF_ZONE_ID` and `CF_API_TOKEN` environment variables
- Verify API token has cache purge permissions

## Examples

### Example 1: Simple TSX Project

```bash
# Create your visualization
cat > import/my-viz.tsx << 'EOF'
export default function App() {
  return (
    <div className="p-8">
      <h1>My Cool Visualization</h1>
      <p>Hello world!</p>
    </div>
  )
}
EOF

# Deploy it
./deploy.sh

# Live at: https://dosmenu.com/generated-docs/my-cool-visualization/
```

### Example 2: HTML Project

```bash
# Create HTML file
cat > import/simple-page.html << 'EOF'
<!DOCTYPE html>
<html>
<head><title>Simple Page</title></head>
<body>
  <h1>Simple Page</h1>
  <p>Just a simple HTML page</p>
</body>
</html>
EOF

# Deploy it
./deploy.sh

# Live at: https://dosmenu.com/generated-docs/simple-page/
```

## License

MIT

## Credits

Built with Claude Code - The AI-powered CLI for software engineering.
