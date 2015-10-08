export default class BaseAdapter {

  constructor() {
  }

  connect() {
  }

  reconnect() {
  }

  close() {
  }

  login() {
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
