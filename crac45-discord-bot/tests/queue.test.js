// tests/queue.test.js
const TaskQueue = require('../src/queue/TaskQueue');

describe('TaskQueue', () => {
    it('should enqueue items', () => {
        const queue = new TaskQueue();
        queue.enqueue('task1');
        queue.enqueue('task2');
        expect(queue.size()).toBe(2);
    })

    it('should dequeue items', () => {
        const queue = new TaskQueue();
        queue.enqueue('task1')
        queue.enqueue('task2')
        expect(queue.dequeue()).toBe('task1')
        expect(queue.size()).toBe(1)
    })

    it('should peek at the next item', () => {
       const queue = new TaskQueue()
       queue.enqueue('task1')
       queue.enqueue('task2')
       expect(queue.peek()).toBe('task1')
       expect(queue.size()).toBe(2)
    })

    it('should return null if peeking on an empty queue', () => {
        const queue = new TaskQueue()
        expect(queue.peek()).toBe(null)
    })


    it('should check if queue is empty', () => {
        const queue = new TaskQueue()
        expect(queue.isEmpty()).toBe(true)
        queue.enqueue('task1')
        expect(queue.isEmpty()).toBe(false)
    })

    it('should not allow enqueuing to a full queue', () => {
      const queue = new TaskQueue(1)
      queue.enqueue('task1')
      expect(() => queue.enqueue('task2')).toThrow('Queue is full')
    })

    it('should not allow dequeuing from an empty queue', () => {
        const queue = new TaskQueue()
        expect(() => queue.dequeue()).toThrow('Queue is empty')
    })
})