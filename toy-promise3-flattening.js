// New features:
// * resolve() “flattens” parameter `value` if it is a promise
//   (the state of`this` becomes locked in on `value`)
//
// Changes:
// * .resolve() and .reject() work differently now
// * New helper function: isThenable()

import * as assert from 'assert';

export class ToyPromise3 {
  _fulfillmentTasks = [];
  _rejectionTasks = [];
  _promiseResult = undefined;
  _promiseState = 'pending';
  _alreadyResolved = false; // [new]
  
  then(onFulfilled, onRejected) {
    const resultPromise = new ToyPromise3();

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

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  resolve(value) { // [new]
    if (this._alreadyResolved) return this;
    this._alreadyResolved = true;

    if (isThenable(value)) {
      // Forward fulfillments and rejections from `value` to `this`.
      // The callbacks are always executed asynchronously
      value.then(
        (result) => this._doFulfill(result),
        (error) => this._doReject(error));
    } else {
      this._doFulfill(value);
    }

    return this; // enable chaining
  }

  _doFulfill(value) { // [new]
    assert.ok(!isThenable(value));
    this._promiseState = 'fulfilled';
    this._promiseResult = value;
    this._clearAndEnqueueTasks(this._fulfillmentTasks);
  }

  reject(error) { // [new]
    if (this._alreadyResolved) return this;
    this._alreadyResolved = true;
    this._doReject(error);
    return this; // enable chaining
  }
  _doReject(error) { // [new]
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

function isThenable(value) { // [new]
  return typeof value === 'object' && value !== null
    && typeof value.then === 'function';
}

function addToTaskQueue(task) {
  setTimeout(task, 0);
}
