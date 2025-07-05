import { inspect } from 'node:util';
import { Constructor_Based_Mapping_Processor } from 'efforting.tech-framework/data/dispatchers.js';
import * as T_AST from './template-ast.js';


export const template_rendering_dispatcher = new Constructor_Based_Mapping_Processor('template_rendering_dispatcher');

template_rendering_dispatcher.register(T_AST.Template, (state, processor, item) => {
	processor.process_multiple(state, ...item.body);
});

template_rendering_dispatcher.register(T_AST.Template_Node, (state, processor, item) => {
	processor.process_multiple(state, item.title, ...item.body);
});

template_rendering_dispatcher.register(T_AST.Template_Line, (state, processor, item) => {
	processor.process_multiple(state, ...item.line);
});

template_rendering_dispatcher.register(T_AST.Sequence, (state, processor, item) => {
	processor.process_multiple(state, ...item.sequence);
});

template_rendering_dispatcher.register(T_AST.Text, (state, processor, item) => {
	if (item.value !== undefined) {
		state.write_text(item.value);
	}
});

template_rendering_dispatcher.register(T_AST.Expression, (state, processor, item) => {
	if (item.value !== undefined) {
		state.write_script(item.value);
	}
});

template_rendering_dispatcher.register(T_AST.Script_Block, (state, processor, item) => {
	if (item.script !== undefined) {
		state.write_script(item.script);
	}
});

export function render_template(state, template) {
	template_rendering_dispatcher.process(state, template);
}
