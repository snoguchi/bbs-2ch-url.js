'use strict'

var
assert = require('assert'),
b2url = require('../bbs-2ch-url.js');

var eq = assert.deepEqual;

function test_parse_range() {
  eq(b2url.parseRangeString(''),
     []);
  eq(b2url.parseRangeString('50'),
     [ [ 49, 50 ] ]);
  eq(b2url.parseRangeString('l50'),
     [ [ 0, 1 ], [ -50 ] ]);
  eq(b2url.parseRangeString('l50n'),
     [ [ -50 ] ]);
  eq(b2url.parseRangeString('-50'),
     [ [ 0, 50 ] ]);
  eq(b2url.parseRangeString('50-'),
     [ [ 0, 1 ], [ 49 ] ]);
  eq(b2url.parseRangeString('50n-'),
     [ [ 49 ] ]);
  eq(b2url.parseRangeString('50-60'),
     [ [ 0, 1 ], [ 49, 60 ] ]);
  eq(b2url.parseRangeString('50n-60'),
     [ [ 49, 60 ] ]);
  eq(b2url.parseRangeString('50,52'),
     [ [ 49, 50 ], [ 51, 52 ] ]);
  eq(b2url.parseRangeString('50,52,55-60'),
     [ [ 49, 50 ], [ 51, 52 ], [ 54, 60 ] ]);
  eq(b2url.parseRangeString('50,52,l60'),
     [ [ 49, 50 ], [ 51, 52 ], [ -60 ] ]);
}

function test_parse() {
  eq(b2url.parse('http://bg20.2ch.net/test/p.so/toro.2ch.net/tech/'),
     { type: 'raw', cache: 'bg20.2ch.net', host: 'toro.2ch.net', bbs: 'tech' });
  eq(b2url.parse('http://bg30.2ch.net/test/p.so/toro.2ch.net/tech/'),
     { type: 'raw', cache: 'bg30.2ch.net', host: 'toro.2ch.net', bbs: 'tech' });
  eq(b2url.parse('http://toro.2ch.net/tech/'),
     { type: 'html', host: 'toro.2ch.net', bbs: 'tech' });
  eq(b2url.parse('http://toro.2ch.net/tech/subject.txt'),
     { type: 'raw', host: 'toro.2ch.net', bbs: 'tech' });

  eq(b2url.parse('http://bg20.2ch.net/test/r.so/toro.2ch.net/tech/1358937029/'),
     { type: 'raw', cache: 'bg20.2ch.net', host: 'toro.2ch.net', bbs: 'tech', key: 1358937029 });
  eq(b2url.parse('http://toro.2ch.net/test/read.cgi/tech/1358937029/'),
     { type: 'html', host: 'toro.2ch.net', bbs: 'tech', key: 1358937029 });
  eq(b2url.parse('http://toro.2ch.net/tech/dat/1358937029.dat'),
     { type: 'raw', host: 'toro.2ch.net', bbs: 'tech', key: 1358937029 });

  eq(b2url.parse({ host:'toro.2ch.net', path: '/tech/' }),
     { type: 'html', host: 'toro.2ch.net', bbs: 'tech' });

  eq(b2url.parse(), null);
  eq(b2url.parse({ host: 'example.com' }), null);
  eq(b2url.parse('http://example.com/'), null);
}

function test_format() {
  eq(b2url.format({ cache: 'bg20.2ch.net', host: 'toro.2ch.net', bbs: 'tech', type: 'raw' }),
     'http://bg20.2ch.net/test/p.so/toro.2ch.net/tech/');
  eq(b2url.format({ cache: 'bg30.2ch.net', host: 'toro.2ch.net', bbs: 'tech', type: 'raw' }),
     'http://bg30.2ch.net/test/p.so/toro.2ch.net/tech/');
  eq(b2url.format({ host: 'toro.2ch.net', bbs: 'tech', type: 'html' }),
     'http://toro.2ch.net/tech/');
  eq(b2url.format({ host: 'toro.2ch.net', bbs: 'tech', type: 'raw' }),
     'http://toro.2ch.net/tech/subject.txt');
  eq(b2url.format({ host: 'toro.2ch.net', bbs: 'tech' }),
     'http://toro.2ch.net/tech/subject.txt');

  eq(b2url.format({ cache: 'bg20.2ch.net', host: 'toro.2ch.net', bbs: 'tech', key: 1358937029, type: 'raw' }),
     'http://bg20.2ch.net/test/r.so/toro.2ch.net/tech/1358937029/');
  eq(b2url.format({ host: 'toro.2ch.net', bbs: 'tech', key: 1358937029, range:'50-60', type: 'html' }),
     'http://toro.2ch.net/test/read.cgi/tech/1358937029/50-60');
  eq(b2url.format({ host: 'toro.2ch.net', bbs: 'tech', key: 1358937029, type: 'raw' }),
     'http://toro.2ch.net/tech/dat/1358937029.dat');
  eq(b2url.format({ host: 'toro.2ch.net', bbs: 'tech', key: 1358937029 }),
     'http://toro.2ch.net/tech/dat/1358937029.dat');

  eq(b2url.format({ host: 'toro.2ch.net', bbs: 'tech', key: 1358937029 }, true),
     { host: 'toro.2ch.net', path: '/tech/dat/1358937029.dat',
       href: 'http://toro.2ch.net/tech/dat/1358937029.dat' });

  eq(b2url.format(null), null);
  eq(b2url.format({ host:'example.com' }), null);
}

console.log('test_parse_range');
test_parse_range();
console.log('test_parse');
test_parse();
console.log('test_format');
test_format();

console.log('ok');
