# angular-vertxbus

![Bower version](https://img.shields.io/bower/v/angular-vertxbus.svg) [![npm version](https://img.shields.io/npm/v/angular-vertxbus.svg)](https://www.npmjs.com/package/angular-vertxbus) [![Build Status](https://img.shields.io/travis/knalli/angular-vertxbus.svg)](https://travis-ci.org/knalli/angular-vertxbus) [![Built with Grunt](https://cdn.gruntjs.com/builtwith.svg)](http://gruntjs.com/)

Client side library using VertX Event Bus as an Angular Service module

## Status

| Branch | Stability | Status |
| --- | --- | --- |
| Canary | unstable | [![Build Status](https://travis-ci.org/knalli/angular-vertxbus.svg?branch=canary)](https://travis-ci.org/knalli/angular-vertxbus) |
| Master | stable | [![Build Status](https://travis-ci.org/knalli/angular-vertxbus.svg?branch=master)](https://travis-ci.org/knalli/angular-vertxbus) |


## How to get

Either download it manually or install it automatically with Bower `bower install -D angular-vertxbus` or npm `npm install -D angular-vertxbus`.

Then only import `dist/angular-vertxbus.js` or `dist/angular-vertxbus.min.js`. The file itself comes with a CJS header.

Alternatively you can use the cdnjs: [cdnjs.com/libraries/angular-vertxbus](https://cdnjs.com/libraries/angular-vertxbus).

## Dependencies

### JavaScript (Polyfill)

The source code is written using newer JavaScript 2015 (partly) and is using the JavaScript transpiler [BabelJS](https://babeljs.io).

Depending on your target clients, you probably need to include a browser polyfill (for ES5 clients). BabelJS itself
recommends the [requirement of its own polyfill](https://babeljs.io/docs/usage/polyfill/). Either you use the explained
way using npm modules and/or browserify, or you can use the alternative artifact variant `dist/angular-vertxbus.withpolyfill.js`.

### AngularJS

This library is being developed against *AngularJS 1.4*, and additional tests are performed against *AngularJS 1.2* and *AngularJS 1.3*.

### Vert.x

This library is being developed against the `eventbus.js` from Vert.x 3.

## How to use

### API

An [Api Documentation](https://knalli.github.io/angular-vertxbus.docs/docs/#/api/knalli.angular-vertxbus) is available.

### Quick start

You have to define the module dependency, this module is named `knalli.angular-vertxbus`.

```javascript
angular.module('app', ['knalli.angular-vertxbus'])
  .controller('MyCtrl', function(vertxEventBus, vertxEventBusService) {

    // using the EventBus directly
    vertxEventBus.send('my.address', {data: 123});

    // using the service
    vertxEventBusService.send('my.address', {data: 123})

  });
```

### Consume messages

```javascript
vertxEventBusService.on('myaddress', function(err, message) {
  console.log('Received a message: ', message);
});
```

### Publish a message

```javascript
vertxEventBusService.publish('myaddress', {data: 123});
```

### Send a message

```javascript
vertxEventBusService.send('myaddress', {data: 123})
  .then(function(reply) {
    console.log('A reply received: ', reply);
  })
  .catch(function() {
    console.warn('No message');
  });

// The "No reply message found" is controlled via a timeout (default 10000ms)
vertxEventBusService.send('myaddress', {data: 123}, {timeout: 3000})
  .then(function(reply) {
    console.log('A reply received: ', reply);
  })
  .catch(function() {
    console.warn('No message within 3 seconds');
  });

// If the reply is an error, this will be the payload
vertxEventBusService.send('myaddress', {data: 123})
  .then(function(reply) {
    console.log('A reply received: ', reply);
  })
  .catch(function(err) {
    console.warn(err);
  });
```

## Advanced configuration

The module has some advanced configuration options. Perhaps you do not have to change them, but at least you should know them!

Each module configuration option must be defined in the `run` phase, i.e.:

```javascript
angular.module('app', ['knalli.angular-vertxbus'])
  .config(function(vertxEventBusProvider) {
    vertxEventBusProvider
      .enable()
      .useReconnect()
      .useUrlServer('http://live.example.org:8888');
  });
```

Please have a look at the API documentation for [vertxEventBusProvider](https://knalli.github.io/angular-vertxbus.docs/docs/#/api/knalli.angular-vertxbus.vertxEventBusProvider)
and [vertxEventBusServiceProvider](https://knalli.github.io/angular-vertxbus.docs/docs/#/api/knalli.angular-vertxbus.vertxEventBusServiceProvider) for further options.

## Architecture details

The module contains two items: the stub holder `vertxEventBus` for the Vert.x EventBus and a more comfortbale high level service `vertxEventBusService`.

*The stub* is required because the Vert.x Event Bus cannot handle a reconnect. The reason is the underlaying SockJS which cannot handle a reconnect, too. A reconnect means to create a new instance of `SockJS`, therefore a new instance of `EventBus`. The stub ensures only one single instance exists. Otherwise a global module was not possible.

More or less the stub supports the same API calls like the original `EventBus`.

Based on the stub, the *high level service* `vertxEventBusService` detects disconnects, handles reconnects and ensures re-registrations of subscriptions. Furthermore, the service provides some neat aliases for the usage of handlers.

```javascript
// Same as EventBus.registerHandler()
service.registerHandler('myaddress', callback);
service.on('myaddress', callback);
service.addListener('myaddress', callback);

// Same as EventBus.unregisterHandler()
service.unregisterHandler('myaddress', callback);
service.un('myaddress', callback);
service.removeListener('myaddress', callback);

// Same as EventBus.send()
service.send('myaddress', data)

// Same as EventBus.publish
service.publish('myaddress', data)
service.emit('myaddress', data)

// Same as EventBus.readyState()
service.readyState()
```

In addition to this, when sending a message with an expected reply:

```javascript
// Same as EventBus.send() but with a promise
service.send('myaddress', data)
  .then(function(reply) {})
  .catch(function(err) {})
```

For each connect or disconnect, a global broadcast will be emitted (on `$rootScope` with `'vertx-eventbus.system.connected'`, `'vertx-eventbus.system.disconnected'`)

## Tests

### Unit tests

Note: Check that dependencies are be installed (`npm install`).

The *unit tests* are available with `npm test` which is actually a shortcut for `grunt test`. It performs tests under the current primary target version of AngularJS. Use `npm run test-scopes` for testing other scoped versions as well.

### E2E tests (manually)

Note: Check that dependencies are be installed (`npm install`).

The *end-to-end tests* start and utilize a full Vert.x node and a NodeJS based web server.

1. `npm run install-it-vertx-server` downloads and installs a Vert.x locally.
2. `npm run start-it-vertx-server` starts Vert.x on port `8080`.
3. `npm run start-it-web-server` starts a web server on port `3000`.
4. Open http://localhost:3000/ in your browser.

## License

Copyright 2016 by Jan Philipp. Licensed under MIT.
