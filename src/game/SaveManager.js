import Genome from '../genetics/Genome'
import { pool } from '../genetics/Pool'

class SaveManager {
  constructor() {
    this.lastSaveTime = 0
    this.previous = []
  }

  elapsed() {
    return ~~((+new Date() - this.lastSaveTime) / 1000)
  }

  getLoadState = () => {
    this.getPreviousSaves(saves => {
      if (!saves.length) {
        pool.init()
      } else {
        this.loadFile(saves[0])
      }
    })
  }

  loadFile(file) {
    var req = new XMLHttpRequest()
    req.open('GET', file, true)
    req.onreadystatechange = e => {
      if (req.readyState == 4) {
        this.hydrate(JSON.parse(req.responseText))
      }
    }
    req.send(null)
  }

  hydrate(json) {
    // json is a representation of pool
    // Copy all the keys
    Object.assign(pool, json)

    //Re Hydrate the genomes
    pool.genomes = pool.genomes.map(g => {
      const hGen = new Genome()
      Object.assign(hGen, g)
      hGen.hydrateNetwork()
      return hGen
    })
  }

  getPreviousSaves(callback) {
    var req = new XMLHttpRequest()
    req.open('GET', '/listsaves', true)
    req.onreadystatechange = e => {
      if (req.readyState == 4) {
        callback(JSON.parse(req.responseText))
      }
    }
    req.send(null)
  }

  saveState(pool) {
    if (this.elapsed() < 60) return
    this.lastSaveTime = +new Date()

    const poolJSON = JSON.stringify(pool)

    const req = new XMLHttpRequest()
    req.open('POST', '/savestate', true)
    req.setRequestHeader('Content-Type', 'application/json')

    req.onerror = e => console.log('Error Saving:', e)
    req.send(poolJSON)
  }
}

export const saveManager = new SaveManager()
