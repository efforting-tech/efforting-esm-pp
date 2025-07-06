# Introduction

*The Efforting ECMAScript preprocesssor* aims to be a versatile template processor that can utilize different styles of templates in order to be generally useful in many different circumstances.
Currently only one style is implemented.

The general principle regardless of the chosen style is that template specific expressions (typically ECMAScript) is interlaved with textual output.
Some styles attempt to avoid confusing source code editors by implementing template specifics inside of specially marked up comments.

Some styles may have the concept of script blocks or make use of indention or not for structure.

## Styles
### `mikael`
#### Introduction
This style has three components

1. Text content for target emission
	If text must contain `«`, `»` or begin a line with `§`, those characters must be escaped, which is done using `««`, `»»` and `§§` respectively.
2. Inline template expressions for target emission
	These expressions (`EXPRESSION`) will be embedded in an *ECMAScript* expression like so:
	```js
	emit(EXPRESSION);
	```
	It is a bit more complex than this though since there is a filter stack involved that one can make use of. This will be demonstrated in the examples section. (Not written yet).
3. Script blocks
	A script block is determined by its indention. The block is defined the following way:
	```
	§ LINE 1
		LINE 2
		LINE 3
	```
	`LINE 1` is not required, the block can be started by only the sigil sign (`§`). The entire block is executed as if it was *ECMAScript* once the whole template has been read.
	Because of this deferred evaluation, we can use these blocks to embed flow control which will also be demonstrated in the yet to be written examples section.

#### Examples

- **Script block**
	https://github.com/efforting-tech/efforting-esm-pp/blob/262f81ec7f6be8139e836b545611a6e6c22f2877/release_build/arch_linux/PKGBUILD-latest.ml#L1-L3

	This script block imports a few names into the local namespace and also installs a filter for the inline emissions, doing some rudimentary shell escapement on them.

- **Inline emission expressions**
	https://github.com/efforting-tech/efforting-esm-pp/blob/262f81ec7f6be8139e836b545611a6e6c22f2877/release_build/arch_linux/PKGBUILD-latest.ml#L4-L5

	These expressions will be evaluated and put within single quotation marks (`'`) like so:
	```sh
	pkgname='efforting-esm-pp'
	pkgver='0.1.5'
	```

- **Flow control**
	Here is a basic example of how script blocks are useful for defining program flow
	```
	§ if (some_flag) {
	This block here
	will be output
	if some_flag is trueish
	§ } else {
	This block here will
	be output if some_flag
	is falsy
	§ }
	```
	The example above can be tested by supplying `-Dsome_flag` or not.


	This one will create a *HTML* table of all environment variables
	```html
	<table>
	§ for (const [key, value] of Object.entries(process.env)) {
	<tr>
		<td><code>«key»</code></td>
		<td><code>«value»</code></td>
	</tr>
	§ }
	</table>
	```
> [!NOTE]
> In this example it is important that `<tr>` is not indented with respect to `§ for`... since this would make the block be interpreted as an *ECMAScript* block rather than text to be output.