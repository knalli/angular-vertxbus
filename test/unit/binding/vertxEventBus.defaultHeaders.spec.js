/* jshint camelcase: false, undef: true, unused: true, browser: true */
/* global module: false, describe: false, it: false, expect: false, beforeEach: false, inject: false, SockJS: false */

var SockJS = require('sockjs-client');
require('../../../src/module.js');

describe('integration of module::vertxEventBus (defaultHeaders)', function () {

  beforeEach(angular.mock.module('knalli.angular-vertxbus'));

  beforeEach(angular.mock.module('knalli.angular-vertxbus', function ($provide) {
    $provide.value('$log', {
      log : function () {
      },
      debug : function () {
      },
      info : function () {
      },
      warn : function () {
      },
      error : function () {
      }
    });
  }));

  describe('without any defaultHeaders', function () {

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

      // Mock bus is opened (said to be)
      _vertxEventBus_.readyState = function () {
        return _vertxEventBus_.EventBus.OPEN;
      };
    }));

    describe('and no specific headers should be called with effective empty headers', function () {
      describe('on registerHandler()', function () {
        it('and implicit headers', function (done) {
          this.timeout(1000);
          const context = {};
          vertxEventBus.instance.registerHandler = function (address, headers) {
            context.headers = headers;
          };
          setTimeout(function () {
            vertxEventBus.registerHandler('address', function () {
            });
            setTimeout(function () {
              expect(context.headers).to.eql({});
              done();
            }, 200);
          }, 200);
        });
        it('and explicit headers (undefined)', function (done) {
          this.timeout(1000);
          const context = {};
          vertxEventBus.instance.registerHandler = function (address, headers) {
            context.headers = headers;
          };
          setTimeout(function () {
            vertxEventBus.registerHandler('address', undefined, function () {
            });
            setTimeout(function () {
              expect(context.headers).to.eql({});
              done();
            }, 200);
          }, 200);
        });
        it('and explicit headers (defined)', function (done) {
          this.timeout(1000);
          const context = {};
          vertxEventBus.instance.registerHandler = function (address, headers) {
            context.headers = headers;
          };
          setTimeout(function () {
            vertxEventBus.registerHandler('address', {}, function () {
            });
            setTimeout(function () {
              expect(context.headers).to.eql({});
              done();
            }, 200);
          }, 200);
        });
      });
      it('on send()', function (done) {
        this.timeout(1000);
        const context = {};
        vertxEventBus.instance.send = function (address, message, headers) {
          context.headers = headers;
        };
        setTimeout(function () {
          vertxEventBus.send('address', {data : 1});
          setTimeout(function () {
            expect(context.headers).to.eql({});
            done();
          }, 200);
        }, 200);
      });
      it('on publish()', function (done) {
        this.timeout(1000);
        const context = {};
        vertxEventBus.instance.publish = function (address, message, headers) {
          context.headers = headers;
        };
        setTimeout(function () {
          vertxEventBus.publish('address', {data : 1});
          setTimeout(function () {
            expect(context.headers).to.eql({});
            done();
          }, 200);
        }, 200);
      });
    });

    describe('and specified headers should be called with effective headers', function () {
      describe('on registerHandler()', function () {
        it('and explicit headers', function (done) {
          this.timeout(1000);
          const context = {};
          vertxEventBus.instance.registerHandler = function (address, headers) {
            context.headers = headers;
          };
          setTimeout(function () {
            vertxEventBus.registerHandler('address', {x : 1}, function () {
            });
            setTimeout(function () {
              expect(context.headers).to.eql({x : 1});
              done();
            }, 200);
          }, 200);
        });
      });
      it('on send()', function (done) {
        this.timeout(1000);
        const context = {};
        vertxEventBus.instance.send = function (address, message, headers) {
          context.headers = headers;
        };
        setTimeout(function () {
          vertxEventBus.send('address', {data : 1}, {x : 1});
          setTimeout(function () {
            expect(context.headers).to.eql({x : 1});
            done();
          }, 200);
        }, 200);
      });
      it('on publish()', function (done) {
        this.timeout(1000);
        const context = {};
        vertxEventBus.instance.publish = function (address, message, headers) {
          context.headers = headers;
        };
        setTimeout(function () {
          vertxEventBus.publish('address', {data : 1}, {x : 1});
          setTimeout(function () {
            expect(context.headers).to.eql({x : 1});
            done();
          }, 200);
        }, 200);
      });
    });

  });

  describe('with defaultHeaders', function () {

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

      // Mock bus is opened (said to be)
      vertxEventBus.readyState = function () {
        return vertxEventBus.EventBus.OPEN;
      };
      vertxEventBus.applyDefaultHeaders({
        x : 1,
        y : 2
      });
    }));

    describe('and no specific headers should be called with headers', function () {
      describe('on registerHandler()', function () {
        it('and implicit headers', function (done) {
          this.timeout(1000);
          const context = {};
          vertxEventBus.instance.registerHandler = function (address, headers) {
            context.headers = headers;
          };
          setTimeout(function () {
            vertxEventBus.registerHandler('address', function () {
            });
            setTimeout(function () {
              expect(context.headers).to.eql({x : 1, y : 2});
              done();
            }, 200);
          }, 200);
        });
        it('and explicit headers (undefined)', function (done) {
          this.timeout(1000);
          const context = {};
          vertxEventBus.instance.registerHandler = function (address, headers) {
            context.headers = headers;
          };
          setTimeout(function () {
            vertxEventBus.registerHandler('address', undefined, function () {
            });
            setTimeout(function () {
              expect(context.headers).to.eql({x : 1, y : 2});
              done();
            }, 200);
          }, 200);
        });
        it('and explicit headers (defined)', function (done) {
          this.timeout(1000);
          const context = {};
          vertxEventBus.instance.registerHandler = function (address, headers) {
            context.headers = headers;
          };
          setTimeout(function () {
            vertxEventBus.registerHandler('address', {}, function () {
            });
            setTimeout(function () {
              expect(context.headers).to.eql({x : 1, y : 2});
              done();
            }, 200);
          }, 200);
        });
      });
      it('on send()', function (done) {
        this.timeout(1000);
        const context = {};
        vertxEventBus.instance.send = function (address, message, headers) {
          context.headers = headers;
        };
        setTimeout(function () {
          vertxEventBus.send('address', {data : 1});
          setTimeout(function () {
            expect(context.headers).to.eql({x : 1, y : 2});
            done();
          }, 200);
        }, 200);
      });
      it('on publish()', function (done) {
        this.timeout(1000);
        const context = {};
        vertxEventBus.instance.publish = function (address, message, headers) {
          context.headers = headers;
        };
        setTimeout(function () {
          vertxEventBus.publish('address', {data : 1});
          setTimeout(function () {
            expect(context.headers).to.eql({x : 1, y : 2});
            done();
          }, 200);
        }, 200);
      });
    });

    describe('and specified headers should be called with effective headers', function () {
      describe('on registerHandler()', function () {
        it('and explicit headers', function (done) {
          this.timeout(1000);
          const context = {};
          vertxEventBus.instance.registerHandler = function (address, headers) {
            context.headers = headers;
          };
          setTimeout(function () {
            vertxEventBus.registerHandler('address', {x : 3}, function () {
            });
            setTimeout(function () {
              expect(context.headers).to.eql({x : 3, y : 2});
              done();
            }, 200);
          }, 200);
        });
      });
      it('on send()', function (done) {
        this.timeout(1000);
        const context = {};
        vertxEventBus.instance.send = function (address, message, headers) {
          context.headers = headers;
        };
        setTimeout(function () {
          vertxEventBus.send('address', {data : 1}, {x : 3});
          setTimeout(function () {
            expect(context.headers).to.eql({x : 3, y : 2});
            done();
          }, 200);
        }, 200);
      });
      it('on publish()', function (done) {
        this.timeout(1000);
        const context = {};
        vertxEventBus.instance.publish = function (address, message, headers) {
          context.headers = headers;
        };
        setTimeout(function () {
          vertxEventBus.publish('address', {data : 1}, {x : 3});
          setTimeout(function () {
            expect(context.headers).to.eql({x : 3, y : 2});
            done();
          }, 200);
        }, 200);
      });
    });

  });

});
