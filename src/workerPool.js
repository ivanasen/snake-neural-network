import { Pool } from 'threads'

const pool = new Pool()

pool.run(getInputLayer, ['http://localhost:8080/scripts/workerUtil.js'])

function getInputLayer(
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

export default pool
