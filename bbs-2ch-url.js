(function(global) {
  'use strict'


  function parseRangeString(str) {
    var range = [], nofirst = false;

    str.split(',').forEach(function(exp) {
      var tok = exp.split('-', 2), m;

      for (var i = 0, n = tok.length; i < n; i++) {
        if (m = tok[i].match(/^(\D*)(\d+)(\D*)/)) {
          var mod = m[1] + m[3];
          if (mod.indexOf('l') !== -1) {
            tok[i] = -m[2];
          } else if (m[2] > 1) {
            tok[i] = +m[2];
          } else {
            tok[i] = NaN;
          }
          if (mod.indexOf('n') !== -1) {
            nofirst = true;
          }
        } else {
          tok[i] = NaN;
        }
      }

      if (tok[0] > 0) {
        tok[0]--;
      }

      if (tok.length === 1) {
        if (!isNaN(tok[0])) {
          if (tok[0] > 0) {
            range.push([tok[0], tok[0] + 1]); // 50 => [49] => [49, 50]
            nofirst = true;
          } else {
            range.push([tok[0]]); // l50 => [-50] => [-50]
          }
        }
      } else if (tok.length === 2) {
        if (isNaN(tok[0])) {
          if (!isNaN(tok[1])) {
            range.push([0, tok[1]]); // -50 => [NaN, 50] => [0, 50]
            nofirst = true;
          }
        } else {
          if (isNaN(tok[1])) {
            range.push([tok[0]]); // 50- => [49, NaN] => [49]
          } else {
            range.push([tok[0], tok[1]]); // 50-60 => [49, 60] => [49, 60]
          }
        }
      }
    });

    if (range.length > 0 && !nofirst) {
      range.unshift([0, 1]);
    }

    return range;
  }


  function parse(url) {
    var obj = null, m;

    if (!url) {
      return null;
    }

    if (typeof url === 'string') {
      if (!(m = url.match(/^h?ttp\:\/\/([^\/]+)(\/.*)/))) {
        return null;
      }
      url = { host: m[1], path: m[2], href: url };
    } else {
      if (!url.host || !url.path) {
        return null;
      }
    }

    if (url.host === 'bg20.2ch.net') {
      if (m = url.path.match(/^\/test\/r\.so\/([^\/]+)\/([^\/]+)\/(\d+)/)) {
        // http://bg20.2ch.net/test/r.so/<host>/<board>/<thread>/
        obj = { type: 'bg', host: m[1], board: m[2], thread: +m[3] };
      } else if (m = url.path.match(/^\/test\/p\.so\/([^\/]+)\/([^\/]+)/)) {
        // http://bg20.2ch.net/test/p.so/<host>/<board>
        obj = { type: 'bg', host: m[1], board: m[2] };
      }
    } else {
      if (m = url.path.match(/^\/test\/read\.cgi\/([^\/]+)\/(\d+)\/?(.*)$/)) {
        // http://<host>/test/read.cgi/<board>/<thread>/<range>
        obj = { type: 'html', host: url.host, board: m[1], thread: +m[2] };
        if (m[3]) {
          obj.range = m[3];
          obj.rangeSlices = parseRangeString(m[3]);
        }
      } else if (m = url.path.match(/^\/([^\/]+)\/dat\/(\d+).dat/)) {
        // http://<host>/<board>/dat/<thread>.dat
        obj = { type: 'raw', host: url.host, board: m[1], thread: +m[2] };
      } else if (m = url.path.match(/^\/([^\/]+)\/?(subject.txt)?$/)) {
        // http://<host>/<board>/
        // http://<host>/<board>/subject.txt
        obj = { type: m[2] ? 'raw' : 'html', host: url.host, board: m[1] };
      }
    }

    return obj;
  }


  function format(obj, asObject) {
    var url;

    if (!obj || !obj.host || !obj.board) {
      return null;
    }

    switch (obj.type) {
    case 'bg':
      url = {
        host: 'bg20.2ch.net',
        path: obj.thread
          ? '/test/r.so/' + obj.host + '/' + obj.board + '/' + obj.thread + '/'
          : '/test/p.so/' + obj.host + '/' + obj.board + '/'
      };
      break;
    case 'html':
      url = {
        host: obj.host,
        path: obj.thread
          ? '/test/read.cgi/' + obj.board + '/' + obj.thread + '/' + (obj.range || '')
          : '/' + obj.board + '/'
      };
      break;
    case 'raw':
    case undefined:
      url = {
        host: obj.host,
        path: obj.thread
          ? '/' + obj.board + '/dat/' + obj.thread + '.dat'
          : '/' + obj.board + '/subject.txt'
      };
      break;
    default:
      return null;
    }

    url.href = 'http://' + url.host + url.path;

    return asObject ? url : url.href;
  }


  global.bbs2ch = global.bbs2ch || {};

  global.bbs2ch.url = {
    parseRangeString: parseRangeString,
    parse: parse,
    format: format
  }

  if (typeof module !== 'undefined') {
    module.exports = global.bbs2ch.url;
  }
})(this.self || global);
