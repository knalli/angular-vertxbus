import {moduleName} from '../../config.js';

class InterfaceService {

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
        for (let callback of callbacks) {
          this.delegate.registerHandler(address, callback);
        }
      }
    }
  }

  registerHandler(address, callback) {
    if (!this.handlers[address]) {
      this.handlers[address] = [];
    }
    this.handlers[address].push(callback);
    var unregisterFn = null;
    if (this.delegate.isConnectionOpen()) {
      this.delegate.registerHandler(address, callback);
      unregisterFn = () => this.delegate.unregisterHandler(address, callback);
    }
    // and return the deregister callback
    var deconstructor = () => {
      if (unregisterFn) {
        unregisterFn();
        unregisterFn = undefined;
      }
      // Remove from internal map
      if (this.handlers[address]) {
        var index = this.handlers[address].indexOf(callback);
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
  on(address, callback) {
    return this.registerHandler(address, callback);
  }
  addListener(address, callback) {
    return this.registerHandler(address, callback);
  }

  unregisterHandler(address, callback) {
    // Remove from internal map
    if (this.handlers[address]) {
      var index = this.handlers[address].indexOf(callback);
      if (index > -1) {
        this.handlers[address].splice(index, 1);
      }
      if (this.handlers[address].length < 1) {
        this.handlers[address] = undefined;
      }
    }
    // Remove from real instance
    if (this.delegate.isConnectionOpen()) {
      this.delegate.unregisterHandler(address, callback);
    }
  }
  un(address, callback) {
    return this.unregisterHandler(address, callback);
  }
  removeListener(address, callback) {
    return this.unregisterHandler(address, callback);
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

export default InterfaceService;
