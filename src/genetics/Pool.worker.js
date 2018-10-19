import { pool } from './Pool'

// Respond to message from parent thread
self.addEventListener('message', message => {
  const { data } = message
  let result

  if (data.methodArgs !== undefined) {
    if (data.methodArgs instanceof ArrayBuffer) {
      result = pool[data.method](data.methodArgs)
    } else {
      result = pool[data.method](...data.methodArgs)
    }
  } else {
    result = pool[data.method]()
  }

  self.postMessage(result)
})
