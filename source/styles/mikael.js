import { register_style } from '../style-registry.js';
import * as T_AST from '../template-ast.js';

import * as O from 'efforting.tech-framework/data/operators.js';
import * as C from 'efforting.tech-framework/data/conditions.js';
import * as R from 'efforting.tech-framework/data/rules.js';


import { Key_Based_Mapping_Processor } from 'efforting.tech-framework/data/dispatchers.js';
import { Advanced_Regex_Tokenizer } from 'efforting.tech-framework/parsing/regexp-tokenizer.js';
import * as RT from 'efforting.tech-framework/parsing/regexp-tokenizer.js';



export const line_tokenizer = new Advanced_Regex_Tokenizer('mikael/line_tokenizer', [
	new R.Resolution_Rule(new C.Regex_Condition( /«(.*)»/ ),
		(name) => {
			return new T_AST.Expression(name + ';');	//We add semicolon here since this is the "simplified format" - still things to decide regarding inline expressions
			// Maybe the T_AST should be style specific - or if there is a shared set but style can have other say. Decisions decisions.
		}
	),

	new R.Default_Rule(
		(text) => {
			return new T_AST.Text(text);
		}
	),

]);

export function parse_line(line) {
	//This pattern is probably common enough that it should be transferred to efforting.tech-framework
	const result = [];
	for (const match of	line_tokenizer.find_matches(line)) {
		switch (match.constructor) {
			case RT.Default_Match:
				result.push(match.rule.action(match.text));
				break;

			case RT.Pattern_Match:
				result.push(match.rule.action(...match.match.slice(1)));
				break;

			default:
				throw new Error(`Unknown match type: ${match.constructor}`)
		}
	}
	return result;
}

export const parser = new O.Tree_Processor('mikael/parser', [

	new R.Resolution_Rule(new C.Title_Condition(new C.Regex_Condition( /§\s*(.*)/ )),
		(resolver, item, match) => {
			let block = match.value.value[1] ?? '';

			if (block) {
				block += '\n';
			}

			block += item.body.to_text();	// Since ES doesn't care about indention levels we can just add it like this

			return new T_AST.Sequence(new T_AST.Script_Block(block), new T_AST.Text('\n'));	//Assume trailing end
		}
	),

	new R.Resolution_Rule(new C.Title_Condition(new C.Regex_Condition( /(.*)/ )),
		(resolver, item, match) => {
			//TODO: This format doesn't care if there is a trailing newline or not but for precise formats we need to make sure this is supported
			const parsed_line = [...parse_line(item.title), new T_AST.Text('\n')];
			const title = new T_AST.Template_Line(parsed_line);
			const body = resolver.process_tree(item.body).filter(Boolean);
			const result = (title || body.length) ? new T_AST.Template_Node(title, body) : null;
			//TODO: attach source?
			return result;
		}
	),
]);




function parse_file(state) {
	return new T_AST.Template(parser.process_text(state.context.pending_file_contents));
}


register_style(['mikael', 'ml'], ['.ml'], parse_file);