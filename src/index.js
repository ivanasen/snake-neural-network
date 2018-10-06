//import 'game/utils';
import 'global.scss'
import { pool } from 'genetics/PoolClient'
import Game from 'game/Game'
import './animationInnerContent'
import './chartButtons'

const width = $('#snakes-animation-holder').width()
const height = $('#snakes-animation-holder').height()
const game = new Game(width, height)

pool.init()
pool.getLoadState()

setTimeout(() => {
  pool.getChampionsPerfs().then(championsPerfs => {
    chart.data.datasets[0].data = championsPerfs
    chart.update()
  })
}, 5000)

// Called one time at load
window.setup = () => {
  game.setup()
}

setTimeout(() => {
  // Called on every frame
  window.draw = () => {
    game.draw()
  }
}, 1500)

// Reset the Canvas
window.reset = () => {
  game.reset()
}
