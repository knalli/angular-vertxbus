/* jshint camelcase: false, undef: true, unused: true, browser: true */
/* global console: false, angular: false, module: false, describe: false, it: false, expect: false, beforeEach: false, inject: false */

describe('knalli.angular-vertxbus', function () {

  beforeEach(module('knalli.angular-vertxbus'));

  it('should have vertxEventBus', function () {
    inject(function (vertxEventBus) {
      expect(vertxEventBus).not.to.be(undefined);
    });
  });

  it('should have vertxEventBusService', function () {
    inject(function (vertxEventBusService) {
      expect(vertxEventBusService).not.to.be(undefined);
    });
  });


  describe('vertxEventBus', function () {

    var vertxEventBus, $timeout, $rootScope;

    beforeEach(function () {
      // Override (improve test running time)
      angular.module('knalli.angular-vertxbus').value('sockjsReconnectInterval', 2000).value('debugEnabled', true);
    });

    beforeEach(inject(function (_vertxEventBus_, _$timeout_, _$rootScope_) {
      vertxEventBus = _vertxEventBus_;
      $timeout = _$timeout_;
      $rootScope = _$rootScope_;
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
            console.debug('[TEST] onclose() called');
            okClose = true;
          };
          vertxEventBus.onopen = function () {
            console.debug('[TEST] onopen() called');
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

  });


  describe('vertxEventBusService', function () {

    var vertxEventBusService;

    beforeEach(inject(function (_vertxEventBusService_) {
      vertxEventBusService = _vertxEventBusService_;
    }));

    it('should be an object', function () {
      expect(typeof vertxEventBusService).to.be('object');
    });

    it('should have a method readyState()', function () {
      expect(vertxEventBusService.readyState).not.to.be(undefined);
    });

    describe('readyState()', function () {
      it('should be a function', function () {
        expect(typeof vertxEventBusService.readyState).to.be('function');
      });
    });

  });

});
