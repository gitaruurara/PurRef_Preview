const fs = require('fs');
const pureref = require('./../js/pureref-util.js');
const imageSize = require('./../js/image-size.js');

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

			// 4. Return the result
            return resolve(item);
        }
        catch (err) {
            return reject(err);
        }
    });
}

