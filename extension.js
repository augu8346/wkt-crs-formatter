'use strict';

const vscode = require('vscode');
const { formatWkt } = require('./formatter');

function edits(document, range, options) {
  const source = document.getText(range);
  if (!source.trim()) return [];
  const indent = options.insertSpaces ? ' '.repeat(options.tabSize) : '\t';
  try {
    const output = formatWkt(source, indent, document.eol === vscode.EndOfLine.CRLF ? '\r\n' : '\n');
    return output === source ? [] : [vscode.TextEdit.replace(range, output)];
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
    void vscode.window.showErrorMessage(`WKT: ${error.message}`);
    return [];
  }
}

function fullRange(document) {
  return new vscode.Range(0, 0, document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length);
}

function activate(context) {
  context.subscriptions.push(
    vscode.languages.registerDocumentFormattingEditProvider('wkt-crs', {
      provideDocumentFormattingEdits(document, options) {
        return edits(document, fullRange(document), options);
      }
    }),
    vscode.commands.registerTextEditorCommand('wkt-crs.format', (editor, builder) => {
      const range = editor.selection.isEmpty ? fullRange(editor.document) : editor.selection;
      for (const edit of edits(editor.document, range, editor.options)) {
        builder.replace(edit.range, edit.newText);
      }
    })
  );
}

module.exports = { activate };
