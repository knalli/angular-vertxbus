import {moduleName} from './config';

import EventbusWrapper from './lib/wrapper/Eventbus';
import NoopWrapper from './lib/wrapper/Noop';

/**
 * An AngularJS wrapper for projects using the VertX Event Bus
 *
 * @param {boolean} [enabled=true] -  if false, the usage of the Event Bus will
 *                                    be disabled (actually, no vertx.EventBus will be created)
 * @param {boolean} [debugEnabled=false] - if true, some additional debug loggings will be displayed
 * @param {string} [prefix='vertx-eventbus.'] -
 *                                    a prefix used for the global broadcasts
 * @param {string} [urlServer=location.protocol + '//' + location.hostname + ':' + (location.port || 80)] -
 *                                    full URL to the server (change it if the server is not the origin)
 * @param {string} [urlPath='/eventbus'] - path to the event bus
 * @param {boolean} [reconnectEnabled=true] - if false, the disconnect will be recognized but no further actions
 * @param {number} [sockjsStateInterval=10000] - defines the check interval (in ms) of the underlayling SockJS connection
 * @param {number} [sockjsReconnectInterval=10000] - defines the wait time (in ms) for a reconnect after a disconnect has been recognized
 * @param {object} [sockjsOptions={}] - optional SockJS options (new SockJS(url, undefined, options))
 */
angular.module(moduleName)
.provider('vertxEventBus', function () {

  // global constants
  const CONSTANTS = {
    MODULE: 'angular-vertxbus',
    COMPONENT: 'wrapper'
  };

  // default options for this module: TODO doc
  const DEFAULT_OPTIONS = {
    enabled: true,
    debugEnabled: false,
    prefix: 'vertx-eventbus.',
    urlServer: `${location.protocol}//${location.hostname}` + ((() => {if (location.port) { return `:${location.port}`; }})() || ''),
    urlPath: '/eventbus',
    reconnectEnabled: true,
    sockjsStateInterval: 10000,
    sockjsReconnectInterval: 10000,
    sockjsOptions: {},
    messageBuffer: 0
  };

  // options (globally, application-wide)
  var options = angular.extend({}, DEFAULT_OPTIONS);

  this.enable = (value = DEFAULT_OPTIONS.enabled) => {
    options.enabled = (value === true);
    return this;
  };
  this.enable.displayName = `${CONSTANTS.MODULE}/${CONSTANTS.COMPONENT}: provider.enable`;

  this.useDebug = (value = DEFAULT_OPTIONS.debugEnabled) => {
    options.debugEnabled = (value === true);
    return this;
  };
  this.useDebug.displayName = `${CONSTANTS.MODULE}/${CONSTANTS.COMPONENT}: provider.useDebug`;

  this.usePrefix = (value = DEFAULT_OPTIONS.prefix) => {
    options.prefix = value;
    return this;
  };
  this.usePrefix.displayName = `${CONSTANTS.MODULE}/${CONSTANTS.COMPONENT}: provider.usePrefix`;

  this.useUrlServer = (value = DEFAULT_OPTIONS.urlServer) => {
    options.urlServer = value;
    return this;
  };
  this.useUrlServer.displayName = `${CONSTANTS.MODULE}/${CONSTANTS.COMPONENT}: provider.useUrlServer`;

  this.useUrlPath = (value = DEFAULT_OPTIONS.urlPath) => {
    options.urlPath = value;
    return this;
  };
  this.useUrlPath.displayName = `${CONSTANTS.MODULE}/${CONSTANTS.COMPONENT}: provider.useUrlPath`;

  this.useReconnect = (value = DEFAULT_OPTIONS.reconnectEnabled) => {
    options.reconnectEnabled = value;
    return this;
  };
  this.useReconnect.displayName = `${CONSTANTS.MODULE}/${CONSTANTS.COMPONENT}: provider.useReconnect`;

  this.useSockJsStateInterval = (value = DEFAULT_OPTIONS.sockjsStateInterval) => {
    options.sockjsStateInterval = value;
    return this;
  };
  this.useSockJsStateInterval.displayName = `${CONSTANTS.MODULE}/${CONSTANTS.COMPONENT}: provider.useSockJsStateInterval`;

  this.useSockJsReconnectInterval = (value = DEFAULT_OPTIONS.sockjsReconnectInterval) => {
    options.sockjsReconnectInterval = value;
    return this;
  };
  this.useSockJsReconnectInterval.displayName = `${CONSTANTS.MODULE}/${CONSTANTS.COMPONENT}: provider.useSockJsReconnectInterval`;

  this.useSockJsOptions = (value = DEFAULT_OPTIONS.sockjsOptions) => {
    options.sockjsOptions = value;
    return this;
  };
  this.useSockJsOptions.displayName = `${CONSTANTS.MODULE}/${CONSTANTS.COMPONENT}: provider.useSockJsOptions`;

  this.useMessageBuffer = (value = DEFAULT_OPTIONS.messageBuffer) => {
    options.messageBuffer = value;
    return this;
  };
  this.useMessageBuffer.displayName = `${CONSTANTS.MODULE}/${CONSTANTS.COMPONENT}: provider.useMessageBuffer`;

  /**
   *
   * @description
   * A stub representing the Vert.x EventBus (core functionality)
   *
   * Because the Event Bus cannot handle a reconnect (because of the underlaying SockJS), a
   * new instance of the bus have to be created.
   * This stub ensures only one object holding the current active instance of the bus.
   *
   * The stub supports theses Vert.x Event Bus APIs:
   *  - close()
   *  - login(username, password, replyHandler)
   *  - send(address, message, handler)
   *  - publish(address, message)
   *  - registerHandler(adress, handler)
   *  - unregisterHandler(address, handler)
   *  - readyState()
   *
   * Furthermore, the stub supports theses extra APIs:
   *  - reconnect()
   *
   * @param $timeout
   * @param $log
   */
  this.$get = ($timeout, $log) => {

    // Current options (merged defaults with application-wide settings)
    let instanceOptions = angular.extend({}, DEFAULT_OPTIONS, options);

    if (instanceOptions.enabled && vertx && vertx.EventBus) {
      if (instanceOptions.debugEnabled) {
        $log.debug("[Vert.x EB Stub] Enabled");
      }
      return new EventbusWrapper(vertx.EventBus, $timeout, $log, CONSTANTS, instanceOptions);
    } else {
      if (instanceOptions.debugEnabled) {
        $log.debug("[Vert.x EB Stub] Disabled");
      }
      return new NoopWrapper();
    }
  }; // $get

});
