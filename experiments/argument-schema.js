import { parse_arguments } from '../source/argument-parser.js';
import { print_help, run_application } from '../source/high-level-functions.js';
import { inspect } from 'node:util';


/*
const a = '-Z --debug -J defs.json -oout.js --style=mikael -Estuff=[auto_complete,auto_find_in_selection] -Fitem=item.txt test.ct --style=xml -Dhello=world'.split(/\s+/)
//a.push('-Eargh=null;\nthrow new Error("Dang")', 'stuff.xmlt');
a.push('-Eargh="More things";', 'stuff.xmlt', '--push-locals', '-Ditem=Other things', 'stuff.xmlt', '--pop-locals', 'stuff.xmlt' );
a.push('-I', 'test.lst');
*/

const a = '--debug -J defs.json -oout.file --style=mikael -Estuff=[auto_complete,auto_find_in_selection] -Fitem=item.txt test.ct'.split(/\s+/)

const config = parse_arguments(a);


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
