const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { exec } = require('child_process');
const { promisify } = require('util');
const os = require('os');

const execAsync = promisify(exec);

// Setup logging to file with unique name
const logDir = path.join(os.tmpdir(), 'pureref_logs');
if (!fs.existsSync(logDir)) {
	try {
		fs.mkdirSync(logDir, { recursive: true });
	} catch (e) {}
}

const uniqueId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
const logFile = path.join(logDir, `pureref_${uniqueId}.log`);

function log(message) {
	const timestamp = new Date().toISOString();
	const logMessage = `[${timestamp}] ${message}\n`;
	try {
		fs.appendFileSync(logFile, logMessage, { encoding: 'utf8' });
	} catch (e) {}
}

/**
 * Finds PureRef.exe installation path
 */
async function findPureRefPath() {
	try {
		log('[findPureRefPath] Starting search...');

		if (process.env.PUREREF_PATH && fs.existsSync(process.env.PUREREF_PATH)) {
			log('[findPureRefPath] Found via PUREREF_PATH: ' + process.env.PUREREF_PATH);
			return process.env.PUREREF_PATH;
		}

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
					log('[findPureRefPath] Found at: ' + exePath);
					return exePath;
				}
			} catch (err) {}
		}

		try {
			const { stdout } = await execAsync('where PureRef.exe');
			const pureRefPath = stdout.trim().split('\n')[0];
			if (pureRefPath && fs.existsSync(pureRefPath)) {
				log('[findPureRefPath] Found via where: ' + pureRefPath);
				return pureRefPath;
			}
		} catch (err) {}

		log('[findPureRefPath] NOT FOUND');
		return null;
	} catch (err) {
		log('[findPureRefPath] Error: ' + err.message);
		return null;
	}
}

/**
 * Exports a scene from a .pur file to PNG using PureRef CLI
 * Uses spawn directly without batch file to handle full-width characters properly
 */
async function exportPureRefThumbnail(purFilePath, outputPath, width = 1000, height = 1000, options = {}) {
	return new Promise(async (resolve, reject) => {
		try {
			const pureRefPath = await findPureRefPath();

			if (!pureRefPath) {
				return reject(new Error('PureRef.exe not found'));
			}

			log('[PureRef] PureRef: ' + pureRefPath);
			log('[PureRef] Input: ' + purFilePath);
			log('[PureRef] Output: ' + outputPath);
			log('[PureRef] Dimensions: ' + width + 'x' + height);

			const outputDir = path.dirname(outputPath);
			if (!fs.existsSync(outputDir)) {
				fs.mkdirSync(outputDir, { recursive: true });
			}

			if (!fs.existsSync(purFilePath)) {
				return reject(new Error(`Input file not found: ${purFilePath}`));
			}

			let finalOutputPath = outputPath;
			if (!finalOutputPath.endsWith('.png')) {
				finalOutputPath = outputPath + '.png';
			}

			log('[PureRef] Final output: ' + finalOutputPath);
			log('[PureRef] Spawning PureRef process...');

			const args = [
				'-c', `load;${purFilePath}`,
				'-c', `exportScene;${finalOutputPath};${width};${height};false`,
				'-c', 'exit'
			];

			log('[PureRef] Args[0]: -c');
			log('[PureRef] Args[1]: ' + args[1]);
			log('[PureRef] Args[2]: -c');
			log('[PureRef] Args[3]: ' + args[3]);
			log('[PureRef] Args[4]: -c');
			log('[PureRef] Args[5]: ' + args[5]);

			const child = spawn(pureRefPath, args, {
				stdio: 'pipe',
				windowsHide: true,
				encoding: 'utf8'
			});

			let stdout = '';
			let stderr = '';

			if (child.stdout) {
				child.stdout.on('data', (data) => {
					stdout += data;
					log('[PureRef] OUT: ' + data);
				});
			}

			if (child.stderr) {
				child.stderr.on('data', (data) => {
					stderr += data;
					log('[PureRef] ERR: ' + data);
				});
			}

			child.on('error', (err) => {
				log('[PureRef] SPAWN ERROR: ' + err.message);
				return reject(err);
			});

			child.on('close', (code) => {
				log('[PureRef] EXIT CODE: ' + code);

				setTimeout(() => {
					log('[PureRef] Checking output file...');
					if (!fs.existsSync(finalOutputPath)) {
						log('[PureRef] ERROR: File not found at ' + finalOutputPath);
						return reject(new Error('Output file not created'));
					}

					const fileSize = fs.statSync(finalOutputPath).size;
					log('[PureRef] File exists, size: ' + fileSize);

					if (fileSize === 0) {
						log('[PureRef] ERROR: File is empty');
						return reject(new Error('Output file is empty'));
					}

					log('[PureRef] SUCCESS!');
					return resolve();
				}, 1500);
			});

		} catch (err) {
			log('[PureRef] EXCEPTION: ' + err.message);
			return reject(err);
		}
	});
}

module.exports = {
	exportPureRefThumbnail,
	findPureRefPath
};

