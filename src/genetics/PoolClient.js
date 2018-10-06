import Worker from 'worker-loader!./Pool.worker.js'
import config from '../config.json'
class PoolClient {
  constructor(chart) {
    this.ticksElapsed = 0
    this.maxTicks = config.GenerationLength
    this.chart = chart
    this.initWorker()
  }

  initWorker() {
    this.resolves = []
    this.rejects = []
    this.worker = new Worker()
    this.worker.onmessage = output => {
      this.rejects.shift()
      const resolve = this.resolves.shift()
      resolve(output.data)
    }
    this.worker.onerror = error => {
      this.resolves.shift()
      const reject = this.rejects.shift()
      reject(error)
    }
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
    return this.callPoolMethod('evaluateGenome', [networkInputs, genomeIndex])
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
      this.resolves.push(resolve)
      this.rejects.push(reject)
    })
  }
}

export const pool = new PoolClient()
