import Queue from '../../../../src/lib/support/Queue';

describe('lib.helpers.Queue', () => {

  describe('after creation', () => {

    it('queue should be empty (size is 0)', () => {
      let queue = new Queue;
      expect(queue.size()).to.be(0);
    });

    it('queue should be empty (no first item)', () => {
      let queue = new Queue;
      expect(queue.first()).to.be(undefined);
    });

    it('queue should be empty (no last item)', () => {
      let queue = new Queue;
      expect(queue.last()).to.be(undefined);
    });

  });

  describe('after adding one item', () => {

    it('queue should be not empty (size is 1)', () => {
      let queue = new Queue;
      queue.push('an item');
      expect(queue.size()).to.be(1);
    });

    it('queue should be not empty (first item is the added one)', () => {
      let queue = new Queue;
      queue.push('an item');
      expect(queue.first()).to.be('an item');
    });

    it('queue should be not empty (last item is the added one)', () => {
      let queue = new Queue;
      queue.push('an item');
      expect(queue.last()).to.be('an item');
    });

    describe('and removing it again', () => {
      it('queue should be empty (size is 0)', () => {
        let queue = new Queue;
        queue.push('an item');
        queue.first();
        expect(queue.size()).to.be(0);
      });

      it('queue should be empty (no first item)', () => {
        let queue = new Queue;
        queue.push('an item');
        queue.first();
        expect(queue.first()).to.be(undefined);
      });

      it('queue should be empty (no last item)', () => {
        let queue = new Queue;
        queue.push('an item');
        queue.last();
        expect(queue.last()).to.be(undefined);
      });
    });

  });

  describe('after adding multiple items', () => {

    it('queue should be not empty (size is 5)', () => {
      let queue = new Queue;
      queue.push('an item 1');
      queue.push('an item 2');
      queue.push('an item 3');
      queue.push('an item 4');
      queue.push('an item 5');
      expect(queue.size()).to.be(5);
    });

    it('queue should be not empty (first item is the added one)', () => {
      let queue = new Queue;
      queue.push('an item 1');
      queue.push('an item 2');
      queue.push('an item 3');
      queue.push('an item 4');
      queue.push('an item 5');
      expect(queue.first()).to.be('an item 1');
    });

    it('queue should be not empty (last item is the added one)', () => {
      let queue = new Queue;
      queue.push('an item 1');
      queue.push('an item 2');
      queue.push('an item 3');
      queue.push('an item 4');
      queue.push('an item 5');
      expect(queue.last()).to.be('an item 5');
    });

    describe('and removing it again', () => {
      it('queue should be still not empty (size is 4)', () => {
        let queue = new Queue;
        queue.push('an item 1');
        queue.push('an item 2');
        queue.push('an item 3');
        queue.push('an item 4');
        queue.push('an item 5');
        queue.first();
        expect(queue.size()).to.be(4);
      });

      it('queue should be not empty (previous first(), now first item is the 2nd added one)', () => {
        let queue = new Queue;
        queue.push('an item 1');
        queue.push('an item 2');
        queue.push('an item 3');
        queue.push('an item 4');
        queue.push('an item 5');
        queue.first();
        expect(queue.first()).to.be('an item 2');
      });

      it('queue should be not empty (previous last(), now last item is the 4th added one)', () => {
        let queue = new Queue;
        queue.push('an item 1');
        queue.push('an item 2');
        queue.push('an item 3');
        queue.push('an item 4');
        queue.push('an item 5');
        queue.last();
        expect(queue.last()).to.be('an item 4');
      });

      it('queue should be not empty (previous last(), now first item is the 1st added one)', () => {
        let queue = new Queue;
        queue.push('an item 1');
        queue.push('an item 2');
        queue.push('an item 3');
        queue.push('an item 4');
        queue.push('an item 5');
        queue.last();
        expect(queue.first()).to.be('an item 1');
      });

      it('queue should be not empty (previous first(), now last item is the 5th added one)', () => {
        let queue = new Queue;
        queue.push('an item 1');
        queue.push('an item 2');
        queue.push('an item 3');
        queue.push('an item 4');
        queue.push('an item 5');
        queue.first();
        expect(queue.last()).to.be('an item 5');
      });
    });

  });

});

