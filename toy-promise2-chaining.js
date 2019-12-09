// New features:
// * .then() returns a promise, which fulfills with what
//   either onFulfilled or onRejected return
// * Missing onFulfilled and onRejected pass on what they receive
// * New convenience method .catch()
// 
// Changes:
// * Several locations inside .then()

export class ToyPromise2 {
  _fulfillmentTasks = [];
  _rejectionTasks = [];
  _promiseResult = undefined;
  _promiseState = 'pending';
  
  then(onFulfilled, onRejected) {
    const resultPromise = new ToyPromise2(); // [new]

    const fulfillmentTask = () => {
      if (typeof onFulfilled === 'function') {
        const returned = onFulfilled(this._promiseResult);
        resultPromise.resolve(returned); // [new]
      } else { // [new]
        // `onFulfilled` is missing
        // => we must pass on the fulfillment value
        resultPromise.resolve(this._promiseResult);
      }  
    };

    const rejectionTask = () => {
      if (typeof onRejected === 'function') {
        const returned = onRejected(this._promiseResult);
        resultPromise.resolve(returned); // [new]
      } else { // [new]
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
    
    return resultPromise; // [new]
  }

  catch(onRejected) { // [new]
    return this.then(null, onRejected);
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
