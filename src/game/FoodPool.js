import _ from 'lodash'
import config from '../config.json'
import { getRandomPosition } from '../util'

class FoodPool {
  constructor(amount, canvasWidth, canvasHeight) {
    this.amount = amount
    this.canvasWidth = canvasWidth
    this.canvasHeight = canvasHeight
    this.foodSize = config.FoodSize
    this.pulseInterval = config.FoodPulseInterval
    this.pulseTicks = this.pulseInterval
    this.color = config.Food.Color
    this.food = this.generateFood()
  }

  generateFood() {
    return _.fill(new Array(this.amount), 0).map(() => this.generateFoodPiece())
  }

  generateFoodPiece() {
    return getRandomPosition(this.canvasWidth, this.canvasHeight)
  }

  eat(foodIndex) {
    if (this.food[foodIndex]) {
      const eatenFood = this.food[foodIndex]
      setTimeout(() => {
        fill(config.Game.ClearBackground.h, config.Game.ClearBackground.s, config.Game.ClearBackground.b)
        ellipse(eatenFood.x, eatenFood.y, this.foodSize / 1.7, this.foodSize / 1.7)
      }, 700)
      

      this.food[foodIndex] = this.generateFoodPiece()
    }
  }

  draw() {
    this.food.forEach(piece => {
      this.drawFoodPiece(piece.x, piece.y, this.foodSize)
    })
  }

  drawFoodPiece(x, y, size) {
    // if (++this.pulseTicks > this.pulseInterval) {
    //   const gradient = drawingContext.createRadialGradient(
    //     x,
    //     y,
    //     0,
    //     x,
    //     y,
    //     size / 1.5
    //   )
    //   gradient.addColorStop(0, `hsla(${this.hue}, 90%, 70%, 0.2)`)
    //   gradient.addColorStop(1, `hsla(0, 0%, 0%, 0.0)`)
    //   drawingContext.fillStyle = gradient
    //   noStroke()
    //   ellipse(x, y, size * 1.5, size * 1.5)

    //   if (this.pulseTicks > 2 * this.pulseInterval) {
    //     this.pulseTicks = 0
    //   }
    // }

    noStroke()
    fill(this.color.h, this.color.s, this.color.b)
    ellipse(x, y, size / 2, size / 2)
  }
}

export default FoodPool
