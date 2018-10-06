import Worker from 'worker-loader!./Pool.worker.js'
import config from '../config.json'
class PoolClient {
  constructor(chart) {
    this.ticksElapsed = 0
    this.maxTicks = config.GenerationLength
    this.worker = new Worker()
    this.chart = chart
  }

  newGeneration() {
    this.ticksElapsed = 0
    this.callPoolMethod('newGeneration')
  }

  init() {
    this.callPoolMethod('init')
  }

  hydrateChart() {
    this.getChampionsPerfs().then(championsPerfs => {
      this.chart.data.datasets[0].data = championsPerfs
      this.chart.update()
    })
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
