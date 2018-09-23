import _ from 'lodash'

import config from '../config.json'
import charts from './charts'
import { pool } from '../genetics/Pool'
import FoodPool from './FoodPool'
import { debug } from 'util';
import Snake from './Snake'

class Game {
  constructor() {
    this.simulationSpeed = config.simulationSpeed
    this.snakesCount = config.Population
    this.snakesList = []
    this.debug = false
    this.showDraw = 1
    this.showSnakesSensors = 0
    this.humanControlled = 0
    this.frameCount = 0
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.shouldEvolve = config.shouldEvolve    
    this.setupChart()
  }

  setupChart() {
    document.addEventListener('DOMContentLoaded', e => {
      window.chart = charts.perfChart()
      window.ageChart = charts.ageChart()
    })
  }

  setup() {
    this.snakesList = []
    const canvas = createCanvas(this.width, this.height)
    this.foodPool = new FoodPool(config.foodAmount, this.width, this.height)
    canvas.parent('sketch-holder')
    colorMode(HSB)
  }

  reset() {
    background(180, 30, 6)

    this.snakesList = []

    _.range(0, this.snakesCount).forEach(id => {
      const snake = new Snake(this.snakesList, id, this.width, this.height, this.foodPool, this.debug)
      this.snakesList.push(snake)
    })

    if (this.showSnakesSensors) {
      this.snakesList.forEach(snake => Snake.setDebug())
    }
  }

  draw() {
    this.clear()

    if (!this.snakesList) return

    for (let i = 0; i < this.simulationSpeed; i++) {
      this.foodPool.draw()
      this.checkDead()
      this.handleNextTick()
    }
  }

  clear() {
    this.debug ? background(0, 0, 0) : background(360, 100, 0, 0.03)    
  }

  checkDead() {
    for (let i = 0; i < this.snakesList.length; i++) {
      const snake = this.snakesList[i]
      if (snake.dead) {
        this.snakesList[i] = new Snake(
          this.snakesList,
          i,
          this.width,
          this.height,
          this.foodPool,
          this.debug
        )
      }
    }
  }

  handleNextTick() {
    if (pool.roundTicksElapsed >= pool.maxRoundTicks && this.shouldEvolve) {
      pool.newGeneration()
    }

    pool.roundTicksElapsed++
    if (pool.roundTicksElapsed % 2 == 0) {
      this.snakesList.forEach(snake => {
        !snake.dead && snake.getInputsAndAssignDir()
      })
    }

    this.snakesList.forEach(snake => snake.update())
  }
}

export default new Game()
