#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';

// Read the three files
const loaderContent = readFileSync('beautiful-lyrics-loader.mjs', 'utf8');
const cssContent = readFileSync('beautiful-lyrics.css', 'utf8');
const mainModuleContent = readFileSync('beautiful-lyrics.mjs', 'utf8');

// Create the consolidated content
let consolidatedContent = loaderContent;

// Replace CSS link injection with inline style injection
const cssReplacement = `// --- Style Injection ---
// Inject the CSS content directly into the document
const style = document.createElement('style');
style.textContent = \`${cssContent.replace(/`/g, '\\`').replace(/\${/g, '\\${')}\`;
document.head.appendChild(style);
maid.add(() => style.remove()); // Add cleanup task to remove the style when no longer needed`;

consolidatedContent = consolidatedContent.replace(
  /\/\/ --- Style Injection ---[\s\S]*?maid\.add\(\(\) => style\.remove\(\)\); \/\/ Add cleanup task to remove the style when no longer needed/,
  cssReplacement
);

// Replace dynamic import with inline module execution
const moduleReplacement = `// --- Module Inline Execution ---
// Execute the main module code directly
try {
	// Wrap the main module in a function to create proper scope
	const moduleFunction = new Function('module', 'exports', \`
		${mainModuleContent.replace(/`/g, '\\`').replace(/\${/g, '\\${')}
		
		// Export the default function
		if (typeof module !== 'undefined' && module.exports) {
			return module.exports;
		}
		// Fallback: look for common export patterns
		if (typeof exports !== 'undefined') {
			return exports.default || exports;
		}
		return null;
	\`);
	
	const moduleExports = {};
	const module = { exports: moduleExports };
	const result = moduleFunction(module, moduleExports) || moduleExports;
	
	if (result && typeof result === 'function') {
		// Assuming the module exports a default function or class that needs to be instantiated or called
		const beautifulLyricsInstance = result();

		// If the imported module has a cleanup or 'destroy' method, add it to the maid
		if (typeof beautifulLyricsInstance?.destroy === 'function') {
			maid.add(() => beautifulLyricsInstance.destroy());
		}

		Spicetify.Snackbar.enqueueSnackbar("Beautiful Lyrics loaded successfully.", {
			variant: 'info',
			autoHideDuration: 3000
		});
	} else if (result && result.default && typeof result.default === 'function') {
		// Handle ES6 module export pattern
		const beautifulLyricsInstance = result.default();

		if (typeof beautifulLyricsInstance?.destroy === 'function') {
			maid.add(() => beautifulLyricsInstance.destroy());
		}

		Spicetify.Snackbar.enqueueSnackbar("Beautiful Lyrics loaded successfully.", {
			variant: 'info',
			autoHideDuration: 3000
		});
	} else {
		Spicetify.Snackbar.enqueueSnackbar("Failed to find default export in beautiful-lyrics module.", {
			variant: 'error',
			autoHideDuration: 5000
		});
	}
} catch (error) {
	console.error("Error loading beautiful-lyrics module:", error);
	Spicetify.Snackbar.enqueueSnackbar("Failed to load beautiful-lyrics module.", {
		variant: 'error',
		autoHideDuration: 5000
	});
}`;

consolidatedContent = consolidatedContent.replace(
  /\/\/ --- Module Import and Initialization ---[\s\S]*?}\);/,
  moduleReplacement
);

// Write the consolidated file
writeFileSync('beautiful-lyrics-consolidated.mjs', consolidatedContent);

console.log('✅ Consolidation complete! Output: beautiful-lyrics-consolidated.mjs');
console.log('⚠️  Note: Test the consolidated file thoroughly before distribution.');