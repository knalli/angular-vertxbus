export default class ConnectionConfigHolder {

  constructor({urlServer, urlPath}) {
    this._urlServer = urlServer;
    this._urlPath = urlPath;
  }

  get urlServer() {
    return this._urlServer;
  }

  get urlPath() {
    return this._urlPath;
  }

}
