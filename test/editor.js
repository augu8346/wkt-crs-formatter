'use strict';

const assert = require('node:assert/strict');
const vscode = require('vscode');

async function run() {
  await vscode.extensions.getExtension('local-preview.wkt-crs-formatter').activate();
  const source = 'GEOGCS["A",UNIT["degree",1]]';
  const doc = await vscode.workspace.openTextDocument({ language: 'wkt-crs', content: source });
  await vscode.window.showTextDocument(doc);
  const edits = await vscode.commands.executeCommand('vscode.executeFormatDocumentProvider', doc.uri,
    { tabSize: 2, insertSpaces: true });
  assert.ok(edits?.length, 'Expected document formatting edits');
  const change = new vscode.WorkspaceEdit();
  change.set(doc.uri, edits);
  assert.ok(await vscode.workspace.applyEdit(change));
  const eol = doc.eol === vscode.EndOfLine.CRLF ? '\r\n' : '\n';
  assert.equal(doc.getText(), ['GEOGCS["A",', '  UNIT["degree", 1]', ']'].join(eol));

  const escaped = '"CS[\\"ellipsoidal\\",2]",';
  const text = await vscode.workspace.openTextDocument({ language: 'plaintext', content: `before ${escaped} after` });
  const editor = await vscode.window.showTextDocument(text);
  editor.selection = new vscode.Selection(0, 7, 0, 7 + escaped.length);
  await vscode.commands.executeCommand('wkt-crs.format');
  assert.equal(text.getText(), 'before CS["ellipsoidal", 2] after');
  assert.equal(text.languageId, 'plaintext');

  for (const content of [escaped, 'CS[ellipsoidal, 2]']) {
    const plain = await vscode.workspace.openTextDocument({ language: 'plaintext', content });
    await vscode.window.showTextDocument(plain);
    await vscode.commands.executeCommand('wkt-crs.format');
    assert.equal(vscode.window.activeTextEditor.document.languageId, 'wkt-crs');
  }
}

module.exports = { run };
