//import 'game/utils';
import 'materialize-loader';
import 'global.scss';
import { pool } from 'genetics/Pool';
import { sm } from 'game/SaveManager';
import Game from 'game/Game';
import 'game/canvas-debug';

pool.init();

sm.getLoadState(() => {
  chart.data.datasets[0].data = pool.championsPerfs.slice().map(c => { return {x:c.generation,y:c.fitness}});
  chart.update();
  reset();
});

window.pool = pool;
window.Game = Game;
// Called one time at load
window.setup = () => {
  Game.setup();
  console.log(Game);
}

// Called on every frame
window.draw = () => {
  Game.draw();
}

// Reset the Canvas
window.reset = () => {
  Game.reset();
}

const showInfoBtn = document.getElementById('show-info-btn');
const hideInfoBtn = document.getElementById('hide-info-btn');
const infoHolder = document.getElementById('info-holder');

showInfoBtn.addEventListener('click', () => {
  showInfoBtn.classList.add('invisible');
  infoHolder.classList.remove('invisible');
});

hideInfoBtn.addEventListener('click', () => {
  showInfoBtn.classList.remove('invisible');
  infoHolder.classList.add('invisible');
});

//setTimeout(reset,500);
