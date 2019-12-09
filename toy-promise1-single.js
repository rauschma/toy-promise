// Features:
// * .then() must work independently if the promise is
//   settled either before or after it is called
// * You can only resolve or reject once

export class ToyPromise1 {
  _fulfillmentTasks = [];
  _rejectionTasks = [];
  _promiseResult = undefined;
  _promiseState = 'pending';
  
  then(onFulfilled, onRejected) {
    const fulfillmentTask = () => {
      if (typeof onFulfilled === 'function') {
        onFulfilled(this._promiseResult);
      }
    };
    const rejectionTask = () => {
      if (typeof onRejected === 'function') {
        onRejected(this._promiseResult);
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
  }

  resolve(value) {
    if (this._promiseState !== 'pending') return this;
    this._promiseState = 'fulfilled';
    this._promiseResult = value;
    this._clearAndEnqueueTasks(this._fulfillmentTasks);
    return this; // enable chaining
  }

  reject(error) {
    if (this._promiseState !== 'pending') return this;
    this._promiseState = 'rejected';
    this._promiseResult = error;
    this._clearAndEnqueueTasks(this._rejectionTasks);
    return this; // enable chaining
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
