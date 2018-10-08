import Genome from '../genetics/Genome'
import axios from 'axios'
import { pool } from '../genetics/Pool'

class SaveManager {
  getLoadState = () => {
    this.getSaticSave().then(save => {
      if (!save) {
        pool.init()
      } else {
        this.loadFile(save)
      }
    })
  }

  loadFile(file) {
    this.hydrate(file)
  }

  hydrate(poolJson) {
    Object.assign(pool, poolJson)

    //Re Hydrate the genomes
    pool.genomes = pool.genomes.map(g => {
      const hydratedGenome = new Genome()
      Object.assign(hydratedGenome, g)
      hydratedGenome.hydrateNetwork()
      return hydratedGenome
    })
  }

  getSaticSave() {
    return axios.get('/saves/147.json').then(
      res => res.data,
      rej => {
        console.log(rej)
        pool.init()
      }
    )
  }

  saveState(pool) {
    console.log("Using static version, so can't save sate.")
  }
}

export const saveManager = new SaveManager()
