const fs = require('fs');
const pureref = require('./../js/pureref-util.js');
const imageSize = require('./../js/image-size.js');
const path = require('path');

module.exports = async ({ src, dest, item }) => {
    return new Promise(async (resolve, reject) => {
        try {
			// 1. Export scene from .pur file to PNG using PureRef CLI
			await pureref.exportPureRefThumbnail(src, dest, 1000, 1000);
			let size = await imageSize(dest);

			// 2. Check if the result is correct
			if (!fs.existsSync(dest) || size.width === 0) {
                return reject(new Error(`PureRef scene export failed or image is invalid.`));
            }

			// 3. Update the item dimensions
            item.height = size?.height || item.height;
            item.width = size?.width || item.width;

			// 4. Create a cached high-resolution version in the same directory
			// This will be used by the viewer to avoid re-exporting every time
			const cacheDir = path.dirname(src);
			const fileName = path.basename(src, '.pur');
			const cacheFile = path.join(cacheDir, `${fileName}_cache_hires.png`);

			// Only generate cache if it doesn't already exist
			if (!fs.existsSync(cacheFile)) {
				console.log('[PureRef] Generating cached high-resolution version...');
				try {
					await pureref.exportPureRefThumbnail(src, cacheFile, 2000, 2000);
					console.log('[PureRef] Cache file created:', cacheFile);
				} catch (err) {
					console.log('[PureRef] Warning: Could not create cache file:', err.message);
					// Don't reject on cache failure - thumbnail is enough
				}
			}

			// 5. Return the result
            return resolve(item);
        }
        catch (err) {
            return reject(err);
        }
    });
}

