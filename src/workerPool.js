import { Pool, config } from 'threads'

const MAX_THREADS = 8

config.set({
  basepath: {
    web: `${document.URL}scripts`
  }
})

const pool = new Pool(MAX_THREADS)

pool.run('workerUtil.js')

export default pool
