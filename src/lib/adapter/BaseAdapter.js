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

  // private
  getDefaultHeaders() {
    return this.defaultHeaders;
  }

  /**
   * @ngdoc method
   * @module knalli.angular-vertxbus
   * @methodOf knalli.angular-vertxbus.vertxEventBus
   * @name .#applyDefaultHeaders
   *
   * @description
   * Stores the given default headers
   *
   * @param {object} headers additional standard headers
   */
  applyDefaultHeaders(headers = {}) {
    this.defaultHeaders = angular.extend({}, headers);
  }

  // private
  getMergedHeaders(headers = {}) {
    return angular.extend({}, this.defaultHeaders, headers);
  }

}
