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
  const distance = sqrt(distX * distX + distY * distY)

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

const collideLineEllipse = (x1, y1, x2, y2, cx, cy, rx, ry) => {
  // is either end INSIDE the ellipse?
  // if so, return true immediately
  const inside1 = collidePointEllipse(x1, y1, cx, cy, rx, ry)
  const inside2 = collidePointEllipse(x2, y2, cx, cy, rx, ry)
  if (inside1 || inside2) return true

  // get length of the line
  // let distX = x1 - x2;
  // let distY = y1 - y2;
  // const len = ((distX * distX) + (distY * distY));

  // // get dot product of the line and circle
  // const dot = (((cx - x1) * (x2 - x1)) + ((cy - y1) * (y2 - y1))) / len;

  // // find the closest point on the line
  // const closestX = x1 + (dot * (x2 - x1));
  // const closestY = y1 + (dot * (y2 - y1));

  // // is this point actually on the line segment?
  // // if so keep going, but if not, return false
  // const onSegment = collidePointLine(closestX, closestY, x1, y1, x2, y2);
  // if (!onSegment) return false;

  // // draw a debug circle at the closest point on the line
  // if (_collideDebug) {
  //   ellipse(closestX, closestY, 10, 10);
  // }

  // // get distance to closest point
  // distX = closestX - cx;
  // distY = closestY - cy;
  // const distance = sqrt((distX * distX) + (distY * distY));

  // if (distance <= diameter / 2) {
  //   return [closestX, closestY];
  // }
  return false
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

const dist = (x1, y1, x2, y2) => Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2))

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
