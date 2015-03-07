import BaseWrapper from './Base';

class EventbusWrapper extends BaseWrapper {

  constructor(EventBus, $timeout, $log, CONSTANTS, {
    enabled,
    debugEnabled,
    prefix,
    urlServer,
    urlPath,
    reconnectEnabled,
    sockjsStateInterval,
    sockjsReconnectInterval,
    sockjsOptions,
    messageBuffer
    }) {
    super();
    // actual EventBus type
    this.EventBus = EventBus;
    this.$timeout = $timeout;
    this.$log = $log;
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
      messageBuffer
    };
    // asap create connection
    this.connect();
  }

  connect() {
    let url = `${this.options.urlServer}${this.options.urlPath}`;
    if (this.options.debugEnabled) {
      this.$log.debug(`[Vert.x EB Stub] Enabled: connecting '${url}'`);
    }
    // Because we have rebuild an EventBus object (because it have to rebuild a SockJS object)
    // we must wrap the object. Therefore, we have to mimic the behavior of onopen and onclose each time.
    this.instance = new this.EventBus(url, undefined, this.options.sockjsOptions);
    this.instance.onopen = () => {
      if (this.options.debugEnabled) {
        this.$log.debug("[Vert.x EB Stub] Connected");
      }
      if (angular.isFunction(this.onopen)) {
        this.onopen();
      }
    };
    this.instance.onclose = () => {
      if (this.options.debugEnabled) {
        this.$log.debug(`[Vert.x EB Stub] Reconnect in ${this.options.sockjsReconnectInterval}ms`);
      }
      if (angular.isFunction(this.onclose)) {
        this.onclose();
      }
      this.instance = undefined;
      if (this.options.reconnectEnabled) {
        this.$timeout((() => this.connect()), this.options.sockjsReconnectInterval);
      }
    };
  }

  reconnect() {
    if (this.instance) {
      return this.instance.close();
    }
  }

  close() {
    if (this.instance) {
      return this.instance.close();
    }
  }

  login(username, password, replyHandler) {
    if (this.instance) {
      return this.instance.login(username, password, replyHandler);
    }
  }

  send(address, message, replyHandler) {
    if (this.instance) {
      return this.instance.send(address, message, replyHandler);
    }
  }

  publish(address, message) {
    if (this.instance) {
      return this.instance.publish(address, message);
    }
  }

  registerHandler(address, handler) {
    if (this.instance) {
      this.instance.registerHandler(address, handler);
      // and return the deregister callback
      let deconstructor = () => {
        this.unregisterHandler(address, handler);
      };
      deconstructor.displayName = `${this.CONSTANTS.MODULE}/${this.CONSTANTS.COMPONENT}: EventBusStub.registerHandler (deconstructor)`;
      return deconstructor;
    }
  }

  unregisterHandler(address, handler) {
    if (this.instance) {
      return this.instance.unregisterHandler(address, handler);
    }
  }

  readyState() {
    if (this.instance) {
      return this.instance.readyState();
    } else {
      return this.EventBus.CLOSED;
    }
  }

  getOptions() {
    // clone options
    return angular.extend({}, this.options);
  }
}

export default EventbusWrapper;
