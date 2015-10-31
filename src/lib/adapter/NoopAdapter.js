import BaseAdapter from './BaseAdapter';

export default class NoopAdapter extends BaseAdapter {

  constructor(EventBus, $q) {
    super($q);
    // actual EventBus type
    this.EventBus = EventBus;
  }

}
