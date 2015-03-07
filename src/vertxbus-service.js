import {moduleName} from './config';

import LiveDelegate from './lib/service/delegate/Live';
import NoopDelegate from './lib/service/delegate/Noop';
import InterfaceService from './lib/service/InterfaceService';

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
