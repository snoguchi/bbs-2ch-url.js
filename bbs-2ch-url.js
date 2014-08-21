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

    if (url.host === 'bg20.2ch.net' || url.host === 'bg30.2ch.net') {
      if (m = url.path.match(/^\/test\/r\.so\/([^\/]+)\/([^\/]+)\/(\d+)/)) {
        // http://bg*0.2ch.net/test/r.so/<host>/<bbs>/<key>/
        obj = { type: 'raw', cache: url.host, host: m[1], bbs: m[2], key: +m[3] };
      } else if (m = url.path.match(/^\/test\/p\.so\/([^\/]+)\/([^\/]+)/)) {
        // http://bg*0.2ch.net/test/p.so/<host>/<bbs>
        obj = { type: 'raw', cache: url.host, host: m[1], bbs: m[2] };
      }
    } else {
      if (m = url.path.match(/^\/test\/read\.cgi\/([^\/]+)\/(\d+)\/?(.*)$/)) {
        // http://<host>/test/read.cgi/<bbs>/<key>/<range>
        obj = { type: 'html', host: url.host, bbs: m[1], key: +m[2] };
        if (m[3]) {
          obj.range = m[3];
          obj.rangeSlices = parseRangeString(m[3]);
        }
      } else if (m = url.path.match(/^\/([^\/]+)\/dat\/(\d+).dat/)) {
        // http://<host>/<bbs>/dat/<key>.dat
        obj = { type: 'raw', host: url.host, bbs: m[1], key: +m[2] };
      } else if (m = url.path.match(/^\/([^\/]+)\/?(subject.txt)?$/)) {
        // http://<host>/<bbs>/
        // http://<host>/<bbs>/subject.txt
        obj = { type: m[2] ? 'raw' : 'html', host: url.host, bbs: m[1] };
      }
    }

    return obj;
  }


  function format(obj, asObject) {
    var url;

    if (!obj || !obj.host || !obj.bbs) {
      return null;
    }

    if (obj.type === 'html') {
      url = {
        host: obj.host,
        path: obj.key
          ? '/test/read.cgi/' + obj.bbs + '/' + obj.key + '/' + (obj.range || '')
          : '/' + obj.bbs + '/'
      };
    } else if (obj.type === 'raw' || typeof obj.type === 'undefined') {
      if (obj.cache) {
        url = {
          host: obj.cache,
          path: obj.key
            ? '/test/r.so/' + obj.host + '/' + obj.bbs + '/' + obj.key + '/'
            : '/test/p.so/' + obj.host + '/' + obj.bbs + '/'
        };
      } else {
        url = {
          host: obj.host,
          path: obj.key
            ? '/' + obj.bbs + '/dat/' + obj.key + '.dat'
            : '/' + obj.bbs + '/subject.txt'
        };
      }
    } else {
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
