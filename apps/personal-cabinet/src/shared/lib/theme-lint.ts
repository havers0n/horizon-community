/**
 * Theme-Safe Color Linting Utility
 * Helps identify hardcoded colors that break light/dark theme consistency
 */

// Hardcoded color patterns that should be avoided
export const PROBLEMATIC_COLOR_PATTERNS = [
  // Gray colors that don't adapt to themes
  /text-gray-[0-9]+/g,
  /bg-gray-[0-9]+/g,
  /border-gray-[0-9]+/g,
  
  // Other hardcoded colors (unless specifically needed)
  /text-blue-[0-9]+/g,
  /bg-blue-[0-9]+/g,
  /text-green-[0-9]+/g,
  /bg-green-[0-9]+/g,
  /text-red-[0-9]+/g,
  /bg-red-[0-9]+/g,
  /text-yellow-[0-9]+/g,
  /bg-yellow-[0-9]+/g,
];

// Recommended semantic alternatives
export const SEMANTIC_COLOR_REPLACEMENTS = {
  // Text colors
  'text-gray-100': 'text-foreground',
  'text-gray-200': 'text-foreground',
  'text-gray-300': 'text-muted-foreground',
  'text-gray-400': 'text-muted-foreground',
  'text-gray-500': 'text-muted-foreground',
  'text-gray-600': 'text-muted-foreground',
  'text-gray-700': 'text-foreground',
  'text-gray-800': 'text-foreground',
  'text-gray-900': 'text-foreground',
  
  // Background colors
  'bg-gray-100': 'bg-muted',
  'bg-gray-200': 'bg-muted',
  'bg-gray-50': 'bg-background',
  'bg-gray-800': 'bg-card',
  'bg-gray-900': 'bg-background',
  
  // Status colors
  'text-green-200': 'text-success',
  'bg-green-900': 'bg-success/10',
  'text-red-200': 'text-destructive',
  'bg-red-900': 'bg-destructive/10',
  'text-blue-200': 'text-info',
  'bg-blue-900': 'bg-info/10',
  'text-yellow-200': 'text-warning',
  'bg-yellow-900': 'bg-warning/10',
} as const;

/**
 * Scan text content for problematic color usage
 */
export function findProblematicColors(content: string): Array<{
  pattern: string;
  line: number;
  suggestion?: string;
}> {
  const issues: Array<{
    pattern: string;
    line: number;
    suggestion?: string;
  }> = [];
  
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    PROBLEMATIC_COLOR_PATTERNS.forEach(pattern => {
      const matches = line.match(pattern);
      if (matches) {
        matches.forEach(match => {
          issues.push({
            pattern: match,
            line: index + 1,
            suggestion: SEMANTIC_COLOR_REPLACEMENTS[match as keyof typeof SEMANTIC_COLOR_REPLACEMENTS]
          });
        });
      }
    });
  });
  
  return issues;
}

/**
 * Generate a report of color issues in a file
 */
export function generateColorReport(filePath: string, content: string): string {
  const issues = findProblematicColors(content);
  
  if (issues.length === 0) {
    return `✅ ${filePath}: No theme-breaking colors found`;
  }
  
  let report = `⚠️  ${filePath}: Found ${issues.length} potential theme issues:\n`;
  
  issues.forEach(issue => {
    report += `  Line ${issue.line}: \"${issue.pattern}\"`;
    if (issue.suggestion) {
      report += ` → Consider using \"${issue.suggestion}\"`;
    }
    report += '\n';
  });
  
  return report;
}

/**
 * Auto-fix common color issues
 */
export function autoFixColors(content: string): string {
  let fixedContent = content;
  
  Object.entries(SEMANTIC_COLOR_REPLACEMENTS).forEach(([problematic, semantic]) => {
    const regex = new RegExp(`\\\\b${problematic}\\\\b`, 'g');
    fixedContent = fixedContent.replace(regex, semantic);
  });
  
  return fixedContent;
}

// Usage example for developers:
// import { findProblematicColors, generateColorReport } from '@/shared/lib/theme-lint';
// const issues = findProblematicColors(fileContent);
// console.log(generateColorReport('MyComponent.tsx', fileContent));
