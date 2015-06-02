/*
 Simple queue implementation

 FIFO: #push() + #first()
 LIFO: #push() + #last()
 */
class Queue {

  constructor(maxSize = 10) {
    this.maxSize = maxSize;
    this.items = [];
  }

  push(item) {
    this.items.push(item);
    return this.recalibrateBufferSize();
  }

  recalibrateBufferSize() {
    while (this.items.length > this.maxSize) {
      this.first();
    }
    return this;
  }

  last() {
    return this.items.pop();
  }

  first() {
    return this.items.shift(0);
  }

  size() {
    return this.items.length;
  }

}

export default Queue;
