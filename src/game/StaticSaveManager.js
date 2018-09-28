import Genome from '../genetics/Genome'

class SaveManager {
  constructor() {
    this.lastSaveTime = 0
    this.previous = []
  }

  elapsed() {
    return ~~((+new Date() - this.lastSaveTime) / 1000)
  }

  getLoadState = (callback) => {
    var sessionPool = sessionStorage.pool
    if (sessionPool) {
      this.hydrate(JSON.parse(sessionPool), callback)
    } else {
      this.getSaticSave(save => {
        if (!save) {
          pool.init()
          setTimeout(callback, 500)
        } else {
          this.loadFile(save, callback)
        }
      })
    }
  }

  loadFile(file, callback) {
    this.hydrate(file, callback)
  }

  hydrate(json, callback) {
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
    setTimeout(pool.hydrateChart.bind(pool), 1000)
    callback()
  }

  getSaticSave(callback) {
    var req = new XMLHttpRequest()
    req.open('GET', '/saves/173.json', true)    
    req.onreadystatechange = e => {
      if (req.readyState == 4) {
        callback(JSON.parse(req.responseText))
      }
    }
    req.send(null)
  }

  saveState(pool, callback) {
    console.log('Using static version, so can\'t save sate.')
  }
}

export let sm = new SaveManager()
