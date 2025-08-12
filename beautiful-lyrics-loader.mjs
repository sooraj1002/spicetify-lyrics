// beautiful-lyrics-loader.mjs

// Wait for Spicetify and its components to be available
await new Promise(resolve => {
	const interval = setInterval(() => {
		if (Spicetify?.Snackbar) {
			clearInterval(interval);
			resolve();
		}
	}, 100);
});

// A simple cleanup utility
const createMaid = () => {
	const tasks = [];
	return {
		add: (task) => tasks.push(task),
		destroy: () => tasks.forEach(task => {
			try {
				task();
			} catch (e) {
				console.error("Error during cleanup:", e);
			}
		}),
	};
};

const maid = createMaid();

// --- Style Injection ---
// Inject the local beautiful-lyrics.css file into the document
const style = document.createElement('link');
style.rel = 'stylesheet';
style.href = 'beautiful-lyrics.css';
document.head.appendChild(style);
maid.add(() => style.remove()); // Add cleanup task to remove the style when no longer needed

// --- Module Import and Initialization ---
// Dynamically import the local beautiful-lyrics.mjs file
import('./beautiful-lyrics.mjs')
	.then(module => {
		if (module.default) {
			// Assuming the module exports a default function or class that needs to be instantiated or called
			const beautifulLyricsInstance = module.default();

			// If the imported module has a cleanup or 'destroy' method, add it to the maid
			if (typeof beautifulLyricsInstance?.destroy === 'function') {
				maid.add(() => beautifulLyricsInstance.destroy());
			}

			Spicetify.Snackbar.enqueueSnackbar("Beautiful Lyrics loaded successfully.", {
				variant: 'info',
				autoHideDuration: 3000
			});
		} else {
			Spicetify.Snackbar.enqueueSnackbar("Failed to find default export in beautiful-lyrics.mjs.", {
				variant: 'error',
				autoHideDuration: 5000
			});
		}
	})
	.catch(error => {
		console.error("Error loading beautiful-lyrics.mjs:", error);
		Spicetify.Snackbar.enqueueSnackbar("Failed to load beautiful-lyrics.mjs.", {
			variant: 'error',
			autoHideDuration: 5000
		});
	});

// You can manually call `maid.destroy()` in the console to clean up the added styles and module effects if needed.