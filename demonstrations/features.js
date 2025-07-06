export function env_bool(name) {
	const key = name.toUpperCase();
	const value = process.env[key].trim().toUpperCase();
	switch (value) {
		case 'TRUE':
		case 'T':
		case 'YES':
		case 'Y':
		case '1':
			return true;
		case 'FALSE':
		case 'F':
		case 'NO':
		case 'N':
		case '0':
			return false;

		default:
			throw new Error(`Can not interpret environment variable ${key} (${JSON.stringify(value)}) as boolean.`);

	}
}