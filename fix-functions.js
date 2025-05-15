#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Next.js App folder path
const appDirectory = path.join(__dirname, 'app');

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

async function processFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    
    // Skip files that are already marked as client components
    if (content.trim().startsWith("'use client'") || content.trim().startsWith('"use client"')) {
      return false;
    }
    
    // Check if this is a server component file with potential issues
    if (content.includes('function') && !content.includes("'use server'") && !content.includes('"use server"')) {
      // Add 'use server' directive to any exported functions
      const modifiedContent = content.replace(
        /export\s+(async\s+)?function\s+(\w+)/g,
        `'use server';\n\nexport $1function $2`
      ).replace(
        /export\s+(const|let|var)\s+(\w+)\s*=\s*(async\s+)?\(\s*([^)]*)\s*\)\s*=>/g,
        `'use server';\n\nexport $1 $2 = $3($4) =>`
      );
      
      // If a change was made, save the file
      if (modifiedContent !== content) {
        await writeFile(filePath, modifiedContent, 'utf8');
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return false;
  }
}

async function main() {
  let modifiedCount = 0;
  
  console.log('Searching for server component functions...');
  
  for await (const filePath of walk(appDirectory)) {
    const modified = await processFile(filePath);
    if (modified) {
      console.log(`✅ Added 'use server' to: ${path.relative(__dirname, filePath)}`);
      modifiedCount++;
    }
  }
  
  if (modifiedCount > 0) {
    console.log(`\nAdded 'use server' directive to ${modifiedCount} files.`);
    console.log('Please rebuild your application to apply the changes.');
  } else {
    console.log('\nNo files needed modification.');
  }
}

main().catch(console.error);
