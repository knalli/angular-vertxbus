import {moduleName} from './config';

import LiveDelegate from './lib/service/delegate/Live';
import NoopDelegate from './lib/service/delegate/Noop';
import InterfaceService from './lib/service/InterfaceService';

/**
 * @description
 * A service utilizing an underlaying Vertx Event Bus
 *
 * The advanced features of this service are:
 *  - broadcasting the connection changes (vertx-eventbus.system.connected, vertx-eventbus.system.disconnected) on $rootScope
 *  - registering all handlers again when a reconnect had been required
 *  - supporting a promise when using send()
 *  - adding aliases on (registerHandler), un (unregisterHandler) and emit (publish)
 *
 * Basic usage:
 * module.controller('MyController', function('vertxEventService') {
 *   vertxEventService.on('my.address', function(message) {
 *     console.log("JSON Message received: ", message)
 *   });
 *   vertxEventService.publish('my.other.address', {type: 'foo', data: 'bar'});
 * });
 *
 * Note the additional configuration of the module itself.
 */
angular.module(moduleName)
.provider('vertxEventBusService', function () {

  const CONSTANTS = {
    MODULE: 'angular-vertxbus',
    COMPONENT: 'service'
  };

  const DEFAULT_OPTIONS = {
    loginRequired: false
  };

  // options (globally, application-wide)
  var options = angular.extend({}, DEFAULT_OPTIONS);

  this.requireLogin = (value = options.loginRequired) => {
    options.loginRequired = (value === true);
    return this;
  };

  this.$get = ($rootScope, $q, $interval, vertxEventBus, $log) => {
    let instanceOptions = angular.extend({}, vertxEventBus.getOptions(), options);
    if (instanceOptions.enabled) {
      return new InterfaceService(new LiveDelegate($rootScope, $interval, $log, $q, vertxEventBus, CONSTANTS, instanceOptions), CONSTANTS);
    } else {
      return new InterfaceService(new NoopDelegate(), CONSTANTS);
    }
  }; // $get

});
