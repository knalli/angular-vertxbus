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
});
