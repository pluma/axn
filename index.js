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
  _afterEmit: function (result/*, data */) {
    return result;
  },
  emit: function (/* ...data */) {
    var data = Array.prototype.slice.call(arguments);
    if (data.length < 2) data = data[0];
    data = this.beforeEmit(data);
    var initial = this._beforeEmit(data);
    var result = initial;
    if (!this.shouldEmit(data)) return result;
    for (var i = 0; i < this._listeners.length; i++) {
      var listener = this._listeners[i];
      result = listener(data, result, initial);
      if (listener.once) {
        this._listeners.splice(i, 1);
        i -= 1;
      }
    }
    result = this._afterEmit(result, initial);
    return result;
  }
};

aaxn.methods = {
  _cb: function (fn, ctx) {
    return function (data, p, p0) {
      return p.then(function (result) {
        if (p0._cancelled) return Promise.reject(new Error(p0._cancelled));
        return fn.call(ctx, data, result);
      });
    };
  },
  _beforeEmit: function (data) {
    return ext(Promise.resolve(data), {
      _cancelled: false
    });
  },
  _afterEmit: function (p, p0) {
    return ext(p.then(function (value) {
      if (p0._cancelled) return Promise.reject(new Error(p0._cancelled));
      return value;
    }), {
      cancel: function (reason) {
        p0._cancelled = reason || 'cancelled';
      },
      cancelled: function () {
        return Boolean(p0._cancelled);
      }
    });
  }
};

axn.async = aaxn;
module.exports = axn;