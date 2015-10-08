import SimpleMap from '../../../../src/lib/support/SimpleMap';

describe('lib.helpers.SimpleMap', () => {

  describe('get()', () => {

    it('should return undefined for unknown keys (empty map)', () => {
      let map = new SimpleMap;
      expect(map.get('key1')).to.be(undefined);
    });

    it('should return undefined for unknown keys (not empty map)', () => {
      let map = new SimpleMap;
      map.put('key2', 'A');
      expect(map.get('key1')).to.be(undefined);
    });

    it('should return undefined for well known key with value undefined', () => {
      let map = new SimpleMap;
      map.put('key1', undefined);
      expect(map.get('key1')).to.be(undefined);
    });

    describe('should return value for key type ', () => {

      it('int', () => {
        let map = new SimpleMap;
        map.put(1, 'A');
        expect(map.get(1)).to.be('A');
      });

      it('string', () => {
        let map = new SimpleMap;
        map.put('1', 'A');
        expect(map.get('1')).to.be('A');
      });

      it('object', () => {
        let map = new SimpleMap;
        let obj = {a : 1};
        map.put(obj, 'A');
        expect(map.get(obj)).to.be('A');
      });

      it('function', () => {
        let map = new SimpleMap;
        let fn = () => {
        };
        map.put(fn, 'A');
        expect(map.get(fn)).to.be('A');
      });

    });

    describe('should return value for value type ', () => {

      it('int', () => {
        let map = new SimpleMap;
        map.put('key1', 1);
        expect(map.get('key1')).to.be(1);
      });

      it('string', () => {
        let map = new SimpleMap;
        map.put('key1', '1');
        expect(map.get('key1')).to.be('1');
      });

      it('object', () => {
        let map = new SimpleMap;
        let obj = {a : 1};
        map.put('key1', obj);
        expect(map.get('key1')).to.be(obj);
      });

      it('function', () => {
        let map = new SimpleMap;
        let fn = () => {
        };
        map.put('key1', fn);
        expect(map.get('key1')).to.be(fn);
      });

    });

  });

  describe('store multiple', () => {

    it('should return the correct value for a key', () => {
      let map = new SimpleMap;
      map.put('key1', 'A');
      map.put('key2', 'B');
      expect(map.get('key1')).to.be('A');
    });

  });

  describe('ensure toString() is not being used', () => {

    it('using functions as keys', ()=> {
      let map = new SimpleMap;
      let fn1 = () => {
      };
      let fn2 = () => {
      };
      map.put(fn1, 'A');
      map.put(fn2, 'B');
      expect(map.get(fn1)).to.be('A');
      expect(map.get(fn2)).to.be('B');

    });

  });

});
