import EventBusDelegate from './service/delegate/EventBusDelegate';
import NoopDelegate from './service/delegate/NoopDelegate';
import Delegator from './service/Delegator';

/**
 * @ngdoc service
 * @module knalli.angular-vertxbus
 * @name knalli.angular-vertxbus.vertxEventBusServiceProvider
 * @description
 * This is the configuration provider for {@link knalli.angular-vertxbus.vertxEventBusService}.
 */

const DEFAULTS = {
  enabled : true,
  debugEnabled : false,
  authRequired : false,
  prefix : 'vertx-eventbus.',
  sockjsStateInterval : 10000,
  messageBuffer : 10000
};

let VertxEventBusServiceProvider = function () {

  // options (globally, application-wide)
  var options = angular.extend({}, DEFAULTS);

  /**
   * @ngdoc method
   * @module knalli.angular-vertxbus
   * @methodOf knalli.angular-vertxbus.vertxEventBusServiceProvider
   * @name .#enable
   *
   * @description
   * Enables or disables the service. This setup is immutable.
   *
   * @param {boolean} [value=true] service is enabled on startup
   * @returns {object} this
   */
  this.enable = (value = DEFAULTS.enabled) => {
    options.enabled = (value === true);
    return this;
  };

  /**
   * @ngdoc method
   * @module knalli.angular-vertxbus
   * @methodOf knalli.angular-vertxbus.vertxEventBusServiceProvider
   * @name .#useDebug
   *
   * @description
   * Enables a verbose mode in which certain events will be logged to `$log`.
   *
   * @param {boolean} [value=false] verbose mode (using `$log`)
   * @returns {object} this
   */
  this.useDebug = (value = DEFAULTS.debugEnabled) => {
    options.debugEnabled = (value === true);
    return this;
  };

  /**
   * @ngdoc method
   * @module knalli.angular-vertxbus
   * @methodOf knalli.angular-vertxbus.vertxEventBusServiceProvider
   * @name .#usePrefix
   *
   * @description
   * Overrides the default prefix which will be used for emitted events.
   *
   * @param {string} [value='vertx-eventbus.'] prefix used in event names
   * @returns {object} this
   */
  this.usePrefix = (value = DEFAULTS.prefix) => {
    options.prefix = value;
    return this;
  };

  /**
   * @ngdoc method
   * @methodOf knalli.angular-vertxbus.vertxEventBusServiceProvider
   * @name .#useSockJsStateInterval
   *
   *
   * @description
   * Overrides the interval of checking the connection is still valid (required for reconnecting automatically).
   *
   * @param {boolean} [value=10000] interval of checking the underlying connection's state (in ms)
   * @returns {object} this
   */
  this.useSockJsStateInterval = (value = DEFAULTS.sockjsStateInterval) => {
    options.sockjsStateInterval = value;
    return this;
  };

  /**
   * @ngdoc method
   * @methodOf knalli.angular-vertxbus.vertxEventBusServiceProvider
   * @name .#useMessageBuffer
   *
   * @description
   * Enables buffering of (sending) messages.
   *
   * The setting defines the total amount of buffered messages (`0` no buffering). A message will be buffered if
   * connection is still in progress, the connection is stale or a login is required/pending.
   *
   * @param {boolean} [value=0] allowed total amount of messages in the buffer
   * @returns {object} this
   */
  this.useMessageBuffer = (value = DEFAULTS.messageBuffer) => {
    options.messageBuffer = value;
    return this;
  };

  /**
   * @ngdoc method
   * @module knalli.angular-vertxbus
   * @methodOf knalli.angular-vertxbus.vertxEventBusServiceProvider
   * @name .#authHandler
   *
   * @description
   * Function or service reference name for function checking the authorization state.
   *
   * The result of the function must be a boolean or promise. The handler can (but is not required) to create authorization on demand.
   * If it is resolved, the authorization is valid.
   * If it is rejected, the authorization is invalid.
   *
   * @param {string|function} value authorization handler (either a function or a service name)
   * @returns {object} promise
   */
  this.authHandler = (value) => {
    options.authHandler = value;
    options.authRequired = !!value;
    return this;
  };

  /**
   * @ngdoc service
   * @module knalli.angular-vertxbus
   * @name knalli.angular-vertxbus.vertxEventBusService
   * @description
   * A service utilizing an underlying Vert.x Event Bus
   *
   * The advanced features of this service are:
   *  - broadcasting the connection changes (vertx-eventbus.system.connected, vertx-eventbus.system.disconnected) on $rootScope
   *  - registering all handlers again when a reconnect had been required
   *  - supporting a promise when using send()
   *  - adding aliases on (registerHandler), un (unregisterHandler) and emit (publish)
   *
   * Basic usage:
   * <pre>
   * module.controller('MyController', function('vertxEventService') {
 *   vertxEventService.on('my.address', function(message) {
 *     console.log("JSON Message received: ", message)
 *   });
 *   vertxEventService.publish('my.other.address', {type: 'foo', data: 'bar'});
 * });
   * </pre>
   *
   * Note the additional {@link knalli.angular-vertxbus.vertxEventBusServiceProvider configuration} of the module itself.
   *
   * @requires knalli.angular-vertxbus.vertxEventBus
   * @requires $rootScope
   * @requires $q
   * @requires $interval
   * @requires $log
   * @requires $injector
   */
  /* @ngInject */
  this.$get = ($rootScope, $q, $interval, vertxEventBus, $log, $injector) => {
    // Current options (merged defaults with application-wide settings)
    let instanceOptions = angular.extend({}, vertxEventBus.getOptions(), options);
    if (instanceOptions.enabled) {
      return new Delegator(
        new EventBusDelegate($rootScope, $interval, $log, $q, $injector, vertxEventBus, instanceOptions),
        $log
      );
    } else {
      return new Delegator(new NoopDelegate());
    }
  };

};

export default VertxEventBusServiceProvider;
