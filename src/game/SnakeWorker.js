import _ from 'lodash'

import config from '../config.json'
import { pool } from '../genetics/PoolClient'
import {
  // collideLineCircle,
  // collideLineLine,
  // collidePointLine,
  collidePointRect,
  distNotSquared,
  collidePointCircle,
  getRandomPosition
} from '../util'
import workerPool from '../workerPool'

const topLeft = {
  x: 0,
  y: 0
}

const topRight = {
  x: window.innerWidth,
  y: 0
}

const bottomLeft = {
  x: 0,
  y: window.innerHeight
}

const bottomRight = {
  x: window.innerWidth,
  y: window.innerHeight
}

const centerTopLeft = {
  x: (window.innerWidth - config.CenterEllipseWidth) / 2,
  y: (window.innerHeight - config.CenterEllipseHeight) / 2
}

const centerTopRight = {
  x: (window.innerWidth + config.CenterEllipseWidth) / 2,
  y: (window.innerHeight - config.CenterEllipseHeight) / 2
}

const centerBottomLeft = {
  x: (window.innerWidth - config.CenterEllipseWidth) / 2,
  y: (window.innerHeight + config.CenterEllipseHeight) / 2
}

const centerBottomRight = {
  x: (window.innerWidth + config.CenterEllipseWidth) / 2,
  y: (window.innerHeight + config.CenterEllipseHeight) / 2
}

const HIT_BORDERS = [
  [topLeft, topRight],
  [topLeft, bottomLeft],
  [topRight, bottomRight],
  [bottomLeft, bottomRight],
  [centerTopLeft, centerTopRight],
  [centerTopLeft, centerBottomLeft],
  [centerTopRight, centerBottomRight],
  [centerBottomLeft, centerBottomRight]
]

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

  getDistanceToHitSensor(
    x,
    y,
    a,
    whiskerSize,
    snakesList,
    id,
    size,
    food,
    foodSize,
    borders
  ) {
    //Debug;
    let minDistance = 3
    x += minDistance * Math.cos(a)
    y += minDistance * Math.sin(a)

    let lineX = x + whiskerSize * Math.cos(a)
    let lineY = y + whiskerSize * Math.sin(a)
    let hit = false // Is the whisker triggered ?
    let from = false // Is it me, wall or enemy ?
    let isFood = false // Is it food ?

    let shortestDistance = whiskerSize

    //Check borders
    borders.forEach(border => {
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
        const borderDist = dist(x, y, hitBorder.x, hitBorder.y)
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

    //Loop through circles and check if line intersects
    let potentialColliders = []
    for (let i = 0; i < snakesList.length; i++) {
      let c = snakesList[i]
      if (i === id) {
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
      if (distNotSquared(x, y, p.x, p.y) > whiskerSize * whiskerSize) continue
      let collided = collideLineCircle(x, y, lineX, lineY, p.x, p.y, size * 2)
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

    // Check food
    const hitFood =
      food
        .map(piece =>
          collideLineCircle(x, y, lineX, lineY, piece.x, piece.y, foodSize)
        )
        .find(Boolean) || false

    if (hitFood) {
      hit = dist(x, y, hitFood[0], hitFood[1])
      lineX = hitFood[0]
      lineY = hitFood[1]
      isFood = true
      from = false
    }

    return {
      x: lineX,
      y: lineY,
      hit: hit ? hit : whiskerSize,
      from: from,
      isFood: isFood
    }
  }

  getInputLayer(
    {
      displayedWhiskers,
      x,
      y,
      whiskerSize,
      snakesList,
      id,
      size,
      food,
      foodSize,
      borders
    },
    done
  ) {
    const inputLayer = []

    const step = (Math.PI * 2) / (displayedWhiskers * 1.2)

    for (let i = 0; i < displayedWhiskers; i++) {
      const modifier = i > displayedWhiskers / 2 ? -1 : 1
      const angle = angle + step * (i % (displayedWhiskers / 2)) * modifier

      const result = getDistanceToHitSensor(
        x,
        y,
        angle,
        whiskerSize,
        snakesList,
        id,
        size,
        food,
        foodSize,
        borders
      )

      const closestDistance = Math.min(result.hit, whiskerSize)
      const hitNormalised = map(closestDistance, whiskerSize, 0, 0, 1)
      inputLayer.push(hitNormalised, result.from, result.isFood)
    }

    done(inputLayer)
  }

  getInputLayerAsync() {
    return new Promise((resolve, reject) => {
      const whiskerSize = this.whiskersize

      const snakesList = this.snakesList.map(snake => ({
        history: snake.history.map(item => ({ x: item.x, y: item.y })),
        pos: { x: snake.pos.x, y: snake.pos.y }
      }))
      const id = this.id
      const size = this.size
      const food = this.foodPool.food.map(food => ({ x: food.x, y: food.y }))
      const foodSize = this.foodPool.foodSize

      const displayedWhiskers = config.NbWhiskers

      workerPool
        .send({
          displayedWhiskers,
          x: this.pos.x,
          y: this.pos.y,
          whiskerSize,
          snakesList,
          id,
          size,
          food,
          foodSize,
          borders: HIT_BORDERS,
          baseAngle: this.angle
        })
        .on('done', function(response) {
          resolve(response)
        })
        .on('error', function(error) {
          console.error('Worker errored:', error)
          resolve(error)
        })
        .on('exit', function() {
          console.log('Worker has been terminated.')
          resolve('sef')
        })
    })
  }

  drawWhisker(x, y, x1, y1, isFood, hit) {
    fill(360, 100, 100)
    noStroke()
    ellipse(x1, y1, 4)

    if (hit) {
      stroke(200, 100, 100)

      if (isFood) {
        stroke(80, 100, 100)
      }
    } else {
      stroke(40, 100, 100)
    }

    line(x, y, x1, y1)
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
    if (this.currentUpdate >= this.updateSpeed) {
      this.age++
      this.currentUpdate = 0
      this.getInputLayerAsync().then(inputs => {
        this.lastInputLayer = inputs

        pool.evaluateGenome(this.lastInputLayer, this.id).then(pressedKey => {
          if (pressedKey.data) {
            this.setPressedKey(pressedKey.data)
          }
        })
        // let controller = Math.random();
        //console.log(inputs,controller);
      })
    } else {
      this.currentUpdate++
    }

    //return; // REMOVE ME!!
    // if (this.currentUpdate >= this.updateSpeed) {
    //   this.age++
    //   this.currentUpdate = 0
    //   const inputs = this.getInputLayer()

    //   this.lastInputLayer = inputs
    // } else {
    //   this.currentUpdate++
    // }

    // //Add sensorsData to Inputs?
    // const pressedKey = pool.evaluateGenome(this.lastInputLayer, this.id)
    // // let controller = Math.random();
    // //console.log(inputs,controller);
    // this.setPressedKey(pressedKey)
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
    // const gradient = drawingContext.createRadialGradient(
    //   this.pos.x,
    //   this.pos.y,
    //   0,
    //   this.pos.x,
    //   this.pos.y,
    //   config.SnakeBlurSize / 2
    // )
    // gradient.addColorStop(0, `hsla(${this.hue}, 90%, 50%, 0.2)`)
    // gradient.addColorStop(1, 'transparent')
    // drawingContext.fillStyle = gradient
    // noStroke()
    // ellipse(this.pos.x, this.pos.y, config.SnakeBlurSize, config.SnakeBlurSize)

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
