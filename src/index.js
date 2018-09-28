//import 'game/utils';
import 'global.scss'
import { pool } from 'genetics/Pool'
import { sm } from 'game/StaticSaveManager'
import Game from 'game/Game'
import 'game/canvas-debug'
import './animationInnerContent'
import './chartButtons'

const width = $('#snakes-animation-holder').width()
const height = $('#snakes-animation-holder').height()
const game = new Game(width, height)

pool.init()

sm.getLoadState(() => {
  chart.data.datasets[0].data = pool.championsPerfs.slice().map(c => {
    return { x: c.generation, y: c.fitness }
  })
  chart.update()
})

window.pool = pool
window.Game = Game
// Called one time at load
window.setup = () => {
  game.setup()
}

// Called on every frame
window.draw = () => {
  game.draw()
}

// Reset the Canvas
window.reset = () => {
  game.reset()
}
