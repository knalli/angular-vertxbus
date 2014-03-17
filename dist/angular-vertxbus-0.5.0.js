/*! angular-vertxbus - v0.5.0 - 2014-03-17
* http://github.com/knalli/angular-vertxbus
* Copyright (c) 2014 ; Licensed  */
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
    sockjsOptions: {}
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
  module = angular.module('knalli.angular-vertxbus', ['ng']).constant('angularVertxbusOptions', DEFAULT_OPTIONS).provider('vertxEventBus', [
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
      };
      this.useUrlServer = function (value) {
        if (value == null) {
          value = DEFAULT_OPTIONS.urlServer;
        }
        angularVertxbusOptions.urlServer = value;
      };
      this.useUrlPath = function (value) {
        if (value == null) {
          value = DEFAULT_OPTIONS.urlPath;
        }
        angularVertxbusOptions.urlPath = value;
      };
      this.useReconnect = function (value) {
        if (value == null) {
          value = DEFAULT_OPTIONS.reconnectEnabled;
        }
        angularVertxbusOptions.reconnectEnabled = value;
      };
      this.useSockJsStateInterval = function (value) {
        if (value == null) {
          value = DEFAULT_OPTIONS.sockjsStateInterval;
        }
        angularVertxbusOptions.sockjsStateInterval = value;
      };
      this.useSockJsReconnectInterval = function (value) {
        if (value == null) {
          value = DEFAULT_OPTIONS.sockjsReconnectInterval;
        }
        angularVertxbusOptions.sockjsReconnectInterval = value;
      };
      this.useSockJsOptions = function (value) {
        if (value == null) {
          value = DEFAULT_OPTIONS.sockjsOptions;
        }
        angularVertxbusOptions.sockjsOptions = value;
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
                return eventBus.registerHandler(address, handler);
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
      var api, connectionState, debugEnabled, enabled, prefix, reconnectEnabled, sockjsOptions, sockjsReconnectInterval, sockjsStateInterval, urlPath, urlServer, util, wrapped, _ref, _ref1;
      _ref = angular.extend({}, DEFAULT_OPTIONS, angularVertxbusOptions), enabled = _ref.enabled, debugEnabled = _ref.debugEnabled, prefix = _ref.prefix, urlServer = _ref.urlServer, urlPath = _ref.urlPath, reconnectEnabled = _ref.reconnectEnabled, sockjsStateInterval = _ref.sockjsStateInterval, sockjsReconnectInterval = _ref.sockjsReconnectInterval, sockjsOptions = _ref.sockjsOptions;
      connectionState = vertxEventBus != null ? (_ref1 = vertxEventBus.EventBus) != null ? _ref1.CLOSED : void 0 : void 0;
      if (enabled && vertxEventBus) {
        vertxEventBus.onopen = function () {
          var address, callback, callbacks, _i, _len, _ref2;
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
          return $rootScope.$digest();
        };
        vertxEventBus.onclose = function () {
          wrapped.getConnectionState(true);
          return $rootScope.$broadcast('' + prefix + 'system.disconnected');
        };
      }
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
          var deferred;
          if (timeout == null) {
            timeout = 10000;
          }
          if (expectReply) {
            deferred = $q.defer();
          }
          vertxEventBus.send(address, message, function (reply) {
            if (deferred) {
              deferred.resolve(reply);
            }
            if (typeof expectReply === 'function') {
              return expectReply(reply);
            }
          });
          if (deferred) {
            $timeout(function () {
              return deferred.reject();
            }, timeout);
          }
          return deferred != null ? deferred.promise : void 0;
        },
        publish: function (address, message) {
          return vertxEventBus.publish(address, message);
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
            return util.registerHandler(address, callback);
          }
        },
        unregisterHandler: function (address, callback) {
          var index;
          if (wrapped.handlers[address] && callback(wrapped.handlers[address])) {
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
          if (connectionState === vertxEventBus.EventBus.OPEN) {
            return util.send(address, message, expectReply, timeout);
          } else {
            return $q.reject('unknown');
          }
        },
        publish: function (address, message) {
          if (connectionState === vertxEventBus.EventBus.OPEN) {
            return util.publish(address, message);
          }
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
        }
      };
      return api;
    }
  ]);
}.call(this));