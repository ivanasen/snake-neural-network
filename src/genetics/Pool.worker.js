import { pool } from './Pool'

// Respond to message from parent thread
self.addEventListener('message', message => {
  const { data } = message
  const result = data.methodArgs
    ? pool[data.method](...data.methodArgs)
    : pool[data.method]()
  self.postMessage(result)
})
