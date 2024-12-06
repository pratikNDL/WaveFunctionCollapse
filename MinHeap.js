export default class MinHeap {
    constructor(grid) {
      this.heap = [];
      for(let cell of grid) {
        this.insert(cell);
      }
    }
  
    insert(value) {
      this.heap.push(value);
      this._heapifyUp();
    }
  
    extract() {
      if (this.heap.length === 0) return null;
      if (this.heap.length === 1) return this.heap.pop();
  
      const min = this.heap[0];
      this.heap[0] = this.heap.pop();
      this._heapifyDown();
      return min;
    }
  
    peek() {
      return this.heap[0] ?? null;
    }
  
    _compare(a, b) {
      if (a.options.length !== b.options.length) return a.options.length - b.options.length;
      return Math.random() - Math.random();
    }
  
    _heapifyUp() {
      let index = this.heap.length - 1;
      while (index > 0) {
        const parentIdx = Math.floor((index - 1) / 2);
        if (this._compare(this.heap[parentIdx], this.heap[index]) <= 0) break;
  
        [this.heap[parentIdx], this.heap[index]] = [this.heap[index], this.heap[parentIdx]];
        index = parentIdx;
      }
    }
  
    _heapifyDown() {
      let index = 0;
      const length = this.heap.length;
  
      while (true) {
        let left = 2 * index + 1;
        let right = 2 * index + 2;
        let smallest = index;
  
        if (left < length && this._compare(this.heap[left], this.heap[smallest]) < 0) {
          smallest = left;
        }
  
        if (right < length && this._compare(this.heap[right], this.heap[smallest]) < 0) {
          smallest = right;
        }
  
        if (smallest === index) break;
  
        [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
        index = smallest;
      }
    }
  }
  