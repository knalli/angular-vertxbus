# angular-vertxbus [![Bower version](https://badge.fury.io/bo/angular-vertxbus.svg)](http://badge.fury.io/bo/angular-vertxbus) [![npm version](https://badge.fury.io/js/angular-vertxbus.svg)](http://badge.fury.io/js/angular-vertxbus) [![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

Client side library using VertX Event Bus as an Angular Service module

## Status

| Branch | Stability | Status |
| --- | --- | --- |
| Canary | unstable | [![Build Status](https://travis-ci.org/knalli/angular-vertxbus.png?branch=canary)](https://travis-ci.org/knalli/angular-vertxbus) |
| Master | stable | [![Build Status](https://travis-ci.org/knalli/angular-vertxbus.png?branch=master)](https://travis-ci.org/knalli/angular-vertxbus) |


## How to get

Either download it manually or install it automatically with Bower: `bower install angular-vertxbus --save`

If you have a standard non AMD styled project, use `dist/angular-vertxbus.js` or `dist/angular-vertxbus.min.js`.

In case of an AMD styled project, there is also a package available at `dist/requirejs/angular-vertxbus.js`. In addition, because of the lack of vertxbus package, there is a Vert.X Event Bus package at `dist/requirejs/vertxbus.js` which includes the version of the Event Bus defined in the `bower.json`.

## How to use

You have to define the module dependency, this module is named `knalli.angular-vertxbus`.

```javascript
angular.module('your-component', ['knalli.angular-vertxbus']).controller('MyCtrl', function(vertxEventBus, vertxEventBusService){

  // using the EventBus directly
  vertxEventBus.send('my.address', {data: 123});

  // using the service
  vertxEventBusService.send('my.address', {data: 123})

});
```

### Consume messages

First, make sure to have the vertxEventBusService available in your controller function.

```javascript
angular.module('your-component', ['knalli.angular-vertxbus']).controller('MyCtrl', function(vertxEventBusService){
  // ...
});
```

```javascript
vertxEventBusService.on('myaddress', function(message) {
  console.log('Received a message: ', message);
});
```

### Publish a message

```javascript
vertxEventBusService.publish('myaddress', {data: 123});
```

### Send a message

```javascript
vertxEventBusService.send('myaddress', {data: 123});

// expect a reply
vertxEventBusService.send('myaddress', {data: 123}).then(function(reply){
  console.log('A reply received: ', reply);
}).catch(function(){
  console.warn('No message');
});

// The "No reply message found" is controlled via a timeout (default 10000ms)
vertxEventBusService.send('myaddress', {data: 123}, 3000).then(function(reply){
  console.log('A reply received: ', reply);
}).catch(function(){
  console.warn('No message within 3 seconds');
});
```

## Advanced configuration

The module has some advanced configuration options. Perhaps you do not have to change them, but at least you should know them!

Each module configuration option must be defined in the `run` phase, i.e.:

```javascript
var module = angular.module('your-component', ['knalli.angular-vertxbus']);
module.config(function(vertxEventBusProvider) {
  vertxEventBusProvider
  .enable()
  .useReconnect()
  .useUrlServer('http://live.example.org:8888');
});
```
| Config Function            | Default         | Description         |
| -------------------------- | --------------- | ------------------- |
| enable(bool)               | `true`          | if false, the usage of the Event Bus will be disabled (actually, no `vertx.EventBus` will be created) |
| useDebug(bool)             | `false`         | if true, some additional debug loggings will be displayed |
| usePrefix(string)          | `'vertx-eventbus.'` | a prefix used for the global broadcasts |
| useUrlServer(string)       | (same origin)\* | full URL to the server (must be changed if the target server is not the origin) |
| useUrlPath(string)         | `'/eventbus'`   | path to the event bus |
| useReconnect               | `true`          | if false, the disconnect will be recognized but no further actions |
| useSockJsStateInterval     | `10000` (ms)    | defines the check interval of the underlayling SockJS connection |
| useSockJsReconnectInterval | `10000` (ms)    | defines the wait time for a reconnect after a disconnect has been recognized |
| useSockJsOptions           | `{}`            | optional SockJS options (technically `new SockJS(url, undefined, sockjsOptions)`) |

* `location.protocol + '//' + location.hostname + ':' + (location.port or 80)`

## Architecture details

The module contains two items: the stub holder `vertxEventBus` for the Vert.X EventBus and a more comfortbale high level service `vertxEventBusService`.

*The stub* is required because the Vert.X Event Bus cannot handle a reconnect. The reason is the underlaying SockJS which cannot handle a reconnect, too. A reconnect means to create a new instance of `SockJS`, therefore a new instanve of `vertx.EventBus`. The stub ensures only one single instance exists. Otherwise a global module was not possible.

More or less the stub supports the same API calls like the original `vertx.EventBus`.

Based on the stub, the *high level service* `vertxEventBusService` detects disconnects, handles reconnects and ensures re-registrations of subscriptions. Furthermore, the service provides some neat aliases for the usage of handlers.

```javascript
// Same as vertx.EventBus.registerHandler()
service.registerHandler('myaddress', callback);
service.on('myaddress', callback);
service.addListener('myaddress', callback);

// Same as vertx.EventBus.unregisterHandler()
service.unregisterHandler('myaddress', callback);
service.un('myaddress', callback);
service.removeListener('myaddress', callback);

// Same as vertx.EventBus.send()
service.send('myaddress', data)

// Same as vertx.EventBus.publish
service.publish('myaddress', data)
service.emit('myaddress', data)

// Same as vertx.readyState()
service.readyState()
```

In addition to this, when sending a message with an expected reply:

```javascript
// Same as vertx.EventBus.send() but with a promise
service.send('myaddress', data).then(function(replyMessage) {})
```

For each connect or disconnect, a global broadcast will be emitted (on `$rootScope` with `'vertx-eventbus.system.connected'`, `'vertx-eventbus.system.disconnected'`)

### Setup for using same callback with different addresses

In some scenarios you will want to use a single callback definition to many different addresses.  To do this you will
have to follow this pattern.

Create a javascript object that defines your callback.  Do not attempt to use `.prototype` as the methods defined
as such will always point to the same memory allocation - so will always be found identical when adding to the internal
array.
```javascript
function FunctionHolder(){
  "use strict";
  return {
      handler: function (message) {
          // do stuff here
      }
  }
};
```

Then when adding the listeners, you will create a new instance of your object and use your defined function.
```javascript
var funcHolder = new FunctionHolder();
vertxEventBusService.addListener('address', funcHolder.handler);
```

**NOTE: this functionality is only available after version 0.8.0.**

## License

Copyright 2014 by Jan Philipp. Licensed under MIT.


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/knalli/angular-vertxbus/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

