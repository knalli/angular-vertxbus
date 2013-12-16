define(['vertxbus'], function () {
  (function () {
    var module, __hasProp = {}.hasOwnProperty;
    module = angular.module('knalli.angular-vertxbus', ['ng']).value('enabled', true).value('debugEnabled', false).value('prefix', 'vertx-eventbus.').value('urlServer', '' + location.protocol + '//' + location.hostname + ':' + (location.port || 80)).value('urlPath', '/eventbus').value('reconnectEnabled', true).value('sockjsStateInterval', 10000).value('sockjsReconnectInterval', 10000).value('sockjsOptions', {});
    module.factory('vertxEventBus', [
      '$timeout',
      'prefix',
      'urlServer',
      'urlPath',
      'sockjsOptions',
      'enabled',
      'debugEnabled',
      'reconnectEnabled',
      'sockjsReconnectInterval',
      function ($timeout, prefix, urlServer, urlPath, sockjsOptions, enabled, debugEnabled, reconnectEnabled, sockjsReconnectInterval) {
        var EventBus_, connect, eventBus, stub, url;
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
    ]);
    module.service('vertxEventBusService', [
      '$rootScope',
      '$q',
      '$interval',
      '$timeout',
      'vertxEventBus',
      'prefix',
      'enabled',
      'sockjsStateInterval',
      function ($rootScope, $q, $interval, $timeout, vertxEventBus, prefix, enabled, sockjsStateInterval) {
        var api, connectionState, util, wrapped, _ref;
        connectionState = vertxEventBus != null ? (_ref = vertxEventBus.EventBus) != null ? _ref.CLOSED : void 0 : void 0;
        if (enabled && vertxEventBus) {
          vertxEventBus.onopen = function () {
            var address, callback, callbacks, _i, _len, _ref1;
            wrapped.getConnectionState(true);
            $rootScope.$broadcast('' + prefix + 'system.connected');
            _ref1 = wrapped.handlers;
            for (address in _ref1) {
              if (!__hasProp.call(_ref1, address))
                continue;
              callbacks = _ref1[address];
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
            vertxEventBus.publish(address, message);
            return $q.resolve();
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
              return $q.reject();
            }
          },
          publish: function (address, message) {
            if (connectionState === vertxEventBus.EventBus.OPEN) {
              return util.publish(address, message);
            } else {
              return $q.reject();
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
});