class PriorityQueue {
  constructor() { this.queue = []; }
  enqueue(item, priority) { this.queue.push({ item, priority }); this.queue.sort((a,b) => b.priority - a.priority); }
  dequeue() { return this.queue.shift()?.item || null; }
  isEmpty() { return this.queue.length === 0; }
}
module.exports = PriorityQueue;
