import _ from 'lodash'

import config from '../config.json'
import charts from './charts'
import { pool } from '../genetics/Pool'
import FoodPool from './FoodPool'
import Snake from './SnakeWorker'

class Game {
  constructor(width, height) {
    this.simulationSpeed = config.SimulationSpeed
    this.snakesCount = config.Population
    this.snakesList = []
    this.debug = config.Debug
    this.showSnakesSensors = 0
    this.humanControlled = 0
    this.frameCount = 0
    this.width = width
    this.height = height
    this.shouldEvolve = config.ShouldEvolve
    this.setupChart()
  }

  setupChart() {
    document.addEventListener('DOMContentLoaded', e => {
      window.chart = charts.perfChart()
    })
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
    background(180, 30, 6)

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

    if (this.showSnakesSensors) {
      this.snakesList.forEach(snake => Snake.setDebug())
    }

    setTimeout(() => {
      $('#snakes-animation-holder').addClass('ready')
    }, 3000)
  }

  draw() {
    this.clear()

    if (!this.snakesList) return

    for (let i = 0; i < this.simulationSpeed; i++) {
      this.foodPool.draw()
      this.handleNextTick()
    }
  }

  clear() {
    this.debug ? background(0, 0, 0) : background(360, 100, 0, 0.03)
  }

  handleNextTick() {
    if (++pool.roundTicksElapsed >= pool.maxRoundTicks && this.shouldEvolve) {
      pool.newGeneration()
    }

    if (pool.roundTicksElapsed % 2 == 0) {
      this.snakesList.forEach(snake => {
        !snake.dead && snake.getInputsAndAssignDir()
      })
    }

    this.snakesList.forEach(snake => snake.update())
  }
}

export default Game
