(function(root){
var module = {exports: {}};
(function(require, exports, module) {
/*jshint es3: true */
/*global module, Promise */
'use strict';
function createAction(spec, base) {
  function action(data) {
    return action.emit(data);
  }
  action._listeners = [];
  if (spec) ext(action, spec);
  return ext(action, base);
}

function axn(spec) {
  return createAction(spec, axn.methods);
}

function aaxn(spec) {
  return ext(createAction(spec, aaxn.methods), axn.methods);
}

function ext(obj, src) {
  for (var key in src) {
    if (src.hasOwnProperty(key)) {
      if (obj.hasOwnProperty(key)) continue;
      obj[key] = src[key];
    }
  }
  return obj;
}

axn.methods = {
  _cb: function (fn, ctx) {
    return function (data, result) {
      return fn.call(ctx, data, result);
    };
  },
  _listen: function (fn, ctx, once) {
    var cb = this._cb(fn, ctx);
    this._listeners.push(cb);
    cb.ctx = ctx;
    cb.fn = fn;
    cb.once = once;
    var self = this;
    return function () {
      var i = self._listeners.indexOf(cb);
      if (i === -1) return false;
      self._listeners.splice(i, 1);
      return true;
    };
  },
  listenOnce: function (fn, ctx) {
    return this._listen(fn, ctx, true);
  },
  listen: function (fn, ctx) {
    return this._listen(fn, ctx, false);
  },
  unlisten: function (fn, ctx) {
    for (var i = 0; i < this._listeners.length; i++) {
      var listener = this._listeners[i];
      if (listener.fn === fn && listener.ctx === ctx) {
        this._listeners.splice(i, 1);
        return true;
      }
    }
    return false;
  },
  shouldEmit: function (/* data */) {
    return true;
  },
  beforeEmit: function (data) {
    return data;
  },
  _beforeEmit: function (data) {
    return data;
  },
  emit: function (data) {
    data = this.beforeEmit(data);
    var result = this._beforeEmit(data);
    if (!this.shouldEmit(data)) return result;
    for (var i = 0; i < this._listeners.length; i++) {
      var listener = this._listeners[i];
      result = listener(data, result);
      if (listener.once) {
        this._listeners.splice(i, 1);
        i -= 1;
      }
    }
    return result;
  }
};

aaxn.methods = {
  _cb: function (fn, ctx) {
    return function (data, p) {
      return p.then(function (result) {
        return fn.call(ctx, data, result);
      });
    };
  },
  _beforeEmit: function (data) {
    return Promise.resolve(data);
  }
};

axn.async = aaxn;

module.exports = axn;
}(function(key){return root[key];}, module.exports, exports));
root.axn = module.exports;
}(this));