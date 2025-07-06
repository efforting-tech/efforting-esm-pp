# Introduction

The Efforting ECMA-script preprocesssor is a template processor that can utilize different styles of templates in order to be generally useful in many different circumstances.
Currently only one style is implemented.

The general principle regardless of the chosen style is that template specific expressions (typically ECMA-script) is interlaved with textual output.
Some styles attempt to avoid confusing source code editors by implementing template specifics inside of specially marked up comments.

Some styles may have the concept of script blocks or make use of indention or not for structure.

## Styles
### `mikael`
This style has three components

1. Text content for target emission
	If text must contain `«`, `»` or begin a line with `§`, those characters must be escaped, which is done using `««`, `»»` and `§§` respectively.
2. Inline template expressions for target emission
	These expressions (`EXPRESSION`) will be embedded in an *ECMA-script* expression like so:
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
	`LINE 1` is not required, the block can be started by only the sigil sign (`§`). The entire block is executed as if it was *ECMA-script* once the whole template has been read.
	Because of this deferred evaluation, we can use these blocks to embed flow control which will also be demonstrated in the yet to be written examples section.

