import { argument_parser } from './argument-schema.js';
import { format_arguments } from './help-formatter.js';
import { start_module_server } from './dynamic_modules/server.js';

import * as AT from './application-types.js';
import * as fs from 'node:fs';


const file_contents_cache = {};

export function print_help() {
	console.log(format_arguments(argument_parser))
}

export async function run_application(config) {


	const state = new AT.Result();
	state.config = config;
	Object.assign(state, await start_module_server());

	try {
		for (const input_file of config.input_files) {
			await process_file(state, input_file);
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


export async function collate_definitions(state, definitions, encoding) {
	const result = {};

	for (const def of definitions) {
		switch (def.constructor) {
			case AT.Literal_Definition:
				result[def.name] = def.value;
				break;

			case AT.Literal_File_Definition:
				result[def.name] = get_file_contents(def.filename, def.encoding ?? encoding ?? 'utf8');
				break;

			case AT.JSON_Definition_File:
				Object.assign(result, get_file_contents(def.filename, def.encoding ?? encoding ?? 'utf8', JSON.parse));
				break;

			case AT.Evaluatory_Definition:
				const context = {
					config: state.config,
					locals: result,
				};
				const names = Object.keys(result);
				const expr = await state.dynamic_import(
					`const {${names}} = ${JSON.stringify(result)};\n` +
					`const _esm_context_ = ${JSON.stringify(context)};\n` +
					/* `console.log(_esm_context_.locals);` + */ 	// ← We could possibly include various debug output here
					`export const _esm_result_ = ${def.value};`
					, 'dynamic.js'
				);

				result[def.name] = expr._esm_result_;
				break;

			default:
				throw new Error(`Unhandled definition: ${def.constructor}`);
		}
	}
	return result;
}



export async function process_file(state, input_file) {
	console.log("Processing file", input_file.filename);
	console.log(await collate_definitions(state, input_file.definitions, input_file.encoding));
	console.log();

}