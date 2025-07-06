import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { resolve as path_resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';




const require = createRequire(pathToFileURL(path_resolve('../source/package.json')));
export const package_info = require('./package.json');
export const [package_name] = Object.keys(package_info.bin);

export function shell_escape(str) {
	return `'${str.replace(/'/g, `'\\''`)}'`;
}

export function sha256_file_sync(path) {
	const data = readFileSync(path);
	const hash = createHash('sha256');
	hash.update(data);
	return hash.digest('hex');
}


const release_file = `${package_info.name}-${package_info.version}.tgz`;

export const release = {
	name: release_file,

	sha256() {
		return sha256_file_sync(path_resolve('../build', release_file));
	}
};