class SockJS {

  constructor(url, whitelist, options, mockOptions) {
    this.nextLoginState = true;
    this.url = url;
    this.whitelist = whitelist;
    this.options = options;
    SockJS.mockInstances.push(this);
    SockJS.currentMockInstance = this;
    let fn = () => {
      if (typeof this.onopen === 'function') {
        this.onopen();
      }
    };
    if (mockOptions != null && mockOptions.timeout) {
      window.setTimeout(fn, mockOptions.timeout);
    } else {
      window.setTimeout(fn, 1);
    }
  }

  log(...args) {
    var log = window.console;
    if (SockJS.currentMockInstance && SockJS.currentMockInstance.$log) {
      log = SockJS.currentMockInstance.$log;
    }
    log.debug(...args);
  }

  close(mockOptions) {
    this.log("[MOCK] SockJS.close()");
    let fn = () => {
      if (typeof this.onclose === 'function') {
        this.onclose();
      }
    };
    if (mockOptions && mockOptions.timeout) {
      window.setTimeout(fn, mockOptions.timeout);
    } else {
      fn();
    }
  }

  send(event) {
    let message = this._unwrapFromEvent(event);
    if (message.type !== 'send') {
      return;
    }
    this.log(`[MOCK] SockJS.send(${event})`);
    if (message.replyAddress) {
      this.log(`[MOCK] Sending reply to ${message.replyAddress}`);
      var mockReply = message.body.mockReply || {data: 'reply'};
      var reply = this._wrapToEvent(message.replyAddress, mockReply, undefined, mockReply.type);
      this.onmessage(reply);
    }
  }

  _unwrapFromEvent(event) {
    return JSON.parse(event);
  }

  _wrapToEvent(address, body, replyAddress, type) {
    return {
      data : JSON.stringify({
        type: type,
        address : address,
        message : body,
        replyAddress : replyAddress
      })
    };
  }

  _buildLoginReplyAsSuccess(username, password) {
    this.sessionId = "SESSION" + (Math.round(1000000 * Math.random()));
    return {
      status : 'ok',
      sessionID : this.sessionId
    };
  }

  _buildLoginReplyAsFail(username, password) {
    return {
      status : 'fail'
    };
  }

  onmessage() {
    console.warn('No SockJS.onmessage() defined!');
  }

}

SockJS.mockInstances = [];
SockJS.currentMockInstance = null;

module.exports = SockJS;
