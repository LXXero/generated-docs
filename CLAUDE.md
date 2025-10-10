- i have a either a  .tsx or .html file i want to publish to my server and generate appropriate metadata for. In the case of the .tsx, I'd like to build a consumable HTML file, or in the case of html, simply publish it.

## Deployment Structure

All projects are deployed under `/public_html/generated-docs/` with the following structure:
- `/public_html/generated-docs/` - Parent directory with its own README.txt ("Generated Documents" / "Interactive documentation and visualizations generated from code.")
- `/public_html/generated-docs/project-name/` - Individual project folders

Each project folder needs a README.txt formatted as:
```
Project Title Here
A description of the project.
```

The README.txt should have a "pretty title" as the very first line, followed by a description.

## Build Process

For .tsx files:
1. Build using Vite with base path set to `/generated-docs/project-name/`
2. Generate README.txt in the dist/ folder
3. Deploy using SCP/SFTP (no SSH access, server is chrooted)

For .html files:
1. Rename to index.html
2. Generate README.txt
3. Deploy using same methods as above

## Deployment

- Use SCP/SFTP commands (reference: /Users/xero/dos-web-menu/deploy.sh)
- Server has no SSH access and is chrooted
- Deploy to `/public_html/generated-docs/project-name/`
- Upload parent-README.txt to `/public_html/generated-docs/README.txt`
- Clear Cloudflare cache after deployment
- Commit and push to GitHub after every change

The GitHub repo is named after this folder: "generated-docs"
