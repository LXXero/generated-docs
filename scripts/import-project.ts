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

function cleanAndTitleCase(str: string): string {
  // Extract trailing punctuation (!, ?, ., etc)
  const punctuationMatch = str.match(/([!?.,;:]+)\s*$/);
  const trailingPunctuation = punctuationMatch ? punctuationMatch[1] : '';

  // Remove trailing punctuation temporarily
  let cleaned = str.replace(/[!?.,;:]+\s*$/, '');

  // Remove non-alphanumeric characters except spaces (removes special chars like ⚡)
  cleaned = cleaned.replace(/[^a-zA-Z0-9\s]/g, '');

  // Convert to title case
  const titleCased = cleaned
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Add back trailing punctuation
  return titleCased + trailingPunctuation;
}

function extractTitleFromContent(content: string, type: 'tsx' | 'html'): string | null {
  // Try to extract title from various sources

  // For TSX: Look for h1 tags in JSX
  const h1Match = content.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1Match) {
    return cleanAndTitleCase(h1Match[1].trim());
  }

  // For HTML: Look for title tag or h1
  if (type === 'html') {
    const titleMatch = content.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch) {
      return cleanAndTitleCase(titleMatch[1].trim());
    }
  }

  // Look for common title patterns in strings
  const titlePatterns = [
    /title:\s*['"]([^'"]+)['"]/i,
    /name:\s*['"]([^'"]+)['"]/i,
  ];

  for (const pattern of titlePatterns) {
    const match = content.match(pattern);
    if (match) {
      return cleanAndTitleCase(match[1].trim());
    }
  }

  return null;
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function processImport(filename: string): void {
  const ext = path.extname(filename);
  const defaultProjectName = path.basename(filename, ext);

  if (!['.tsx', '.html'].includes(ext)) {
    console.log(`⚠️  Skipping ${filename} (unsupported file type)`);
    return;
  }

  const type = ext === '.tsx' ? 'tsx' : 'html';
  const sourcePath = path.join(IMPORT_DIR, filename);

  // Read file content to extract title
  const content = fs.readFileSync(sourcePath, 'utf-8');
  const extractedTitle = extractTitleFromContent(content, type);

  // Determine project name and title
  let projectName = defaultProjectName;
  let projectTitle = toTitleCase(defaultProjectName);

  if (extractedTitle) {
    projectName = slugify(extractedTitle);
    projectTitle = extractedTitle;
    console.log(`\n📦 Processing: ${filename}`);
    console.log(`   Detected title: "${extractedTitle}"`);
    console.log(`   Project name: ${projectName}`);
  } else {
    console.log(`\n📦 Processing: ${filename}`);
    console.log(`   Project name: ${projectName} (from filename)`);
  }

  console.log(`   Type: ${type}`);

  const projectDir = path.join(PROJECTS_DIR, projectName);
  const targetFile = path.join(projectDir, `index${ext}`);
  const metadataFile = path.join(projectDir, 'project.json');

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
    <title>${projectTitle}</title>
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
      title: projectTitle,
      description: `Interactive ${projectTitle}`,
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
