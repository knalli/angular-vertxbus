/* jshint camelcase: false, undef: true, unused: true, browser: true */
/* global module: false, describe: false, it: false, expect: false, beforeEach: false, inject: false, SockJS: false */

var SockJS = require('sockjs-client');
require('../../../src/module.js');

describe('integration of module::vertxEventBusService', function () {

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

  it('should have vertxEventBusService', angular.mock.inject(function (vertxEventBusService) {
    expect(vertxEventBusService).not.to.be(undefined);
  }));

  describe('vertxEventBusService', function () {

    var vertxEventBusService;

    beforeEach(angular.mock.inject(function (_vertxEventBusService_) {
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

    describe('adding two handlers with the same address, different callbacks.', function () {
      it('both handlers should be called - with same address', function (done) {
        var abcCalled, abcCalled2;
        setTimeout(function () {
          var abcHandler = function (message) {
            abcCalled = message;
          }, abcHandler2 = function (message) {
            // use a copy of the data so that we don't change
            // the message sent to other callbacks.
            var copy = angular.copy(message);
            copy = copy + "-2";
            abcCalled2 = copy;
          };
          vertxEventBusService.addListener('abc', abcHandler);
          vertxEventBusService.addListener('abc', abcHandler2);
          // remove again!
          SockJS.currentMockInstance.onmessage({
            data : JSON.stringify({
              address : 'abc',
              body : '1x',
              replyAddress : undefined
            })
          });
          expect(abcCalled).to.be('1x');
          expect(abcCalled2).to.be('1x-2');
          // remove handlers
          vertxEventBusService.removeListener('abc', abcHandler);
          vertxEventBusService.removeListener('abc', abcHandler2);
          done();
        }, 200);
      });
    });

    describe('adding two handlers with the same callback, different addresses.', function () {
      it('handler should be called twice - with two different values - two different addresses', function (done) {
        var singleCallbackValue;

        function FunctionHolder() {
          "use strict";
          return {
            handler : function (message) {
              singleCallbackValue = message;
            }
          };
        }

        setTimeout(function () {
          var funcOne = new FunctionHolder();
          var funcTwo = new FunctionHolder();
          vertxEventBusService.addListener('abc', funcOne.handler);
          vertxEventBusService.addListener('xyz', funcTwo.handler);
          SockJS.currentMockInstance.onmessage({
            data : JSON.stringify({
              address : 'abc',
              body : 'abc',
              replyAddress : undefined
            })
          });
          expect(singleCallbackValue).to.be('abc');
          SockJS.currentMockInstance.onmessage({
            data : JSON.stringify({
              address : 'xyz',
              body : 'xyz',
              replyAddress : undefined
            })
          });
          expect(singleCallbackValue).to.be('xyz');
          // remove handlers
          vertxEventBusService.removeListener('abc', funcOne.handler);
          vertxEventBusService.removeListener('xyz', funcTwo.handler);
          done();
        }, 200);
      });
    });
  });

  describe('vertxEventBusService', function () {

    describe('with disabled message queue (default)', function () {
      var vertxEventBus, vertxEventBusService, result;

      beforeEach(angular.mock.module('knalli.angular-vertxbus', function (vertxEventBusServiceProvider) {
        vertxEventBusServiceProvider.useMessageBuffer(0);
      }));

      beforeEach(angular.mock.inject(function (_vertxEventBus_, _vertxEventBusService_) {
        vertxEventBus = _vertxEventBus_;
        vertxEventBusService = _vertxEventBusService_;
        // Mock bus is closed
        _vertxEventBus_.readyState = function () {
          return _vertxEventBus_.EventBus.CLOSED;
        };
        var sendCalls = 0;
        _vertxEventBus_.send = function (address, message, headers, replyHandler) {
          ++sendCalls;
          result = {
            reply : message
          };
          if (replyHandler) {
            replyHandler(result);
          }
        };
        // extend object
        vertxEventBus.getSendCalls = function () {
          return sendCalls;
        };
      }));

      describe('should not dispatch send', function () {
        it('when eventbus is closed', function (done) {
          setTimeout(function () {
            vertxEventBusService.send('xyz', {data : 1});
            setTimeout(function () {
              expect(result).to.be(undefined);
              expect(vertxEventBusService.delegate.getMessageQueueLength()).to.be(0);
              expect(vertxEventBus.getSendCalls()).to.be(0);
              done();
            }, 1000);
          }, 200);
        });
      });
    });

    describe('with enabled message queue (size 3)', function () {
      var vertxEventBus, vertxEventBusService, result;

      beforeEach(angular.mock.module('knalli.angular-vertxbus', function (vertxEventBusServiceProvider) {
        vertxEventBusServiceProvider.useMessageBuffer(3);
      }));

      beforeEach(angular.mock.inject(function (_vertxEventBus_, _vertxEventBusService_) {
        vertxEventBus = _vertxEventBus_;
        vertxEventBusService = _vertxEventBusService_;
        // Mock bus is closed
        vertxEventBus.readyState = function () {
          return vertxEventBus.EventBus.CLOSED;
        };
        var sendCalls = 0;
        vertxEventBus.send = function (address, message, headers, replyHandler) {
          ++sendCalls;
          result = {
            reply : message
          };
          if (replyHandler) {
            replyHandler(result);
          }
        };
        // extend object
        vertxEventBus.getSendCalls = function () {
          return sendCalls;
        };
      }));

      describe('when eventbus is closed', function () {
        it('should dispatch send as queued', function (done) {
          setTimeout(function () {
            vertxEventBusService.send('xyz', {data : 123});
            setTimeout(function () {
              expect(result).to.be(undefined);
              expect(vertxEventBusService.delegate.getMessageQueueLength()).to.be(1);
              expect(vertxEventBus.getSendCalls()).to.be(0);
              done();
            }, 1000);
          }, 200);
        });

        it('should queue max 3 items', function (done) {
          setTimeout(function () {
            vertxEventBusService.send('xyz', {data : 1});
            vertxEventBusService.send('xyz', {data : 2});
            vertxEventBusService.send('xyz', {data : 3});
            vertxEventBusService.send('xyz', {data : 4});
            setTimeout(function () {
              expect(result).to.be(undefined);
              expect(vertxEventBusService.delegate.getMessageQueueLength()).to.be(3);
              expect(vertxEventBus.getSendCalls()).to.be(0);
              done();
            }, 1000);
          }, 200);
        });
      });

      describe('should replay queued items', function () {
        it('when eventbus is reopened', function (done) {
          setTimeout(function () {
            vertxEventBusService.send('xyz', {data : 0});
            vertxEventBusService.send('xyz', {data : 1});
            vertxEventBusService.send('xyz', {data : 2});
            vertxEventBusService.send('xyz', {data : 3});

            // fake connect
            vertxEventBus.readyState = function () {
              return vertxEventBus.EventBus.OPEN;
            };
            vertxEventBus.onopen();

            setTimeout(function () {
              expect(result).to.eql({reply : {data : 3}});
              expect(vertxEventBusService.delegate.getMessageQueueLength()).to.be(0);
              expect(vertxEventBus.getSendCalls()).to.be(3);
              done();
            }, 1000);
          }, 200);
        });
      });
    });

    describe('when the service is not connected correctly (stalled connection)', function () {
      var $rootScope, vertxEventBus, vertxEventBusService, $timeout;

      beforeEach(angular.mock.module('knalli.angular-vertxbus', function (vertxEventBusServiceProvider) {
        vertxEventBusServiceProvider.useMessageBuffer(0).useDebug(true);
      }));

      beforeEach(angular.mock.inject(function (_$rootScope_, _vertxEventBus_, _vertxEventBusService_, _$timeout_) {
        $rootScope = _$rootScope_;
        $timeout = _$timeout_;
        vertxEventBus = _vertxEventBus_;
        vertxEventBusService = _vertxEventBusService_;
        // Mock bus is opened (said to be)
        _vertxEventBus_.readyState = function () {
          return _vertxEventBus_.EventBus.OPEN;
        };
        _vertxEventBusService_.getConnectionState = function () {
          return true;
        };
        var sendCalls = 0;
        _vertxEventBus_.send = function () {
          // do nothing, let it timeout
        };
        // extend object
        vertxEventBus.getSendCalls = function () {
          return sendCalls;
        };
      }));

      describe('send() should call the error callback', function () {

        var $interval;

        beforeEach(angular.mock.inject(function (_$interval_) {
          $interval = _$interval_; // angular.mock.$interval
        }));

        it('via promise.then()', function (done) {
          var successCalled, errorCalled;
          setTimeout(function () {
            // very short timeout: 10
            vertxEventBusService.send('xyz', {data : 1}, {}, {timeout : 10}).then(function () {
              successCalled = true;
            }, function () {
              errorCalled = true;
            });
            $rootScope.$apply();
            setTimeout(function () {
              $interval.flush(20); // goto T+20
              expect(successCalled).to.be(undefined);
              expect(errorCalled).to.be(true);
              done();
            }, 300);
          }, 200);
        });

        it('via promise.then() without expecting reply', function (done) {
          var successCalled, errorCalled;
          setTimeout(function () {
            // very short timeout: 10
            vertxEventBusService.send('xyz', {data : 1}, {}, {timeout : 10, expectReply : false}).then(function () {
              successCalled = true;
            }, function () {
              errorCalled = true;
            });
            $rootScope.$apply();
            setTimeout(function () {
              $interval.flush(20); // goto T+20
              expect(successCalled).to.be(true);
              expect(errorCalled).to.be(undefined);
              done();
            }, 300);
          }, 200);
        });

        it('via promise.catch()', function (done) {
          var successCalled, errorCalled;
          setTimeout(function () {
            // very short timeout: 10
            vertxEventBusService.send('xyz', {data : 1}, {}, {timeout : 10}).then(function () {
              successCalled = true;
            })['catch'](function () {
              errorCalled = true;
            });
            $rootScope.$apply();
            setTimeout(function () {
              $interval.flush(20); // goto T+20
              expect(successCalled).to.be(undefined);
              expect(errorCalled).to.be(true);
              done();
            }, 300);
          }, 200);
        });

      });

    });

    describe('reconnect', function () {
      var $timeout, vertxEventBus, vertxEventBusService;
      beforeEach(angular.mock.inject(function (_vertxEventBus_, _vertxEventBusService_, _$timeout_) {
        $timeout = _$timeout_;
        vertxEventBus = _vertxEventBus_;
        vertxEventBusService = _vertxEventBusService_;
        // Mock bus is closed
        _vertxEventBus_.readyState = function () {
          return _vertxEventBus_.EventBus.OPEN;
        };
        var sendCalls = 0;
        _vertxEventBus_.send = function () {
          // do nothing, let it timeout
        };
        // extend object
        vertxEventBus.getSendCalls = function () {
          return sendCalls;
        };
      }));
      it('should be a function', function () {
        expect(typeof vertxEventBus.reconnect).to.be('function');
      });
      // Reconnect should be switch the connectivity, onopen() and onclose()
      // must be delegated transparently
      it('should re-add handler after a reconnect', function (done) {
        this.timeout(20000);
        var okHandler = false;
        var myHandler = function () {
          //$log.debug('[TEST] onhandle() called');
          okHandler = true;
        };

        setTimeout(function () {
          vertxEventBusService.addListener('lalelu', myHandler);
          vertxEventBus.reconnect();
          setTimeout(function () {
            setTimeout(function () {
              SockJS.currentMockInstance.onmessage({
                data : JSON.stringify({
                  address : 'lalelu',
                  body : {
                    data : '1x'
                  },
                  replyAddress : undefined
                })
              });
              expect(okHandler).to.be(true);
              done();
            }, 2100);
            $timeout.flush();
          }, 100);
        }, 100);
      });
    });

    describe('after adding and removing a handler via "registerHandler"', function () {

      var vertxEventBusService;

      beforeEach(angular.mock.module('knalli.angular-vertxbus', function (vertxEventBusServiceProvider) {
        vertxEventBusServiceProvider.useMessageBuffer(0);
      }));

      beforeEach(angular.mock.inject(function (_vertxEventBusService_) {
        vertxEventBusService = _vertxEventBusService_;
      }));

      it('should not be called', function (done) {
        var abcCalled, xyzCalled;
        setTimeout(function () {
          var abcHandler = function (message) {
            abcCalled = message;
          }, xyzHandler = function (message) {
            xyzCalled = message;
          };

          var abcFunct = vertxEventBusService.addListener('abc', abcHandler);
          var xyzFunct = vertxEventBusService.addListener('xyz', xyzHandler);
          // remove again!
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

  });

  describe('after removing a registered handler via "unregisterHandler"', function () {

    var vertxEventBusService;

    beforeEach(angular.mock.module('knalli.angular-vertxbus', function (vertxEventBusServiceProvider) {
      vertxEventBusServiceProvider.useMessageBuffer(0);
    }));

    beforeEach(angular.mock.inject(function (_vertxEventBusService_) {
      vertxEventBusService = _vertxEventBusService_;
    }));

    it('should not be called', function (done) {
      var abcCalled, xyzCalled;
      setTimeout(function () {
        var abcHandler = function (message) {
          abcCalled = message;
        }, xyzHandler = function (message) {
          xyzCalled = message;
        };
        vertxEventBusService.addListener('abc', abcHandler);
        vertxEventBusService.addListener('xyz', xyzHandler);
        // remove again!
        vertxEventBusService.removeListener('abc', abcHandler);
        vertxEventBusService.removeListener('xyz', xyzHandler);
        SockJS.currentMockInstance.onmessage({
          data : JSON.stringify({
            address : 'xyz',
            message : {
              data : '1x'
            }
          })
        });
        expect(abcCalled).to.be(undefined);
        expect(xyzCalled).to.be(undefined);
        done();
      }, 200);
    });

  });

  describe('vertxEventBusService (bus online) send()', function () {

    var vertxEventBusService, vertxEventBus, $timeout, $rootScope, $log;

    beforeEach(angular.mock.module('knalli.angular-vertxbus', function (vertxEventBusServiceProvider) {
      vertxEventBusServiceProvider.useMessageBuffer(0).useDebug(true);
    }));

    beforeEach(angular.mock.inject(function (_vertxEventBus_, _vertxEventBusService_, _$timeout_, _$rootScope_, _$log_) {
      vertxEventBus = _vertxEventBus_;
      vertxEventBusService = _vertxEventBusService_;
      $timeout = _$timeout_;
      $rootScope = _$rootScope_;
      $log = _$log_;
      SockJS.currentMockInstance.$log = $log;
    }));

    it('should return a promise which will be resolved (success)', function (done) {
      setTimeout(function () {
        var results = {
          'then' : 0,
          'catch' : 0,
          'finally' : 0
        };
        var promise = vertxEventBusService.send('xyz', {data : 123});
        expect(promise).to.not.be(undefined);
        // looks like a promise?
        expect(typeof promise).to.be('object');
        expect(typeof promise.then).to.be('function');
        expect(typeof promise.catch).to.be('function');
        expect(typeof promise.finally).to.be('function');
        promise.then(function () {
          results.then++;
        });
        promise.catch(function () {
          results.catch++;
        });
        promise.finally(function () {
          results.finally++;
        });
        $rootScope.$apply();
        setTimeout(function () {
          expect(results.then).to.be(1);
          expect(results.catch).to.be(0);
          expect(results.finally).to.be(1);
          done();
        }, 500);
      }, 200);
    });

    it('should return a promise which will be rejected (failure in message)', function (done) {
      setTimeout(function () {
        var results = {
          'then' : 0,
          'catch' : 0,
          'finally' : 0
        };
        var promise = vertxEventBusService.send('xyz', {
          data : 123,
          mockReply: {
            type: 'err',
            failureCode: 4711,
            failureType: 'whatever'
          }
        });
        expect(promise).to.not.be(undefined);
        // looks like a promise?
        expect(typeof promise).to.be('object');
        expect(typeof promise.then).to.be('function');
        expect(typeof promise.catch).to.be('function');
        expect(typeof promise.finally).to.be('function');
        promise.then(function () {
          results.then++;
        });
        promise.catch(function () {
          results.catch++;
        });
        promise.finally(function () {
          results.finally++;
        });
        $rootScope.$apply();
        setTimeout(function () {
          expect(results.then).to.be(0);
          expect(results.catch).to.be(1);
          expect(results.finally).to.be(1);
          done();
        }, 500);
      }, 200);
    });

  });

  describe('vertxEventBusService (bus offline) send()', function () {

    var vertxEventBusService, vertxEventBus, $timeout, $rootScope, $log;

    beforeEach(angular.mock.module('knalli.angular-vertxbus', function (vertxEventBusServiceProvider) {
      vertxEventBusServiceProvider.useMessageBuffer(0).useDebug(true);
    }));

    beforeEach(angular.mock.inject(function (_vertxEventBus_, _vertxEventBusService_, _$timeout_, _$rootScope_, _$log_) {
      vertxEventBus = _vertxEventBus_;
      vertxEventBusService = _vertxEventBusService_;
      $timeout = _$timeout_;
      $rootScope = _$rootScope_;
      $log = _$log_;
      SockJS.currentMockInstance.$log = $log;

      vertxEventBus.readyState = function () {
        return 3;
      };
    }));

    it('should return a promise which will be rejected (fail)', function (done) {
      setTimeout(function () {
        var results = {
          'then' : 0,
          'catch' : 0,
          'finally' : 0
        };
        var promise = vertxEventBusService.send('xyz', {data : 123});
        expect(promise).to.not.be(undefined);
        // looks like a promise?
        expect(typeof promise).to.be('object');
        expect(typeof promise.then).to.be('function');
        expect(typeof promise.catch).to.be('function');
        expect(typeof promise.finally).to.be('function');
        promise.then(function () {
          results.then++;
        });
        promise.catch(function () {
          results.catch++;
        });
        promise.finally(function () {
          results.finally++;
        });
        $rootScope.$apply();
        setTimeout(function () {
          window.console.log(results);
          expect(results.then).to.be(0);
          expect(results.catch).to.be(1);
          expect(results.finally).to.be(1);
          done();
        }, 500);
      }, 200);
    });

  });

});
