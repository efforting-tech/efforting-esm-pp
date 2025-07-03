import { parse_arguments } from '../source/argument-parser.js';
import { print_help, run_application } from '../source/high-level-functions.js';
import { inspect } from 'node:util';


//const a = '-Z --help --debug -J defs.json -oout.js --style=c -Estuff=Symbol("Hah!") -Fitem=item.txt test.ct --style=xml -Dhello=world stuff.xmlt'.split(/\s+/);
const a = '-Z --debug -J defs.json -oout.js --style=c -Estuff=Symbol("Hah!") -Fitem=item.txt test.ct --style=xml -Dhello=world stuff.xmlt'.split(/\s+/);
const config = parse_arguments(a);

//console.log(inspect(config, { colors: true, depth: null }));

switch (config.action) {
	case 'help':
		print_help();
		break;

	case 'run':
		run_application(config);
		break;

	default:
		throw new Error(`Unhandled action: ${config.action}`);

}
