import BaseWrapper from './Base';

class NoopWrapper extends BaseWrapper {

  constructor(EventBus) {
    super();
    // actual EventBus type
    this.EventBus = EventBus;
  }

}

export default NoopWrapper;
