import {moduleName} from '../../config.js';

import BaseWrapper from './Base';

/**
 * @ngdoc service
 * @module vertx
 * @name vertx.EventBus
 *
 * @description
 * This is the interface of `vertx.EventBus`. It is not included.
 */

/**
 * @ngdoc method
 * @module vertx
 * @methodOf vertx.EventBus
 * @name .#close
 */

/**
 * @ngdoc method
 * @module vertx
 * @methodOf vertx.EventBus
 * @name .#login
 *
 * @param {string} username credential's username
 * @param {string} password credential's password
 * @param {function=} replyHandler optional callback
 */

/**
 * @ngdoc method
 * @module vertx
 * @methodOf vertx.EventBus
 * @name .#send
 *
 * @param {string} address target address
 * @param {object} message payload message
 * @param {function=} replyHandler optional callback
 */

/**
 * @ngdoc method
 * @module vertx
 * @methodOf vertx.EventBus
 * @name .#publish
 *
 * @param {string} address target address
 * @param {object} message payload message
 */

/**
 * @ngdoc method
 * @module vertx
 * @methodOf vertx.EventBus
 * @name .#registerHandler
 *
 * @param {string} address target address
 * @param {function} handler callback handler
 */

/**
 * @ngdoc method
 * @module vertx
 * @methodOf vertx.EventBus
 * @name .#unregisterHandler
 *
 * @param {string} address target address
 * @param {function} handler callback handler to be removed
 */

/**
 * @ngdoc method
 * @module vertx
 * @methodOf vertx.EventBus
 * @name .#readyState
 *
 * @returns {number} value of vertxbus connection states
 */

export default class EventbusWrapper extends BaseWrapper {

  constructor(EventBus, $timeout, $log, {
    id,
    enabled,
    debugEnabled,
    urlServer,
    urlPath,
    reconnectEnabled,
    sockjsReconnectInterval,
    sockjsOptions
    }) {
    super();
    // actual EventBus type
    this.EventBus = EventBus;
    this.$timeout = $timeout;
    this.$log = $log;
    this.options = {
      id,
      enabled,
      debugEnabled,
      urlServer,
      urlPath,
      reconnectEnabled,
      sockjsReconnectInterval,
      sockjsOptions
    };
    this.disconnectTimeoutEnabled = true;
    // asap create connection
    this.connect();
  }

  connect() {
    let url = `${this.options.urlServer}${this.options.urlPath}`;
    if (this.options.debugEnabled) {
      this.$log.debug(`[Vert.x EB Stub "${this.options.id}"] Enabled: connecting '${url}'`);
    }
    // Because we have rebuild an EventBus object (because it have to rebuild a SockJS object)
    // we must wrap the object. Therefore, we have to mimic the behavior of onopen and onclose each time.
    this.instance = new this.EventBus(url, undefined, this.options.sockjsOptions);
    this.instance.onopen = () => {
      if (this.options.debugEnabled) {
        this.$log.debug(`[Vert.x EB Stub "${this.options.id}"] Connected`);
      }
      if (angular.isFunction(this.onopen)) {
        this.onopen();
      }
    };
    // instance onClose handler
    this.instance.onclose = () => {
      if (this.options.debugEnabled) {
        this.$log.debug(`[Vert.x EB Stub "${this.options.id}"] Reconnect in ${this.options.sockjsReconnectInterval}ms`);
      }
      if (angular.isFunction(this.onclose)) {
        this.onclose();
      }
      this.instance = undefined;

      if (!this.disconnectTimeoutEnabled) {
        // reconnect required asap
        if (this.options.debugEnabled) {
          this.$log.debug(`[Vert.x EB Stub "${this.options.id}"] Reconnect immediately`);
        }
        this.disconnectTimeoutEnabled = true;
        this.connect();
      } else if (this.options.reconnectEnabled) {
        // automatic reconnect after timeout
        if (this.options.debugEnabled) {
          this.$log.debug(`[Vert.x EB Stub "${this.options.id}"] Reconnect in ${this.options.sockjsReconnectInterval}ms`);
        }
        this.$timeout((() => this.connect()), this.options.sockjsReconnectInterval);
      }
    };
  }

  /**
   * @ngdoc method
   * @module knalli.angular-vertxbus
   * @methodOf knalli.angular-vertxbus.vertxEventBus
   * @name .#reconnect
   *
   * @description
   * Reconnects the underlying connection.
   *
   * Unless a connection is open, it will connect using a new one.
   *
   * If a connection is already open, it will close this one and opens a new one. If `immediately` is `true`, the
   * default timeout for reconnect will be skipped.
   *
   * @param {boolean} [immediately=false] optionally enforce a reconnect asap instead of using the timeout
   */
  reconnect(immediately = false) {
    if (this.instance && this.instance.readyState() === this.EventBus.OPEN) {
      if (immediately) {
        this.disconnectTimeoutEnabled = false;
      }
      this.instance.close();
    } else {
      this.connect();
    }
  }

  /**
   * @ngdoc method
   * @module knalli.angular-vertxbus
   * @methodOf knalli.angular-vertxbus.vertxEventBus
   * @name .#close
   *
   * @description
   * Closes the underlying connection.
   *
   * Note: If automatic reconnection is active, a new connection will be established after the {@link knalli.angular-vertxbus.vertxEventBusProvider#methods_useReconnect reconnect timeout}.
   *
   * See also:
   * - {@link vertx.EventBus#methods_close vertx.EventBus.close()}
   */
  close() {
    if (this.instance) {
      this.instance.close();
    }
  }

  /**
   * @ngdoc method
   * @module knalli.angular-vertxbus
   * @methodOf knalli.angular-vertxbus.vertxEventBus
   * @name .#login
   *
   * @description
   * Sends a login request against the vertxbus
   *
   * See also:
   * - {@link vertx.EventBus#methods_login vertx.EventBus.login()}
   *
   * @param {string} username credential's username
   * @param {string} password credential's password
   * @param {function=} replyHandler optional callback
   */
  login(username, password, replyHandler) {
    if (this.instance) {
      if (!this.instance.login) {
        this.$log.error(`[Vert.x EB Stub "${this.options.id}"] Attempted to call vertx.EventBus.login(), but that was not found. Are you using v3 already? Have a look at vertx.EventBusServiceProvider.useLoginInterceptor`);
        replyHandler();
        return;
      }
      this.instance.login(username, password, replyHandler);
    }
  }

  /**
   * @ngdoc method
   * @module knalli.angular-vertxbus
   * @methodOf knalli.angular-vertxbus.vertxEventBus
   * @name .#send
   *
   * @description
   * Sends a message
   *
   * See also:
   * - {@link vertx.EventBus#methods_send vertx.EventBus.send()}
   *
   * @param {string} address target address
   * @param {object} message payload message
   * @param {function=} replyHandler optional callback
   * @param {function=} failureHandler optional callback (since Vert.x 3.0.0)
   */
  send(address, message, replyHandler, failureHandler) {
    if (this.instance) {
      this.instance.send(address, message, replyHandler, failureHandler);
    }
  }

  /**
   * @ngdoc method
   * @module knalli.angular-vertxbus
   * @methodOf knalli.angular-vertxbus.vertxEventBus
   * @name .#publish
   *
   * @description
   * Publishes a message
   *
   * See also:
   * - {@link vertx.EventBus#methods_publish vertx.EventBus.publish()}
   *
   * @param {string} address target address
   * @param {object} message payload message
   */
  publish(address, message) {
    if (this.instance) {
      this.instance.publish(address, message);
    }
  }

  /**
   * @ngdoc method
   * @module knalli.angular-vertxbus
   * @methodOf knalli.angular-vertxbus.vertxEventBus
   * @name .#registerHandler
   *
   * @description
   * Registers a listener
   *
   * See also:
   * - {@link vertx.EventBus#methods_registerHandler vertx.EventBus.registerHandler()}
   *
   * @param {string} address target address
   * @param {function} handler callback handler
   */
  registerHandler(address, handler) {
    if (this.instance) {
      this.instance.registerHandler(address, handler);
      // and return the deregister callback
      let deconstructor = () => {
        this.unregisterHandler(address, handler);
      };
      deconstructor.displayName = `${moduleName}.wrapper.eventbus.registerHandler.deconstructor`;
      return deconstructor;
    }
  }

  /**
   * @ngdoc method
   * @module knalli.angular-vertxbus
   * @methodOf knalli.angular-vertxbus.vertxEventBus
   * @name .#unregisterHandler
   *
   * @description
   * Removes a registered a listener
   *
   * See also:
   * - {@link vertx.EventBus#methods_unregisterHandler vertx.EventBus.unregisterHandler()}
   *
   * @param {string} address target address
   * @param {function} handler callback handler to be removed
   */
  unregisterHandler(address, handler) {
    if (this.instance && this.instance.readyState() === this.EventBus.OPEN) {
      this.instance.unregisterHandler(address, handler);
    }
  }

  /**
   * @ngdoc method
   * @module knalli.angular-vertxbus
   * @methodOf knalli.angular-vertxbus.vertxEventBus
   * @name .#readyState
   *
   * @description
   * Returns the current connection state
   *
   * See also:
   * - {@link vertx.EventBus#methods_readyState vertx.EventBus.readyState()}
   *
   * @returns {number} value of vertxbus connection states
   */
  readyState() {
    if (this.instance) {
      return this.instance.readyState();
    } else {
      return this.EventBus.CLOSED;
    }
  }

  // private
  getOptions() {
    // clone options
    return angular.extend({}, this.options);
  }

}
