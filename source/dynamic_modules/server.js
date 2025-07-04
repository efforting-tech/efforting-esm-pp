import { register } from 'node:module';
import { readFile } from 'node:fs/promises';
import { createHash } from 'crypto';
import { URL, pathToFileURL } from 'node:url';

import { v1 as UUIDv1 } from 'uuid';

import net from 'net';


function sha256_hex(input) {
	return createHash('sha256').update(input).digest('hex');
}



let server_socket;
const code_queue = [];

const server = net.createServer((socket) => {
	socket.on('data', (chunk) => {
		const url = JSON.parse(chunk.toString());
		const pending_code = code_queue.shift();
		socket.write(JSON.stringify(pending_code) + '\n');
		server_socket = socket;
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

export function start_module_server() {
	return new Promise((resolve) => {

		server.listen(0, '127.0.0.1', async () => {
			const port = server.address().port;
			process.env.CODE_SOURCE_PORT = port;

			register('./dynamic-module-loader.js', import.meta.url);

			const shutdown_server = () => {
				server_socket?.write('shutdown\n');
				server.close();
			};

			resolve({ dynamic_import, shutdown_server });

		});
	});
}