import { register } from 'node:module';
import { createHash } from 'crypto';
import { URL, pathToFileURL } from 'node:url';

//TODO - this whole solution have become messy. We need a proper protocol and we need to boil things down to simplify

import { v1 as UUIDv1 } from 'uuid';

import net from 'net';


function sha256_hex(input) {
	return createHash('sha256').update(input).digest('hex');
}



let server_connection;
const code_queue = [];

const server = net.createServer((socket) => {
	server_connection = socket;
	socket.on('data', (chunk) => {
		const url = JSON.parse(chunk.toString());
		if (url === null) {
			socket.write(JSON.stringify('') + '\n');
			return;
		}
		const pending_code = code_queue.shift();
		if (pending_code === undefined) {
			socket.write(`not found ${url}\n`);
		} else {
			socket.write(JSON.stringify(pending_code) + '\n');
		}
	});
});





function create_top_url(checksum, parent_file) {
	const url = new URL('data://top');
	url.searchParams.set('hash', checksum);

	if (parent_file) {
		url.searchParams.set('parent_file', pathToFileURL(parent_file).href);
	}

	return url.href;
}


function dynamic_import(code, parent_file=undefined) {
	//In this version we don't want to reuse any modules so we will replace checksum with a time based hash or monotonic value

	const key = UUIDv1();
	code_queue.push(code);

	/*
	const checksum = sha256_hex(code);

	if (!code_seen.has(checksum)) {	// Only push to queue if it is a new checksum
		code_queue.push(code);
	}
	*/

	return import(create_top_url(key, parent_file)); // `data://top?hash=${checksum}`);
}

export async function start_module_server() {
	const result = await new Promise((resolve, reject) => {
		server.listen(0, '127.0.0.1', () => {
			const port = server.address().port;
			process.env.CODE_SOURCE_PORT = port;

			register('./dynamic-module-loader.js', import.meta.url);

			async function shutdown_server() {
				if (server_connection) {
					await server_connection.write('shutdown\n');
				}
				server.close();
			};

			async function synchronize_context(data) {
				if (server_connection) {
					await server_connection.write(`update ${JSON.stringify(data)}\n`);
				}
			};

			resolve({ dynamic_import, shutdown_server, synchronize_context });

		});
		server.on('error', reject);
	});
	return result;

}