/* global angular:false,console:false */
(function () {
  'use strict';

  angular.module('app', ['ng', 'knalli.angular-vertxbus'])
  .config(function(vertxEventBusProvider) {
    vertxEventBusProvider
    .useDebug(true)
    .useUrlServer('http://localhost:8080');
  })
  .run(function ($rootScope) {
    $rootScope.sessionIsValid = false;
    $rootScope.$on('vertx-eventbus.system.login.succeeded', function (event, data) {
      console.log('Vert.X Login succeeded (status)', data);
      $rootScope.sessionIsValid = (data && data.status === 'ok');
    });
    $rootScope.$on('vertx-eventbus.system.login.failed', function (event, data) {
      console.log('Vert.X Login failed (status)', data);
      $rootScope.sessionIsValid = false;
    });
  })
  .controller('MyController', function($scope, vertxEventBusService) {
    $scope.login = function (username, password) {
      vertxEventBusService.login(username, password).then(function (reply) {
        $scope.reply = reply;
      })['catch'](function (reply) {
        $scope.reply = reply;
      });
    };

    var holder = {};
    $scope.timeServiceActive = false;
    $scope.registerTimeService = function () {
      holder.timeServiceDeconstructor = vertxEventBusService.on('what-time-is-it', function (data) {
        $scope.currentDateTime = new Date(data.time);
      });
      $scope.timeServiceActive = true;
    };
    $scope.deregisterTimeService = function () {
      holder.timeServiceDeconstructor();
      holder.timeServiceDeconstructor = undefined;
      $scope.timeServiceActive = false;
    };
  });
}());
