/*! angular-vertxbus - v0.6.0 - 2014-05-19
* http://github.com/knalli/angular-vertxbus
* Copyright (c) 2014 ; Licensed  */
define(['vertxbus'], function () {
  (function () {
    var DEFAULT_OPTIONS, module, __hasProp = {}.hasOwnProperty;
    DEFAULT_OPTIONS = {
      enabled: true,
      debugEnabled: false,
      prefix: 'vertx-eventbus.',
      urlServer: '' + location.protocol + '//' + location.hostname + ':' + (location.port || 80),
      urlPath: '/eventbus',
      reconnectEnabled: true,
      sockjsStateInterval: 10000,
      sockjsReconnectInterval: 10000,
      sockjsOptions: {},
      messageBuffer: 0
    };
    /*
    An AngularJS wrapper for projects using the VertX Event Bus
  
    This module as some options (as constant property object "angularVertxbusOptions")
  
    * enabled (default true): if false, the usage of the Event Bus will be disabled (actually, no vertx.EventBus will be created)
    * debugEnabled (default false): if true, some additional debug loggings will be displayed
    * prefix (default 'vertx-eventbus.'): a prefix used for the global broadcasts
    * urlServer (default location.protocol + '//' + location.hostname + ':' + (location.port || 80): full URL to the server (change it if the server is not the origin)
    * urlPath (default '/eventbus'): path to the event bus
    * reconnectEnabled (default true): if false, the disconnect will be recognized but no further actions
    * sockjsStateInterval (default 10000 ms): defines the check interval of the underlayling SockJS connection
    * sockjsReconnectInterval (default 10000 ms): defines the wait time for a reconnect after a disconnect has been recognized
    * sockjsOptions (default {}): optional SockJS options (new SockJS(url, undefined, options))
  */
    module = angular.module('knalli.angular-vertxbus', ['ng']).constant('angularVertxbusOptions', angular.extend({}, DEFAULT_OPTIONS)).provider('vertxEventBus', [
      'angularVertxbusOptions',
      function (angularVertxbusOptions) {
        this.enable = function (value) {
          if (value == null) {
            value = DEFAULT_OPTIONS.enabled;
          }
          angularVertxbusOptions.enabled = value === true;
          return this;
        };
        this.useDebug = function (value) {
          if (value == null) {
            value = DEFAULT_OPTIONS.debugEnabled;
          }
          angularVertxbusOptions.debugEnabled = value === true;
          return this;
        };
        this.usePrefix = function (value) {
          if (value == null) {
            value = DEFAULT_OPTIONS.prefix;
          }
          angularVertxbusOptions.prefix = value;
          return this;
        };
        this.useUrlServer = function (value) {
          if (value == null) {
            value = DEFAULT_OPTIONS.urlServer;
          }
          angularVertxbusOptions.urlServer = value;
          return this;
        };
        this.useUrlPath = function (value) {
          if (value == null) {
            value = DEFAULT_OPTIONS.urlPath;
          }
          angularVertxbusOptions.urlPath = value;
          return this;
        };
        this.useReconnect = function (value) {
          if (value == null) {
            value = DEFAULT_OPTIONS.reconnectEnabled;
          }
          angularVertxbusOptions.reconnectEnabled = value;
          return this;
        };
        this.useSockJsStateInterval = function (value) {
          if (value == null) {
            value = DEFAULT_OPTIONS.sockjsStateInterval;
          }
          angularVertxbusOptions.sockjsStateInterval = value;
          return this;
        };
        this.useSockJsReconnectInterval = function (value) {
          if (value == null) {
            value = DEFAULT_OPTIONS.sockjsReconnectInterval;
          }
          angularVertxbusOptions.sockjsReconnectInterval = value;
          return this;
        };
        this.useSockJsOptions = function (value) {
          if (value == null) {
            value = DEFAULT_OPTIONS.sockjsOptions;
          }
          angularVertxbusOptions.sockjsOptions = value;
          return this;
        };
        this.useMessageBuffer = function (value) {
          if (value == null) {
            value = DEFAULT_OPTIONS.messageBuffer;
          }
          angularVertxbusOptions.messageBuffer = value;
          return this;
        };
        /*
      A stub representing the VertX Event Bus (core functionality)
    
      Because the Event Bus cannot handle a reconnect (because of the underlaying SockJS), a new instance of the bus have to be created.
      This stub ensures only one object holding the current active instance of the bus.
    
      The stub supports theses VertX Event Bus APIs:
      - close()
      - login(username, password, replyHandler)
      - send(address, message, handler)
      - publish(address, message)
      - registerHandler(adress, handler)
      - unregisterHandler(address, handler)
      - readyState()
    
      Furthermore, the stub supports theses extra APIs:
      - recconnect()
    */
        this.$get = [
          'angularVertxbusOptions',
          '$timeout',
          function (angularVertxbusOptions, $timeout) {
            var EventBus_, connect, debugEnabled, enabled, eventBus, prefix, reconnectEnabled, sockjsOptions, sockjsReconnectInterval, sockjsStateInterval, stub, url, urlPath, urlServer, _ref;
            _ref = angular.extend({}, DEFAULT_OPTIONS, angularVertxbusOptions), enabled = _ref.enabled, debugEnabled = _ref.debugEnabled, prefix = _ref.prefix, urlServer = _ref.urlServer, urlPath = _ref.urlPath, reconnectEnabled = _ref.reconnectEnabled, sockjsStateInterval = _ref.sockjsStateInterval, sockjsReconnectInterval = _ref.sockjsReconnectInterval, sockjsOptions = _ref.sockjsOptions;
            stub = null;
            EventBus_ = typeof vertx !== 'undefined' && vertx !== null ? vertx.EventBus : void 0;
            if (enabled && EventBus_) {
              url = '' + urlServer + urlPath;
              if (debugEnabled) {
                console.debug('[Vertex EventBus] Enabled: connecting \'' + url + '\'');
              }
              eventBus = null;
              connect = function () {
                eventBus = new EventBus_(url, void 0, sockjsOptions);
                eventBus.onopen = function () {
                  if (debugEnabled) {
                    console.debug('[VertX EventBus] Connected');
                  }
                  if (typeof stub.onopen === 'function') {
                    stub.onopen();
                  }
                };
                eventBus.onclose = function () {
                  if (debugEnabled) {
                    console.debug('[VertX EventBus] Reconnect in ' + sockjsReconnectInterval + 'ms');
                  }
                  if (typeof stub.onclose === 'function') {
                    stub.onclose();
                  }
                  if (reconnectEnabled) {
                    $timeout(connect, sockjsReconnectInterval);
                  }
                };
              };
              connect();
              stub = {
                reconnect: function () {
                  return eventBus.close();
                },
                close: function () {
                  return eventBus.close();
                },
                login: function (username, password, replyHandler) {
                  return eventBus.login(username, password, replyHandler);
                },
                send: function (address, message, replyHandler) {
                  return eventBus.send(address, message, replyHandler);
                },
                publish: function (address, message) {
                  return eventBus.publish(address, message);
                },
                registerHandler: function (address, handler) {
                  eventBus.registerHandler(address, handler);
                  return function () {
                    stub.unregisterHandler(address, handler);
                  };
                },
                unregisterHandler: function (address, handler) {
                  return eventBus.unregisterHandler(address, handler);
                },
                readyState: function () {
                  return eventBus.readyState();
                },
                EventBus: EventBus_
              };
            } else {
              if (debugEnabled) {
                console.debug('[VertX EventBus] Disabled');
              }
            }
            return stub;
          }
        ];
      }
    ]);
    /*
    A service utilitzing an underlaying Vertx Event Bus
  
    The advanced features of this service are:
    - broadcasting the connection changes (vertx-eventbus.system.connected, vertx-eventbus.system.disconnected) on $rootScope
    - registering all handlers again when a reconnect had been required
    - supporting a promise when using send()
    - adding aliases on (registerHandler), un (unregisterHandler) and emit (publish)
  
    Basic usage:
    module.controller('MyController', function('vertxEventService'){
      vertxEventService.on('my.address', function(message) {
        console.log("JSON Message received: ", message)
      });
      vertxEventService.publish('my.other.address', {type: 'foo', data: 'bar'});
    });
  
    Note the additional configuration of the module itself.
  */
    module.service('vertxEventBusService', [
      '$rootScope',
      '$q',
      '$interval',
      '$timeout',
      'vertxEventBus',
      'angularVertxbusOptions',
      function ($rootScope, $q, $interval, $timeout, vertxEventBus, angularVertxbusOptions) {
        var MessageQueueHolder, api, connectionState, debugEnabled, enabled, ensureOpenConnection, messageBuffer, messageQueueHolder, prefix, reconnectEnabled, sockjsOptions, sockjsReconnectInterval, sockjsStateInterval, urlPath, urlServer, util, wrapped, _ref, _ref1;
        MessageQueueHolder = function () {
          function MessageQueueHolder(maxSize) {
            this.maxSize = maxSize != null ? maxSize : 10;
            this.items = [];
          }
          MessageQueueHolder.prototype.push = function (item) {
            this.items.push(item);
            return this.recalibrateBufferSize();
          };
          MessageQueueHolder.prototype.recalibrateBufferSize = function () {
            while (this.items.length > this.maxSize) {
              this.first();
            }
            return this;
          };
          MessageQueueHolder.prototype.last = function () {
            return this.items.pop();
          };
          MessageQueueHolder.prototype.first = function () {
            return this.items.shift(0);
          };
          MessageQueueHolder.prototype.size = function () {
            return this.items.length;
          };
          return MessageQueueHolder;
        }();
        _ref = angular.extend({}, DEFAULT_OPTIONS, angularVertxbusOptions), enabled = _ref.enabled, debugEnabled = _ref.debugEnabled, prefix = _ref.prefix, urlServer = _ref.urlServer, urlPath = _ref.urlPath, reconnectEnabled = _ref.reconnectEnabled, sockjsStateInterval = _ref.sockjsStateInterval, sockjsReconnectInterval = _ref.sockjsReconnectInterval, sockjsOptions = _ref.sockjsOptions, messageBuffer = _ref.messageBuffer;
        connectionState = vertxEventBus != null ? (_ref1 = vertxEventBus.EventBus) != null ? _ref1.CLOSED : void 0 : void 0;
        messageQueueHolder = new MessageQueueHolder(messageBuffer);
        if (enabled && vertxEventBus) {
          vertxEventBus.onopen = function () {
            var address, callback, callbacks, fn, _i, _len, _ref2;
            wrapped.getConnectionState(true);
            $rootScope.$broadcast('' + prefix + 'system.connected');
            _ref2 = wrapped.handlers;
            for (address in _ref2) {
              if (!__hasProp.call(_ref2, address))
                continue;
              callbacks = _ref2[address];
              for (_i = 0, _len = callbacks.length; _i < _len; _i++) {
                callback = callbacks[_i];
                util.registerHandler(address, callback);
              }
            }
            $rootScope.$digest();
            if (messageBuffer && messageQueueHolder.size()) {
              while (messageQueueHolder.size()) {
                fn = messageQueueHolder.first();
                if (typeof fn === 'function') {
                  fn();
                }
              }
              $rootScope.$digest();
            }
          };
          vertxEventBus.onclose = function () {
            wrapped.getConnectionState(true);
            return $rootScope.$broadcast('' + prefix + 'system.disconnected');
          };
        }
        ensureOpenConnection = function (fn) {
          if (wrapped.getConnectionState() === vertxEventBus.EventBus.OPEN) {
            fn();
            return true;
          } else if (messageBuffer) {
            messageQueueHolder.push(fn);
            return true;
          }
          return false;
        };
        util = {
          registerHandler: function (address, callback) {
            if (typeof callback !== 'function') {
              return;
            }
            if (debugEnabled) {
              console.debug('[VertX EventBus] Register handler for ' + address);
            }
            return vertxEventBus.registerHandler(address, function (message, replyTo) {
              callback(message, replyTo);
              return $rootScope.$digest();
            });
          },
          unregisterHandler: function (address, callback) {
            if (typeof callback !== 'function') {
              return;
            }
            if (debugEnabled) {
              console.debug('[VertX EventBus] Unregister handler for ' + address);
            }
            return vertxEventBus.unregisterHandler(address, callback);
          },
          send: function (address, message, expectReply, timeout) {
            var deferred, dispatched;
            if (timeout == null) {
              timeout = 10000;
            }
            if (expectReply) {
              deferred = $q.defer();
            }
            dispatched = ensureOpenConnection(function () {
              vertxEventBus.send(address, message, function (reply) {
                if (deferred) {
                  deferred.resolve(reply);
                }
                if (typeof expectReply === 'function') {
                  return expectReply(reply);
                }
              });
              if (deferred) {
                return $timeout(function () {
                  return deferred.reject();
                }, timeout);
              }
            });
            if (deferred && !dispatched) {
              deferred.reject();
            }
            return deferred != null ? deferred.promise : void 0;
          },
          publish: function (address, message) {
            var dispatched;
            dispatched = ensureOpenConnection(function () {
              return vertxEventBus.publish(address, message);
            });
            return dispatched;
          }
        };
        wrapped = {
          handlers: {},
          registerHandler: function (address, callback) {
            if (!wrapped.handlers[address]) {
              wrapped.handlers[address] = [];
            }
            wrapped.handlers[address].push(callback);
            if (connectionState === vertxEventBus.EventBus.OPEN) {
              util.registerHandler(address, callback);
            }
            return function () {
              wrapped.unregisterHandler(address, callback);
            };
          },
          unregisterHandler: function (address, callback) {
            var index;
            if (wrapped.handlers[address]) {
              index = wrapped.handlers[address].indexOf(callback);
              if (index > -1) {
                wrapped.handlers[address].splice(index, 1);
              }
            }
            if (connectionState === vertxEventBus.EventBus.OPEN) {
              return util.unregisterHandler(address, callback);
            }
          },
          send: function (address, message, expectReply, timeout) {
            if (timeout == null) {
              timeout = 10000;
            }
            return util.send(address, message, expectReply, timeout);
          },
          publish: function (address, message) {
            return util.publish(address, message);
          },
          getConnectionState: function (immediate) {
            if (vertxEventBus != null ? vertxEventBus.EventBus : void 0) {
              if (enabled) {
                if (immediate) {
                  connectionState = vertxEventBus.readyState();
                }
              } else {
                connectionState = vertxEventBus.EventBus.CLOSED;
              }
            } else {
              connectionState = 3;
            }
            return connectionState;
          }
        };
        $interval(function () {
          return wrapped.getConnectionState(true);
        }, sockjsStateInterval);
        api = {
          on: wrapped.registerHandler,
          addListener: wrapped.registerHandler,
          un: wrapped.unregisterHandler,
          removeListener: wrapped.unregisterHandler,
          send: wrapped.send,
          publish: wrapped.publish,
          emit: wrapped.publish,
          readyState: wrapped.getConnectionState,
          isEnabled: function () {
            return enabled;
          },
          getBufferCount: function () {
            return messageQueueHolder.size();
          }
        };
        return api;
      }
    ]);
  }.call(this));
});