import _ from 'lodash'
import config from '../config.json'
import { getRandomPosition } from '../util'

class FoodPool {
  constructor(amount, canvasWidth, canvasHeight) {
    this.amount = amount
    this.canvasWidth = canvasWidth
    this.canvasHeight = canvasHeight
    this.foodSize = config.foodSize
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
      this.food[foodIndex] = this.generateFoodPiece()
    }
  }

  draw() {
    this.food.forEach(piece => {
      this.drawFoodPiece(piece.x, piece.y, this.foodSize)
    })
  }

  drawFoodPiece(x, y, size) {
    const gradient = drawingContext.createRadialGradient(
      x,
      y,
      0,
      x,
      y,
      size / 2
    )
    gradient.addColorStop(0, `hsla(200, 90%, 70%, 0.1)`)
    gradient.addColorStop(1, 'transparent')
    drawingContext.fillStyle = gradient
    noStroke()
    ellipse(x, y, size, size)

    fill(200, 40, 70)
    ellipse(x, y, size / 3, size / 3)
  }

  // showFood() {
  //   if (this.foodPulseCounter++ > this.foodPulseInterval) {
  //     const gradient = drawingContext.createRadialGradient(
  //       this.pos.x,
  //       this.pos.y,
  //       0,
  //       this.pos.x,
  //       this.pos.y,
  //       config.foodSize * 0.75
  //     )
  //     gradient.addColorStop(0, `hsla(${this.hue}, 90%, 50%, 0.2)`)
  //     gradient.addColorStop(1, 'transparent')
  //     drawingContext.fillStyle = gradient
  //     noStroke()
  //     ellipse(this.food.x, this.food.y, this.foodSize * 1.5, this.foodSize * 1.5)
  
  //     fill(this.hue, 90, 70)
  //     ellipse(this.food.x, this.food.y, this.foodSize, this.foodSize)

  //     this.foodPulseCounter = 0
  //   }
  // }
}

export default FoodPool
