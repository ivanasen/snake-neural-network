import Genome from '../genetics/Genome'
import axios from 'axios'
import { pool } from '../genetics/Pool'

class SaveManager {
  POOL_STATE = 'POOL_STATE'
  
  getLoadState = () => {
    this.getPreviousSaves().then(saves => {
      if (!saves.length) {
        pool.init()
      } else {
        this.loadFile(saves[0])
      }
    })
  }

  loadFile(file) {
    axios.get(file).then(
      res => {
        const poolJson = res.data
        this.hydrate(poolJson)
      },
      rej => {
        console.log(rej)
        pool.init()
      }
    )
  }

  hydrate(poolJson) {
    Object.assign(pool, poolJson)

    //Re Hydrate the genomes
    pool.genomes = pool.genomes.map(genome => {
      const hydratedGenome = Object.assign(new Genome(), genome)
      hydratedGenome.hydrateNetwork()
      return hydratedGenome
    })
  }

  getPreviousSaves() {
    const pool = localStorage.getItem(POOL_STATE)
    return pool
    // return axios.get('/listsaves').then(
    //   res => res.data,
    //   rej => {
    //     console.log(rej)
    //     pool.init()
    //   }
    // )
  }

  saveState(pool) {
    localStorage.setItem(POOL_STATE, pool)
    // axios.post('/savestate', pool)
  }
}

export const saveManager = new SaveManager()
