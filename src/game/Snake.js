import config from '../config.json'
import { pool } from '../genetics/Pool'
import _ from 'lodash'
import {
  collideLineLine,
  collideLineCircle,
  collidePointRect,
  distNotSquared,
  collidePointCircle,
  getRandomPosition,
  HIT_BORDERS
} from '../util'

class Snake {
  constructor(
    snakesList,
    id,
    canvasWidth,
    canvasHeight,
    foodPool,
    debug = false
  ) {
    this.id = id
    this.snakesList = snakesList
    this.canvasWidth = canvasWidth
    this.canvasHeight = canvasHeight
    this.age = 0
    this.hue = ((Math.random() * 50) % 50) + 180
    // this.hue = 220;
    // this.hue = (Math.random() * 360) % 360;
    this.vector
    this.history = []
    this.speed = config.SnakeSpeed //maxspeed
    this.size = config.SnakeSize
    this.radius = 40 //Turning radius??? maxradius?
    this.angle = TWO_PI * Math.random() //
    this.maxAngle = TWO_PI / 9
    this.stepAngle = this.maxAngle / 20
    this.direction = 2 // LEFT RIGHT STILL
    this.whiskersize = config.WhiskerSize
    this.pos = getRandomPosition(this.canvasWidth, this.canvasHeight)
    this.lastInputLayer = _.fill(new Array(config.InputSize), 0) // Keeping it for debugging
    this.lastEvaluation = null // Same
    this.diedOn = 0
    this.debug = debug
    this.foodPool = foodPool
  }

  getDistanceToHitSensor(x, y, a) {
    //Debug;
    let minDistance = 3
    x += minDistance * Math.cos(a)
    y += minDistance * Math.sin(a)

    let lineX = x + this.whiskersize * Math.cos(a)
    let lineY = y + this.whiskersize * Math.sin(a)
    let hit = false // Is the whisker triggered ?
    let from = false // Is it me, wall or enemy ?
    let isFood = false // Is it food ?

    let shortestDistance = this.whiskersize
    //First Checking borders
    HIT_BORDERS.forEach(border => {
      const hitBorder = collideLineLine(
        border[0].x,
        border[0].y,
        border[1].x,
        border[1].y,
        x,
        y,
        lineX,
        lineY,
        true
      )

      if (hitBorder.x !== false && hitBorder.y !== false) {
        const borderDist = dist(
          x,
          y,
          hitBorder.x,
          hitBorder.y
        )
        if (borderDist < shortestDistance) {
          shortestDistance = borderDist
          hit = borderDist
          lineX = hitBorder.x
          lineY = hitBorder.y
          isFood = false
          from = true
        }
      }
    })

    let potentialColliders = []
    //Loop through circles and check if line intersects
    for (let i = 0; i < this.snakesList.length; i++) {
      let c = this.snakesList[i]
      if (i === this.id) {
        potentialColliders = potentialColliders.concat(c.history)
      } else {
        potentialColliders = potentialColliders.concat(c.history, [
          c.pos.x,
          c.pos.y
        ])
      }
    }

    for (let i = 0; i < potentialColliders.length; i++) {
      let p = potentialColliders[i]
      //if further than this.whiskersizepx discard
      if (distNotSquared(x, y, p.x, p.y) > this.whiskersize * this.whiskersize)
        continue
      let collided = collideLineCircle(
        x,
        y,
        lineX,
        lineY,
        p.x,
        p.y,
        this.size * 2
      )
      if (collided) {
        let distance = dist(x, y, collided[0], collided[1])
        if (distance < shortestDistance) {
          shortestDistance = distance
          hit = distance
          lineX = collided[0]
          lineY = collided[1]
          isFood = false
          from = true
        }
      }
    }

    const hitFood =
      this.foodPool.food
        .map(piece =>
          collideLineCircle(
            x,
            y,
            lineX,
            lineY,
            piece.x,
            piece.y,
            this.foodPool.foodSize
          )
        )
        .find(Boolean) || false

    if (hitFood) {
      hit = dist(x, y, hitFood[0], hitFood[1])
      lineX = hitFood[0]
      lineY = hitFood[1]
      isFood = true
      from = false
    }

    if (this.debug) {
      fill(360, 100, 100)
      noStroke()
      ellipse(lineX, lineY, 4)

      if (hit) {
        stroke(200, 100, 100)

        if (isFood) {
          stroke(80, 100, 100)
        }
      } else {
        stroke(40, 100, 100)
      }

      line(x, y, lineX, lineY)
    }

    const result = {
      x: lineX,
      y: lineY,
      hit: hit ? hit : this.whiskersize,
      from: from,
      isFood: isFood
    }

    return result
  }

  getInputLayer() {
    return new Promise((resolve, reject) => {
      const displayedWhiskers = config.NbWhiskers
      const inputLayer = []

      const step = TWO_PI / (displayedWhiskers * 1.2)
      for (let i = 0; i < displayedWhiskers; i++) {
        const modifier = i > displayedWhiskers / 2 ? -1 : 1
        const angle =
          this.angle + step * (i % (displayedWhiskers / 2)) * modifier
        const result = this.getDistanceToHitSensor(
          this.pos.x,
          this.pos.y,
          angle
        )

        const closestDistance = Math.min(result.hit, this.whiskersize)
        const hitNormalised = map(closestDistance, this.whiskersize, 0, 0, 1)
        inputLayer.push(hitNormalised, result.from, result.isFood)
      }

      resolve(inputLayer)
    })
  }

  update() {
    if (this.dead) return

    this.store()
    this.move()
    this.eat()
    this.show()
    this.checkCollisions()
  }

  currentUpdate = 0
  updateSpeed = 2

  getInputsAndAssignDir() {
    //return; // REMOVE ME!!
    if (this.currentUpdate >= this.updateSpeed) {
      this.age++
      this.currentUpdate = 0
      this.getInputLayer().then(inputs => {
        this.assignDir(inputs)
        this.lastInputLayer = inputs
      })
    } else {
      this.currentUpdate++
    }
  }

  assignDir(inputLayer) {
    let controller = pool.evaluateGenome(inputLayer, this.id)
    this.setPressedKey(controller)
  }

  // Outputs is an array with 3 elements [a,b,c]
  // We arbitrarily decided which is going to do what
  // I could have decided a was stay-still, b was left
  setPressedKey(outputs) {
    let value = outputs[0]
    // console.log(value);
    let newDirection = 2
    if (value > 0.55) newDirection = 1
    if (value < 0.45) newDirection = 0

    if (newDirection !== this.direction) {
      pool.matchResult(this.id, config.ChangeDirectionReward)
    }

    this.direction = newDirection
  }

  // Adds the snake position to its history if far enough from last one
  store() {
    var farEnough = false
    var lastHistory =
      this.history.length && this.history[this.history.length - 1]
    if (!!lastHistory) {
      farEnough =
        distNotSquared(lastHistory.x, lastHistory.y, this.pos.x, this.pos.y) >
        this.size * this.size + 1
    } else {
      farEnough = true
    }

    if (farEnough) {
      var currentPos = this.pos.copy()

      if (this.history.length) {
        this.history[this.history.length - 1].head = false
      }

      currentPos.head = true
      currentPos.id = this.id

      this.history.push(currentPos)

      if (this.history.length >= config.SnakeMaxLength) {
        this.history.shift()
      }
    }
  }

  setSnakesList(snakesList) {
    this.snakesList = snakesList
  }

  // Did we collide?
  checkCollisions() {
    let snakesList = this.snakesList
    if (this.history.length < 1) return false
    var potentialColliders = this.history.slice(0, -1)

    //Adding current pos and history
    potentialColliders.push([this.pos.x, this.pos.y])
    var ownHistoryIndex = potentialColliders.length
    var others = snakesList.filter(c => c.id != this.id)

    others.forEach(o => {
      potentialColliders = potentialColliders.concat(o.history)
    })

    var target = this.history[this.history.length - 1]
    var isColliding = potentialColliders.some((pos, i) => {
      var d = distNotSquared(pos.x, pos.y, target.x, target.y)
      var colliding = d < this.size * this.size
      if (colliding) {
        if (i > ownHistoryIndex) {
          this.diedOn = 1 // He died on enemy
        }
        this.stop()
      }
      return colliding
    })

    var collidesWithRect = collidePointRect(
      this.pos.x,
      this.pos.y,
      (this.canvasWidth - config.CenterEllipseWidth) / 2,
      (this.canvasHeight - config.CenterEllipseHeight) / 2,
      config.CenterEllipseWidth,
      config.CenterEllipseHeight
    )

    var isOutOfBounds =
      this.pos.x > this.canvasWidth ||
      this.pos.x < 0 ||
      this.pos.y > this.canvasHeight ||
      this.pos.y < 0
    if (isOutOfBounds || collidesWithRect) {
      this.stop()
    }
    return isColliding || isOutOfBounds || collidesWithRect
  }

  stop() {
    pool.matchResult(this.id, config.DieReward)
    this.dead = true

    this.snakesList[this.id] = new Snake(
      this.snakesList,
      this.id,
      this.canvasWidth,
      this.canvasHeight,
      this.foodPool,
      this.debug
    )
  }

  show() {
    // if (this.noDrawing == 0) {
    //     fill('rgba(255,255,255,1)');
    //     stroke(this.hue, 204, 100);
    //     ellipse(this.pos.x, this.pos.y, this.size, this.size);
    // } else {
    // if (this.debug) {
    if (this.debug) {
      this.showHistory()
    } else {
      this.showTrail()
    }

    // stroke(this.hue, 204, 100);
    // for (let i = 0; i < this.history.length; i++) {
    //     ellipse(this.history[i].x, this.history[i].y, this.size, this.size);
    // }
    // } else {
    //   fill('rgba(255,255,255,0.0)');
    //   stroke(40);
    //   ellipse(this.pos.x, this.pos.y, this.size/2, this.size/2);
    // }
    // }
  }

  showHistory() {
    stroke(this.hue, 90, 70)
    fill(this.hue, 90, 70, 0.3)
    this.history.forEach(pos => ellipse(pos.x, pos.y, this.size, this.size))

    ellipse(this.pos.x, this.pos.y, this.size, this.size)
  }

  showTrail() {
    const gradient = drawingContext.createRadialGradient(
      this.pos.x,
      this.pos.y,
      0,
      this.pos.x,
      this.pos.y,
      config.SnakeBlurSize / 2
    )
    gradient.addColorStop(0, `hsla(${this.hue}, 90%, 50%, 0.2)`)
    gradient.addColorStop(1, 'transparent')
    drawingContext.fillStyle = gradient
    noStroke()
    ellipse(this.pos.x, this.pos.y, config.SnakeBlurSize, config.SnakeBlurSize)

    fill(this.hue, 90, 70)
    ellipse(this.pos.x, this.pos.y, this.size, this.size)
  }

  setDebug(debug) {
    this.debug = debug
  }

  toggleDebug() {
    this.debug = !this.debug
  }

  move() {
    if (this.direction != 2) {
      this.angle += (this.direction === 1 ? 1 : -1) * this.stepAngle
    }
    this.pos.x += this.speed * Math.cos(this.angle)
    this.pos.y += this.speed * Math.sin(this.angle)
  }

  eat() {
    this.foodPool.food.forEach((piece, index) => {
      const eatsFood = collidePointCircle(
        this.pos.x,
        this.pos.y,
        piece.x,
        piece.y,
        this.foodPool.foodSize
      )
      if (eatsFood) {
        this.foodPool.eat(index)
        pool.matchResult(this.id, config.EatFoodReward)
      }
    })
  }
}

export default Snake
