import { Pool, config } from 'threads'

const POOL_MAX_THREADS = 3

config.set({
  basepath: {
    web: 'http://localhost:8080/scripts'
  }
})

const pool = new Pool()

pool.run('workerUtil.js')

export default pool
