const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

/**
 * Finds PureRef.exe installation path from Windows Registry, environment variables, or common paths
 * @returns {Promise<string|null>} Path to PureRef.exe or null if not found
 */
async function findPureRefPath() {
	try {
		// Try environment variable first
		if (process.env.PUREREF_PATH && fs.existsSync(process.env.PUREREF_PATH)) {
			return process.env.PUREREF_PATH;
		}

		// Try common installation paths
		const commonPaths = [
			'C:\\Program Files\\PureRef\\PureRef.exe',
			'C:\\Program Files (x86)\\PureRef\\PureRef.exe',
			path.join(process.env.APPDATA || '', '..\\Local\\Programs\\PureRef\\PureRef.exe'),
			'C:\\PureRef\\PureRef.exe',
			path.join(process.env.USERPROFILE || '', 'AppData\\Local\\Programs\\PureRef\\PureRef.exe'),
		];

		for (const exePath of commonPaths) {
			try {
				if (fs.existsSync(exePath)) {
					return exePath;
				}
			} catch (err) {
				// Continue to next path
			}
		}

		// Try where command (Windows)
		try {
			const { stdout } = await execAsync('where PureRef.exe');
			const pureRefPath = stdout.trim().split('\n')[0];
			if (pureRefPath && fs.existsSync(pureRefPath)) {
				return pureRefPath;
			}
		} catch (err) {
			// Continue
		}

		return null;
	} catch (err) {
		console.error('Error finding PureRef path:', err);
		return null;
	}
}

/**
 * Exports a scene from a .pur file to PNG using PureRef CLI
 * @param {string} purFilePath - Path to the .pur file
 * @param {string} outputPath - Output PNG file path
 * @param {number} width - Export width (default: 1000)
 * @param {number} height - Export height (default: 1000)
 * @param {Object} options - Additional options (currently unused)
 * @returns {Promise<void>}
 */
async function exportPureRefThumbnail(purFilePath, outputPath, width = 1000, height = 1000, options = {}) {
	return new Promise(async (resolve, reject) => {
		const tempBatchFile = path.join(path.dirname(outputPath), 'pureref_temp.bat');

		try {
			const pureRefPath = await findPureRefPath();

			if (!pureRefPath) {
				return reject(new Error('PureRef.exe not found. Please install PureRef or set PUREREF_PATH environment variable.'));
			}

			console.log('[PureRef] Found PureRef at:', pureRefPath);
			console.log('[PureRef] Input file:', purFilePath);
			console.log('[PureRef] Output path:', outputPath);

			// Create output directory if it doesn't exist
			const outputDir = path.dirname(outputPath);
			if (!fs.existsSync(outputDir)) {
				fs.mkdirSync(outputDir, { recursive: true });
			}

			// Verify input file exists
			if (!fs.existsSync(purFilePath)) {
				return reject(new Error(`PureRef input file not found: ${purFilePath}`));
			}

			// Ensure output path has .png extension
			let finalOutputPath = outputPath;
			if (!finalOutputPath.endsWith('.png')) {
				finalOutputPath = outputPath + '.png';
				console.log('[PureRef] Added .png extension:', finalOutputPath);
			}

			// For batch files, backslashes must be doubled (escaped)
			// Example: D:\path\to\file becomes D:\\path\\to\\file in batch syntax
			const batchPurPath = purFilePath.replace(/\\/g, '\\\\');
			const batchOutputPath = finalOutputPath.replace(/\\/g, '\\\\');

			// Create batch file - this will be executed by cmd.exe
			// cmd.exe will interpret the doubled backslashes as single backslashes
			const batchContent = `@echo off\n"${pureRefPath}" -c "load;${batchPurPath}" -c "exportScene;${batchOutputPath};${width};${height};false" -c "exit"\n`;

			console.log('[PureRef] Creating batch file:', tempBatchFile);
			fs.writeFileSync(tempBatchFile, batchContent);

			console.log('[PureRef] Executing command...');

			// Execute batch file
			const { stdout, stderr } = await execAsync(`"${tempBatchFile}"`, {
				timeout: 60000,
				maxBuffer: 10 * 1024 * 1024,
				shell: 'cmd.exe'
			});

			console.log('[PureRef] Command output:', stdout || '(empty)');
			if (stderr) {
				console.log('[PureRef] Errors:', stderr);
			}

			// Wait for file system to sync
			await new Promise(resolve => setTimeout(resolve, 1500));

			// Check if output file was created
			if (!fs.existsSync(finalOutputPath)) {
				return reject(new Error(`PureRef export failed. Output file not created at: ${finalOutputPath}`));
			}

			const fileSize = fs.statSync(finalOutputPath).size;
			if (fileSize === 0) {
				return reject(new Error(`PureRef export created empty file at: ${finalOutputPath}`));
			}

			console.log('[PureRef] Export successful! File size:', fileSize, 'bytes');

			return resolve();
		} catch (err) {
			console.error('[PureRef] Export error:', err);
			return reject(new Error(`PureRef export error: ${err.message}`));
		} finally {
			// Clean up batch file
			if (fs.existsSync(tempBatchFile)) {
				try {
					fs.unlinkSync(tempBatchFile);
					console.log('[PureRef] Cleaned up temporary batch file');
				} catch (err) {
					console.log('[PureRef] Warning: Could not delete batch file');
				}
			}
		}
	});
}

module.exports = {
	findPureRefPath: findPureRefPath,
	exportPureRefThumbnail: exportPureRefThumbnail
};


