const _collideDebug = false

const distNotSquared = (x1, y1, x2, y2) =>
  (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)

const collideLineLine = (x1, y1, x2, y2, x3, y3, x4, y4, calcIntersection) => {
  let intersection

  // calculate the distance to intersection point
  const uA =
    ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) /
    ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))
  const uB =
    ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) /
    ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))

  let intersectionX
  let intersectionY

  // if uA and uB are between 0-1, lines are colliding
  if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
    if (_collideDebug || calcIntersection) {
      // calc the point where the lines meet
      intersectionX = x1 + uA * (x2 - x1)
      intersectionY = y1 + uA * (y2 - y1)
    }

    if (calcIntersection) {
      intersection = {
        x: intersectionX,
        y: intersectionY
      }
      return intersection
    } else {
      return true
    }
  }

  if (calcIntersection) {
    intersection = {
      x: false,
      y: false
    }
    return intersection
  }
  return false
}

const collideLineCircle = (x1, y1, x2, y2, cx, cy, diameter) => {
  // is either end INSIDE the circle?
  // if so, return true immediately
  const inside1 = collidePointCircle(x1, y1, cx, cy, diameter)
  const inside2 = collidePointCircle(x2, y2, cx, cy, diameter)
  if (inside1 || inside2) return [cx, cy]

  // get length of the line
  let distX = x1 - x2
  let distY = y1 - y2
  const len = distX * distX + distY * distY

  // get dot product of the line and circle
  const dot = ((cx - x1) * (x2 - x1) + (cy - y1) * (y2 - y1)) / len

  // find the closest point on the line
  const closestX = x1 + dot * (x2 - x1)
  const closestY = y1 + dot * (y2 - y1)

  // is this point actually on the line segment?
  // if so keep going, but if not, return false
  const onSegment = collidePointLine(closestX, closestY, x1, y1, x2, y2)
  if (!onSegment) return false

  // draw a debug circle at the closest point on the line
  if (_collideDebug) {
    ellipse(closestX, closestY, 10, 10)
  }

  // get distance to closest point
  distX = closestX - cx
  distY = closestY - cy
  const distance = Math.sqrt(distX * distX + distY * distY)

  if (distance <= diameter / 2) {
    return [closestX, closestY]
  }
  return false
}

const collidePointCircle = (x, y, cx, cy, d) =>
  distNotSquared(x, y, cx, cy) <= (d / 2) * (d / 2)

const collidePointLine = (px, py, x1, y1, x2, y2, buffer) => {
  // get distance from the point to the two ends of the line
  const d1 = dist(px, py, x1, y1)
  const d2 = dist(px, py, x2, y2)

  // get the length of the line
  const lineLen = dist(x1, y1, x2, y2)

  // since floats are so minutely accurate, add a little buffer zone that will give collision
  if (!buffer) {
    buffer = 0.1
  } // higher # = less accurate

  // if the two distances are equal to the line's length, the point is on the line!
  // note we use the buffer here to give a range, rather than one #
  return d1 + d2 >= lineLen - buffer && d1 + d2 <= lineLen + buffer
}

const collidePointEllipse = (x, y, cx, cy, rx, ry) =>
  ((x - cx) * (x - cx)) / (rx * rx) + ((y - cy) * (y - cy)) / (ry * ry) <= 1

const collidePointRect = (pointX, pointY, x, y, xW, yW) => {
  if (
    pointX >= x && // right of the left edge AND
    pointX <= x + xW && // left of the right edge AND
    pointY >= y && // below the top AND
    pointY <= y + yW
  ) {
    // above the bottom
    return true
  }
  return false
}

const dist = (x1, y1, x2, y2) =>
  Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2))

const map = (value, upperValue, lowerValue, lowerTarget, upperTarget) => {
  return value / upperValue
}

const getDistanceToHitSensor = (
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
) => {
  //Debug;
  let minDistance = 3
  x += minDistance * Math.cos(a)
  y += minDistance * Math.sin(a)

  let lineX = x + whiskerSize * Math.cos(a)
  let lineY = y + whiskerSize * Math.sin(a)
  let hit = 0 // Is the whisker triggered ?
  let from = 0 // Is it me, wall or enemy ?
  let isFood = 0 // Is it food ?

  let shortestDistance = whiskerSize

  for (let i = 0; i < borders.length; i += 4) {
    const hitBorder = collideLineLine(
      borders[i],
      borders[i + 1],
      borders[i + 2],
      borders[i + 3],
      x,
      y,
      lineX,
      lineY,
      true
    )

    if (hitBorder.x !== 0 && hitBorder.y !== 0) {
      const borderDist = dist(x, y, hitBorder.x, hitBorder.y)
      if (borderDist < shortestDistance) {
        shortestDistance = borderDist
        hit = borderDist
        lineX = hitBorder.x
        lineY = hitBorder.y
        isFood = 0
        from = 1
      }
    }
  }

  //Loop through circles and check if line intersects
  let potentialColliders = snakesList
  // for (let i = 0; i < snakesList.length; i++) {
  //   let c = snakesList[i]
  //   if (i === id) {
  //     potentialColliders = potentialColliders.concat(c.history)
  //   } else {
  //     potentialColliders = potentialColliders.concat(c.history, [
  //       c.pos.x,
  //       c.pos.y
  //     ])
  //   }
  // }

  for (let i = 0; i < potentialColliders.length; i += 2) {
    const colliderX = potentialColliders[i]
    const colliderY = potentialColliders[i + 1]
    //if further than this.whiskersizepx discard
    if (distNotSquared(x, y, colliderX, colliderY) > whiskerSize * whiskerSize)
      continue
    let collided = collideLineCircle(
      x,
      y,
      lineX,
      lineY,
      colliderX,
      colliderY,
      size * 2
    )
    if (collided) {
      let distance = dist(x, y, collided[0], collided[1])
      if (distance < shortestDistance) {
        shortestDistance = distance
        hit = distance
        lineX = collided[0]
        lineY = collided[1]
        isFood = 0
        from = 1
      }
    }
  }

  // Check food
  for (let i = 0; i < food.length; i += 2) {
    const hitFood = collideLineCircle(
      x,
      y,
      lineX,
      lineY,
      food[i],
      food[i + 1],
      foodSize
    )
    if (hitFood) {
      const distance = dist(x, y, hitFood[0], hitFood[1])
      if (distance < shortestDistance) {
        hit = distance
        lineX = hitFood[0]
        lineY = hitFood[1]
        isFood = 1
        from = 0
      }
    }
  }

  // const hitFood =
  //   food
  //     .map(piece =>
  //       collideLineCircle(x, y, lineX, lineY, piece.x, piece.y, foodSize)
  //     )
  //     .find(Boolean) || 0

  // if (hitFood) {
  //   hit = dist(x, y, hitFood[0], hitFood[1])
  //   lineX = hitFood[0]
  //   lineY = hitFood[1]
  //   isFood = 1
  //   from = 0
  // }

  return {
    x: lineX,
    y: lineY,
    hit: hit ? hit : whiskerSize,
    from: from,
    isFood: isFood
  }
}

module.exports = function getInputLayer(
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
    borders,
    baseAngle
  },
  done
) {
  const snakesListTyped = new Float32Array(snakesList)
  const foodTyped = new Float32Array(food)
  const bordersTyped = new Float32Array(borders)

  const inputLayer = []
  const step = (Math.PI * 2) / (displayedWhiskers * 1.2)

  for (let i = 0; i < displayedWhiskers; i++) {
    const modifier = i > displayedWhiskers / 2 ? -1 : 1
    const angle = baseAngle + step * (i % (displayedWhiskers / 2)) * modifier

    const result = getDistanceToHitSensor(
      x,
      y,
      angle,
      whiskerSize,
      snakesListTyped,
      id,
      size,
      foodTyped,
      foodSize,
      bordersTyped
    )

    const closestDistance = Math.min(result.hit, whiskerSize)
    const hitNormalised = map(closestDistance, whiskerSize, 0, 0, 1)
    inputLayer.push(hitNormalised, result.from, result.isFood)
  }
  done(inputLayer)
}
