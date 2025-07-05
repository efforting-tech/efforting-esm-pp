import { Argument_Parser, Sub_Command, Flag, Setting, Positional, Remaining, Dynamic_Key_Setting, Static_Key_Setting, Definition_Setting } from 'efforting.tech-framework/parsing/argument-definition.js';
import { Peekable_Iterator } from 'efforting.tech-framework/iteration/peekable-iterator.js';

class Exclusive_Operation {
	constructor(name, default_op) {
		Object.assign(this, { name, default_op });
	}

	validate(match) {
		console.warn("Not implemented yet");
	}

}

const main_op = new Exclusive_Operation('main_operation', 'run', 'version');

export const argument_parser = Argument_Parser('argument_parser', [

	Setting('output', '--output', '-o', 'Write output to file', {
		note: 'One can specify multiple files. If no output files are specified output will be written to «path /dev/stdout».',
		syntax_placeholder: 'FILE',
	}),

	Static_Key_Setting('style', '--style', '-S', 'Set «concept language style» of template'),
	Static_Key_Setting('encoding', '--encoding', '-C', 'Set «concept encoding» for file IO', {
		note: 'Currently this is overall but maybe in the future we will allow changing encoding between files while internally manage it all in «concept UTF-8».',
		default: 'utf8',
	}),

	Definition_Setting('definition_literal', '--define', '-D', 'Define literal constant available in the template context', {
		syntax_placeholder: {
			key: 'DEFINITION',
		}
	}),
	Definition_Setting('definition_eval', '--define-eval', '-E', 'Define constant set to evaluated expression and make available in the template context', {
		syntax_placeholder: {
			key: 'EXPRESSION',
		}
	}),
	Definition_Setting('definition_file', '--define-file', '-F', 'Define constant set the contents of a file', {
		syntax_placeholder: {
			key: 'FILE',
		}
	}),

	Setting('defs_from_json', '--defs-from-json', '-J', 'Load definitions from «concept JSON»', {
		syntax_placeholder: 'FILE',
		note: 'The «concept JSON» should contain either an array which will be run through «js Object.fromEntries()» or it should be an «js Object» already',
	}),

	Setting('process_files', '--process-file-list', '-I', 'Read files to process from a file that lists files separated by newlines.', {
		syntax_placeholder: 'FILE',
	}),

	Static_Key_Setting('help_format', '--help-format', null, 'Set the help output format', {
		syntax_placeholder: 'FORMAT',
		note:
			'The output format for help can be set to different formats, such as:\n'
		+	'§ table'
		+	'	cs columns: Format, Description\n'
		+	'	cs data:\n'
		+	'		«code plain», Plain text in «concept UTF-8»\n'
		+	'		«code a24», «concept ANSI» for «concept 24 bit» terminals\n'
		+	'		«code aleg», Legacy «concept ANSI» for less capable terminals\n'
		+	'		«code html», «concept HTML» output\n',
		default: 'auto',
	}),

	Flag('dry_run', '--dry-run', '-Z', 'Do not write any output files'),
	Flag('debug', '--debug', null, 'Output information useful for debugging misbehaving templates'),

	Sub_Command('list_styles', '--list-styles', [], 'List available template language styles and exit', {
		validate: main_op.validate,
	}),
	Sub_Command('help', ['--help', '-h'], [], 'Show help and exit', {
		validate: main_op.validate,
	}),

	Sub_Command('version', ['--version'], [], 'Show version and exit', {
		validate: main_op.validate,
	}),

	Sub_Command('push_locals',  '--push-locals', [], 'Push locals to the locals stack'),
	Sub_Command('pop_locals',  '--pop-locals', [], 'Pop from the locals stack'),

	Sub_Command('input', '--', [Remaining('input_files')], 'All remaining arguments are treated as input files. Useful if files begin with hyphens and you can not add «path ./» to filenames.'),

	Positional('input_file', 'Template files to process', /^(?!-)(.*)/, {
		syntax_placeholder: 'FILE',
	}),
]);


