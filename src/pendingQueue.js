class PendingQueue {
  isWorking;

  constructor() {
    this.queue = [];
    this.isWorking = false;
  }

  enqueue(work) {
    const { req, res } = work;
    const events = req.body.events.map((event) => ({ req, res, event }));
    this.queue.push(...events);
  }

  async processPendingRequest(execute) {
    if (this.queue.length > 0) {
      const { req, res, event } = this.queue.shift();
      this.isWorking = true;
      await execute({ req, res, event });
      this.isWorking = false;
      this.processPendingRequest(execute);
    }
  }
}

const pendingQ = new PendingQueue();

module.exports = {
  pendingQ,
};
