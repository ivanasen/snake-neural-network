import config from '../config.json';
import {
  pool
} from '../genetics/Pool';
import Snake from './Snake';
import _ from 'lodash'
import charts from './charts';

class Game {
  constructor() {
    this.snakesCount = config.Population;
    this.snakesList = [];
    this.showDebug = 1;
    this.showDraw = 1;
    this.showSnakesSensors = 0;
    this.humanControlled = 0;
    this.frameCount = 0;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.setupChart();
  }

  setupChart() {
    document.addEventListener("DOMContentLoaded", e => {
      window.chart = charts.perfChart();
      window.ageChart = charts.ageChart();
    });
  }

  setup() {
    this.snakesList = [];
    const canvas = createCanvas(this.width, this.height);
    canvas.parent('sketch-holder');
    colorMode(HSB);
  }

  reset() {
    background(180, 30, 6);
    this.snakesList.forEach(snake => pool.matchResult(snake));

    this.snakesList = [];

    _.range(0, this.snakesCount).forEach(id => { 
      const snake = new Snake(this.snakesList, id, this.width, this.height);
      this.snakesList.push(snake);
    });

    if (this.showSnakesSensors) {
      this.snakesList.forEach(snake => Snake.setDebug());      
    }    

    pool.newGeneration();
  }

  draw() {
    this.clear();

    if (!this.snakesList) return;
    if (this.snakesList.some(c => c.debug)) background(51);

    this.checkDead();
    this.handleNextTick();
  }

  clear() {
    background(360, 100, 0, 0.03);
  }

  checkDead() {
    for (let i = 0; i < this.snakesList.length; i++) {
      const Snake = this.snakesList[i];
      if (snake.dead) {
        pool.matchResult(snake);    
        this.snakesList[i] = new Snake(this.snakesList, i, this.width, this.height);
      }
    }
  }

  handleNextTick() {
    // if (pool.roundTicksElapsed >= pool.maxRoundTicks) {
    //   pool.newGeneration();
    // }

    pool.roundTicksElapsed++;
    if (pool.roundTicksElapsed % 2 == 0) {      
      this.snakesList.forEach(snake => {
        !snake.dead && snake.getInputsAndAssignDir();
      })
    }

    this.snakesList.forEach(snake => snake.update());
  }

}

export default new Game();