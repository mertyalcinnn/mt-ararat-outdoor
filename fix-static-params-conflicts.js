#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Project root folder path
const rootDirectory = __dirname;
const appDirectory = path.join(rootDirectory, 'app');

async function* walk(dir) {
  const files = await readdir(dir);
  for (const file of files) {
    if (file.startsWith('.')) continue;
    const pathToFile = path.join(dir, file);
    const stats = await stat(pathToFile);
    if (stats.isDirectory()) {
      yield* walk(pathToFile);
    } else if (stats.isFile() && (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx'))) {
      yield pathToFile;
    }
  }
}

async function fixStaticParamsConflict(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    
    // Check if file has both "use client" and generateStaticParams
    if (
      (content.includes("'use client'") || content.includes('"use client"')) &&
      (content.includes('export async function generateStaticParams') || content.includes('export function generateStaticParams'))
    ) {
      console.log(`Found conflict in: ${path.relative(rootDirectory, filePath)}`);
      
      // Remove the "use client" directive
      let modifiedContent = content
        .replace(/'use client';\s*\n+/g, '')
        .replace(/"use client";\s*\n+/g, '');
      
      // Also remove any "use server" directives if present (they're not needed in a Server Component)
      modifiedContent = modifiedContent
        .replace(/'use server';\s*\n+/g, '')
        .replace(/"use server";\s*\n+/g, '');
      
      // Add a comment explaining this is a Server Component
      modifiedContent = `// This file is a Server Component by default (no "use client" directive)\n${modifiedContent}`;
      
      await writeFile(filePath, modifiedContent, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return false;
  }
}

async function main() {
  let fixedCount = 0;
  
  console.log('Scanning for "use client" and generateStaticParams conflicts...');
  
  for await (const filePath of walk(appDirectory)) {
    const fixed = await fixStaticParamsConflict(filePath);
    if (fixed) {
      console.log(`✅ Fixed conflict in: ${path.relative(rootDirectory, filePath)}`);
      fixedCount++;
    }
  }
  
  if (fixedCount > 0) {
    console.log(`\nFixed ${fixedCount} files with "use client" and generateStaticParams conflicts.`);
    console.log('Please rebuild your application to apply the changes.');
  } else {
    console.log('\nNo conflicts found between "use client" and generateStaticParams.');
  }
}

main().catch(console.error);
