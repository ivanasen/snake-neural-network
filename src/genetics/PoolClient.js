import Worker from 'worker-loader!./Pool.worker.js'
import config from '../config.json'

class PoolClient {
  constructor() {
    this.roundTicksElapsed = 0
    this.maxRoundTicks = config.GenerationLength
    this.worker = new Worker()
  }

  newGeneration() {
    this.callPoolMethod('newGeneration')
  }

  hydrateChart() {
    this.callPoolMethod('hydrateChart')
  }

  init() {
    this.callPoolMethod('init')
  }

  evaluateGenome(networkInputs, genomeIndex) {
    return this.callPoolMethod(
      'evaluateGenome',
      [networkInputs, genomeIndex]
    )
  }

  matchResult(genomeIndex, score) {
    this.callPoolMethod('matchResult', [genomeIndex, score])
  }

  getLoadState() {
    return this.callPoolMethod('getLoadState')
  }

  getChampionsPerfs() {
    return this.callPoolMethod('getChampionsPerfs')
  }

  callPoolMethod(method, methodArgs) {
    return new Promise((resolve, reject) => {
      this.worker.postMessage({ method, methodArgs })
      this.worker.onmessage = output => resolve(output)
      this.worker.onerror = error => reject(error)
    })
  }
}

export const pool = new PoolClient()
