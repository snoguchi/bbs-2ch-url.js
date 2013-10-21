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


  function _normalize(url) {
    var urlObj = {}, m;
    if (typeof url === 'string') {
      if (m = url.match(/^h?ttp\:\/\/([^\/]+)(\/.*)/)) {
        urlObj.host = m[1];
        urlObj.path = m[2];
      }
    } else {
      urlObj.host = url.host || url.hostname;
      urlObj.path = url.path || url.pathname;
    }
    return urlObj;
  }


  // in: url string or url object
  // out: addr object
  function parse(url) {
    var addr = null, m;

    url = _normalize(url);

    if (!url.host || !url.path) {
      return null;
    }

    if (url.host === 'bg.2ch.net') {
      if (m = url.path.match(/^\/test\/r\.so\/([^\/]+)\/([^\/]+)\/(\d+)/)) {
        // http://bg.2ch.net/test/r.so/<host>/<board>/<thread>/
        addr = { host: m[1], board: m[2], thread: +m[3] };
      } else if (m = url.path.match(/^\/test\/p\.so\/([^\/]+)\/([^\/]+)/)) {
        // http://bg.2ch.net/test/p.so/<host>/<board>
        addr = { host: m[1], board: m[2] };
      }
    } else {
      if (m = url.path.match(/^\/test\/read\.cgi\/([^\/]+)\/(\d+)\/?(.*)$/)) {
        // http://<host>/test/read.cgi/<board>/<thread>/<range>
        addr = { host: url.host, board: m[1], thread: +m[2] };
        if (m[3]) {
          addr.range = m[3];
          addr.rangeSlices = parseRangeString(m[3]);
        }
      } else if (m = url.path.match(/^\/([^\/]+)\/dat\/(\d+).dat/)) {
        // http://<host>/<board>/dat/<thread>.dat
        addr = { host: url.host, board: m[1], thread: +m[2] };
      } else if (m = url.path.match(/^\/([^\/]+)\/?(subject.txt)?$/)) {
        // http://<host>/<board>/
        // http://<host>/<board>/subject.txt
        addr = { host: url.host, board: m[1] };
      }
    }

    return addr;
  }


  // in: addr object
  // out: url object
  function convert(addr, type) {
    var url = null;

    if (typeof addr === 'string') {
      addr = parse(addr);
    }

    if (!addr.host || !addr.board) {
      return null;
    }

    switch (type) {
    case 'board':
      url = {
        host: addr.host,
        path: '/' + addr.board + '/'
      };
      break;
    case 'subject':
      url = {
        host: addr.host,
        path: '/' + addr.board + '/subject.txt'
      };
      break;
    case 'subject:bg':
      url = {
        host: 'bg20.2ch.net',
        path: '/test/p.so/' + addr.host + '/' + addr.board + '/'
      };
      break;
    case 'thread':
      if (addr.thread) {
        url = {
          host: addr.host,
          path: '/test/read.cgi/' + addr.board + '/' + addr.thread + '/' + (addr.range || '')
        };
      }
      break;
    case 'dat':
      if (addr.thread) {
        url = {
          host: addr.host,
          path: '/' + addr.board + '/dat/' + addr.thread + '.dat'
        };
      }
      break;
    case 'dat:bg':
      if (addr.thread) {
        url = {
          host: 'bg20.2ch.net',
          path: '/test/r.so/' + addr.host + '/' + addr.board + '/' + addr.thread + '/'
        };
      }
      break;
    default:
      url = convert(addr, addr.thread ? 'dat' : 'subject');
      break;
    }

    return url;
  }


  function format(addr, type) {
    var url = convert(addr, type);
    return url ? 'http://' + url.host + url.path : '';
  }


  global.bbs2ch = global.bbs2ch || {};

  global.bbs2ch.url = {
    parseRangeString: parseRangeString,
    parse: parse,
    convert: convert,
    format: format
  }

  if (typeof module !== 'undefined') {
    module.exports = global.bbs2ch.url;
  }
})(this.self || global);
