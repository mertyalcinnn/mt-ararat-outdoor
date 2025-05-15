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

async function fixApiRouteServerDirectives(filePath) {
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
    
    // Check if "use server" directive is not at the top
    const hasUseServerNotAtTop = (
      content.includes('"use server"') || 
      content.includes("'use server'")
    ) && !(
      content.trim().startsWith('"use server"') || 
      content.trim().startsWith("'use server'")
    );
    
    if (hasUseServerNotAtTop) {
      // Remove all "use server" directives
      let modifiedContent = content.replace(/"use server";\s*\n+/g, '')
                                   .replace(/'use server';\s*\n+/g, '');
      
      // Add "use server" directive at the top
      modifiedContent = `"use server";\n\n${modifiedContent}`;
      
      await writeFile(filePath, modifiedContent, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return false;
  }
}

async function fixLayoutMetadataConflicts(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    
    // Check if this is a layout file with both "use client" and metadata export
    const isLayoutWithMetadata = (
      (filePath.endsWith('/layout.js') || 
       filePath.endsWith('/layout.ts') || 
       filePath.endsWith('/layout.jsx') || 
       filePath.endsWith('/layout.tsx')) &&
      (content.includes('export const metadata') || 
       content.includes('export let metadata') || 
       content.includes('export var metadata')) &&
      (content.trim().startsWith('"use client"') || 
       content.trim().startsWith("'use client'"))
    );
    
    if (isLayoutWithMetadata) {
      // Remove "use client" directive
      let modifiedContent = content.replace(/'use client';\s*\n+/g, '')
                                   .replace(/"use client";\s*\n+/g, '');
      
      // Add a comment to explain the change
      modifiedContent = `// REMOVED "use client" - this must be a Server Component to export metadata\n\n${modifiedContent}`;
      
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
  let apiRoutesFixed = 0;
  let layoutsFixed = 0;
  
  console.log('Scanning for Next.js file issues...');
  
  for await (const filePath of walk(appDirectory)) {
    // Fix API routes with "use server" not at the top
    const apiRouteFixed = await fixApiRouteServerDirectives(filePath);
    if (apiRouteFixed) {
      console.log(`✅ Fixed API route: ${path.relative(rootDirectory, filePath)}`);
      apiRoutesFixed++;
      continue;
    }
    
    // Fix layouts with "use client" and metadata
    const layoutFixed = await fixLayoutMetadataConflicts(filePath);
    if (layoutFixed) {
      console.log(`✅ Fixed layout with metadata: ${path.relative(rootDirectory, filePath)}`);
      layoutsFixed++;
    }
  }
  
  if (apiRoutesFixed > 0 || layoutsFixed > 0) {
    console.log(`\nFixed ${apiRoutesFixed} API routes with improper "use server" directive placement.`);
    console.log(`Fixed ${layoutsFixed} layouts with metadata conflicts.`);
    console.log('Please rebuild your application to apply the changes.');
  } else {
    console.log('\nNo files needed fixing.');
  }
}

main().catch(console.error);
