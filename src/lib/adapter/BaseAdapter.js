export default class BaseAdapter {

  constructor($q) {
    this.$q = $q;
  }

  configureConnection() {
  }

  connect() {
    return this.$q.reject();
  }

  reconnect() {
  }

  close() {
  }

  send() {
  }

  publish() {
  }

  registerHandler() {
  }

  unregisterHandler() {
  }

  readyState() {
  }

  getOptions() {
    return {};
  }

  // empty: can be overriden by externals
  onopen() {
  }

  // empty: can be overriden by externals
  onclose() {
  }

}
