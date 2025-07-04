
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
}

export const PUSH_LOCALS = Symbol('PUSH_LOCALS');
export const POP_LOCALS = Symbol('POP_LOCALS');