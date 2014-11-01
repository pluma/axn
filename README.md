# Synopsis

**axn** is a small (< 1.2 kB minified, ~550 bytes gzipped) implementation of listenable actions or signals in JavaScript.

[![license - MIT](https://img.shields.io/npm/l/axn.svg)](https://pluma.mit-license.org)

[![NPM status](https://nodei.co/npm/axn.png?compact=true)](https://npmjs.org/package/axn)

[![browser support](https://ci.testling.com/pluma/axn.png)](https://ci.testling.com/pluma/axn)

[![Build Status](https://img.shields.io/travis/pluma/axn.svg)](https://travis-ci.org/pluma/axn) [![Coverage Status](https://img.shields.io/coveralls/pluma/axn.svg)](https://coveralls.io/r/pluma/axn?branch=master) [![Dependencies](https://img.shields.io/david/pluma/axn.svg)](https://david-dm.org/pluma/axn)

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

# API

## axn([spec]):Function

Creates a new action.

If `spec` is an object, its properties will be copied to the new action, overwriting its default properties.

## axn::(data)

Invokes the action's listeners with the given `data`.

## axn::listen(fn, [ctx]):Function

Adds a given function to the action's listeners. If `ctx` is provided, the function will be invoked using it as its `this` context.

Returns a function that will remove the listener from the action.

## axn::unlisten(fn, [ctx]):Boolean

Removes the given function with the given context from the action's listeners.

Returns `true` if the listener was removed successfully, otherwise returns `false`.

## axn::beforeEmit(data):data

Override this function in your action's `spec` to pre-process data passed to the action before it is emitted.

The return value will be passed to the action's listeners.

## axn::shouldEmit(data):Boolean

Override this function in your action's `spec` to define whether data should be emitted.

This function is passed the output of `beforeEmit`. If the function returns `false` or a non-truthy value, the data will not be emitted. Otherwise the action's listeners will be invoked as normally.

## axn.methods

An object containing the default properties that will be copied to new actions.

# License

The MIT/Expat license. For more information, see http://pluma.mit-license.org/ or the accompanying [LICENSE](https://github.com/pluma/axn/blob/master/LICENSE) file.
