/* global angular:false,console:false */
(function () {
  'use strict';

  angular.module('app', ['ng', 'knalli.angular-vertxbus'])
  .config(function(vertxEventBusProvider, vertxEventBusServiceProvider) {
    vertxEventBusProvider
    .useDebug(true)
    .useUrlServer('http://localhost:8080');
    vertxEventBusServiceProvider
      .useDebug(true)
      .authHandler('myCustomAuthHandler');
  })
  .run(function ($rootScope, vertxEventBus, vertxEventBusService, $interval) {
    $rootScope.sessionIsValid = false;

    $rootScope.moduleStats = {
      wrapper: {},
      service: {}
    };
    $interval(function () {
      try {
        $rootScope.moduleStats.wrapper.readyState = vertxEventBus.readyState();
        $rootScope.moduleStats.service.readyState = vertxEventBusService.readyState();
        $rootScope.moduleStats.service.getConnectionState = vertxEventBusService.getConnectionState();
        $rootScope.moduleStats.service.isEnabled = vertxEventBusService.isEnabled();
        $rootScope.moduleStats.service.isConnected = vertxEventBusService.isConnected();
        $rootScope.moduleStats.service.isAuthorized = vertxEventBusService.isAuthorized();
      } catch (e) {}
    }, 1000);
  })
  .filter('eventBusState', function () {
    var states = ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'];
    return function (value) {
      return states[value] || value;
    };
  })
  .service('myCustomAuthHandler', function (vertxEventBus, $q) {
    var states = {
      enabled: false
    };
    var service = function () {
      console.log('authHandler invoked', states);
      return $q(function (resolve, reject) {
        if (states.enabled) {
          vertxEventBus.applyDefaultHeaders({
            token: 'VALID-123'
          });
          resolve();
        } else {
          reject();
        }
      });
    };
    service.start = function () {
      states.enabled = true;
    };
    service.stop = function () {
      states.enabled = false;
      vertxEventBus.applyDefaultHeaders({});
    };
    return service;
  })
  .controller('MyController', function($scope, vertxEventBus, vertxEventBusService, myCustomAuthHandler) {
    var me = this;
    var holder = {};
    me.timeServiceActive = false;
    me.registerTimeService = function () {
      holder.timeServiceDeconstructor = vertxEventBusService.on('what-time-is-it', function (data) {
        me.currentDateTime = new Date(data.time);
      });
      me.timeServiceActive = true;
    };
    me.deregisterTimeService = function () {
      holder.timeServiceDeconstructor();
      holder.timeServiceDeconstructor = undefined;
      me.timeServiceActive = false;
    };
    me.deregisterTimeService2x = function () {
      holder.timeServiceDeconstructor();
      holder.timeServiceDeconstructor();
      holder.timeServiceDeconstructor = undefined;
      me.timeServiceActive = false;
    };

    me.timeServiceActive = false;
    me.registerTimeService = function () {
      holder.timeServiceDeconstructor = vertxEventBusService.on('what-time-is-it', function (data) {
        me.currentDateTime = new Date(data.time);
      });
      me.timeServiceActive = true;
    };
    me.deregisterTimeService = function () {
      holder.timeServiceDeconstructor();
      holder.timeServiceDeconstructor = undefined;
      me.timeServiceActive = false;
    };
    me.refreshDefaultHeaders = function(token) {
      vertxEventBus.applyDefaultHeaders({
        token: token
      });
    };
    var sendCommand = function (type) {
      vertxEventBusService.send('commands', {type: type})
        .then(function (message) {
          console.log('Command succeeded: ' + message.body.type)
        }, function () {
          console.log('Command failed')
        });
    };
    me.sendPing = function () {
      sendCommand('PING');
    };
    me.sendNonPing = function () {
      sendCommand('INVALID');
    };
    me.enableAuthHandler = function () {
      myCustomAuthHandler.start();
    };
    me.disableAuthHandler = function () {
      myCustomAuthHandler.stop();
    };
  });
}());
