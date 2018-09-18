import config from '../config.json';
import {
  pool
} from '../genetics/Pool';
import Curve from './Curve';
import _ from 'lodash'
import charts from './charts';

class MainCanvas {
  constructor() {
    this.curvesCount = config.Population;
    this.curvesList = [];
    this.showDebug = 1;
    this.showDraw = 1;
    this.showCurvesSensors = 0;
    this.humanControlled = 0;
    this.frameCount = 0;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    // this.deadCount = 0;
    this.setupChart();
  }

  setupChart() {
    document.addEventListener("DOMContentLoaded", e => {
      window.chart = charts.perfChart();
      window.ageChart = charts.ageChart();
    });
  }

  setup() {
    this.curvesList = [];
    const canvas = createCanvas(this.width, this.height);
    canvas.parent('sketch-holder');
    colorMode(HSB);
  }

  reset() {
    background(180, 30, 6);
    this.curvesList.forEach(curve => pool.matchResult(curve));

    this.curvesList = [];
    // this.deadCount = 0;

    _.range(0, this.curvesCount).forEach(id => { 
      const curve = new Curve(this.curvesList, id, this.width, this.height);
      this.curvesList.push(curve);
    });

    if (this.showCurvesSensors) {
      this.curvesList.forEach(curve => curve.setDebug());      
    }    

    pool.newGeneration();
  }

  // reset() {
  //   background(0, 0, 0);
  //   this.curvesList = [];
  //   this.waitForReset = 0;

  //   _.range(0, this.curvesCount).forEach(id => { 
  //     const curve = new Curve(this.curvesList, id, this.width, this.height);
  //     this.curvesList.push(curve);
  //   });

  //   if (this.showCurvesSensors) {
  //     this.curvesList.forEach(curve => curve.setDebug());      
  //   }

  //   // if (this.humanControlled) {
  //   //   this.curvesList[1].humanControlled = true;
  //   //   return;
  //   // }

  //   pool.roundTicksElapsed = 0;
  //   // pool.pickPlayers();
  // }

  draw() {
    this.clear();

    if (!this.curvesList) return;
    if (this.curvesList.some(c => c.debug)) background(51);

    this.checkDead();
    this.handleNextTick();
  }

  clear() {
    background(360, 100, 0, 0.03);
  }

  checkDead() {
    for (let i = 0; i < this.curvesList.length; i++) {
      const curve = this.curvesList[i];
      if (curve.dead) {
        pool.matchResult(curve);    
        this.curvesList[i] = new Curve(this.curvesList, i, this.width, this.height);
      }
    }
  }

  handleNextTick() {
    // if (pool.roundTicksElapsed >= pool.maxRoundTicks) {
    //   pool.newGeneration();
    // }

    pool.roundTicksElapsed++;
    if (pool.roundTicksElapsed % 2 == 0) {      
      this.curvesList.forEach(curve => {
        !curve.dead && curve.getInputsAndAssignDir();
      })
    }

    this.curvesList.forEach(curve => curve.update());
  }

}

export let Game = new MainCanvas();