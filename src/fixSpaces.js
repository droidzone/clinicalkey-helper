// Script to properly handle renaming for ClinicalKey files
// This avoids the double backslashes that were appearing in filenames

const fs = require('fs');
const path = require('path');

// Sample script content that would be created by the extension
const scriptContent = `#!/bin/bash

# ClinicalKey PDF Renamer Script
# Generated: ${new Date().toLocaleString()}
# This script renames downloaded PDF files to include chapter numbers and titles

# Color definitions for output
GREEN="\\033[0;32m"
RED="\\033[0;31m"
YELLOW="\\033[0;33m"
NC="\\033[0m" # No Color

# Export color variables for proper visibility
export GREEN RED YELLOW NC

# Counters for summary
TOTAL=0
SUCCESS=0
MISSING=0

echo "Starting PDF renaming process..."

`;

// Test entries similar to what would be created for each PDF
// Note: In these examples we're not escaping spaces with backslashes
const entries = [
  {
    originalFile: '3-s2.0-B9780443105203010017.pdf',
    newFile: 'Front Matter.pdf'
  },
  {
    originalFile: '3-s2.0-B9780443105203120015.pdf',
    newFile: 'Copyright.pdf'
  },
  {
    originalFile: '3-s2.0-B9780443105203000022.pdf',
    newFile: '1. Big data—Science fiction or clinically relevant?.pdf'
  }
];

// Create script content similar to what the extension would generate
let finalScript = scriptContent;

entries.forEach(entry => {
  // Sanitize quotes but don't escape spaces
  const sanitizedOriginal = entry.originalFile.replace(/"/g, '\\"');
  const sanitizedNew = entry.newFile.replace(/"/g, '\\"');
  
  // Add file check and mv command to script
  finalScript += `# Check for ${sanitizedOriginal}\n`;
  finalScript += `TOTAL=$((TOTAL+1))\n`;
  finalScript += `if [ -f "${sanitizedOriginal}" ]; then\n`;
  finalScript += `  mv "${sanitizedOriginal}" "${sanitizedNew}"\n`;
  finalScript += `  echo -e "${GREEN}✓${NC} Renamed: ${sanitizedOriginal} → ${sanitizedNew}"\n`;
  finalScript += `  SUCCESS=$((SUCCESS+1))\n`;
  finalScript += `else\n`;
  finalScript += `  echo -e "${RED}✗${NC} Warning: File ${sanitizedOriginal} not found"\n`;
  finalScript += `  MISSING=$((MISSING+1))\n`;
  finalScript += `fi\n`;
});

// Add summary section
finalScript += `
# Print summary
echo ""
echo -e "${YELLOW}===== Summary =====${NC}"
echo -e "Total files to process: ${TOTAL}"
echo -e "Successfully renamed: ${GREEN}${SUCCESS}${NC}"
echo -e "Missing files: ${RED}${MISSING}${NC}"
echo -e "${YELLOW}===================${NC}"

# End of renamer script
`;

// Write the script to a file
fs.writeFileSync('sample_rename_script.sh', finalScript);
console.log('Sample script created: sample_rename_script.sh');

// Log example of how the fix should be implemented in Popup.vue
console.log(`
FIX IMPLEMENTATION FOR Popup.vue:

1. Replace:
   const escapedOriginal = originalFilename.replace(/(["'\\s\\(\\)\\[\\]\\{\\}\\*\\?\\!\\^\\&\\$\\#\\@\\%\\|\\\\])/g, '\\\\$1');
   const escapedNew = newFilename.replace(/(["'\\s\\(\\)\\[\\]\\{\\}\\*\\?\\!\\^\\&\\$\\#\\@\\%\\|\\\\])/g, '\\\\$1');

   With:
   const sanitizedOriginal = originalFilename.replace(/"/g, '\\\\"');
   const sanitizedNew = newFilename.replace(/"/g, '\\\\"');

2. Replace all instances of escapedOriginal with sanitizedOriginal
3. Replace all instances of escapedNew with sanitizedNew
`);
