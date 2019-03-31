import config from './config.json'

const _collideDebug = false

export const distNotSquared = (x1, y1, x2, y2) =>
  (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)

export const collideLineLine = (
  x1,
  y1,
  x2,
  y2,
  x3,
  y3,
  x4,
  y4,
  calcIntersection
) => {
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

export const collideLineCircle = (x1, y1, x2, y2, cx, cy, diameter) => {
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

export const collidePointCircle = (x, y, cx, cy, d) =>
  distNotSquared(x, y, cx, cy) <= (d / 2) * (d / 2)

export const collidePointLine = (px, py, x1, y1, x2, y2, buffer) => {
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

export const collideLineEllipse = (x1, y1, x2, y2, cx, cy, rx, ry) => {
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

export const collidePointEllipse = (x, y, cx, cy, rx, ry) =>
  ((x - cx) * (x - cx)) / (rx * rx) + ((y - cy) * (y - cy)) / (ry * ry) <= 1

export const getRandomPosition = (width, height) => {
  const x = Math.random() * width
  const y = Math.random() * height
  return createVector(x, y)
}

export const collidePointRect = (pointX, pointY, x, y, xW, yW) => {
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

export const HIT_BORDERS = [
  [topLeft, topRight],
  [topLeft, bottomLeft],
  [topRight, bottomRight],
  [bottomLeft, bottomRight],
  [centerTopLeft, centerTopRight],
  [centerTopLeft, centerBottomLeft],
  [centerTopRight, centerBottomRight],
  [centerBottomLeft, centerBottomRight]
]