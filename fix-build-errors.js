#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Fix the global-error.tsx file
async function fixGlobalError() {
  const globalErrorPath = path.join(__dirname, 'app', 'global-error.tsx');
  
  if (fs.existsSync(globalErrorPath)) {
    try {
      let content = await readFile(globalErrorPath, 'utf8');
      
      // Add 'use client' directive if it doesn't exist
      if (!content.trim().startsWith("'use client'") && !content.trim().startsWith('"use client"')) {
        content = "'use client';\n\n" + content;
        await writeFile(globalErrorPath, content, 'utf8');
        console.log('✅ Added "use client" directive to global-error.tsx');
        return true;
      } else {
        console.log('No changes needed for global-error.tsx, already marked as client component');
      }
    } catch (error) {
      console.error('Error processing global-error.tsx:', error);
    }
  } else {
    console.log('global-error.tsx not found');
  }
  
  return false;
}

// Function to wrap route handlers with 'use server' directive
async function fixRouteHandlers() {
  const apiDirectory = path.join(__dirname, 'app', 'api');
  let modifiedCount = 0;
  
  if (fs.existsSync(apiDirectory)) {
    try {
      // Recursively get all .js, .ts, .jsx, .tsx files in the api directory
      const apiFiles = getAllFiles(apiDirectory, ['.js', '.ts', '.jsx', '.tsx']);
      
      for (const filePath of apiFiles) {
        let content = await readFile(filePath, 'utf8');
        
        // Skip files that are already marked
        if (content.includes("'use server'") || content.includes('"use server"')) {
          continue;
        }
        
        // Find route handlers and add 'use server' directive
        if (content.includes('export async function') || content.includes('export function')) {
          content = content.replace(
            /(export\s+)(async\s+)?(function\s+\w+)/g,
            '"use server";\n\n$1$2$3'
          );
          
          await writeFile(filePath, content, 'utf8');
          console.log(`✅ Added "use server" directive to: ${path.relative(__dirname, filePath)}`);
          modifiedCount++;
        }
      }
    } catch (error) {
      console.error('Error processing API routes:', error);
    }
  } else {
    console.log('API directory not found');
  }
  
  return modifiedCount;
}

// Helper function to get all files recursively
function getAllFiles(dir, extensions = []) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      // Recursively get files from subdirectories
      results = results.concat(getAllFiles(filePath, extensions));
    } else {
      // Check if file has one of the specified extensions
      if (extensions.length === 0 || extensions.includes(path.extname(filePath))) {
        results.push(filePath);
      }
    }
  });
  
  return results;
}

async function main() {
  console.log('Fixing Next.js build errors...');
  
  // Fix global error component
  const globalErrorFixed = await fixGlobalError();
  
  // Fix route handlers
  const routeHandlersFixed = await fixRouteHandlers();
  
  if (globalErrorFixed || routeHandlersFixed > 0) {
    console.log('\nFixed build errors. Please rebuild your application.');
  } else {
    console.log('\nNo files needed fixing.');
  }
}

main().catch(console.error);
