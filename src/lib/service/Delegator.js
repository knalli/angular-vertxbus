import {moduleName} from '../../config';

export default class Delegator {

  constructor(delegate, $log) {
    this.delegate = delegate;
    this.$log = $log;
    this.handlers = {};
    this.delegate.observe({
      afterEventbusConnected: () => this.afterEventbusConnected()
    });
  }

  afterEventbusConnected() {
    for (let address in this.handlers) {
      if (Object.prototype.hasOwnProperty.call(this.handlers, address)) {
        let callbacks = this.handlers[address];
        if (callbacks && callbacks.length) {
          for (let {headers, callback} of callbacks) {
            this.delegate.registerHandler(address, headers, callback);
          }
        }
      }
    }
  }

  /**
   * @ngdoc method
   * @module knalli.angular-vertxbus
   * @methodOf knalli.angular-vertxbus.vertxEventBusService
   * @name .#registerHandler
   *
   * @description
   * Registers a callback handler for the specified address match.
   *
   * @param {string} address target address
   * @param {object} headers optional headers
   * @param {function} callback handler with params `(message, replyTo)`
   * @returns {function} deconstructor
   */
  registerHandler(address, headers, callback) {
    if (!this.handlers[address]) {
      this.handlers[address] = [];
    }
    var handler = {headers, callback};
    this.handlers[address].push(handler);
    var unregisterFn = null;
    if (this.delegate.isConnectionOpen()) {
      this.delegate.registerHandler(address, headers, callback);
      unregisterFn = () => this.delegate.unregisterHandler(address, headers, callback);
    }
    // and return the deregister callback
    var deconstructor = () => {
      if (unregisterFn) {
        unregisterFn();
        unregisterFn = undefined;
      }
      // Remove from internal map
      if (this.handlers[address]) {
        var index = this.handlers[address].indexOf(handler);
        if (index > -1) {
          this.handlers[address].splice(index, 1);
        }
        if (this.handlers[address].length < 1) {
          this.handlers[address] = undefined;
        }
      }
    };
    deconstructor.displayName = `${moduleName}.service.registerHandler.deconstructor`;
    return deconstructor;
  }

  /**
   * @ngdoc method
   * @module knalli.angular-vertxbus
   * @methodOf knalli.angular-vertxbus.vertxEventBusService
   * @name .#on
   *
   * @description
   * See (using {@link knalli.angular-vertxbus.vertxEventBusService#methods_registerHandler registerHandler()})
   */
  on(address, headers, callback) {
    return this.registerHandler(address, headers, callback);
  }

  /**
   * @ngdoc method
   * @module knalli.angular-vertxbus
   * @methodOf knalli.angular-vertxbus.vertxEventBusService
   * @name .#addListener
   *
   * @description
   * See (using {@link knalli.angular-vertxbus.vertxEventBusService#methods_registerHandler registerHandler()})
   */
  addListener(address, headers, callback) {
    return this.registerHandler(address, headers, callback);
  }

  /**
   * @ngdoc method
   * @module knalli.angular-vertxbus
   * @methodOf knalli.angular-vertxbus.vertxEventBusService
   * @name .#unregisterHandler
   *
   * @description
   * Removes a callback handler for the specified address match.
   *
   * @param {string} address target address
   * @param {object} headers optional headers
   * @param {function} callback handler with params `(message, replyTo)`
   */
  unregisterHandler(address, headers, callback) {
    // Remove from internal map
    if (this.handlers[address]) {
      var index = this.handlers[address].indexOf({headers, callback});
      if (index > -1) {
        this.handlers[address].splice(index, 1);
      }
      if (this.handlers[address].length < 1) {
        this.handlers[address] = undefined;
      }
    }
    // Remove from real instance
    if (this.delegate.isConnectionOpen()) {
      this.delegate.unregisterHandler(address, headers, callback);
    }
  }

  /**
   * @ngdoc method
   * @module knalli.angular-vertxbus
   * @methodOf knalli.angular-vertxbus.vertxEventBusService
   * @name .#un
   *
   * @description
   * See (using {@link knalli.angular-vertxbus.vertxEventBusService#methods_registerHandler unregisterHandler()})
   */
  un(address, headers, callback) {
    return this.unregisterHandler(address, headers, callback);
  }

  /**
   * @ngdoc method
   * @module knalli.angular-vertxbus
   * @methodOf knalli.angular-vertxbus.vertxEventBusService
   * @name .#removeListener
   *
   * @description
   * See (using {@link knalli.angular-vertxbus.vertxEventBusService#methods_registerHandler unregisterHandler()})
   */
  removeListener(address, headers, callback) {
    return this.unregisterHandler(address, headers, callback);
  }

  /**
   * @ngdoc method
   * @module knalli.angular-vertxbus
   * @methodOf knalli.angular-vertxbus.vertxEventBusService
   * @name .#send
   *
   * @description
   * Sends a message to the specified address (using {@link knalli.angular-vertxbus.vertxEventBus#methods_send vertxEventBus.send()}).
   *
   * @param {string} address target address
   * @param {object} message payload message
   * @param {object} headers headers
   * @param {number=} [options.timeout=10000] (in ms) after which the promise will be rejected
   * @param {boolean=} [options.expectReply=true] if false, the promise will be resolved directly and
   *                                       no replyHandler will be created
   * @returns {object} promise
   */
  send(address, message, headers = {}, options = {timeout: 10000, expectReply: true}) {
    return this.delegate.send(address, message, headers, options.timeout, options.expectReply);
  }

  /**
   * @ngdoc method
   * @module knalli.angular-vertxbus
   * @methodOf knalli.angular-vertxbus.vertxEventBusService
   * @name .#publish
   *
   * @description
   * Publishes a message to the specified address (using {@link knalli.angular-vertxbus.vertxEventBus#methods_publish vertxEventBus.publish()}).
   *
   * @param {string} address target address
   * @param {object} message payload message
   * @param {object=} headers headers
   * @returns {object} promise (resolved on either performed or queued)
   */
  publish(address, message, headers = {}) {
    return this.delegate.publish(address, message, headers);
  }

  /**
   * @ngdoc method
   * @module knalli.angular-vertxbus
   * @methodOf knalli.angular-vertxbus.vertxEventBusService
   * @name .#emit
   *
   * @description
   * See (using {@link knalli.angular-vertxbus.vertxEventBusService#methods_publish publish()})
   */
  emit(address, message, headers = {}) {
    return this.publish(address, message, headers);
  }

  /**
   * @ngdoc method
   * @module knalli.angular-vertxbus
   * @methodOf knalli.angular-vertxbus.vertxEventBusService
   * @name .#getConnectionState
   *
   * @description
   * Returns the current connection state. The state is being cached internally.
   *
   * @returns {number} state type of vertx.EventBus
   */
  getConnectionState() {
    return this.delegate.getConnectionState();
  }

  /**
   * @ngdoc method
   * @module knalli.angular-vertxbus
   * @methodOf knalli.angular-vertxbus.vertxEventBusService
   * @name .#readyState
   *
   * @description
   * See (using {@link knalli.angular-vertxbus.vertxEventBusService#methods_getConnectionState getConnectionState()})
   */
  readyState() {
    return this.getConnectionState();
  }



  /**
   * @ngdoc method
   * @module knalli.angular-vertxbus
   * @methodOf knalli.angular-vertxbus.vertxEventBusService
   * @name .#isConnectionOpen
   *
   * @description
   * Returns true if the current connection state ({@link knalli.angular-vertxbus.vertxEventBusService#methods_getConnectionState getConnectionState()}) is `OPEN`.
   *
   * @returns {boolean} connection open state
   */
  isConnectionOpen() {
    return this.isConnectionOpen();
  }

  /**
   * @ngdoc method
   * @module knalli.angular-vertxbus
   * @methodOf knalli.angular-vertxbus.vertxEventBusService
   * @name .#isEnabled
   *
   * @description
   * Returns true if service is being enabled.
   *
   * @returns {boolean} state
   */
  isEnabled() {
    return this.delegate.isEnabled();
  }

  /**
   * @ngdoc method
   * @module knalli.angular-vertxbus
   * @methodOf knalli.angular-vertxbus.vertxEventBusService
   * @name .#isConnected
   *
   * @description
   * Returns true if service (and the eventbus) is being connected.
   *
   * @returns {boolean} state
   */
  isConnected() {
    return this.delegate.isConnected();
  }

  /**
   * @ngdoc method
   * @module knalli.angular-vertxbus
   * @methodOf knalli.angular-vertxbus.vertxEventBusService
   * @name .#isAuthorized
   *
   * @description
   * Returns true if the authorization is valid
   *
   * @returns {boolean} state
   */
  isAuthorized() {
    return this.delegate.isAuthorized();
  }

  /**
   * @ngdoc method
   * @module knalli.angular-vertxbus
   * @methodOf knalli.angular-vertxbus.vertxEventBusService
   * @name .#isValidSession
   *
   * See (using {@link knalli.angular-vertxbus.vertxEventBusService#methods_isAuthorized isAuthorized()})
   */
  isValidSession() {
    return this.delegate.isAuthorized();
  }

  /**
   * @ngdoc method
   * @module knalli.angular-vertxbus
   * @methodOf knalli.angular-vertxbus.vertxEventBusService
   * @name .#getMessageQueueLength
   *
   * @description
   * Returns the current amount of messages in the internal buffer.
   *
   * @returns {number} amount
   */
  getMessageQueueLength() {
    return this.delegate.getMessageQueueLength();
  }

}
