import {moduleName} from '../../config.js';

import BaseWrapper from './Base';

class EventbusWrapper extends BaseWrapper {

  constructor(EventBus, $timeout, $log, {
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
    this.disconnectTimeoutEnabled = true;
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
    // instance onClose handler
    this.instance.onclose = () => {
      if (this.options.debugEnabled) {
        this.$log.debug(`[Vert.x EB Stub] Reconnect in ${this.options.sockjsReconnectInterval}ms`);
      }
      if (angular.isFunction(this.onclose)) {
        this.onclose();
      }
      this.instance = undefined;

      if (!this.disconnectTimeoutEnabled) {
        // reconnect required asap
        if (this.options.debugEnabled) {
          this.$log.debug("[Vert.x EB Stub] Reconnect immediately");
        }
        this.disconnectTimeoutEnabled = true;
        this.connect();
      } else if (this.options.reconnectEnabled) {
        // automatical reconnect after timeout
        if (this.options.debugEnabled) {
          this.$log.debug(`[Vert.x EB Stub] Reconnect in ${this.options.sockjsReconnectInterval}ms`);
        }
        this.$timeout((() => this.connect()), this.options.sockjsReconnectInterval);
      }
    };
  }

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
      deconstructor.displayName = `${moduleName}.wrapper.eventbus.registerHandler.deconstructor`;
      return deconstructor;
    }
  }

  unregisterHandler(address, handler) {
    if (this.instance && this.instance.readyState() === this.EventBus.OPEN) {
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
