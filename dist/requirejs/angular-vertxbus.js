/*! angular-vertxbus - v0.3.0 - 2013-12-15
* http://github.com/knalli/angular-vertxbus
* Copyright (c) 2013 ; Licensed  */
define(['vertxbus'], function() {

/*
  An AngularJS wrapper for projects using the VertX Event Bus

  This module as some options

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


(function() {
  var module,
    __hasProp = {}.hasOwnProperty;

  module = angular.module('knalli.angular-vertxbus', ['ng']).value('enabled', true).value('debugEnabled', false).value('prefix', 'vertx-eventbus.').value('urlServer', "" + location.protocol + "//" + location.hostname + ":" + (location.port || 80)).value('urlPath', '/eventbus').value('reconnectEnabled', true).value('sockjsStateInterval', 10000).value('sockjsReconnectInterval', 10000).value('sockjsOptions', {});

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


  module.factory('vertxEventBus', function($timeout, prefix, urlServer, urlPath, sockjsOptions, enabled, debugEnabled, reconnectEnabled, sockjsReconnectInterval) {
    var EventBus_, connect, eventBus, stub, url;
    stub = null;
    EventBus_ = typeof vertx !== "undefined" && vertx !== null ? vertx.EventBus : void 0;
    if (enabled && EventBus_) {
      url = "" + urlServer + urlPath;
      if (debugEnabled) {
        console.debug("[Vertex EventBus] Enabled: connecting '" + url + "'");
      }
      eventBus = null;
      connect = function() {
        eventBus = new EventBus_(url, void 0, sockjsOptions);
        eventBus.onopen = function() {
          if (debugEnabled) {
            console.debug("[VertX EventBus] Connected");
          }
          if (typeof stub.onopen === 'function') {
            stub.onopen();
          }
        };
        eventBus.onclose = function() {
          if (debugEnabled) {
            console.debug("[VertX EventBus] Reconnect in " + sockjsReconnectInterval + "ms");
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
        reconnect: function() {
          return eventBus.close();
        },
        close: function() {
          return eventBus.close();
        },
        login: function(username, password, replyHandler) {
          return eventBus.login(username, password, replyHandler);
        },
        send: function(address, message, replyHandler) {
          return eventBus.send(address, message, replyHandler);
        },
        publish: function(address, message) {
          return eventBus.publish(address, message);
        },
        registerHandler: function(address, handler) {
          return eventBus.registerHandler(address, handler);
        },
        unregisterHandler: function(address, handler) {
          return eventBus.unregisterHandler(address, handler);
        },
        readyState: function() {
          return eventBus.readyState();
        },
        EventBus: EventBus_
      };
    } else {
      if (debugEnabled) {
        console.debug("[VertX EventBus] Disabled");
      }
    }
    return stub;
  });

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


  module.service('vertxEventBusService', function($rootScope, $q, $interval, $timeout, vertxEventBus, prefix, enabled, sockjsStateInterval) {
    var api, connectionState, util, wrapped, _ref;
    connectionState = vertxEventBus != null ? (_ref = vertxEventBus.EventBus) != null ? _ref.CLOSED : void 0 : void 0;
    if (enabled && vertxEventBus) {
      vertxEventBus.onopen = function() {
        var address, callback, callbacks, _i, _len, _ref1;
        wrapped.getConnectionState(true);
        $rootScope.$broadcast("" + prefix + "system.connected");
        _ref1 = wrapped.handlers;
        for (address in _ref1) {
          if (!__hasProp.call(_ref1, address)) continue;
          callbacks = _ref1[address];
          for (_i = 0, _len = callbacks.length; _i < _len; _i++) {
            callback = callbacks[_i];
            util.registerHandler(address, callback);
          }
        }
        return $rootScope.$digest();
      };
      vertxEventBus.onclose = function() {
        wrapped.getConnectionState(true);
        return $rootScope.$broadcast("" + prefix + "system.disconnected");
      };
    }
    util = {
      registerHandler: function(address, callback) {
        if (typeof callback !== 'function') {
          return;
        }
        if (debugEnabled) {
          console.debug("[VertX EventBus] Register handler for " + address);
        }
        return vertxEventBus.registerHandler(address, function(message, replyTo) {
          callback(message, replyTo);
          return $rootScope.$digest();
        });
      },
      unregisterHandler: function(address, callback) {
        if (typeof callback !== 'function') {
          return;
        }
        if (debugEnabled) {
          console.debug("[VertX EventBus] Unregister handler for " + address);
        }
        return vertxEventBus.unregisterHandler(address, callback);
      },
      send: function(address, message, expectReply, timeout) {
        var deferred;
        if (timeout == null) {
          timeout = 10000;
        }
        if (expectReply) {
          deferred = $q.defer();
        }
        vertxEventBus.send(address, message, function(reply) {
          if (deferred) {
            deferred.resolve(reply);
          }
          if (typeof expectReply === 'function') {
            return expectReply(reply);
          }
        });
        if (deferred) {
          $timeout((function() {
            return deferred.reject();
          }), timeout);
        }
        return deferred != null ? deferred.promise : void 0;
      },
      publish: function(address, message) {
        vertxEventBus.publish(address, message);
        return $q.resolve();
      }
    };
    wrapped = {
      handlers: {},
      registerHandler: function(address, callback) {
        if (!wrapped.handlers[address]) {
          wrapped.handlers[address] = [];
        }
        wrapped.handlers[address].push(callback);
        if (connectionState === vertxEventBus.EventBus.OPEN) {
          return util.registerHandler(address, callback);
        }
      },
      unregisterHandler: function(address, callback) {
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
      send: function(address, message, expectReply, timeout) {
        if (timeout == null) {
          timeout = 10000;
        }
        if (connectionState === vertxEventBus.EventBus.OPEN) {
          return util.send(address, message, expectReply, timeout);
        } else {
          return $q.reject();
        }
      },
      publish: function(address, message) {
        if (connectionState === vertxEventBus.EventBus.OPEN) {
          return util.publish(address, message);
        } else {
          return $q.reject();
        }
      },
      getConnectionState: function(immediate) {
        if (enabled && vertxEventBus) {
          if (immediate) {
            connectionState = vertxEventBus.readyState();
          }
        } else {
          connectionState = vertxEventBus.EventBus.CLOSED;
        }
        return connectionState;
      }
    };
    $interval((function() {
      return wrapped.getConnectionState(true);
    }), sockjsStateInterval);
    api = {
      on: wrapped.registerHandler,
      addListener: wrapped.registerHandler,
      un: wrapped.unregisterHandler,
      removeListener: wrapped.unregisterHandler,
      send: wrapped.send,
      publish: wrapped.publish,
      emit: wrapped.publish,
      readyState: wrapped.getConnectionState,
      isEnabled: function() {
        return enabled;
      }
    };
    return api;
  });

}).call(this);

});