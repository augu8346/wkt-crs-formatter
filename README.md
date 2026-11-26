# WKT CRS Formatter

A VS Code formatter for coordinate reference systems written in Well-Known Text (WKT1 and WKT2). Nested elements appear on separate lines; scalar arguments stay together. Names, keyword case, numbers, and bracket style are preserved. Formatting follows your editor's indentation and line endings.

## Install

Requires VS Code 1.85 or newer. This preview is distributed as a VSIX, not through the Marketplace. In VS Code, run **Extensions: Install from VSIX...** and select `wkt-crs-formatter-0.2.0.vsix`. Alternatively:

```sh
code --install-extension wkt-crs-formatter-0.2.0.vsix
```

## Use

WKT language mode uses your VS Code theme to color element keywords, quoted names, numbers, and bare values such as `north`. Formatting an entire plain-text document enables WKT highlighting automatically. Formatting a selection inside a larger document preserves the surrounding language mode. Colors are editor styling, not characters added to the WKT.

- Open a `.prj`, `.wkt`, `.wkt1`, or `.wkt2` file, then run **Format Document**. If other WKT formatters are installed, use **Format Document With...** to choose this one.
- In an untitled or plain-text editor, paste a definition and run **WKT: Format Coordinate Reference System** from the Command Palette. The command formats the selection, or the whole document when nothing is selected.
- To extract WKT from JSON, select just the quoted value (an immediately following comma is fine). The command replaces it with **plain WKT**, not another JSON string. Copy to an untitled editor first if you need to keep the surrounding JSON valid.

For example, this pasted value:

```text
"AXIS[\"latitude\",north,ORDER[1]]",
```

becomes:

```text
AXIS["latitude", north,
  ORDER[1]
]
```

Ordinary WKT is not JSON-decoded. Inside ordinary WKT names, doubled quotation marks (`""`) remain intact. A single-line JSON-escaped fragment without its outer quotes is also supported.

This is a structural formatter, not a CRS validator or converter. It expects one complete keyword-and-arguments expression, not a geometry such as `LINESTRING (0 0, 1 1)`, an entire JSON object, or an arbitrary fragment of a larger definition. Malformed delimiters or strings produce an error without applying a partial edit.

## Build or contribute

With Node.js 24 or newer, run `npm ci`, `npm test`, then `npm run package` to build the VSIX locally.
`formatter.js` formats the expression, `extension.js` connects it to VS Code, and the TextMate grammar supplies highlighting.
See [contributing](./CONTRIBUTING.md), [support](./.github/SUPPORT.md), and the [MIT license](./LICENSE).
