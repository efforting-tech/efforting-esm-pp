import net from 'net';

import { URL, fileURLToPath, pathToFileURL } from 'node:url';
import { resolve as path_resolve, dirname } from 'path';
import { existsSync } from 'node:fs';

// Note - this loader can not share PROCESS_CONTEXT from context.js with the rest of the system
//	but we can transfer serializable data, which is useful since we might need access to some info, like configuration and current file


const PREFIX = 'data://top';
const loader_context = {};

let client;
let inflight = null;


function get_parent_filename(url) {
	const parent_file = (new URL(url)).searchParams.get('parent_file');
	return parent_file && fileURLToPath(parent_file);
}



export async function resolve(specifier, context, nextResolve) {
	//console.log("RESOLVE", specifier, context);

	if (context.parentURL.startsWith('data://top')) {

		const in_fs = specifier.startsWith('.') || specifier.startsWith('/');


		if (in_fs) {
			const dirs_to_check = [dirname(loader_context.pending_file.filename), ...loader_context.config.include_dirs];
			for (const dir of dirs_to_check) {
				//console.log('check import relative to script', specifier, dir);
				const resolved_path = path_resolve(dir, specifier);
				if (existsSync(resolved_path)) {
					const fileUrl = pathToFileURL(resolved_path).href;

					//console.log('FOUND', resolved_path);
					return {
						url: fileUrl,
						format: 'module',
						shortCircuit: true
					};

				}
			}
			//console.log('NOT FOUND', specifier);
			return nextResolve(specifier, context, nextResolve);

		} else {
			const parentPath = get_parent_filename(context.parentURL);
			if (parentPath) {
				return nextResolve(specifier, { ...context, parentURL: pathToFileURL(parentPath).href }, nextResolve);
			} else {
				return nextResolve(specifier, context, nextResolve);
			}
		}

	}

	if (specifier.startsWith(PREFIX)) {
		return {
			url: specifier,
			format: 'module',
			shortCircuit: true
		};
	} else if (specifier === 'data://connect') {
		return {
			url: specifier,
			format: 'module',
			shortCircuit: true,
		};

	}

	return nextResolve(specifier, context, nextResolve);
}




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
					//TODO: Way nicer handler
					if (line === 'shutdown') {
						//console.log("Shutdown loader");
						client.end();
						return;
					} else if (line.startsWith('update ')) {
						const data = JSON.parse(line.slice(7));
						Object.assign(loader_context, data);
					} else if (line.startsWith('not found ')) {
						throw new Error(`Module ${line.slice(10)} not found`);
					} else {
						const msg = JSON.parse(line);
						if (inflight) {
							inflight.resolve(msg);
							inflight = null;
						}
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
	if (url === 'data://connect') {
		await ensure_connection();

		const source = await new Promise((resolve, reject) => {
			inflight = { resolve, reject };
			client.write(JSON.stringify(null) + '\n');
		});

		return {
			format: 'module',
			source,
			shortCircuit: true,
		};
	} else if (!url.startsWith(PREFIX)) {
		return nextLoad(url, context, nextLoad);
	}

	await ensure_connection();

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
