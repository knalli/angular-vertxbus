/* jshint camelcase: false, undef: true, unused: true */
/* global module: false, describe: false, it: false, expect: false, beforeEach: false, inject: false */

describe('knalli.angular-vertxbus', function () {

  beforeEach(module('knalli.angular-vertxbus'));

  it('should have vertxEventBus', function () {
    inject(function (vertxEventBus) {
      expect(vertxEventBus).toBeDefined();
    });
  });

  it('should have vertxEventBusService', function () {
    inject(function (vertxEventBusService) {
      expect(vertxEventBusService).toBeDefined();
    });
  });

  describe('vertxEventBus', function () {

    var vertxEventBus;

    beforeEach(inject(function (_vertxEventBus_) {
      vertxEventBus = _vertxEventBus_;
    }));

    it('should be an object', function () {
      expect(typeof vertxEventBus).toBe('object');
    });

    it('should have a method close()', function () {
      expect(vertxEventBus.close).toBeDefined();
    });

    describe('close()', function () {

      it('should be a function', function () {
        expect(typeof vertxEventBus.close).toBe('function');
      });
    });
  });

  describe('vertxEventBusService', function () {

    var vertxEventBusService;

    beforeEach(inject(function (_vertxEventBusService_) {
      vertxEventBusService = _vertxEventBusService_;
    }));

    it('should be an object', function () {
      expect(typeof vertxEventBusService).toBe('object');
    });

    it('should have a method readyState()', function () {
      expect(vertxEventBusService.readyState).toBeDefined();
    });

    describe('readyState()', function () {

      it('should be a function', function () {
        expect(typeof vertxEventBusService.readyState).toBe('function');
      });
    });
  });
});
