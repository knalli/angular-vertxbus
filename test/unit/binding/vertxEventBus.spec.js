/* jshint camelcase: false, undef: true, unused: true, browser: true */
/* global module: false, describe: false, it: false, expect: false, beforeEach: false, inject: false, SockJS: false */

var SockJS = require('sockjs-client');
require('../../../src/module.js');

describe('integration of module::vertxEventBus', function () {

  beforeEach(angular.mock.module('knalli.angular-vertxbus'));

  beforeEach(angular.mock.module('knalli.angular-vertxbus', function ($provide) {
    $provide.value('$log', {
      log: function () {},
      debug: function () {},
      info: function () {},
      warn: function () {},
      error: function () {}
    });
  }));

  it('should have vertxEventBus', angular.mock.inject(function (vertxEventBus) {
    expect(vertxEventBus).not.to.be(undefined);
  }));

  describe('vertxEventBus (w/ reconnect)', function () {

    var vertxEventBus, $timeout, $rootScope, $log;

    beforeEach(angular.mock.module('knalli.angular-vertxbus', function (vertxEventBusProvider) {
      // Override (improve test running time)
      vertxEventBusProvider.useDebug(true).useSockJsReconnectInterval(2000);
    }));

    beforeEach(angular.mock.inject(function (_vertxEventBus_, _$timeout_, _$rootScope_, _$log_) {
      vertxEventBus = _vertxEventBus_;
      $timeout = _$timeout_;
      $rootScope = _$rootScope_;
      $log = _$log_;
      SockJS.currentMockInstance.$log = $log;
    }));

    it('should be an object', function () {
      expect(typeof vertxEventBus).to.be('object');
    });

    it('should have a method close()', function () {
      expect(vertxEventBus.close).not.to.be(undefined);
    });

    describe('constructor()', function () {
      // Delegating onopen transparently
      it('should call the onopen function', function (done) {
        var ok = false;
        vertxEventBus.onopen = function () {
          ok = true;
        };
        setTimeout(function () {
          setTimeout(function () {
            expect(ok).to.be(true);
            done();
          }, 1000);
        }, 200);
      });
    });

    describe('close()', function () {
      it('should be a function', function () {
        expect(typeof vertxEventBus.close).to.be('function');
      });
      // Delegating onclose transparently
      it('should call the onclose function', function (done) {
        var ok = false;
        vertxEventBus.onclose = function () {
          ok = true;
        };
        setTimeout(function () {
          vertxEventBus.close();
          setTimeout(function () {
            expect(ok).to.be(true);
            done();
          }, 1000);
        }, 200);
      });
    });

    describe('reconnect()', function () {
      it('should be a function', function () {
        expect(typeof vertxEventBus.reconnect).to.be('function');
      });
      // Reconnect should be switch the connectivity, onopen() and onclose()
      // must be delegated transparently
      it('should call onclose and onopen functions', function (done) {
        this.timeout(20000);
        var okClose = false, okOpen = false;
        setTimeout(function () {
          vertxEventBus.onclose = function () {
            $log.debug('[TEST] onclose() called');
            okClose = true;
          };
          vertxEventBus.onopen = function () {
            $log.debug('[TEST] onopen() called');
            okOpen = true;
          };
          vertxEventBus.reconnect();
          setTimeout(function () {
            expect(okClose).to.be(true);
            // Reconnect should be still false..
            expect(okOpen).to.be(false);
            setTimeout(function () {
              expect(okOpen).to.be(true);
              done();
            }, 2100);
            $timeout.flush();
          }, 100);
        }, 100);
      });
    });

    describe('reconnect(true)', function () {
      it('should call the onclose and onopen function if previously connected', function (done) {
        this.timeout(20000);
        var onopenCount = 0;
        vertxEventBus.onopen = function () {
          onopenCount++;
        };
        var oncloseCount = 0;
        vertxEventBus.onclose = function () {
          oncloseCount++;
        };
        setTimeout(function () {
          expect(onopenCount, 'onopenCount').to.be(1);
          vertxEventBus.reconnect(true);
          setTimeout(function () {
            expect(oncloseCount).to.be(1);
            expect(onopenCount).to.be(2);
            done();
          }, 1200);
        }, 200);
      });
    });

    describe('after adding a handler via "registerHandler"', function () {
      it('should be called', function (done) {
        var abcCalled, xyzCalled;
        setTimeout(function () {
          var abcHandler = function (err, message) {
            abcCalled = message.message.data;
          }, xyzHandler = function (err, message) {
            xyzCalled = message.message.data;
          };
          vertxEventBus.registerHandler('abc', abcHandler);
          vertxEventBus.registerHandler('xyz', xyzHandler);
          SockJS.currentMockInstance.onmessage({
            data : JSON.stringify({
              address : 'xyz',
              message : {
                data : '1x'
              },
              replyAddress : undefined
            })
          });
          expect(abcCalled).to.be(undefined);
          expect(xyzCalled).to.be('1x');
          done();
        }, 200);
      });
      it('should be called as error', function (done) {
        var abcCalled, xyzCalled;
        setTimeout(function () {
          var abcHandler = function (err, message) {
            abcCalled = message.message.data;
          }, xyzHandler = function (err) {
            xyzCalled = err.message.data;
          };
          vertxEventBus.registerHandler('abc', abcHandler);
          vertxEventBus.registerHandler('xyz', xyzHandler);
          SockJS.currentMockInstance.onmessage({
            data : JSON.stringify({
              address : 'xyz',
              type: 'err',
              failureCode: 4711,
              failureType: 'whatever',
              message : {
                data : '1x'
              }
            })
          });
          expect(abcCalled).to.be(undefined);
          expect(xyzCalled).to.be('1x');
          done();
        }, 200);
      });
    });

    describe('after adding and removing a handler via "registerHandler"', function () {
      it('should be not called', function (done) {
        var abcCalled, xyzCalled;
        setTimeout(function () {
          var abcHandler = function (err, message) {
            abcCalled = message.data;
          }, xyzHandler = function (err, message) {
            xyzCalled = message.data;
          };
          var abcFunct = vertxEventBus.registerHandler('abc', abcHandler);
          var xyzFunct = vertxEventBus.registerHandler('xyz', xyzHandler);
          abcFunct();
          xyzFunct();
          SockJS.currentMockInstance.onmessage({
            data : JSON.stringify({
              address : 'xyz',
              message : {
                data : '1x'
              },
              replyAddress : undefined
            })
          });
          expect(abcCalled).to.be(undefined);
          expect(xyzCalled).to.be(undefined);
          done();
        }, 200);
      });
    });

    describe('after removing a registered handler via "unregisterHandler"', function () {
      it('should not be called', function (done) {
        var abcCalled, xyzCalled;
        setTimeout(function () {
          var abcHandler = function (err, message) {
            abcCalled = message.data;
          }, xyzHandler = function (err, message) {
            xyzCalled = message.data;
          };
          vertxEventBus.registerHandler('abc', abcHandler);
          vertxEventBus.registerHandler('xyz', xyzHandler);
          // remove again!
          vertxEventBus.unregisterHandler('abc', abcHandler);
          vertxEventBus.unregisterHandler('xyz', xyzHandler);
          SockJS.currentMockInstance.onmessage({
            data : JSON.stringify({
              address : 'xyz',
              message : {
                data : '1x'
              },
              replyAddress : undefined
            })
          });
          expect(abcCalled).to.be(undefined);
          expect(xyzCalled).to.be(undefined);
          done();
        }, 200);
      });
    });

  });

  describe('vertxEventBus (w/o reconnect)', function () {

    var vertxEventBus, $timeout, $rootScope, $log;

    beforeEach(angular.mock.module('knalli.angular-vertxbus', function (vertxEventBusProvider) {
      // Override (improve test running time)
      vertxEventBusProvider.useDebug(true).useSockJsReconnectInterval(2000).useReconnect(false);
    }));

    beforeEach(angular.mock.inject(function (_vertxEventBus_, _$timeout_, _$rootScope_, _$log_) {
      vertxEventBus = _vertxEventBus_;
      $timeout = _$timeout_;
      $rootScope = _$rootScope_;
      $log = _$log_;
      SockJS.currentMockInstance.$log = $log;
    }));

    it('should call the onopen function if not previously connected', function (done) {
      this.timeout(20000);
      var onopenCount = 0;
      vertxEventBus.onopen = function () {
        $log.debug('onopen');
        onopenCount++;
      };
      var oncloseCount = 0;
      vertxEventBus.onclose = function () {
        $log.debug('onclose');
        oncloseCount++;
      };
      setTimeout(function () {
        expect(onopenCount).to.be(1);
        $log.debug('reconnecting..');
        vertxEventBus.close();
        vertxEventBus.reconnect(true);
        setTimeout(function () {
          $log.debug('check..');
          expect(oncloseCount).to.be(1);
          expect(onopenCount).to.be(2);
          done();
        }, 1200);
      }, 200);
    });

  });

  describe('vertxEventBus (w/o autoconnect)', function () {

    var vertxEventBus, $timeout, $rootScope, $log;

    beforeEach(angular.mock.module('knalli.angular-vertxbus', function (vertxEventBusProvider) {
      // Override (improve test running time)
      vertxEventBusProvider
        .useDebug(true)
        .useSockJsReconnectInterval(2000)
        .useReconnect(false)
        .disableAutoConnect();
    }));

    beforeEach(angular.mock.inject(function (_vertxEventBus_, _$timeout_, _$rootScope_, _$log_) {
      vertxEventBus = _vertxEventBus_;
      $timeout = _$timeout_;
      $rootScope = _$rootScope_;
      $log = _$log_;
      SockJS.currentMockInstance.$log = $log;
    }));

    it('should not fail calling close() on non existing connection', function (done) {
      this.timeout(20000);
      setTimeout(function () {
        vertxEventBus.close();
        setTimeout(done, 1200);
      }, 200);
    });

    it('should not fail calling reconnect() on non existing connection', function (done) {
      this.timeout(20000);
      setTimeout(function () {
        vertxEventBus.reconnect(true);
        setTimeout(done, 1200);
      }, 200);
    });

    it('should not call the onopen function because no automatic connect', function (done) {
      this.timeout(20000);
      var onopenCount = 0;
      vertxEventBus.onopen = function () {
        $log.debug('onopen');
        onopenCount++;
      };
      var oncloseCount = 0;
      vertxEventBus.onclose = function () {
        $log.debug('onclose');
        oncloseCount++;
      };
      setTimeout(function () {
        expect(onopenCount).to.be(0); // should be not called!
        setTimeout(done, 1200);
      }, 200);
    });

    it('should not call the onopen function because no automatic connect', function (done) {
      this.timeout(20000);
      var onopenCount = 0;
      vertxEventBus.onopen = function () {
        $log.debug('onopen');
        onopenCount++;
      };
      var oncloseCount = 0;
      vertxEventBus.onclose = function () {
        $log.debug('onclose');
        oncloseCount++;
      };
      setTimeout(function () {
        expect(onopenCount).to.be(0); // should be not called!
        $log.debug('apply connection config..');
        vertxEventBus.configureConnection('http://localhost:1234', '/eventbus1');
        var connectPromise = vertxEventBus.connect();
        expect(connectPromise).not.to.be(undefined);
        var connectPromiseResult = false;
        connectPromise.then(() => {
          connectPromiseResult = true
        });
        setTimeout(function () {
          $rootScope.$digest(); // for $q
          $log.debug('check..');
          expect(SockJS.currentMockInstance.url).to.be('http://localhost:1234/eventbus1');
          expect(onopenCount).to.be(1);
          expect(oncloseCount).to.be(0);
          expect(connectPromiseResult ).to.be(true);
          done();
        }, 1200);
      }, 200);
    });

  });

});
