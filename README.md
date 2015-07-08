 Synopsis

**axn** is a small-ish (~2.2 kB minified, 758 bytes gzipped) implementation of listenable actions or signals in JavaScript for browsers (IE8+) and the server.

[![license - MIT](https://img.shields.io/npm/l/axn.svg)](http://pluma.mit-license.org) [![Dependencies](https://img.shields.io/david/pluma/axn.svg)](https://david-dm.org/pluma/axn)

[![NPM status](https://nodei.co/npm/axn.png?compact=true)](https://npmjs.org/package/axn)

[![Build Status](https://img.shields.io/travis/pluma/axn.svg)](https://travis-ci.org/pluma/axn) [![Coverage Status](https://img.shields.io/coveralls/pluma/axn.svg)](https://coveralls.io/r/pluma/axn?branch=master) [![Codacy rating](https://img.shields.io/codacy/18052d33b87d4f2fb42c79ab99152e9b.svg)](https://www.codacy.com/public/me_4/axn)

# Install

## Node.js

### With NPM

```sh
npm install axn
```

### From source

```sh
git clone https://github.com/pluma/axn.git
cd axn
npm install
npm run test && npm run dist
```

## Browser

### With component

```sh
component install pluma/axn
```

[Learn more about component](https://github.com/component/component).

### With bower

```sh
bower install axn
```

[Learn more about bower](https://github.com/twitter/bower).

### With a CommonJS module loader

Download the [latest minified CommonJS release](https://raw.github.com/pluma/axn/master/dist/axn.min.js) and add it to your project.

[Learn more about CommonJS modules](http://wiki.commonjs.org/wiki/Modules/1.1).

### With an AMD module loader

Download the [latest minified AMD release](https://raw.github.com/pluma/axn/master/dist/axn.amd.min.js) and add it to your project.

[Learn more about AMD modules](http://requirejs.org/docs/whyamd.html).

### As a standalone library

Download the [latest minified standalone release](https://raw.github.com/pluma/axn/master/dist/axn.globals.min.js) and add it to your project.

```html
<script src="/your/js/path/axn.globals.min.js"></script>
```

This makes the `axn` module available in the global namespace.

# Examples

```js
import axn from 'axn';

let action = axn();

let unlisten = action.listen(data => data.toUpperCase());
action.listen((data, modified) => console.log('received data:', data, modified));
action.listen(() => 42);

let result = action('hello'); // -> received data: hello HELLO
result === 42;

unlisten();
action('hello'); // -> received data: hello hello

let asyncAction = axn.async();

asyncAction.listen(data => Promise.resolve(data.toUpperCase()));

asyncAction('hello').then(result => console.log(result)); // -> HELLO
```

# API

## axn([spec]):Function

Creates a new action.

If `spec` is an object, its properties will be copied to the new action, overwriting its default properties.

## action(data)

Invokes the action's listeners in sequence with the given `data`. Returns the return value of the last listener called.

If passed more than one argument, the arguments will be passed on as an array.

In addition to `data`, each listener will be passed the return value of the previous listener as a second argument, or `data` if the listener is the first in the sequence.

## action.listen(fn, [ctx]):Function

Adds a given function to the action's listeners. If `ctx` is provided, the function will be invoked using it as its `this` context.

Returns a function that will remove the listener from the action.

## action.unlisten(fn, [ctx]):Boolean

Removes the given function with the given context from the action's listeners.

Returns `true` if the listener was removed successfully, otherwise returns `false`.

## action.listenOnce(fn, [ctx]):Function

Adds a given function to the action's listeners. If `ctx` is provided, the function will be invoked using it as its `this` context.

The function will only be invoked once and then automatically removed from the action's listeners.

Returns a function that will remove the listener from the action.

## action.beforeEmit(data):data

Override this function in your action's `spec` to pre-process data passed to the action before it is emitted.

The return value will be passed to the action's listeners.

## action.shouldEmit(data):Boolean

Override this function in your action's `spec` to define whether data should be emitted.

This function is passed the output of `beforeEmit`. If the function returns `false` or a non-truthy value, the data will not be emitted. Otherwise the action's listeners will be invoked as normally.

## axn.methods

An object containing the default properties that will be copied to new actions.

## axn.async([spec]):Function

Creates a new async action.

If `spec` is an object, its properties will be copied to the new action, overwriting its default properties.

**NOTE:** async actions use promises. `axn` uses the global `Promise` implementation defined by ES 2015. If you want to use async actions in environments that don't provide an ES2015-compatible `Promise` implementation, you need to make sure to use a polyfill like [es6-promise](https://www.npmjs.com/package/es6-promise). If you're not interested in async actions, you can ignore this section.

## asyncAction(data):Promise

Invokes the action's listeners in sequence with the given `data`. Returns a promise resolving to the return value of the last listener called (or rejected accordingly).

In addition to `data`, each listener will be passed the resolved value of the previous listener as a second argument, or `data` if the listener is the first in the sequence.

The promise returned by the action has two additional methods to allow aborting an action that is still in progress:

## promise.cancel([message])

Cancels the action. Listeners that have not yet been invoked will no longer be called and the promise will be rejected with an error with the given message or `"cancelled"` if no message was provided.

## promise.cancelled():Boolean

Returns `true` if the action was cancelled or `false` otherwise.

This function can be used to determine whether a promise was rejected due to a regular error or because it was explicitly cancelled.

## axn.async.methods

An object containing the default properties that will be copied to new async actions in addition to those in `axn.methods`.

# License

The MIT/Expat license. For more information, see http://pluma.mit-license.org/ or the accompanying [LICENSE](https://github.com/pluma/axn/blob/master/LICENSE) file.
