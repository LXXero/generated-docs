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

  // Split into words and preserve original casing for analysis
  const words = cleaned.split(/\s+/).filter(word => word.length > 0);

  // Convert to title case with smart acronym detection
  const titleCased = words.map(word => {
    // 1. Short all-caps (2-4 chars) = likely acronym (ECS, API, CSS, 3D, HTML5)
    if (word.length >= 2 && word.length <= 4 && word === word.toUpperCase()) {
      return word;
    }

    // 2. Has mixed case = preserve it (handles iOS, macOS, WebGL, JavaScript)
    const hasLower = word !== word.toUpperCase();
    const hasUpper = word !== word.toLowerCase();
    const standardTitleCase = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();

    if (hasLower && hasUpper && word !== standardTitleCase) {
      return word; // Keep original mixed case
    }

    // 3. Otherwise, convert to title case
    return standardTitleCase;
  }).join(' ');

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

function extractDescriptionFromContent(content: string, type: 'tsx' | 'html'): string | null {
  // Try to extract description from various sources

  // Look for subheadline class (common in newspaper-style layouts)
  const subheadlineMatch = content.match(/<div class="subheadline"[^>]*>\s*([^<]+)\s*<\/div>/i);
  if (subheadlineMatch) {
    return subheadlineMatch[1].trim();
  }

  // Look for headline class (fallback)
  const headlineMatch = content.match(/<div class="headline"[^>]*>\s*([^<]+)\s*<\/div>/i);
  if (headlineMatch) {
    // Clean up the headline - remove the title prefix if present
    let headline = headlineMatch[1].trim();
    // Remove patterns like "TITLE: " from the beginning
    headline = headline.replace(/^[^:]+:\s*/, '');
    return headline;
  }

  // Look for meta description
  const metaMatch = content.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  if (metaMatch) {
    return metaMatch[1].trim();
  }

  // Look for common description patterns
  const descPatterns = [
    /description:\s*['"]([^'"]+)['"]/i,
    /subtitle:\s*['"]([^'"]+)['"]/i,
  ];

  for (const pattern of descPatterns) {
    const match = content.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  return null;
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')     // Remove special chars
    .replace(/\s+/g, '-')          // Convert spaces to dashes
    .replace(/-+/g, '-')           // Collapse multiple dashes
    .replace(/^[-\s]+|[-\s]+$/g, ''); // Remove leading/trailing dashes and spaces
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

  // Read file content to extract title and description
  const content = fs.readFileSync(sourcePath, 'utf-8');
  const extractedTitle = extractTitleFromContent(content, type);
  const extractedDescription = extractDescriptionFromContent(content, type);

  // Check for manual title override via environment variable
  const titleOverride = process.env.IMPORT_TITLE;

  // Determine project name and title
  let projectName = defaultProjectName;
  let projectTitle = toTitleCase(defaultProjectName);

  if (titleOverride) {
    projectName = slugify(titleOverride);
    projectTitle = titleOverride;
    console.log(`\n📦 Processing: ${filename}`);
    console.log(`   Title override: "${titleOverride}"`);
    console.log(`   Project name: ${projectName}`);
  } else if (extractedTitle) {
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
    const defaultDescription = extractedDescription || `Interactive ${projectTitle}`;
    metadata = {
      name: projectName,
      title: projectTitle,
      description: defaultDescription,
      type: type,
    };
    console.log(`   ✓ Created project.json`);
    if (extractedDescription) {
      console.log(`   ✓ Detected description from content`);
    }
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
