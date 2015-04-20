class BaseDelegate {

  isConnectionOpen() {
    return false;
  }

  get validSession() {
    return false;
  }

  get enabled() {
    return false;
  }

  get connected() {
    return false;
  }

  set validSession(validSession) {}

}

export default BaseDelegate;
