'use strict'

var
assert = require('assert'),
b2url = require('../bbs-2ch-url.js');

function test_parse_thread() {
  var expected = { host: 'toro.2ch.net', board: 'tech', thread: 1358937029 };
  assert.deepEqual(b2url.parse('http://toro.2ch.net/test/read.cgi/tech/1358937029/'),
                   expected);
  assert.deepEqual(b2url.parse('http://toro.2ch.net/tech/dat/1358937029.dat'),
                   expected);
  assert.deepEqual(b2url.parse('http://bg.2ch.net/test/r.so/toro.2ch.net/tech/1358937029/'),
                   expected);
}

function test_parse_board() {
  var expected = { host: 'toro.2ch.net', board: 'tech' };
  assert.deepEqual(b2url.parse('http://toro.2ch.net/tech/'),
                   expected);
  assert.deepEqual(b2url.parse('http://toro.2ch.net/tech/subject.txt'),
                   expected);
  assert.deepEqual(b2url.parse('http://bg.2ch.net/test/p.so/toro.2ch.net/tech/'),
                   expected);
}

function test_parse_range() {
  assert.deepEqual(b2url.parseRangeString(''),
                   []);
  assert.deepEqual(b2url.parseRangeString('50'),
                   [ [ 49, 50 ] ]);
  assert.deepEqual(b2url.parseRangeString('l50'),
                   [ [ 0, 1 ], [ -50 ] ]);
  assert.deepEqual(b2url.parseRangeString('l50n'),
                   [ [ -50 ] ]);
  assert.deepEqual(b2url.parseRangeString('-50'),
                   [ [ 0, 50 ] ]);
  assert.deepEqual(b2url.parseRangeString('50-'),
                   [ [ 0, 1 ], [ 49 ] ]);
  assert.deepEqual(b2url.parseRangeString('50n-'),
                   [ [ 49 ] ]);
  assert.deepEqual(b2url.parseRangeString('50-60'),
                   [ [ 0, 1 ], [ 49, 60 ] ]);
  assert.deepEqual(b2url.parseRangeString('50n-60'),
                   [ [ 49, 60 ] ]);
  assert.deepEqual(b2url.parseRangeString('50,52'),
                   [ [ 49, 50 ], [ 51, 52 ] ]);
  assert.deepEqual(b2url.parseRangeString('50,52,55-60'),
                   [ [ 49, 50 ], [ 51, 52 ], [ 54, 60 ] ]);
  assert.deepEqual(b2url.parseRangeString('50,52,l60'),
                   [ [ 49, 50 ], [ 51, 52 ], [ -60 ] ]);
}

function test_convert() {
  var bbs = { host: 'toro.2ch.net', board: 'tech', thread: 1358937029, range:'50-60' };
  assert.deepEqual(b2url.convert(bbs, 'board'),
                   { host: 'toro.2ch.net', path: '/tech/' });
  assert.deepEqual(b2url.convert(bbs, 'subject'),
                   { host: 'toro.2ch.net', path: '/tech/subject.txt' });
  assert.deepEqual(b2url.convert(bbs, 'subject:bg'),
                   { host: 'bg20.2ch.net', path: '/test/p.so/toro.2ch.net/tech/' });
  assert.deepEqual(b2url.convert(bbs, 'thread'),
                   { host: 'toro.2ch.net', path: '/test/read.cgi/tech/1358937029/50-60' });
  assert.deepEqual(b2url.convert(bbs, 'dat'),
                   { host: 'toro.2ch.net', path: '/tech/dat/1358937029.dat' });
  assert.deepEqual(b2url.convert(bbs, 'dat:bg'),
                   { host: 'bg20.2ch.net', path: '/test/r.so/toro.2ch.net/tech/1358937029/' });
}

function test_format() {
  assert.strictEqual(b2url.format('http://toro.2ch.net/test/read.cgi/tech/1358937029/', 'dat'),
                     'http://toro.2ch.net/tech/dat/1358937029.dat');
}

test_parse_board();
test_parse_thread();
test_parse_range();
test_convert();
test_format();

console.log('ok');
