/*jshint node: true */
/*global describe, it, beforeEach, afterEach */
'use strict';
var expect = require('expect.js');
var axn = require('../');
var invoke = function (fn) {return fn();};

describe('axn', function() {
  it('is a function', function () {
    expect(axn).to.be.a('function');
  });
  it('returns a function', function () {
    expect(axn()).to.be.a('function');
  });
  it('remembers listeners', function() {
    var listener = function() {};
    var action = axn();
    action.listen(listener);
    expect(action._listeners.length).to.equal(1);
  });
  describe('when invoked', function () {
    var listeners = [];
    function listen(listenable, listener, ctx) {
      var cb = listenable.listen(listener, ctx);
      listeners.push(cb);
      return cb;
    }
    afterEach(function () {
      listeners.splice(0).forEach(invoke);
    });
    it('notifies listeners', function (done) {
      var action = axn();
      listen(action, function () {
        done();
      });
      action({});
    });
    it('invokes listeners with their context', function (done) {
      var ctx = {hello: 'world'};
      var action = axn();
      var listener = function() {
        expect(this).to.equal(ctx);
        done();
      };
      listen(action, listener, ctx);
      action();
    });
    it('applies the beforeEmit function', function (done) {
      var value1 = {hello: 'world'};
      var value2 = {foo: 'bar'};
      function beforeEmit(input) {
        expect(input).to.equal(value1);
        beforeEmit.called = true;
        return value2;
      }
      var action = axn({beforeEmit: beforeEmit});
      listen(action, function (input) {
        expect(beforeEmit.called).to.equal(true);
        expect(input).to.equal(value2);
        done();
      });
      action(value1);
    });
    it('does not notify listeners removed by unlisten', function () {
      var action = axn();
      var fn = function () {
        expect().fail();
      };
      action.listen(fn);
      action.unlisten(fn);
      action({});
    });
    it('does not notify listeners removed by callback', function () {
      var action = axn();
      var cb = action.listen(function () {
        expect().fail();
      });
      cb();
      action({});
    });
    it('does not notify listeners if shouldEmit fails', function () {
      function shouldEmit() {
        return false;
      }
      var action = axn({shouldEmit: shouldEmit});
      listen(action, function () {expect().fail();});
      action({});
    });
    it('invokes listeners in the correct order', function (done) {
      var called = false;
      var action = axn();
      listen(action, function () {
        called = true;
      });
      listen(action, function () {
        expect(called).to.equal(true);
        done();
      });
      action({});
    });
    it('passes its argument to its listeners', function (done) {
      var value = {hello: 'world'};
      var action = axn();
      listen(action, function (input) {
        expect(input).to.equal(value);
        done();
      });
      action(value);
    });
    it('invokes listenOnce only once', function (done) {
      var times = 0;
      var action = axn();
      action.listenOnce(function () {
        times++;
      });
      action();
      expect(times).to.equal(1);
      action();
      expect(times).to.equal(1);
      done();
    });
    it('removes listener after listenOnce', function (done) {
      var action = axn();
      action.listenOnce(function () {});
      expect(action._listeners.length).to.equal(1);
      action();
      expect(action._listeners.length).to.equal(0);
      done();
    });
    it('invokes listenOnce with context', function (done) {
      var ctx = {hello: 'world'};
      var action = axn();
      var listener = function() {
        expect(this).to.equal(ctx);
        done();
      };
      action.listenOnce(listener, ctx);
      done();
    });
  });
  describe('when a listener is unlistened by calling the callback', function() {
    var action, result, callback1, callback2;
    var listener1 = function() {
      listener1.timesCalled += 1;
    };
    var listener2 = function() {
      listener2.timesCalled += 1;
    };
    beforeEach(function() {
      action = axn();
      listener1.timesCalled = 0;
      listener2.timesCalled = 0;
      var unlisten = action.listen(listener1);
      callback1 = action._listeners[action._listeners.length - 1];
      action.listen(listener2);
      callback2 = action._listeners[action._listeners.length - 1];
      result = unlisten();
    });
    it('returns true', function() {
      expect(result).to.equal(true);
    });
    it('does not unlisten other functions', function() {
      expect(action._listeners).to.only.contain(callback2);
    });
    it('does not notify unlistened listeners', function() {
      action('message');
      expect(listener1.timesCalled).to.equal(0);
    });
    it('does notify other listeners', function() {
      action('message');
      expect(listener2.timesCalled).to.equal(1);
    });
    describe('and is unlistened again', function() {
      it('returns false', function() {
        var action = axn();
        var listener = function() {};
        var nonListener = function() {};
        var result;
        action.listen(listener);
        var callback = action._listeners[action._listeners.length - 1];
        var unlisten = action.listen(nonListener);
        unlisten();
        result = unlisten();
        expect(result).to.equal(false);
        expect(action._listeners).to.only.contain(callback);
      });
    });
  });
  describe('when a listener is unlistened via unlisten', function() {
    var action, result, callback1, callback2;
    var listener1 = function() {
      listener1.timesCalled += 1;
    };
    var listener2 = function() {
      listener2.timesCalled += 1;
    };
    beforeEach(function() {
      action = axn();
      listener1.timesCalled = 0;
      listener2.timesCalled = 0;
      action.listen(listener1);
      callback1 = action._listeners[action._listeners.length - 1];
      action.listen(listener2);
      callback2 = action._listeners[action._listeners.length - 1];
      result = action.unlisten(listener1);
    });
    it('returns true', function() {
      expect(result).to.equal(true);
    });
    it('does not unlisten other functions', function() {
      expect(action._listeners).to.only.contain(callback2);
    });
    it('does not notify unlistened listeners', function() {
      action('message');
      expect(listener1.timesCalled).to.equal(0);
    });
    it('does notify other listeners', function() {
      action('message');
      expect(listener2.timesCalled).to.equal(1);
    });
    describe('and is unlistened again', function() {
      it('returns false', function() {
        var action = axn();
        var listener = function() {};
        var nonListener = function() {};
        var result;
        action.listen(listener);
        var callback = action._listeners[action._listeners.length - 1];
        action.listen(nonListener);
        action.unlisten(nonListener);
        result = action.unlisten(nonListener);
        expect(result).to.equal(false);
        expect(action._listeners).to.only.contain(callback);
      });
    });
  });
  describe('when a spec is provided', function () {
    it('is extended with the spec', function () {
      var spec = {example: 'hi'};
      var action = axn(spec);
      expect(action.example).to.equal(spec.example);
    });
    it('overrides built-ins', function () {
      expect(axn.methods).to.have.property('beforeEmit');
      var spec = {beforeEmit: function () {}};
      var action = axn(spec);
      expect(action.beforeEmit).to.equal(spec.beforeEmit);
      expect(action.beforeEmit).not.to.equal(axn.methods.beforeEmit);
    });
    describe('when shouldEmit is overridden', function () {
      it('only emits if shouldEmit returns true', function () {
        var action = axn({
          shouldEmit: function () {
            return false;
          }
        });
        action.listen(function () {
          expect().fail();
        });
        action();
      });
      it('passes the pre-processed data to shouldEmit', function (done) {
        var value = 'potato';
        var action = axn({
          beforeEmit: function () {
            return value;
          },
          shouldEmit: function (input) {
            expect(input).to.equal(value);
            done();
          }
        });
        action('hi');
      });
    });
    describe('when beforeEmit is overridden', function () {
      it('passes its value to beforeEmit', function (done) {
        var value = {yo: 'sup'};
        var action = axn({
          beforeEmit: function (input) {
            expect(input).to.equal(value);
            done();
          }
        });
        action(value);
      });
      it('emits the result of beforeEmit', function (done) {
        var value = 'tomato';
        var action = axn({
          beforeEmit: function () {
            return value;
          }
        });
        action.listen(function (input) {
          expect(input).to.equal(value);
          done();
        });
        action('nope');
      });
    });
  });
});
