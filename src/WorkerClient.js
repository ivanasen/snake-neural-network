class WorkerClient {
  constructor(WorkerClass) {
    this.initWorker(WorkerClass)
  }

  initWorker(WorkerClass) {
    this.resolves = []
    this.rejects = []
    this.worker = new WorkerClass()

    this.worker.onmessage = output => {
      this.rejects.shift()
      const resolve = this.resolves.shift()
      resolve(output.data)

      this.onMessage(output)
    }

    this.worker.onerror = error => {
      this.resolves.shift()
      const reject = this.rejects.shift()
      reject(error)

      this.onError(error)
    }
  }

  onMessage(message) {

  }

  onError(error) {

  }

  callWorkerMethod(method, methodArgs, transferableList) {
    
    return new Promise((resolve, reject) => {
      this.worker.postMessage({ method, methodArgs }, transferableList)
      this.resolves.push(resolve)
      this.rejects.push(reject)
    })
  }
}

export default WorkerClient
