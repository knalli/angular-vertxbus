import Queue from './../../helpers/Queue';
import SimpleMap from './../../helpers/SimpleMap';
import BaseDelegate from './Base';

class LiveDelegate extends BaseDelegate {
  constructor($rootScope, $interval, $log, $q, eventBus, CONSTANTS, {
    enabled,
    debugEnabled,
    prefix,
    urlServer,
    urlPath,
    reconnectEnabled,
    sockjsStateInterval,
    sockjsReconnectInterval,
    sockjsOptions,
    messageBuffer,
    loginRequired
    }) {
    super();
    this.$rootScope = $rootScope;
    this.$interval = $interval;
    this.$log = $log;
    this.$q = $q;
    this.eventBus = eventBus;
    this.CONSTANTS = CONSTANTS;
    this.options = {
      enabled,
      debugEnabled,
      prefix,
      urlServer,
      urlPath,
      reconnectEnabled,
      sockjsStateInterval,
      sockjsReconnectInterval,
      sockjsOptions,
      messageBuffer,
      loginRequired
    };
    this.connectionState = this.eventBus.EventBus.CLOSED;
    this.states = {
      connected: false,
      validSession: false
    };
    this.observers = [];
    // internal store of buffered messages
    this.messageQueue = new Queue(this.options.messageBuffer);
    // internal map of callbacks
    this.callbackMap = new SimpleMap();
    // asap
    this.initialize();
  }

  initialize() {
    this.eventBus.onopen = () => this.onEventbusOpen();
    this.eventBus.onclose = () => this.onEventbusClose();

    // Update the current connection state periodically.
    let connectionIntervalCheck = () => this.getConnectionState(true);
    connectionIntervalCheck.displayName = `connectionIntervalCheck`;
    this.$interval((() => connectionIntervalCheck()), this.options.sockjsStateInterval);
  }

  onEventbusOpen() {
    this.getConnectionState(true);
    if (!this.states.connected) {
      this.states.connected = true;
      this.$rootScope.$broadcast(`${this.options.prefix}system.connected`);
    }
    this.afterEventbusConnected();
    this.$rootScope.$digest();
    // consume message queue?
    if (this.options.messageBuffer && this.messageQueue.size()) {
      while (this.messageQueue.size()) {
        let fn = this.messageQueue.first();
        if (angular.isFunction(fn)) {
          fn();
        }
      }
      this.$rootScope.$digest();
    }
  }

  onEventbusClose() {
    this.getConnectionState(true);
    if (this.states.connected) {
      this.states.connected = false;
      this.$rootScope.$broadcast(`${this.options.prefix}system.disconnected`);
    }
  }

  observe(observer) {
    this.observers.push(observer);
  }

  afterEventbusConnected() {
    for (let observerIdx in this.observers) {
      // Explicit not using For Of because of Symbol requirement (not possible on older envs, i.e. PhantomJS)
      let observer = this.observers[observerIdx];
      if (angular.isFunction(observer.afterEventbusConnected)) {
        observer.afterEventbusConnected();
      }
    }
  }

  /**
   * On message callback
   * @callback Eventbus~onMessageCallback
   * @param {object} message
   * @param {string} replyTo
   */

  /**
   * Register a callback handler for the specified address match.
   * @param {string} address
   * @param {Eventbus~onMessageCallback} callback
   * @returns {function=}
   */
  registerHandler(address, callback) {
    if (!angular.isFunction(callback)) {
      return;
    }
    if (this.options.debugEnabled) {
      this.$log.debug(`[Vert.x EB Service] Register handler for ${address}`);
    }
    var callbackWrapper = (message, replyTo) => {
      callback(message, replyTo);
      this.$rootScope.$digest();
    };
    callbackWrapper.displayName = `${this.CONSTANTS.MODULE}/${this.CONSTANTS.COMPONENT}: util.registerHandler (callback wrapper)`;
    this.callbackMap.put(callback, callbackWrapper);
    return this.eventBus.registerHandler(address, callbackWrapper);
  }

  /**
   * Remove a callback handler for the specified address match.
   * @param {string} address
   * @param {Eventbus~onMessageCallback} callback
   */
  unregisterHandler(address, callback) {
    if (!angular.isFunction(callback)) {
      return;
    }
    if (this.options.debugEnabled) {
      this.$log.debug(`[Vert.x EB Service] Unregister handler for ${address}`);
    }
    this.eventBus.unregisterHandler(address, this.callbackMap.get(callback));
    this.callbackMap.remove(callback);
  }
  /**
   * Send a message to the specified address (using EventBus.send).
   * @param {string} address - targeting address in the bus
   * @param {object} message - payload
   * @param {number} [timeout=10000] - timeout (in ms) after which the promise will be rejected
   * @returns {promise}
   */
  send(address, message, timeout = 10000) {
    let deferred = this.$q.defer();
    let next = () => {
      this.eventBus.send(address, message, (reply) => {
        deferred.resolve(reply);
      });
      // Register timeout for promise rejecting
      this.$interval((() => deferred.reject()), timeout, 1);
    };
    next.displayName = `${this.CONSTANTS.MODULE}/${this.CONSTANTS.COMPONENT}: util.send (ensureOpenAuthConnection callback)`;
    if (!this.ensureOpenAuthConnection(next)) {
      deferred.reject();
    }
    return deferred.promise;
  }

  /**
   * Publish a message to the specified address (using EventBus.publish).
   * @param {string} address - targeting address in the bus
   * @param {object} message - payload
   * @returns {boolean} true when explicitly put in queue for sending
   */
  publish(address, message) {
    let next = () => {
      this.eventBus.publish(address, message);
    };
    next.displayName = `${this.CONSTANTS.MODULE}/${this.CONSTANTS.COMPONENT}: util.publish (ensureOpenAuthConnection callback)`;
    return this.ensureOpenAuthConnection(next);
  }

  /**
   * Send a login message
   * @param {string} [options.username] username
   * @param {string} [options.password] password
   * @param {number} [timeout=5000]
   * @returns {promise}
   */
  login(username = this.options.username, password = this.options.password, timeout = 5000) {
    let deferred = this.$q.defer();
    let next = (reply) => {
      if (reply && reply.status === 'ok') {
        this.states.validSession = true;
        deferred.resolve(reply);
        this.$rootScope.$broadcast(`${this.options.prefix}system.login.succeeded`, {status: reply.status});
      } else {
        this.states.validSession = false;
        deferred.reject(reply);
        this.$rootScope.$broadcast(`${this.options.prefix}system.login.failed`, {status: reply.status});
      }
    };
    next.displayName = `${this.CONSTANTS.MODULE}/${this.CONSTANTS.COMPONENT}: util.login (callback)`;
    this.eventBus.login(username, password, next);
    this.$interval((() => deferred.reject()), timeout, 1);
    return deferred.promise;
  }

  ensureOpenConnection(fn) {
    if (this.isConnectionOpen()) {
      fn();
      return true;
    } else if (this.options.messageBuffer) {
      this.messageQueue.push(fn);
      return true;
    }
    return false;
  }

  ensureOpenAuthConnection(fn) {
    if (!this.options.loginRequired) {
      // easy: no login required
      this.ensureOpenConnection(fn);
    } else {
      let wrapFn = () => {
        if (this.states.validSession) {
          fn();
          return true;
        } else {
          // ignore this message
          if (this.options.debugEnabled) {
            this.$log.debug(`[Vert.x EB Service] Message was not sent because login is required`);
          }
          return false;
        }
      };
      wrapFn.displayName = `${this.CONSTANTS.MODULE}/${this.CONSTANTS.COMPONENT}: ensureOpenAuthConnection function wrapper`;
      this.ensureOpenConnection(wrapFn);
    }
  }

  getConnectionState(immediate) {
    if (this.options.enabled) {
      if (immediate) {
        this.connectionState = this.eventBus.readyState();
      }
    } else {
      this.connectionState = this.eventBus.EventBus.CLOSED;
    }
    return this.connectionState;
  }

  isConnectionOpen() {
    return this.getConnectionState() === this.eventBus.EventBus.OPEN;
  }

  isValidSession() {
    return this.states.validSession;
  }

  isConnected() {
    return this.states.connected;
  }

  isEnabled() {
    return this.options.enabled;
  }

  getMessageQueueLength() {
    return this.messageQueue.size();
  }
}

export default LiveDelegate;
