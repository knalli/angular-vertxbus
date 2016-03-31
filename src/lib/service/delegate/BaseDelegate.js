export default class BaseDelegate {

  observe() {}

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
