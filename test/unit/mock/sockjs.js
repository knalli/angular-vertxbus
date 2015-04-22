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
    let log = window.console;
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

  send(message) {
    let json = JSON.parse(message);
    if (json.type !== 'send') {
      return;
    }
    let data = null;
    try {
      data = this._unwrapFromEvent(message);
    } catch (err) {
      return;
    }
    this.log(`[MOCK] SockJS.send(${message})`);
    if (data.address === 'vertx.basicauthmanager.login') {
      let reply = this.nextLoginState
        ? this._buildLoginReplyAsSuccess(data.body.username, data.body.password)
        : this._buildLoginReplyAsFail(data.body.username, data.body.password);
      this.onmessage(this._wrapToEvent(data.replyAddress, reply));
    } else if (data.replyAddress) {
      this.log(`[MOCK] Sending reply to ${data.replyAddress}`);
      this.onmessage(this._wrapToEvent(data.replyAddress, data.mockReply || {data: 'reply'}));
    }
  }

  _unwrapFromEvent(msg) {
    return JSON.parse(msg);
  }

  _wrapToEvent(address, body, replyAddress) {
    return {
      data : JSON.stringify({
        address : address,
        body : body,
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

;

  _buildLoginReplyAsFail(username, password) {
    return {
      status : 'fail'
    };
  }

;
}

SockJS.mockInstances = [];
SockJS.currentMockInstance = null;

global.SockJS = SockJS; // mocks global available SockJS
