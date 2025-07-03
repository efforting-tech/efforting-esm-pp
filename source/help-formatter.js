import { Key_Based_Mapping_Processor, Constructor_Based_Mapping_Processor } from 'efforting.tech-framework/data/dispatchers.js';
import { Argument_Matcher, Pattern_Matcher, Sub_Command_Matcher } from 'efforting.tech-framework/parsing/argument-parser.js';

function join_sections(...sections) {
	return sections.filter(Boolean).map(s => s.replace(/\n+$/, '')).join('\n\n');
}


function flatten(item) {
	switch (item.constructor) {
		case Array: {
			const result = [];
			for (const sub_item of item) {
				const sub_result = flatten(sub_item);
				if (Array.isArray(sub_result)) {
					result.push(...sub_result);
				} else {
					result.push(sub_result);
				}
			}
			return result;
		}

		default:
			return item;
	}
}


export function format_arguments(argument_parser) {

	const argument_type_formatter = new Key_Based_Mapping_Processor('argument_type_formatter', (item) => item.type);
	argument_type_formatter.register('Sub_Command', (context, processor, item) => {
		const syntax = item.source_patterns.filter(Boolean).map(p => `${p}`);

		const sub_command_info = [];
		argument_type_formatter.process_multiple(sub_command_info, ...item.sub_command_rules);

		let sub_command_summary;
		if (item.sub_command_rules.length) {
			sub_command_summary = '** TODO **';	// TODO  (should format sub_command_info)
		}

		const { name } = item;
		context.push({ name, syntax,
			description: join_sections(item.description, sub_command_summary, item.note),
		})
	});

	argument_type_formatter.register('Positional', (context, processor, item) => {
		//NOTE - we do not try to make sense of item.source_patterns here. Caller can always throw in a note.
		const syntax = [`${item.syntax_placeholder ?? item.name.toUpperCase()}`]
		const { name } = item;
		context.push({ name, syntax,
			description: join_sections(item.description, item.note),
		})
	});


	argument_type_formatter.register('Remaining', (context, processor, item) => {
		const syntax = [`${item.syntax_placeholder ?? item.name.toUpperCase()} …`]
		const { name } = item;
		context.push({ name, syntax,
			description: join_sections(item.description, item.note),
		})
	});


	argument_type_formatter.register('Flag', (context, processor, item) => {
		const syntax = item.source_patterns.filter(Boolean).map(p => `${p}`);
		const { name } = item;
		context.push({ name, syntax,
			description: join_sections(item.description, item.note),
		})
	});

	argument_type_formatter.register('Static_Key_Setting', (context, processor, item) => {
		const syntax = flatten(
			item.source_patterns.filter(Boolean).map(p => [`${p} ${item.syntax_placeholder ?? item.name.toUpperCase()}`, `${p}=${item.syntax_placeholder ?? item.name.toUpperCase()}`])
		);
		const { name } = item;
		context.push({ name, syntax,
			description: join_sections(item.description, item.note),
		})
	});


	argument_type_formatter.register('Setting', (context, processor, item) => {
		const syntax = item.source_patterns.filter(Boolean).map(p => `${p} ${item.syntax_placeholder ?? item.name.toUpperCase()}¹`);
		const { name } = item;
		context.push({ name, syntax,
			description: join_sections(item.description, item.note,
				'¹ Can be joined into a single argument'	// Later we will use our markup to assign/handle notes like this. Such as system could also collate multiple notes to a section below.
			),
		})
	});

	argument_type_formatter.register('Definition_Setting', (context, processor, item) => {
		const key = item.syntax_placeholder?.key ?? 'KEY';
		const value = item.syntax_placeholder?.value ?? 'VALUE';
		const syntax = item.source_patterns.filter(Boolean).map(p => `${p} ${key}[=${value}]¹`);
		const { name } = item;
		context.push({ name, syntax,
			description: join_sections(item.description, item.note,
				'¹ Can be joined into a single argument'	// Later we will use our markup to assign/handle notes like this. Such as system could also collate multiple notes to a section below.
			),
		})
	});


	const argument_formatter = new Constructor_Based_Mapping_Processor('argument_formatter');
	argument_formatter.register(Argument_Matcher, (context, processor, item) => {
		for (const sub_item of item.rules) {
			argument_formatter.process(context, sub_item);
		}
	});

	argument_formatter.register(Pattern_Matcher, Sub_Command_Matcher, (context, processor, item) => {
		argument_type_formatter.process(context, item);
	});


	let output = '';
	const result = [];
	argument_formatter.process(result, argument_parser);
	const max_length = Math.max(...result.map(i => Math.max(...i.syntax.map(l => l.length))));

	for (const { syntax, description } of result) {
		const lines = description.split('\n');
		const line_count = Math.max(syntax.length, lines.length);

		for (let l=0; l<line_count+1; l++) {
			output += (syntax[l] ?? '').padStart(max_length) + ' | ' + (lines[l] ?? '') + '\n';
		}
	}
	return output;

}