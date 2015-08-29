import BaseWrapper from './Base';

export default class NoopWrapper extends BaseWrapper {

  constructor(EventBus) {
    super();
    // actual EventBus type
    this.EventBus = EventBus;
  }

}
