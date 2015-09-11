import BaseWrapper from './Base';
import Eventbus from './Eventbus';

export default class MultiProxyWrapper extends BaseWrapper {

  constructor(vertxEventBus, $timeout, $log, optionsList) {
    super();
    // actual EventBus type
    this.EventBus = vertxEventBus;
    this.$timeout = $timeout;
    this.$log = $log;
    // create all instances of dedicated EBs
    if (!optionsList || optionsList.length < 1) {
      throw new Error('Proxy cannot be created without at least one options set');
    }
    this.initializeInstances(optionsList);
  }

  initializeInstances(optionsList) {
    this.instances = optionsList
      .map((options) => {
        return {
          id : options.id,
          connection : new Eventbus(this.EventBus, this.$timeout, this.$log, options)
        };
      });
  }

  // default forward
  connect(...args) {
    return this.get('default').connect(...args);
  }

  // default forward
  reconnect(...args) {
    return this.get('default').reconnect(...args);
  }

  // default forward
  close(...args) {
    return this.get('default').close(...args);
  }

  // default forward
  login(...args) {
    return this.get('default').login(...args);
  }

  // default forward
  send(...args) {
    return this.get('default').send(...args);
  }

  // default forward
  publish(...args) {
    return this.get('default').publish(...args);
  }

  // default forward
  registerHandler(...args) {
    return this.get('default').registerHandler(...args);
  }

  // default forward
  unregisterHandler(...args) {
    return this.get('default').unregisterHandler(...args);
  }

  // default forward
  readyState(...args) {
    return this.get('default').readyState(...args);
  }

  // default forward
  getOptions(...args) {
    return this.get('default').getOptions(...args);
  }

  get(id) {
    if (typeof id === 'number' && this.instances[id] && this.instances[id].connection) {
      return this.instances[id].connection;
    } else {
      for (let item of this.instances) {
        if (id === item.id) {
          return item.connection;
        }
      }
      return null;
    }
  }

}
