// src/queue/TaskQueue.js
class TaskQueue {
    constructor(maxSize = Infinity) {
        this.queue = []
        this.maxSize = maxSize
    }

    enqueue(item) {
        if(this.size() >= this.maxSize) {
            throw new Error('Queue is full')
        }
        this.queue.push(item)
    }

    dequeue() {
        if(this.isEmpty()) {
            throw new Error('Queue is empty')
        }
        return this.queue.shift()
    }

    peek() {
        if (this.isEmpty()) {
            return null
        }
        return this.queue[0]
    }

    isEmpty() {
        return this.queue.length === 0;
    }

    isFull() {
        return this.size() >= this.maxSize
    }

    size() {
        return this.queue.length
    }
}

module.exports = TaskQueue