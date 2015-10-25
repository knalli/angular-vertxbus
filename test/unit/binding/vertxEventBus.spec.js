/* jshint camelcase: false, undef: true, unused: true, browser: true */
/* global module: false, describe: false, it: false, expect: false, beforeEach: false, inject: false, SockJS: false */

describe('integration of module::vertxEventBus', function () {

  beforeEach(module('knalli.angular-vertxbus'));

  beforeEach(module('knalli.angular-vertxbus', function ($provide) {
    $provide.value('$log', window.console);
  }));

  it('should have vertxEventBus', function () {
    inject(function (vertxEventBus) {
      expect(vertxEventBus).not.to.be(undefined);
    });
  });

  describe('vertxEventBus (w/ reconnect)', function () {

    var vertxEventBus, $timeout, $rootScope, $log;

    beforeEach(module('knalli.angular-vertxbus', function (vertxEventBusProvider) {
      // Override (improve test running time)
      vertxEventBusProvider.useDebug(true).useSockJsReconnectInterval(2000);
    }));

    beforeEach(inject(function (_vertxEventBus_, _$timeout_, _$rootScope_, _$log_) {
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
          var abcHandler = function (message) {
            abcCalled = message;
          }, xyzHandler = function (message) {
            xyzCalled = message;
          };
          vertxEventBus.registerHandler('abc', abcHandler);
          vertxEventBus.registerHandler('xyz', xyzHandler);
          SockJS.currentMockInstance.onmessage({
            data : JSON.stringify({
              address : 'xyz',
              body : {
                data : '1x'
              },
              replyAddress : undefined
            })
          });
          expect(abcCalled).to.be(undefined);
          expect(xyzCalled).to.eql({data : '1x'});
          done();
        }, 200);
      });
    });

    describe('after adding and removing a handler via "registerHandler"', function () {
      it('should be not called', function (done) {
        var abcCalled, xyzCalled;
        setTimeout(function () {
          var abcHandler = function (message) {
            abcCalled = message;
          }, xyzHandler = function (message) {
            xyzCalled = message;
          };
          var abcFunct = vertxEventBus.registerHandler('abc', abcHandler);
          var xyzFunct = vertxEventBus.registerHandler('xyz', xyzHandler);
          abcFunct();
          xyzFunct();
          SockJS.currentMockInstance.onmessage({
            data : JSON.stringify({
              address : 'xyz',
              body : {
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
          var abcHandler = function (message) {
            abcCalled = message;
          }, xyzHandler = function (message) {
            xyzCalled = message;
          };
          vertxEventBus.registerHandler('abc', abcHandler);
          vertxEventBus.registerHandler('xyz', xyzHandler);
          // remove again!
          vertxEventBus.unregisterHandler('abc', abcHandler);
          vertxEventBus.unregisterHandler('xyz', xyzHandler);
          SockJS.currentMockInstance.onmessage({
            data : JSON.stringify({
              address : 'xyz',
              body : {
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

    beforeEach(module('knalli.angular-vertxbus', function (vertxEventBusProvider) {
      // Override (improve test running time)
      vertxEventBusProvider.useDebug(true).useSockJsReconnectInterval(2000).useReconnect(false);
    }));

    beforeEach(inject(function (_vertxEventBus_, _$timeout_, _$rootScope_, _$log_) {
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

    beforeEach(module('knalli.angular-vertxbus', function (vertxEventBusProvider) {
      // Override (improve test running time)
      vertxEventBusProvider
        .useDebug(true)
        .useSockJsReconnectInterval(2000)
        .useReconnect(false)
        .disableAutoConnect();
    }));

    beforeEach(inject(function (_vertxEventBus_, _$timeout_, _$rootScope_, _$log_) {
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
        vertxEventBus.connect();
        setTimeout(function () {
          $log.debug('check..');
          expect(SockJS.currentMockInstance.url).to.be('http://localhost:1234/eventbus1');
          expect(onopenCount).to.be(1);
          expect(oncloseCount).to.be(0);
          done();
        }, 1200);
      }, 200);
    });

  });

});
