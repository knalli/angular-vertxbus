export default class BaseDelegate {

  observe() {}

  getConnectionState() {
    return 3; // CLOSED
  }

  isConnectionOpen() {
    return false;
  }

  isAuthorized() {
    return false;
  }

  isEnabled() {
    return false;
  }

  isConnected() {
    return false;
  }

  send() {}

  publish() {}

}
