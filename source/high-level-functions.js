import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const package_info = require('./package.json');

import { PROCESS_CONTEXT } from './dynamic_modules/context.js';

import { argument_parser } from './argument-schema.js';
import { format_arguments, format_usage } from './help-formatter.js';
import { start_module_server } from './dynamic_modules/server.js';
import { Property_Stack, Object_Snapshot_Stack } from 'efforting.tech-framework/data/stack.js';
import { render_template } from './template-renderer.js';

import { inspect } from 'node:util';

//TODO - we use "switch item.constructor" in a few places but if we replace these with dispatchers we can also let plugins or templates add features

import { pathToFileURL } from 'node:url';
import { resolve as path_resolve } from 'node:path';
import { readdirSync, statSync } from 'node:fs';

import { require_style } from './style-registry.js';


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

export function print_version() {
	const { name, version, description } = package_info;
	const [bin] = Object.keys(package_info.bin);
	const usage = `${bin} ${format_usage(argument_parser)}`;
	console.log(`${description}`);
	console.log(`\n${name} — version ${version}`);
	console.log(`Usage: ${usage}`);

}


export function print_help() {
	console.log(format_arguments(argument_parser))
}

//TODO - the operation processing should probably be put in a function for easier reuse and for keeping this function small and neat
export async function run_application(config) {
	const state = new AT.Result();
	state.config = config;

	await load_all_styles();

	Object.assign(state, await start_module_server());
	await import('data://connect');

	state.context = PROCESS_CONTEXT;

	const locals = {};
	Object.assign(state.context, {
		config: state.config,
		locals: locals,
		short_filter_stack: [],
		pending_output: '',
	});


	state.context_stack = new Property_Stack(state.context);
	state.locals_stack = new Object_Snapshot_Stack(state.context.locals);

	locals.emit = function emit(text, filter_stack=[]) {
		for (const filter of filter_stack) {
			text = filter(text);
		}
		state.context.pending_output += text;
	}

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
					state.context.locals[operation.name] = await state.evaluate_expression(operation.value);
					break;


				default:
					throw new Error(`Unhandled operation: ${operation.constructor}`);
			}

		}
	} finally {
		state.shutdown_server();
	}

	if (!config.dry_run) {
		for (const filename of config.output_files) {
			write_file_contents(filename, state.context.pending_output, config.encoding ?? 'utf8');
		}

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

export function write_file_contents(filename, contents, encoding) {
	//TODO - check for overwrite and such based on options
	fs.writeFileSync(filename, contents, encoding);
}




export async function process_file(state, input_file) {

	//NOTE: In the future we might want to have hooks here in case we want to load user defined features that might do something before and/or after a file is processed
	//		this could be things like adding comments regarding origin which is a good practice that should be supported and encouraged even.

	const style = require_style(input_file.style ?? 'c');

	if (state.config.debug) {
		console.log("Processing file", input_file.filename, 'using', style);
	}
	state.context_stack.push({
		pending_file: input_file,
		pending_file_contents: get_file_contents(input_file.filename, input_file.encoding ?? 'utf8'),
		pending_expression: '',
	});


	const template = style.parsing_function(state);
	render_template(state, template);

	if (state.config.debug) {
		console.log('state.context.pending_expression:', inspect(state.context.pending_expression, { colors: true, depth: null }));
	}

	await state.synchronize_context(state.context);
	await state.execute_script(state.context.pending_expression);

	state.context_stack.pop();

}