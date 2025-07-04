import { argument_parser } from './argument-schema.js';
import { format_arguments } from './help-formatter.js';
import { start_module_server } from './dynamic_modules/server.js';
import { Property_Stack, Object_Snapshot_Stack } from 'efforting.tech-framework/data/stack.js';

import { pathToFileURL } from 'node:url';
import { resolve as path_resolve } from 'node:path';
import { readdirSync, statSync } from 'node:fs';

import { require_style } from './style-registry.js';

import { inspect } from 'node:util';


export async function load_all_styles() {
	const directory = path_resolve(import.meta.dirname, 'styles');
	for (const file of readdirSync(directory)) {
		const full_path = path_resolve(directory, file);
		if (statSync(full_path).isFile()) {
			await import(pathToFileURL(full_path));
		}
	}
}



import * as AT from './application-types.js';
import * as fs from 'node:fs';


const file_contents_cache = {};

export function print_help() {
	console.log(format_arguments(argument_parser))
}

//TODO - the operation processing should probably be put in a function for easier reuse and for keeping this function small and neat
export async function run_application(config) {
	const state = new AT.Result();
	state.config = config;

	await load_all_styles();

	Object.assign(state, await start_module_server());
	state.context = (await import('data://context')).PROCESS_CONTEXT;
	Object.assign(state.context, {
		config: state.config,
		locals: {},
	});
	state.context_stack = new Property_Stack(state.context);
	state.locals_stack = new Object_Snapshot_Stack(state.context.locals);

	try {
		for (const operation of config.operations) {

			switch (operation.constructor) {
				case Symbol:
					switch (operation) {
						case AT.PUSH_LOCALS:
							state.locals_stack.push();
							break;

						case AT.POP_LOCALS:
							state.locals_stack.pop();
							break;

						default:
							throw new Error(`Unhandled symbol: ${operation.description}`);
					}
					break;

				case AT.Process_File:
					await process_file(state, operation);
					break;

				case AT.Process_Files_From_List_File:
					for (const file_to_process of get_file_contents(operation.filename, operation.encoding ?? 'utf8', data => data.split(/\n/))) {
						await process_file(state, new AT.Process_File(file_to_process, operation.style, operation.encoding));
					}
					break;

				case AT.Literal_Definition:
					state.context.locals[operation.name] = operation.value;
					break;

				case AT.Literal_File_Definition:
					state.context.locals[operation.name] = get_file_contents(operation.filename, operation.encoding ?? 'utf8');
					break;

				case AT.JSON_Definition_File:
					Object.assign(state.context.locals, get_file_contents(operation.filename, operation.encoding ?? 'utf8', JSON.parse));
					break;

				case AT.Evaluatory_Definition:

					const context_url = pathToFileURL(path_resolve(import.meta.dirname, 'dynamic_modules/context.js'));

					state.context_stack.push({result: null});

					const key_names = Object.keys(state.context.locals).join(', ');
					const names = Object.keys(state.context.locals);

					const ingress =
						`import { PROCESS_CONTEXT as __ESM_PROCESS_CONTEXT__ } from ${JSON.stringify(context_url.href)};\n`+
						`const {${key_names}} = __ESM_PROCESS_CONTEXT__.locals\n`+
						`__ESM_PROCESS_CONTEXT__.result = `;

					const initial_lines = ingress.split(/\n/).length;
					const expression = ingress + `\n${operation.value}`;

					try {
						await state.dynamic_import(expression, 'dynamic.js');
					} catch (err) {
						const match = err.stack.match(/:(\d+):(\d+)$/m);
						if (match) {
							const [line, col] = match.slice(1);
							throw new Error(
								`Error in expression during dynamic evaluation (line ${line-initial_lines}, column ${col}) of definition "${operation.name}" when handling "${state.context.pending_file_name}"\n` +
								`\n${err.stack}\n`
							);
						} else {
							throw new Error(
								`Error in dynamic evaluation of definition "${operation.name}" when handling "${state.context.pending_file_name}"\n` +
								`\n${err.stack}\n`
							);
						}
					}

					state.context.locals[operation.name] = state.context.result;
					state.context_stack.pop();

					break;


				default:
					throw new Error(`Unhandled operation: ${operation.constructor}`);
			}

		}
	} finally {
		state.shutdown_server();
	}
}

export function get_file_contents(filename, encoding, post_processor=null) {
	const key = JSON.stringify([filename, encoding, post_processor]);
	if (key in file_contents_cache) {
		return file_contents_cache[key];
	} else {
		const file_contents = fs.readFileSync(filename, encoding);
		const result = post_processor ? post_processor(file_contents) : file_contents;
		file_contents_cache[key] = result;
		return result;
	}
}




export async function process_file(state, input_file) {

	state.context_stack.push({
		pending_file: input_file,
		pending_file_contents: get_file_contents(input_file.filename, input_file.encoding ?? 'utf8'),
	});

	const style = require_style(input_file.style ?? 'c');

	//console.log("Processing file", input_file.filename, 'using', style);
	const template = style.parsing_function(state);

	console.log(inspect(template, { colors: true, depth: null }));
	console.log();

	state.context_stack.pop();

}