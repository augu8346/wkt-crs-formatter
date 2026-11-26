'use strict';

const vscode = require('vscode');
const { formatWkt } = require('./formatter');

function formattedText(document, range, options) {
  const source = document.getText(range);
  if (!source.trim()) return undefined;
  const indent = options.insertSpaces ? ' '.repeat(options.tabSize) : '\t';
  try {
    return formatWkt(source, indent, document.eol === vscode.EndOfLine.CRLF ? '\r\n' : '\n');
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
    void vscode.window.showErrorMessage(`WKT: ${error.message}`);
    return undefined;
  }
}

function fullRange(document) {
  return new vscode.Range(0, 0, document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length);
}

function activate(context) {
  context.subscriptions.push(
    vscode.languages.registerDocumentFormattingEditProvider('wkt-crs', {
      provideDocumentFormattingEdits(document, options) {
        const range = fullRange(document);
        const output = formattedText(document, range, options);
        return output === undefined || output === document.getText() ? [] : [vscode.TextEdit.replace(range, output)];
      }
    }),
    vscode.commands.registerCommand('wkt-crs.format', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      const document = editor.document;
      const whole = fullRange(document);
      const range = editor.selection.isEmpty ? whole : editor.selection;
      const output = formattedText(document, range, editor.options);
      if (output === undefined) return;
      if (output !== document.getText(range)) {
        const applied = await editor.edit(builder => builder.replace(range, output));
        if (!applied) throw new Error('WKT: Could not apply the formatted text.');
      }
      if (range.isEqual(whole) && document.languageId === 'plaintext') {
        await vscode.languages.setTextDocumentLanguage(document, 'wkt-crs');
      }
    })
  );
}

module.exports = { activate };
