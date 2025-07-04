import net from 'net';

import { URL, fileURLToPath, pathToFileURL } from 'node:url';
import { resolve as path_resolve } from 'path';



const PREFIX = 'data://top';



function get_parent_filename(url) {
	const parent_file = (new URL(url)).searchParams.get('parent_file');
	return parent_file && fileURLToPath(parent_file);
}



export async function resolve(specifier, context, nextResolve) {
	//console.log("RESOLVE", specifier, context);

	if (context.parentURL.startsWith('data://top')) {

		const in_fs = specifier.startsWith('.') || specifier.startsWith('/');

		if (!in_fs) {
			const parentPath = get_parent_filename(context.parentURL);
			if (parentPath) {
				return nextResolve(specifier, { ...context, parentURL: pathToFileURL(parentPath).href }, nextResolve);
			} else {
				return nextResolve(specifier, context, nextResolve);
			}
		}

		const fileUrl = specifier.startsWith('file://') ? specifier : pathToFileURL(path_resolve(specifier)).href;

		return {
			url: fileUrl,
			format: 'module',
			shortCircuit: true
		};

	} else if (specifier === 'data://context') {

		const fileUrl = pathToFileURL(path_resolve(import.meta.dirname, 'context.js')).href;

		return {
			url: fileUrl,
			format: 'module',
			shortCircuit: true
		};

	}


	if (specifier.startsWith(PREFIX)) {
		return {
			url: specifier,
			format: 'module',
			shortCircuit: true
		};
	}
	return nextResolve(specifier, context, nextResolve);
}


let client;
let inflight = null;

function ensure_connection() {
	if (!client) {
		client = net.connect(process.env.CODE_SOURCE_PORT, '127.0.0.1');
		let buffer = '';

		client.on('data', (chunk) => {
			buffer += chunk.toString();
			let newlineIndex;
			while ((newlineIndex = buffer.indexOf('\n')) >= 0) {
				const line = buffer.slice(0, newlineIndex);
				buffer = buffer.slice(newlineIndex + 1);
				try {
					if (line === 'shutdown') {
						//console.log("Shutdown loader");
						client.end();
						return;
					}
					const msg = JSON.parse(line);
					if (inflight) {
						inflight.resolve(msg);
						inflight = null;
					}
				} catch (err) {
					if (inflight) {
						inflight.reject(err);
						inflight = null;
					}
				}
			}
		});

		client.on('error', (err) => {
			if (inflight) {
				inflight.reject(err);
				inflight = null;
			}
		});
	}
}

export async function load(url, context, nextLoad) {

	if (!url.startsWith(PREFIX)) {
		return nextLoad(url, context, nextLoad);
	}

	ensure_connection();

	const source = await new Promise((resolve, reject) => {
		inflight = { resolve, reject };
		client.write(JSON.stringify(url) + '\n');
	});

	return {
		format: 'module',
		source,
		shortCircuit: true,
	};
}
