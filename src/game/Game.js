import _ from 'lodash'

import config from '../config.json'
import charts from './charts'
import { pool } from '../genetics/PoolClient'
import FoodPool from './FoodPool'
import Snake from './Snake'

class Game {
  constructor(width, height) {
    this.simulationSpeed = config.SimulationSpeed
    this.snakesCount = config.Population
    this.snakesList = []
    this.debug = config.Debug
    this.humanControlled = 0
    this.frameCount = 0
    this.width = width
    this.height = height
    this.shouldEvolve = config.ShouldEvolve
    this.setupCharts()
  }

  setupCharts() {
    window.chart = charts.perfChart()
  }

  setup() {
    this.snakesList = []
    const canvas = createCanvas(this.width, this.height)
    this.foodPool = new FoodPool(config.FoodAmount, this.width, this.height)
    canvas.parent('snakes-animation-holder')
    colorMode(HSB)

    this.reset()
  }

  reset() {
    background(217, 0, 96.5)

    this.snakesList = []

    _.range(0, this.snakesCount).forEach(id => {
      const snake = new Snake(
        this.snakesList,
        id,
        this.width,
        this.height,
        this.foodPool,
        this.debug
      )
      this.snakesList.push(snake)
    })

    setTimeout(() => $('#snakes-animation-holder').addClass('ready'), 3000)
  }
  
  draw() {
    if (!this.snakesList) return
    this.clear()
    this.foodPool.draw()
    
    for (let i = 0; i < this.simulationSpeed; i++) {
      this.handleNextTick()
    }
  }

  clear() { 
    this.debug ? background(0, 0, 100) : background(0, 0, 100, 0.05)
  }

  handleNextTick() {
    if (this.shouldEvolve) {
      if (++pool.ticksElapsed >= pool.maxTicks) {
        this.snakesList.forEach(snake => snake.matchResult())
        pool.newGeneration()
      }
    }

    this.snakesList.forEach(snake => snake.show())
  }
}

export default Game
