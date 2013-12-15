# angular-vertxbus

Client side library using VertX Event Bus as an Angular Service module

## How to get

Either download it manually or install it automatically with Bower: `bower install angular-vertxbus --save`

## How to use

You have to define the module dependency, this module is named `knalli.angular-vertxbus`.

```javascript
angular.module('your-component', ['knalli.angular-vertxbus']).controller(function(vertxEventBus){
  vertxEventBus.send('my.address', {data: 123});
});
```

### Consume messages

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
vertxEventBusService.send('myaddress', {data: 123}, true).then(function(reply){
  console.log('A reply received: ', reply);
}).catch(function(){
  console.warn('No message');
});

// The "No reply message found" is controlled via a timeout (default 10000ms)
vertxEventBusService.send('myaddress', {data: 123}, true, 3000).then(function(reply){
  console.log('A reply received: ', reply);
}).catch(function(){
  console.warn('No message within 3 seconds');
});
```

## Advanced configuration

The module has some advanced configuration options. Perhaps you do not have to change them, but at least you should know them!

Each module configuration option must be defined in the `run` phase, i.e.:

```javascript
angular.module('your-component').run(function(){
  angular.module('knalli.angular-vertxbus')
  .value('enabled', vertxServerIsEnabled)
  .value('reconnectEnabled', vertxServerReconnectIsSupported)
  .value('urlServer', 'http://live.example.org:8888')
});
```
| Key                     | Default       | Description         |
| ----------------------- | ------------- | ------------------- |
| enabled                 | `true`        | if false, the usage of the Event Bus will be disabled (actually, no vertx.EventBus will be created) |
| debugEnabled            | `false`       | if true, some additional debug loggings will be displayed |
| prefix                  | `vertx-eventbus.` | a prefix used for the global broadcasts |
| urlServer               | (same origin)\* | full URL to the server (change it if the server is not the origin) |
| urlPath                 | `'/eventbus'` | path to the event bus |
| reconnectEnabled        | `true`        | if false, the disconnect will be recognized but no further actions |
| sockjsStateInterval     | `10000` (ms)  | defines the check interval of the underlayling SockJS connection |
| sockjsReconnectInterval | `10000` (ms)  | defines the wait time for a reconnect after a disconnect has been recognized |
| sockjsOptions           | `{}`          | optional SockJS options (new SockJS(url, undefined, options)) |

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
service.send('myaddress', data, true).then(function(replyMessage) {})
```

For each connect or disconnect, a global broadcast will be emitted (on `$rootScope` with `'vertx-eventbus.system.connected'`, `'vertx-eventbus.system.disconnected'`)

## License

Copyright 2014 by Jan Philipp. Licensed under MIT.
