import WorkerClient from '../WorkerClient'
import PoolWorker from 'worker-loader!./Pool.worker.js'
import config from '../config.json'

class PoolClient extends WorkerClient {
  constructor(chart) {
    super(PoolWorker)
    this.ticksElapsed = 0
    this.maxTicks = config.GenerationLength
    this.chart = chart
  }

  newGeneration() {
    this.ticksElapsed = 0
    this.callWorkerMethod('newGeneration')
  }

  init() {
    this.callWorkerMethod('init')
  }

  hydrateChart() {
    this.getChampionsPerfs().then(championsPerfs => {
      this.chart.data.datasets[0].data = championsPerfs
      this.chart.update()
    })
  }

  evaluateGenome(networkInputs, genomeIndex) {
    return this.callWorkerMethod('evaluateGenome', [networkInputs, genomeIndex])
  }

  matchResult(genomeIndex, score) {
    this.callWorkerMethod('matchResult', [genomeIndex, score])
  }

  getLoadState() {
    return this.callWorkerMethod('getLoadState')
  }

  getChampionsPerfs() {
    return this.callWorkerMethod('getChampionsPerfs')
  }

  onMessage(message) {

  }

  onError(error) {
    
  }
}

export const pool = new PoolClient()
