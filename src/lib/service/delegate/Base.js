class BaseDelegate {

  isConnectionOpen() {
    return false;
  }

  get validSession() {
    return false;
  }

  set validSession(validSession) {}

}

export default BaseDelegate;
