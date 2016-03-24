import {moduleName} from '../../config';

export default class Delegator {

  constructor(delegate, $log) {
    this.delegate = delegate;
    this.$log = $log;
    this.handlers = [];
    this.delegate.observe({
      afterEventbusConnected: () => this.afterEventbusConnected()
    });
  }

  afterEventbusConnected() {
    for (let address in this.handlers) {
      let callbacks = this.handlers[address];
      if (callbacks && callbacks.length) {
        for (let {headers, callback} of callbacks) {
          this.delegate.registerHandler(address, headers, callback);
        }
      }
    }
  }

  registerHandler(address, headers, callback) {
    if (angular.isFunction(headers) && !callback) {
      callback = headers;
      headers = undefined;
    }
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
  on(address, headers, callback) {
    if (typeof headers === 'function' && !callback) {
      callback = headers;
      headers = undefined;
    }
    return this.registerHandler(address, headers, callback);
  }
  addListener(address, headers, callback) {
    if (typeof headers === 'function' && !callback) {
      callback = headers;
      headers = undefined;
    }
    return this.registerHandler(address, headers, callback);
  }

  unregisterHandler(address, headers, callback) {
    if (typeof headers === 'function' && !callback) {
      callback = headers;
      headers = undefined;
    }
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
  un(address, headers, callback) {
    if (typeof headers === 'function' && !callback) {
      callback = headers;
      headers = undefined;
    }
    return this.unregisterHandler(address, headers, callback);
  }
  removeListener(address, headers, callback) {
    if (typeof headers === 'function' && !callback) {
      callback = headers;
      headers = undefined;
    }
    return this.unregisterHandler(address, headers, callback);
  }

  send(address, message, options = {}) {

    // FALLBACK: signature change since 2.0
    if (!angular.isObject(options)) {
      this.$log.error(`${moduleName}: Signature of vertxEventBusService.send() has been changed!`);
      return this.send(address, message, {
        timeout: arguments[2] !== undefined ? arguments[2] : 10000,
        expectReply: arguments[3] !== undefined ? arguments[3] : true
      });
    }

    return this.delegate.send(address, message, options.timeout, options.expectReply);
  }

  publish(address, message) {
    return this.delegate.publish(address, message);
  }
  emit(address, message) {
    return this.publish(address, message);
  }

  getConnectionState() {
    return this.delegate.getConnectionState();
  }

  readyState() {
    return this.getConnectionState();
  }

  isEnabled() {
    return this.delegate.isEnabled();
  }

  isConnected() {
    return this.delegate.isConnected();
  }

  login(username, password, timeout) {
    return this.delegate.login(username, password, timeout);
  }

}
