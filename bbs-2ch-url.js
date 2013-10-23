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


  function _str2url(str) {
    var url = null, m;
    if (m = str.match(/^h?ttp\:\/\/([^\/]+)(\/.*)/)) {
      url = { host: m[1], path: m[2] };
    }
    return url;
  }


  function _url2bbs(url) {
    var bbs = null, m;
    if (url.host === 'bg20.2ch.net') {
      if (m = url.path.match(/^\/test\/r\.so\/([^\/]+)\/([^\/]+)\/(\d+)/)) {
        // http://bg20.2ch.net/test/r.so/<host>/<board>/<thread>/
        bbs = { host: m[1], board: m[2], thread: +m[3] };
      } else if (m = url.path.match(/^\/test\/p\.so\/([^\/]+)\/([^\/]+)/)) {
        // http://bg20.2ch.net/test/p.so/<host>/<board>
        bbs = { host: m[1], board: m[2] };
      }
    } else {
      if (m = url.path.match(/^\/test\/read\.cgi\/([^\/]+)\/(\d+)\/?(.*)$/)) {
        // http://<host>/test/read.cgi/<board>/<thread>/<range>
        bbs = { host: url.host, board: m[1], thread: +m[2] };
        if (m[3]) {
          bbs.range = m[3];
          bbs.rangeSlices = parseRangeString(m[3]);
        }
      } else if (m = url.path.match(/^\/([^\/]+)\/dat\/(\d+).dat/)) {
        // http://<host>/<board>/dat/<thread>.dat
        bbs = { host: url.host, board: m[1], thread: +m[2] };
      } else if (m = url.path.match(/^\/([^\/]+)\/?(subject.txt)?$/)) {
        // http://<host>/<board>/
        // http://<host>/<board>/subject.txt
        bbs = { host: url.host, board: m[1] };
      }
    }
    return bbs;
  }


  function _bbs2url(bbs, type) {
    var url = null;

    if (!bbs.host || !bbs.board) {
      return null;
    }

    switch (type) {
    case 'board':
      url = {
        host: bbs.host,
        path: '/' + bbs.board + '/'
      };
      break;
    case 'subject':
      url = {
        host: bbs.host,
        path: '/' + bbs.board + '/subject.txt'
      };
      break;
    case 'subject:bg':
      url = {
        host: 'bg20.2ch.net',
        path: '/test/p.so/' + bbs.host + '/' + bbs.board + '/'
      };
      break;
    case 'thread':
      if (bbs.thread) {
        url = {
          host: bbs.host,
          path: '/test/read.cgi/' + bbs.board + '/' + bbs.thread + '/' + (bbs.range || '')
        };
      }
      break;
    case 'dat':
      if (bbs.thread) {
        url = {
          host: bbs.host,
          path: '/' + bbs.board + '/dat/' + bbs.thread + '.dat'
        };
      }
      break;
    case 'dat:bg':
      if (bbs.thread) {
        url = {
          host: 'bg20.2ch.net',
          path: '/test/r.so/' + bbs.host + '/' + bbs.board + '/' + bbs.thread + '/'
        };
      }
      break;
    default:
      url = _bbs2url(bbs, bbs.thread ? 'dat' : 'subject');
      break;
    }

    return url;
  }


  function parse(url, type) {
    var bbs, m;

    if (typeof url === 'string' && !(url = _str2url(url))) {
      return null;
    }

    if (!(bbs = url.bbs || _url2bbs(url))) {
      return null;
    }

    if (type && !(url = _bbs2url(bbs, type))) {
      return null;
    }

    url.bbs = bbs;
    url.href = 'http://' + url.host + url.path;

    return url;
  }


  global.bbs2ch = global.bbs2ch || {};

  global.bbs2ch.url = {
    parseRangeString: parseRangeString,
    parse: parse
  }

  if (typeof module !== 'undefined') {
    module.exports = global.bbs2ch.url;
  }
})(this.self || global);
