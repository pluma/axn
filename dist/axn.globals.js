(function(root){
var module = {exports: {}};
(function(require, exports, module) {
/*jshint es3: true */
/*global module */
'use strict'
function axn(spec) {
  function action(data) {
    action.emit(data);
  }
  action._listeners = [];
  if (spec) ext(action, spec);
  ext(action, axn.methods);
  return action;
}

function ext(obj, src) {
  for (var key in src) {
    if (src.hasOwnProperty(key)) {
      if (obj.hasOwnProperty(key)) continue;
      obj[key] = src[key];
    }
  }
}

axn.methods = {
  _listen: function (fn, ctx, once) {
    function cb(data) {
      return fn.call(ctx, data);
    }
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
  emit: function (data) {
    data = this.beforeEmit(data);
    if (!this.shouldEmit(data)) return;
    for (var i = 0; i < this._listeners.length; i++) {
      var listener = this._listeners[i];
      listener.call(undefined, data);
      if (listener.once) {
        this._listeners.splice(i, 1);
        i -= 1;
      }
    }
  }
};

module.exports = axn;

}(function(key){return root[key];}, module.exports, exports));
root.axn = module.exports;
}(this));