//import 'game/utils';
import 'global.scss';
import { pool } from 'genetics/Pool';
import { sm } from 'game/SaveManager';
import { Game } from 'game/canvas-setup';
import 'game/canvas-debug';

pool.init();

sm.getLoadState(() => {
  // chart.data.datasets[0].data = pool.championsPerfs.slice().map(c => { return {x:c.generation,y:c.fitness}});
  // chart.update();
  reset();
});

window.pool = pool;
window.Game = Game;
// Called one time at load
window.setup = () => {
  Game.setup();
  console.log(Game);
}

// Reset the Canvas
window.reset = () => {
  Game.reset();
}

// Called on every frame
window.draw = () => {
  Game.draw();
}

//setTimeout(reset,500);
