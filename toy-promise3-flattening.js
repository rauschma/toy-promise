// New features:
// * resolve() “flattens” parameter `value` if it is a promise
//   (the state of`this` becomes locked in on `value`)
//
// Changes:
// * .resolve() and .reject() work differently now

export class ToyPromise3 {
  _fulfillmentTasks = [];
  _rejectionTasks = [];
  _promiseResult = undefined;
  _promiseState = 'pending';
  _settledOrLockedIn = false; // [new]
  
  then(onFulfilled, onRejected) {
    const resultPromise = new ToyPromise3();

    // Runs if the Promise is fulfilled (now or later)
    const fulfillmentTask = () => {
      if (typeof onFulfilled === 'function') {
        const returned = onFulfilled(this._promiseResult);
        resultPromise.resolve(returned);
      } else {
        // `onFulfilled` is missing
        // => we must pass on the fulfillment value
        resultPromise.resolve(this._promiseResult);
      }  
    };

    const rejectionTask = () => {
      if (typeof onRejected === 'function') {
        const returned = onRejected(this._promiseResult);
        resultPromise.resolve(returned);
      } else {
        // `onRejected` is missing
        // => we must pass on the rejection value
        resultPromise.reject(this._promiseResult);
      }
    };

    switch (this._promiseState) {
      case 'pending':
        this._fulfillmentTasks.push(fulfillmentTask);
        this._rejectionTasks.push(rejectionTask);
        break;
      case 'fulfilled':
        addToTaskQueue(fulfillmentTask);
        break;
      case 'rejected':
        addToTaskQueue(rejectionTask);
        break;
      default:
        throw new Error();
    }
    return resultPromise;
  }

  resolve(value) { // [new]
    if (this._settledOrLockedIn) return this;
    this._settledOrLockedIn = true;
    this._coreResolve(value);
    return this; // enable chaining
  }
  _coreResolve(value) { // [new]
    // Is `value` a thenable?
    if (typeof value === 'object' && value !== null && 'then' in value) {
      // Forward fulfillments and rejections from `value` to `this`.
      // The callbacks are always executed asynchronously
      value.then(
        (result) => this._coreResolve(result),
        (error) => this._coreReject(error));
    } else {
      this._promiseState = 'fulfilled';
      this._promiseResult = value;
      this._clearAndEnqueueTasks(this._fulfillmentTasks);
    }
  }

  reject(error) { // [new]
    if (this._settledOrLockedIn) return this;
    this._settledOrLockedIn = true;
    this._coreReject(error);
    return this; // enable chaining
  }
  /** Only a separate method because it’s called from ._coreResolve() */
  _coreReject(error) { // [new]
    this._promiseState = 'rejected';
    this._promiseResult = error;
    this._clearAndEnqueueTasks(this._rejectionTasks);
  }
  
  _clearAndEnqueueTasks(tasks) {
    this._fulfillmentTasks = undefined;
    this._rejectionTasks = undefined;
    tasks.map(addToTaskQueue);
  }
}

function addToTaskQueue(task) {
  setTimeout(task, 0);
}
