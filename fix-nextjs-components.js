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

function getRelativePath(filePath) {
  return path.relative(rootDirectory, filePath);
}

async function fixGlobalErrorComponent() {
  const globalErrorPath = path.join(appDirectory, 'global-error.tsx');
  if (fs.existsSync(globalErrorPath)) {
    let content = await readFile(globalErrorPath, 'utf8');
    
    // Add 'use client' directive if it doesn't exist
    if (!content.trim().startsWith("'use client'") && !content.trim().startsWith('"use client"')) {
      content = "'use client';\n\n" + content;
      await writeFile(globalErrorPath, content, 'utf8');
      console.log(`✅ Added 'use client' directive to global-error.tsx`);
      return true;
    }
  }
  return false;
}

async function fixUseServerFunctions(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    
    // Skip files that are already marked as client components
    if (content.trim().startsWith("'use client'") || content.trim().startsWith('"use client"')) {
      return false;
    }
    
    // Check if this is a server component file with potential issues
    if (content.includes('function') && !content.includes("'use server'") && !content.includes('"use server"')) {
      let modifiedContent = content;
      
      // Add 'use server' directive to any exported function declarations
      const exportedFunctionRegex = /export\s+(async\s+)?function\s+(\w+)/g;
      if (exportedFunctionRegex.test(content)) {
        modifiedContent = modifiedContent.replace(
          exportedFunctionRegex,
          `"use server";\n\nexport $1function $2`
        );
      }
      
      // Add 'use server' directive to any exported arrow functions
      const exportedArrowFunctionRegex = /export\s+(const|let|var)\s+(\w+)\s*=\s*(async\s+)?\(\s*([^)]*)\s*\)\s*=>/g;
      if (exportedArrowFunctionRegex.test(content)) {
        modifiedContent = modifiedContent.replace(
          exportedArrowFunctionRegex,
          `"use server";\n\nexport $1 $2 = $3($4) =>`
        );
      }
      
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

async function fixComponentsExportingFunctions(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    
    // Skip files that are already marked as client components
    if (content.trim().startsWith("'use client'") || content.trim().startsWith('"use client"')) {
      return false;
    }
    
    // If this component exports a default function and is not marked as a client component,
    // check if it potentially passes functions to client components
    if (content.includes('export default') && content.includes('function') && content.includes('return')) {
      // Add 'use client' directive at the top
      const modifiedContent = '"use client";\n\n' + content;
      
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
  let serverFunctionsFixed = 0;
  let clientComponentsFixed = 0;
  
  console.log('Fixing Next.js Server/Client Component issues...');
  
  // First fix the global error component
  const globalErrorFixed = await fixGlobalErrorComponent();
  if (globalErrorFixed) {
    console.log('Fixed global error component by adding use client directive');
  }
  
  // Process all files in the app directory
  for await (const filePath of walk(appDirectory)) {
    // Try to fix server functions first
    const serverFunctionFixed = await fixUseServerFunctions(filePath);
    if (serverFunctionFixed) {
      console.log(`✅ Added 'use server' to: ${getRelativePath(filePath)}`);
      serverFunctionsFixed++;
      continue;
    }
    
    // If no server functions were fixed, try to fix components that might need to be client components
    const componentFixed = await fixComponentsExportingFunctions(filePath);
    if (componentFixed) {
      console.log(`✅ Added 'use client' to: ${getRelativePath(filePath)}`);
      clientComponentsFixed++;
    }
  }
  
  if (serverFunctionsFixed > 0 || clientComponentsFixed > 0 || globalErrorFixed) {
    console.log(`\nFixed ${serverFunctionsFixed} server functions with 'use server' directive.`);
    console.log(`Fixed ${clientComponentsFixed} components with 'use client' directive.`);
    console.log('Please rebuild your application to apply the changes.');
  } else {
    console.log('\nNo files needed modification.');
  }
}

main().catch(console.error);
