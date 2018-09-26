import { cloneDeep } from 'lodash'
import config from '../config.json'
import Genome from './Genome'
import { Network } from 'synaptic'
import { sm } from '../game/SaveManager'

class Pool {
  constructor() {
    this.roundTicksElapsed = 0
    this.maxRoundTicks = config.GenerationLength
    this.generation = 0
    this.championsPerfs = []
    this.playersGenomeIndexes = []
    this.genomes = []
  }

  newGeneration() {
    this.roundTicksElapsed = 0

    const maxFitness = this.getMaxFitness()
    const chartsData = {
      x: this.generation,
      y: maxFitness
    }

    this.championsPerfs.push(chartsData)
    this.hydrateChart()

    console.log(this.genomes.map(g => g.fitness))

    // Kill worst genomes
    this.genomes = this.selectBestGenomes(
      this.genomes,
      config.KeepAlivePercent,
      config.Population
    )

    const bestGenomes = _.clone(this.genomes)

    // Crossover
    while (this.genomes.length < config.Population - 2) {
      const gen1 = this.getRandomGenome(bestGenomes)
      const gen2 = this.getRandomGenome(bestGenomes)
      const newGenome = this.mutate(this.crossOver(gen1, gen2))
      this.genomes.push(newGenome)
    }
    // 2 random from the best will get mutations
    while (this.genomes.length < config.Population) {
      const gen = this.getRandomGenome(bestGenomes)
      const newGenome = this.mutate(gen)
      this.genomes.push(newGenome)
    }

    // Increment the age of a Genome for debug checking
    // If the top Genome keeps aging and aging it means no children was able to beat him
    // Which might indicate that we're stuck and the network converged
    this.genomes.forEach(g => {
      g.age++
    })

    // Reset Matches & fitness
    this.genomes.forEach(g => {
      g.matches = []
      g.fitness = 0
    })

    //Save JSON
    this.saveState(this)
    console.log(`Completed Generation ${this.generation}`)
    this.generation++
  }

  saveState(pool) {
    sm.saveState(pool)
  }

  mutate(genome) {
    let networkJSON = genome.network.toJSON()
    const newGenome = new Genome()
    const mutationChance = this.calculateMutationChance()
    console.log(mutationChance)
    networkJSON.neurons = this.mutateDataKeys(
      networkJSON.neurons,
      'bias',
      mutationChance
    )
    networkJSON.connections = this.mutateDataKeys(
      networkJSON.connections,
      'weight',
      mutationChance
    )
    newGenome.network = Network.fromJSON(networkJSON)
    return newGenome
  }

  getMaxFitness() {
    return Math.max.apply(Math, this.genomes.map(g => g.fitness))
  }

  calculateMutationChance() {
    const maxFitness = this.getMaxFitness()
    return maxFitness > 100 ? Math.min((1 / Math.pow(maxFitness, 0.35)), config.MutationChance) : config.MutationChance
  }

  // Given an array of object with key and mutationChance
  // randomly mutate the value of each key
  mutateDataKeys(obj, key, mutationChance) {
    const finalObj = cloneDeep(obj)
    finalObj.forEach(o => {
      if (Math.random() < mutationChance) {
        o[key] += o[key] * (Math.random() - 0.5) * 3 + (Math.random() - 0.5)
      }
    })
    return finalObj
  }

  hydrateChart() {
    chart.data.datasets[0].data = this.championsPerfs.slice()
    chart.update()
    const ageStats = this.genomes.map(g => g.age)
    // ageStats.length = ~~(config.Population * config.KeepAlivePercent)
    // ageChart.data.datasets[0].data = ageStats
    // ageChart.update()
  }

  getRandomGenome(list) {
    return list[~~(Math.random() * list.length)]
  }

  // Will only touch the neurons part of the network
  // Taking some part from gen1 network, and the rest from gen2
  crossOver(gen1, gen2, swapChance = 0.5) {
    // Grab the json version of their networks
    // then compute changes
    if (Math.random() < swapChance) [gen1, gen2] = [gen2, gen1]

    //Extract their networks
    const [net1, net2] = [gen1, gen2].map(g => g.network.toJSON())
    const child = new Genome()

    // Get the result of crossover of the bias of the neurons
    const crossedNeurons = this.crossOverDataKey(
      net1.neurons,
      net2.neurons,
      'bias'
    )
    net1.neurons = crossedNeurons
    // Reconstruct the synaptic Network back
    child.network = Network.fromJSON(net1)
    return child
  }

  // Given 2 arrays of objects,
  // select a crossOver point randomly,
  // swap values starting at cut
  crossOverDataKey(a, b, key, cutLocation) {
    const childNeurons = cloneDeep(a)
    cutLocation = cutLocation || ~~(Math.random() * a.length)
    for (let i = cutLocation; i < a.length; i++) {
      childNeurons[i][key] = b[i][key]
    }
    return childNeurons
  }

  // Return a sorted version of the genomes array based on fitness key
  selectBestGenomes(genomes, keepRatio, populationCount) {
    genomes.sort((g1, g2) => g2.fitness - g1.fitness)
    genomes.length = ~~(keepRatio * populationCount)
    return genomes
  }

  // Populate according to the config with random mutated Genomes
  buildInitGenomes() {
    let builded = []
    for (let i = 0; i < config.Population; i++) {
      builded.push(this.mutate(new Genome()))
    }
    return builded
  }

  init() {
    this.generation = 0
    this.championsPerfs = []
    this.genomes = this.buildInitGenomes()
  }

  reboot() {
    this.init()
    this.hydrateChart()
  }

  evaluateGenome(networkInputs, genomeIndex) {
    const output = this.genomes[genomeIndex].network.activate(networkInputs)
    return output
  }

  // Returns a percent of the current generation advancement
  getGenerationAdvancement() {
    return ~~(
      this.genomes.map(g => g.matches.length).reduce((x, y) => x + y, 0) /
      config.Population
    )
  }

  getPlayerGenome(index) {
    return this.genomes[index]
  }

  getGenomeOfSnake(index) {
    return this.getPlayerGenome(index)
  }

  // getIndexOfSnakeGenome(id) {
  //   return id ? this.p2GenomeIndex : this.p1GenomeIndex;
  // }

  matchResult(player, score) {
    const genome = this.getGenomeOfSnake(player.id)
    genome.addMatch(score)
  }
}

export const pool = new Pool()
