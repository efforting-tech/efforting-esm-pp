import { resolve as path_resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export class Literal_Definition {
	constructor(name, value) {
		const type = 'Literal_Definition';
		Object.assign(this, { name, value, type });
	}
}

export class Evaluatory_Definition {
	constructor(name, value) {
		const type = 'Evaluatory_Definition';
		Object.assign(this, { name, value, type });
	}
}

export class Literal_File_Definition {
	constructor(name, filename) {
		const type = 'Literal_File_Definition';
		Object.assign(this, { name, filename, type });
	}
}

export class JSON_Definition_File {
	constructor(filename) {
		const type = 'JSON_Definition_File';
		Object.assign(this, { filename, type });
	}
}

export class Process_Files_From_List_File {
	constructor(filename, style='c', encoding='utf8') {
		Object.assign(this, { filename, style, encoding });
	}
}

export class Process_File {
	constructor(filename, style='c', encoding='utf8') {
		Object.assign(this, { filename, style, encoding });
	}
}

export class Result {
	constructor() {
	}

	write_text(text) {
		this.context.pending_expression += `emit(${JSON.stringify(text)});`;
	}

	write_script(script) {
		this.context.pending_expression += script;
	}

	async execute_script(script) {
		const context_url = pathToFileURL(path_resolve(import.meta.dirname, 'dynamic_modules/context.js'));

		const key_names = Object.keys(this.context.locals).join(', ');
		const names = Object.keys(this.context.locals);

		const ingress =
			`import { PROCESS_CONTEXT as __ESM_PROCESS_CONTEXT__ } from ${JSON.stringify(context_url.href)};\n`+
			`const {${key_names}} = __ESM_PROCESS_CONTEXT__.locals\n`

		const initial_lines = ingress.split(/\n/).length;
		const final_expression = ingress + `\n${script}`;

		try {
			await this.dynamic_import(final_expression, 'dynamic.js');
		} catch (err) {
			const match = err.stack.match(/:(\d+):(\d+)$/m);
			if (match) {
				const [line, col] = match.slice(1);
				throw new Error(
					`Error in expression during dynamic evaluation (line ${line-initial_lines}, column ${col}) when handling "${this.context.pending_file_name}"\n` +
					`\n${err.stack}\n`
				);
			} else {
				throw new Error(
					`Error in dynamic evaluation when handling "${this.context.pending_file_name}"\n` +
					`\n${err.stack}\n`
				);
			}
		}

	}

	async evaluate_expression(expression) {
		this.context_stack.push({result: null});
		`__ESM_PROCESS_CONTEXT__.result = ${expression}`;
		await this.evaluate_expression(expression);
		const result = this.context.result;
		this.context_stack.pop();
		return result;

	}


}


export const PUSH_LOCALS = Symbol('PUSH_LOCALS');
export const POP_LOCALS = Symbol('POP_LOCALS');