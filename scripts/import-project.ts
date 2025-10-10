#!/usr/bin/env tsx
/**
 * Smart Import Processor
 * Automatically processes files from import/ directory into proper project structure
 *
 * Usage: npm run import
 *
 * Expected input: import/project-name.tsx or import/project-name.html
 * Output: projects/project-name/index.tsx (or .html) + project.json
 */

import * as fs from 'fs';
import * as path from 'path';

const IMPORT_DIR = path.join(process.cwd(), 'import');
const PROJECTS_DIR = path.join(process.cwd(), 'projects');

interface ProjectMetadata {
  name: string;
  title: string;
  description: string;
  type: 'tsx' | 'html';
}

function toTitleCase(str: string): string {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function processImport(filename: string): void {
  const ext = path.extname(filename);
  const projectName = path.basename(filename, ext);

  if (!['.tsx', '.html'].includes(ext)) {
    console.log(`⚠️  Skipping ${filename} (unsupported file type)`);
    return;
  }

  const type = ext === '.tsx' ? 'tsx' : 'html';
  const sourcePath = path.join(IMPORT_DIR, filename);
  const projectDir = path.join(PROJECTS_DIR, projectName);
  const targetFile = path.join(projectDir, `index${ext}`);
  const metadataFile = path.join(projectDir, 'project.json');

  console.log(`\n📦 Processing: ${filename}`);
  console.log(`   Project name: ${projectName}`);
  console.log(`   Type: ${type}`);

  // Create project directory
  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir, { recursive: true });
    console.log(`   ✓ Created directory: projects/${projectName}/`);
  }

  // Move file
  fs.renameSync(sourcePath, targetFile);
  console.log(`   ✓ Moved to: projects/${projectName}/index${ext}`);

  // For TSX projects, create HTML entry point and main wrapper
  if (type === 'tsx') {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${metadata ? metadata.title : toTitleCase(projectName)}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/main.tsx"></script>
  </body>
</html>`;

    const mainContent = `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './index.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`;

    const cssContent = `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  padding: 0;
}`;

    fs.writeFileSync(path.join(projectDir, 'index.html'), htmlContent);
    fs.writeFileSync(path.join(projectDir, 'main.tsx'), mainContent);
    fs.writeFileSync(path.join(projectDir, 'index.css'), cssContent);
    console.log(`   ✓ Generated index.html, main.tsx, and index.css`);
  }

  // Create or update project.json
  let metadata: ProjectMetadata;
  if (fs.existsSync(metadataFile)) {
    const existing = JSON.parse(fs.readFileSync(metadataFile, 'utf-8'));
    metadata = {
      ...existing,
      name: projectName,
      type: type,
    };
    console.log(`   ✓ Updated existing project.json`);
  } else {
    metadata = {
      name: projectName,
      title: toTitleCase(projectName),
      description: `Interactive ${toTitleCase(projectName)}`,
      type: type,
    };
    console.log(`   ✓ Created project.json`);
  }

  fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));
  console.log(`\n✅ Successfully imported: ${projectName}`);
  console.log(`   Title: ${metadata.title}`);
  console.log(`   Description: ${metadata.description}`);
}

// Main execution
console.log('🚀 Smart Import Processor\n');

if (!fs.existsSync(IMPORT_DIR)) {
  console.error('❌ Import directory not found!');
  process.exit(1);
}

if (!fs.existsSync(PROJECTS_DIR)) {
  fs.mkdirSync(PROJECTS_DIR, { recursive: true });
}

const files = fs.readdirSync(IMPORT_DIR);
const importFiles = files.filter(f => ['.tsx', '.html'].includes(path.extname(f)));

if (importFiles.length === 0) {
  console.log('📭 No files to import (import/ directory is empty)');
  console.log('\nDrop .tsx or .html files named like "project-name.tsx" in the import/ directory');
  process.exit(0);
}

console.log(`Found ${importFiles.length} file(s) to import:\n`);
importFiles.forEach(f => console.log(`  - ${f}`));

importFiles.forEach(processImport);

console.log('\n✨ Import complete!\n');
