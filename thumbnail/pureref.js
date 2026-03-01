const fs = require('fs');
const pureref = require('./../js/pureref-util.js');
const imageSize = require('./../js/image-size.js');
const path = require('path');
const os = require('os');

// Setup logging with unique filename
const logDir = path.join(os.tmpdir(), 'pureref_logs');
if (!fs.existsSync(logDir)) {
	try {
		fs.mkdirSync(logDir, { recursive: true });
	} catch (e) {}
}
const uniqueSuffix = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
const logFile = path.join(logDir, `thumbnail_${uniqueSuffix}.log`);

function log(message) {
	const timestamp = new Date().toISOString();
	const logMessage = `[${timestamp}] ${message}\n`;
	try {
		fs.appendFileSync(logFile, logMessage, { encoding: 'utf8' });
	} catch (e) {}
}

module.exports = async ({ src, dest, item }) => {
	return new Promise(async (resolve, reject) => {
		try {
			log('='.repeat(80));
			log('THUMBNAIL GENERATION STARTED');
			log('Source: ' + src);
			log('Destination: ' + dest);
			log('Log: ' + logFile);
			log('='.repeat(80));

			if (!fs.existsSync(src)) {
				log('ERROR: Source file not found');
				return reject(new Error(`Source file not found: ${src}`));
			}
			log('Source verified');

			log('Exporting thumbnail...');
			await pureref.exportPureRefThumbnail(src, dest, 1000, 1000);
			log('Export completed');

			if (!fs.existsSync(dest)) {
				log('ERROR: Thumbnail not created');
				return reject(new Error(`Thumbnail not created: ${dest}`));
			}
			log('Thumbnail file exists: ' + fs.statSync(dest).size + ' bytes');

			log('Getting image size...');
			let size = await imageSize(dest);
			log('Size: ' + size.width + 'x' + size.height);

			if (!fs.existsSync(dest) || size.width === 0) {
				log('ERROR: Invalid image');
				return reject(new Error('Image is invalid'));
			}

			item.height = size?.height || item.height;
			item.width = size?.width || item.width;
			log('Item updated');

			// Create cache
			const cacheDir = path.dirname(src);
			const fileName = path.basename(src, '.pur');
			const cacheFile = path.join(cacheDir, `${fileName}_cache_hires.png`);
			log('Cache path: ' + cacheFile);

			if (!fs.existsSync(cacheFile)) {
				log('Creating high-res cache...');
				try {
					await pureref.exportPureRefThumbnail(src, cacheFile, 2000, 2000);
					log('Cache created: ' + (fs.existsSync(cacheFile) ? 'OK' : 'FAILED'));
				} catch (e) {
					log('Cache creation failed (non-fatal): ' + e.message);
				}
			}

			log('='.repeat(80));
			log('SUCCESS');
			log('='.repeat(80));
			return resolve(item);
		}
		catch (err) {
			log('='.repeat(80));
			log('FAILED: ' + err.message);
			log('='.repeat(80));
			return reject(err);
		}
	});
}

