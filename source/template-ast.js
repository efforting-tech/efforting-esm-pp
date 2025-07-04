export class Text {
	constructor(value) {
		Object.assign(this, { value });
	}
}

export class Placeholder {
	constructor(name) {
		Object.assign(this, { name });
	}
}

export class Template_Line {
	constructor(line) {
		Object.assign(this, { line });
	}
}

export class Template_Node {
	constructor(title, body) {
		Object.assign(this, { title, body });
	}
}

export class Template {
	constructor(body) {
		Object.assign(this, { body });
	}
}

export class Script_Block {
	constructor(script) {
		Object.assign(this, { script });
	}
}