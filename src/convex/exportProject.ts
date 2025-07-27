"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

export const getAllFiles = action({
  args: {},
  returns: v.object({
    files: v.record(v.string(), v.string()),
    timestamp: v.string(),
  }),
  handler: async () => {
    const projectFiles: Record<string, string> = {};
    
    // Function to recursively read files
    const readDirectory = (dirPath: string, basePath: string = "") => {
      try {
        const items = readdirSync(dirPath);
        
        for (const item of items) {
          const fullPath = join(dirPath, item);
          const relativePath = basePath ? join(basePath, item) : item;
          
          try {
            const stat = statSync(fullPath);
            
            if (stat.isDirectory()) {
              // Skip node_modules, .git, and other build directories
              if (!['node_modules', '.git', 'dist', 'build', '.next', '_generated'].includes(item)) {
                readDirectory(fullPath, relativePath);
              }
            } else if (stat.isFile()) {
              // Only include relevant file types
              const ext = item.split('.').pop()?.toLowerCase();
              if (['ts', 'tsx', 'js', 'jsx', 'css', 'json', 'md', 'html', 'svg'].includes(ext || '')) {
                try {
                  const content = readFileSync(fullPath, 'utf-8');
                  projectFiles[relativePath] = content;
                } catch (readError) {
                  console.warn(`Could not read file ${relativePath}:`, readError);
                }
              }
            }
          } catch (statError) {
            console.warn(`Could not stat ${relativePath}:`, statError);
          }
        }
      } catch (dirError) {
        console.warn(`Could not read directory ${dirPath}:`, dirError);
      }
    };

    // Read from current working directory
    readDirectory('.');
    
    return {
      files: projectFiles,
      timestamp: new Date().toISOString(),
    };
  },
});
