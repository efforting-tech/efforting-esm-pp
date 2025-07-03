import { argument_parser } from './argument-schema.js';
import { Key_Based_Mapping_Processor } from 'efforting.tech-framework/data/dispatchers.js';
import * as AT from './application-types.js';

export function parse_arguments(arguments_to_parse) {

	const argument_handler = new Key_Based_Mapping_Processor('argument_handler', ([key, value]) => key);

	argument_handler.register('help', (context, processor, [key, value]) => {
		context.action = 'help';
	})

	argument_handler.register('list_styles', (context, processor, [key, value]) => {
		context.action = 'list-styles';
	})

	argument_handler.register('help_format', (context, processor, [key, value]) => {
		context.help_format = value.value;
	})

	argument_handler.register('dry_run', (context, processor, [key, value]) => {
		context.dry_run = true;
	})

	argument_handler.register('output', (context, processor, [key, value]) => {
		context.output_files.push(value.value);
	})

	argument_handler.register('definition_literal', (context, processor, [key, {name, value}]) => {
		context.definitions.push(new AT.Literal_Definition(name, value));
	})

	argument_handler.register('definition_eval', (context, processor, [key, {name, value}]) => {
		context.definitions.push(new AT.Evaluatory_Definition(name, value));
	})

	argument_handler.register('definition_file', (context, processor, [key, {name, value}]) => {
		context.definitions.push(new AT.Literal_File_Definition(name, value));
	})

	argument_handler.register('defs_from_json', (context, processor, [key, value]) => {
		context.definitions.push(new AT.JSON_Definition_File(value.value));
	})


	argument_handler.register('input_file', (context, processor, [key, value]) => {
		context.input_files.push({
			filename: value.value,
			style: context.style,
			encoding: context.encoding,
			definitions: [...context.definitions],
		});
	})

	argument_handler.register('debug', (context, processor, [key, value]) => {
		context.debug = true;
	})

	argument_handler.register('style', (context, processor, [key, value]) => {
		context.style = value.value;
	})

	argument_handler.register('encoding', (context, processor, [key, value]) => {
		context.encoding = value.value;
	})

	const config = {
		dry_run: false,
		action: 'run',
		output_files: [],
		input_files: [],
		definitions: [],
		style: 'c',
		encoding: 'utf8',
		help_format: 'default',
		debug: false,
	};

	const bins = argument_parser.structured_argument_list(arguments_to_parse);

	for (const bin of bins) {
		argument_handler.process_multiple(config, ...Object.entries(bin));
	}

	return config;
}