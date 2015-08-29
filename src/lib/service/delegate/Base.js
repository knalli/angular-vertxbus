export default class BaseDelegate {

  getConnectionState() {
    return 3; // CLOSED
  }

  isConnectionOpen() {
    return false;
  }

  isValidSession() {
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
