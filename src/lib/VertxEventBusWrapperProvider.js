import EventBusAdapter from './adapter/EventBusAdapter';
import NoopAdapter from './adapter/NoopAdapter';
import ConnectionConfigHolder from './support/ConnectionConfigHolder';

import EventBus from 'vertx-eventbus';

/**
 * @ngdoc service
 * @module knalli.angular-vertxbus
 * @name knalli.angular-vertxbus.vertxEventBusProvider
 * @description
 * An AngularJS wrapper for projects using the VertX Event Bus
 */

const DEFAULTS = {
  enabled : true,
  debugEnabled : false,
  initialConnectEnabled : true,
  urlServer : `${location.protocol}//${location.hostname}` + ((() => {
    if (location.port) {
      return `:${location.port}`;
    }
  })() || ''),
  urlPath : '/eventbus',
  reconnectEnabled : true,
  sockjsReconnectInterval : 10000,
  sockjsOptions : {}
};

let VertxEventBusWrapperProvider = function () {

  // options (globally, application-wide)
  var options = angular.extend({}, DEFAULTS);

  /**
   * @ngdoc method
   * @module knalli.angular-vertxbus
   * @methodOf knalli.angular-vertxbus.vertxEventBusProvider
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
   * @methodOf knalli.angular-vertxbus.vertxEventBusProvider
   * @name .#disableAutoConnect
   *
   * @description
   * Disables the auto connection feature.
   *
   * This feature will be only available if `enable == true`.
   *
   * @param {boolean} [value=true] auto connect on startup
   * @returns {object} this
   */
  this.disableAutoConnect = () => {
    options.initialConnectEnabled = false;
    return this;
  };

  /**
   * @ngdoc method
   * @module knalli.angular-vertxbus
   * @methodOf knalli.angular-vertxbus.vertxEventBusProvider
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
   * @methodOf knalli.angular-vertxbus.vertxEventBusProvider
   * @name .#useUrlServer
   *
   * @description
   * Overrides the url part "server" for connecting. The default is based on
   * - `location.protocol`
   * - `location.hostname`
   * - `location.port`
   *
   * i.e. `http://domain.tld` or `http://domain.tld:port`
   *
   * @param {boolean} [value=$computed] server to connect (default based on `location.protocol`, `location.hostname` and `location.port`)
   * @returns {object} this
   */
  this.useUrlServer = (value = DEFAULTS.urlServer) => {
    options.urlServer = value;
    return this;
  };

  /**
   * @ngdoc method
   * @module knalli.angular-vertxbus
   * @methodOf knalli.angular-vertxbus.vertxEventBusProvider
   * @name .#useUrlPath
   *
   * @description
   * Overrides the url part "path" for connection.
   *
   * @param {boolean} [value='/eventbus'] path to connect
   * @returns {object} this
   */
  this.useUrlPath = (value = DEFAULTS.urlPath) => {
    options.urlPath = value;
    return this;
  };

  /**
   * @ngdoc method
   * @module knalli.angular-vertxbus
   * @methodOf knalli.angular-vertxbus.vertxEventBusProvider
   * @name .#useReconnect
   *
   * @description
   * Enables or disables the automatic reconnect handling.
   *
   * @param {boolean} [value=true] if a disconnect was being noted, a reconnect will be enforced automatically
   * @returns {object} this
   */
  this.useReconnect = (value = DEFAULTS.reconnectEnabled) => {
    options.reconnectEnabled = value;
    return this;
  };

  /**
   * @ngdoc method
   * @module knalli.angular-vertxbus
   * @methodOf knalli.angular-vertxbus.vertxEventBusProvider
   * @name .#useSockJsReconnectInterval
   *
   * @description
   * Overrides the timeout for reconnecting after a disconnect was found.
   *
   * @param {boolean} [value=10000] time between a disconnect and the next try to reconnect (in ms)
   * @returns {object} this
   */
  this.useSockJsReconnectInterval = (value = DEFAULTS.sockjsReconnectInterval) => {
    options.sockjsReconnectInterval = value;
    return this;
  };

  /**
   * @ngdoc method
   * @module knalli.angular-vertxbus
   * @methodOf knalli.angular-vertxbus.vertxEventBusProvider
   * @name .#useSockJsOptions
   *
   * @description
   * Sets additional params for the `SockJS` instance.
   *
   * Internally, it will be applied (as `options`) like `new SockJS(url, undefined, options)`.
   *
   * @param {boolean} [value={}]  optional params for raw SockJS options
   * @returns {object} this
   */
  this.useSockJsOptions = (value = DEFAULTS.sockjsOptions) => {
    options.sockjsOptions = value;
    return this;
  };

  /**
   * @ngdoc service
   * @module knalli.angular-vertxbus
   * @name knalli.angular-vertxbus.vertxEventBus
   * @description
   * A stub representing the Vert.x EventBus (core functionality)
   *
   * Because the Event Bus cannot handle a reconnect (because of the underlaying SockJS), a
   * new instance of the bus have to be created.
   * This stub ensures only one object holding the current active instance of the bus.
   *
   * The stub supports theses Vert.x Event Bus APIs:
   *  - {@link knalli.angular-vertxbus.vertxEventBus#methods_close close()}
   *  - {@link knalli.angular-vertxbus.vertxEventBus#methods_send send(address, message, handler)}
   *  - {@link knalli.angular-vertxbus.vertxEventBus#methods_publish publish(address, message)}
   *  - {@link knalli.angular-vertxbus.vertxEventBus#methods_registerHandler registerHandler(adress, handler)}
   *  - {@link knalli.angular-vertxbus.vertxEventBus#methods_unregisterHandler unregisterHandler(address, handler)}
   *  - {@link knalli.angular-vertxbus.vertxEventBus#methods_readyState readyState()}
   *
   * Furthermore, the stub supports theses extra APIs:
   *  - {@link knalli.angular-vertxbus.vertxEventBus#methods_reconnect reconnect()}
   *
   * @requires $timeout
   * @requires $log
   */
  /* @ngInject */
  this.$get = ($timeout, $log, $q) => {
    // Current options (merged defaults with application-wide settings)
    let instanceOptions = angular.extend({}, DEFAULTS, options);
    if (instanceOptions.enabled && EventBus) {
      if (instanceOptions.debugEnabled) {
        $log.debug('[Vert.x EB Stub] Enabled');
      }

      // aggregate server connection params
      instanceOptions.connectionConfig = new ConnectionConfigHolder({
        urlServer : instanceOptions.urlServer,
        urlPath : instanceOptions.urlPath
      });
      delete instanceOptions.urlServer;
      delete instanceOptions.urlPath;

      return new EventBusAdapter(EventBus, $timeout, $log, $q, instanceOptions);
    } else {
      if (instanceOptions.debugEnabled) {
        $log.debug('[Vert.x EB Stub] Disabled');
      }
      return new NoopAdapter(EventBus, $q);
    }
  };

};

export default VertxEventBusWrapperProvider;
