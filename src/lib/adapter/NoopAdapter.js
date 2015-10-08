import BaseAdapter from './BaseAdapter';

export default class NoopAdapter extends BaseAdapter {

  constructor(EventBus) {
    super();
    // actual EventBus type
    this.EventBus = EventBus;
  }

}
