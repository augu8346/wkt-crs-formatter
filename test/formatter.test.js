'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { formatWkt } = require('../formatter');

test('WKT1 preserves bracket style, case, decimal spelling and quoted content', () => {
  const input = String.raw`GEOGCS("A, [B] ""alias"" \path",Datum("D",SPHEROID("S",6.38E+06,298.0)),UNIT("degree",1))`;
  const output = [
    String.raw`GEOGCS("A, [B] ""alias"" \path",`,
    '\tDatum("D",',
    '\t\tSPHEROID("S", 6.38E+06, 298.0)',
    '\t),',
    '\tUNIT("degree", 1)',
    ')', ''
  ].join('\r\n');
  assert.equal(formatWkt(input + '\r\n', '\t', '\r\n'), output);
  assert.equal(formatWkt(output, '\t', '\r\n'), output);
});

test('raw and JSON-escaped WKT2 produce the same document', () => {
  const input = 'GEOGCRS["WGS 84",CS[ellipsoidal,2],AXIS["latitude",north,ORDER[1]]]';
  const expected = 'GEOGCRS["WGS 84",\n  CS[ellipsoidal, 2],\n  AXIS["latitude", north,\n    ORDER[1]\n  ]\n]';
  for (const source of [input, JSON.stringify(input) + ',', JSON.stringify(input).slice(1, -1)]) {
    assert.equal(formatWkt(source), expected);
  }
});

test('structural errors are not partially formatted', () => {
  for (const source of ['CS[1,]', 'CS[1)', 'CS["open]', 'CS[1', 'CS[1 2]', 'CS[1],CS[2]', '"invalid\\j"']) {
    assert.throws(() => formatWkt(source), SyntaxError);
  }
});
