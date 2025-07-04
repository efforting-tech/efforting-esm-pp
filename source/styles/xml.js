import { register_style } from '../style-registry.js';


function parse_file(state) {
	console.log("NOT IMPLEMENTED");
}


register_style(['xml', 'html'], ['.xml', '.html', '.htm'], parse_file);