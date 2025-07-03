import { parse_arguments } from '../source/argument-parser.js';

import { argument_parser } from '../source/argument-schema.js';
import { format_arguments } from '../source/help-formatter.js';

import { inspect } from 'node:util';


const a = '-Z --help --debug -J defs.json -oout.js --style=c -Estuff=Symbol("Hah!") -Fitem=item.txt test.ct --style=xml -Dhello=world stuff.xmlt'.split(/\s+/);
const config = parse_arguments(a);

console.log(inspect(config, { colors: true, depth: null }));

if (config.action === 'help') {
	console.log(format_arguments(argument_parser));
}