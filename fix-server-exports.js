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

async function fixServerDirectiveWithExports(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    
    // Check if this is an API route file
    const isApiRoute = filePath.includes('/api/') && (
      filePath.endsWith('/route.js') || 
      filePath.endsWith('/route.ts') || 
      filePath.endsWith('/route.jsx') || 
      filePath.endsWith('/route.tsx')
    );
    
    if (!isApiRoute) {
      return false;
    }
    
    // Check if "use server" directive is at the top and has config exports
    const hasUseServerAtTopWithExports = (
      (content.trim().startsWith('"use server"') || content.trim().startsWith("'use server'")) &&
      (content.includes('export const dynamic') || 
       content.includes('export const revalidate') || 
       content.includes('export const fetchCache'))
    );
    
    if (hasUseServerAtTopWithExports) {
      console.log(`Found file with 'use server' at top and config exports: ${path.relative(rootDirectory, filePath)}`);
      
      // Remove the "use server" directive from the top
      let modifiedContent = content.replace(/^["']use server["'];?\s*\n+/g, '');
      
      // Find the last config export
      const configExportPattern = /export\s+const\s+(dynamic|revalidate|fetchCache)\s*=/g;
      let match;
      let lastConfigExportIndex = -1;
      
      // Find all config exports and track the last one
      while ((match = configExportPattern.exec(modifiedContent)) !== null) {
        lastConfigExportIndex = match.index;
      }
      
      if (lastConfigExportIndex !== -1) {
        // Find the end of the config export statement
        const endOfConfigExport = modifiedContent.indexOf(';', lastConfigExportIndex);
        const newLineAfterExport = modifiedContent.indexOf('\n', endOfConfigExport);
        
        if (endOfConfigExport !== -1 && newLineAfterExport !== -1) {
          // Insert the "use server" directive after the config exports
          modifiedContent = 
            modifiedContent.slice(0, newLineAfterExport + 1) +
            '\n// Server-side directive - must be placed after config exports but before functions\n"use server";\n\n' +
            modifiedContent.slice(newLineAfterExport + 1);
          
          await writeFile(filePath, modifiedContent, 'utf8');
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return false;
  }
}

async function main() {
  let filesFixed = 0;
  
  console.log('Scanning for API route files with "use server" directive at top and const exports...');
  
  for await (const filePath of walk(appDirectory)) {
    const fixed = await fixServerDirectiveWithExports(filePath);
    if (fixed) {
      console.log(`✅ Fixed file: ${path.relative(rootDirectory, filePath)}`);
      filesFixed++;
    }
  }
  
  if (filesFixed > 0) {
    console.log(`\nFixed ${filesFixed} API route files with "use server" directive and config exports.`);
    console.log('Please rebuild your application to apply the changes.');
  } else {
    console.log('\nNo files needed fixing.');
  }
}

main().catch(console.error);
