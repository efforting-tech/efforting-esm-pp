
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


export class Result {
	constructor() {
	}
}