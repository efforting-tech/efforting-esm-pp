const STYLE_REGISTRY = {};

class Style {
	constructor(names, file_endings, parsing_function) {
		Object.assign(this, { names, file_endings, parsing_function });
	}
}

export function require_style(name) {
	const result = STYLE_REGISTRY[name.toLowerCase()];
	if (!result) {
		throw new Error(`Unknown style: ${name}`);
	}
	return result;
}

export function register_style(names, file_endings, parsing_function) {
	const style = new Style(names, file_endings, parsing_function);
	for (const name of names) {
		STYLE_REGISTRY[name.toLowerCase()] = style;
	}
}