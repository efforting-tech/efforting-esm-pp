import { argument_parser } from './argument-schema.js';
import { format_arguments } from './help-formatter.js';
import * as AT from './application-types.js';
import * as fs from 'node:fs';


const file_contents_cache = {};

export function print_help() {
	console.log(format_arguments(argument_parser))
}

export function run_application(config) {

	const state = new AT.Result();

	for (const input_file of config.input_files) {
		process_file(state, input_file);
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


export function collate_definitions(definitions, encoding) {

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
				console.warn(def, 'Not yet implemented' );
				break;


			default:
				throw new Error(`Unhandled definition: ${def.constructor}`);
		}
	}
	return result;
}



export function process_file(state, input_file) {

	console.log(collate_definitions(input_file.definitions, input_file.encoding));

}