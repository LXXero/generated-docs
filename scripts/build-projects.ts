#!/usr/bin/env tsx
/**
 * Multi-Project Build Script
 * Builds all projects or specific projects from the projects/ directory
 *
 * Usage:
 *   npm run build-all              # Build all projects
 *   npm run build project-name     # Build specific project
 *
 * For .tsx projects: Builds with Vite
 * For .html projects: Copies to build directory
 * All projects: Generates README.txt from metadata
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const PROJECTS_DIR = path.join(process.cwd(), 'projects');
const BUILDS_DIR = path.join(process.cwd(), 'builds');
const PARENT_README_PATH = path.join(process.cwd(), 'parent-README.txt');

interface ProjectMetadata {
  name: string;
  title: string;
  description: string;
  type: 'tsx' | 'html';
}

function loadProjectMetadata(projectDir: string): ProjectMetadata | null {
  const metadataPath = path.join(projectDir, 'project.json');
  if (!fs.existsSync(metadataPath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
}

function generateReadme(metadata: ProjectMetadata): string {
  return `${metadata.title}\n${metadata.description}`;
}

function buildTsxProject(projectName: string, metadata: ProjectMetadata): void {
  const projectDir = path.join(PROJECTS_DIR, projectName);
  const buildDir = path.join(BUILDS_DIR, projectName);

  console.log(`   Building with Vite...`);

  // Create temporary vite config for this project
  const viteConfig = `
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/generated-docs/${projectName}/',
  root: '${projectDir}',
  build: {
    outDir: '${buildDir}',
    emptyOutDir: true,
  },
})
`;

  const tempConfigPath = path.join(process.cwd(), `.vite.config.${projectName}.ts`);
  fs.writeFileSync(tempConfigPath, viteConfig);

  try {
    execSync(`npx vite build --config ${tempConfigPath}`, {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
    fs.unlinkSync(tempConfigPath);
  } catch (error) {
    fs.unlinkSync(tempConfigPath);
    throw error;
  }

  console.log(`   ✓ Built to: builds/${projectName}/`);
}

function buildHtmlProject(projectName: string, metadata: ProjectMetadata): void {
  const projectDir = path.join(PROJECTS_DIR, projectName);
  const buildDir = path.join(BUILDS_DIR, projectName);

  console.log(`   Copying HTML files...`);

  // Create build directory
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }

  // Copy all files from project directory (recursive for subdirectories)
  function copyDir(srcDir: string, destDir: string): void {
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
      if (entry.name === 'project.json' && srcDir === projectDir) continue;
      const src = path.join(srcDir, entry.name);
      const dest = path.join(destDir, entry.name);
      if (entry.isDirectory()) {
        copyDir(src, dest);
      } else {
        fs.copyFileSync(src, dest);
      }
    }
  }
  copyDir(projectDir, buildDir);

  console.log(`   ✓ Copied to: builds/${projectName}/`);
}

function buildProject(projectName: string): void {
  console.log(`\n📦 Building: ${projectName}`);

  let currentProjectName = projectName;
  let projectDir = path.join(PROJECTS_DIR, projectName);
  const metadata = loadProjectMetadata(projectDir);

  if (!metadata) {
    console.log(`   ⚠️  Skipping (no project.json found)`);
    return;
  }

  // Check if directory name matches project.json name field
  if (metadata.name !== projectName) {
    console.log(`   🔄 Directory name mismatch detected`);
    console.log(`      Old: ${projectName}`);
    console.log(`      New: ${metadata.name}`);

    const newProjectDir = path.join(PROJECTS_DIR, metadata.name);

    // Rename the directory
    if (fs.existsSync(newProjectDir)) {
      console.log(`   ⚠️  Target directory already exists, skipping rename`);
    } else {
      fs.renameSync(projectDir, newProjectDir);
      console.log(`   ✓ Renamed directory to: ${metadata.name}`);

      // Clean up old build directory if it exists
      const oldBuildDir = path.join(BUILDS_DIR, projectName);
      if (fs.existsSync(oldBuildDir)) {
        fs.rmSync(oldBuildDir, { recursive: true, force: true });
        console.log(`   ✓ Cleaned up old build directory`);
      }

      // Update references
      currentProjectName = metadata.name;
      projectDir = newProjectDir;
    }
  }

  const buildDir = path.join(BUILDS_DIR, currentProjectName);

  // Ensure builds directory exists
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }

  // Build based on type
  if (metadata.type === 'tsx') {
    buildTsxProject(currentProjectName, metadata);
  } else if (metadata.type === 'html') {
    buildHtmlProject(currentProjectName, metadata);
  }

  // Generate README.txt
  const readmeContent = generateReadme(metadata);
  const readmePath = path.join(buildDir, 'README.txt');
  fs.writeFileSync(readmePath, readmeContent);
  console.log(`   ✓ Generated README.txt`);

  console.log(`✅ Successfully built: ${currentProjectName}`);
}

function ensureParentReadme(): void {
  const content = 'Generated Documents\nInteractive documentation and visualizations generated from code.';
  if (!fs.existsSync(PARENT_README_PATH)) {
    fs.writeFileSync(PARENT_README_PATH, content);
    console.log('✓ Created parent-README.txt');
  }
}

// Main execution
console.log('🚀 Multi-Project Build System\n');

if (!fs.existsSync(PROJECTS_DIR)) {
  console.error('❌ Projects directory not found!');
  process.exit(1);
}

ensureParentReadme();

const args = process.argv.slice(2);
const specificProject = args[0];

if (specificProject) {
  // Build specific project
  const projectPath = path.join(PROJECTS_DIR, specificProject);
  if (!fs.existsSync(projectPath)) {
    console.error(`❌ Project not found: ${specificProject}`);
    process.exit(1);
  }
  buildProject(specificProject);
} else {
  // Build all projects
  const projects = fs.readdirSync(PROJECTS_DIR).filter(p => {
    const stat = fs.statSync(path.join(PROJECTS_DIR, p));
    return stat.isDirectory();
  });

  if (projects.length === 0) {
    console.log('📭 No projects found in projects/ directory');
    process.exit(0);
  }

  console.log(`Found ${projects.length} project(s) to build:\n`);
  projects.forEach(p => console.log(`  - ${p}`));

  projects.forEach(buildProject);
}

console.log('\n✨ Build complete!\n');
