import { Pool, config } from 'threads'

config.set({
  basepath: {
    web: `${document.URL}scripts`
  }
})

const pool = new Pool(4)

pool.run('workerUtil.js')

export default pool
