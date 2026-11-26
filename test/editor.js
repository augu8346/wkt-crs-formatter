'use strict';

const assert = require('node:assert/strict');
const vscode = require('vscode');

async function run() {
  const source = 'GEOGCS["A",UNIT["degree",1]]';
  const doc = await vscode.workspace.openTextDocument({ language: 'wkt-crs', content: source });
  const edits = await vscode.commands.executeCommand('vscode.executeFormatDocumentProvider', doc.uri,
    { tabSize: 2, insertSpaces: true });
  assert.equal(edits.length, 1);
  const eol = doc.eol === vscode.EndOfLine.CRLF ? '\r\n' : '\n';
  assert.equal(edits[0].newText, ['GEOGCS["A",', '  UNIT["degree", 1]', ']'].join(eol));

  const escaped = '"CS[\\"ellipsoidal\\",2]",';
  const text = await vscode.workspace.openTextDocument({ language: 'plaintext', content: `before ${escaped} after` });
  const editor = await vscode.window.showTextDocument(text);
  editor.selection = new vscode.Selection(0, 7, 0, 7 + escaped.length);
  await vscode.commands.executeCommand('wkt-crs.format');
  assert.equal(text.getText(), 'before CS["ellipsoidal", 2] after');
}

module.exports = { run };
