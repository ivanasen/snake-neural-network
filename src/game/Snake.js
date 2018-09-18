import config from '../config.json';
import Game from 'game/Game';
import { pool } from '../genetics/Pool';
import _ from 'lodash';
import {
    collideLineLine,
    collideLineCircle,
    collidePointEllipse,
    distNotSquared,
    collidePointCircle
} from '../util';


const topLeft = {
    x: 0,
    y: 0
};

const topRight = {
    x: window.innerWidth,
    y: 0
};

const bottomLeft = {
    x: 0,
    y: window.innerHeight
};

const bottomRight = {
    x: window.innerWidth,
    y: window.innerHeight
};

const centerTopLeft = {
    x: (window.innerWidth - config.centerEllipseWidth) / 2,
    y: (window.innerHeight - config.centerEllipseHeight) / 2
};

const centerTopRight = {
    x: (window.innerWidth + config.centerEllipseWidth) / 2,
    y: (window.innerHeight - config.centerEllipseHeight) / 2
};

const centerBottomLeft = {
    x: (window.innerWidth - config.centerEllipseWidth) / 2,
    y: (window.innerHeight + config.centerEllipseHeight) / 2
};

const centerBottomRight = {
    x: (window.innerWidth + config.centerEllipseWidth) / 2,
    y: (window.innerHeight + config.centerEllipseHeight) / 2
};

const HIT_BORDERS = [
    [topLeft, topRight],
    [topLeft, bottomLeft],
    [topRight, bottomRight],
    [bottomLeft, bottomRight],
    [centerTopLeft, centerTopRight],
    [centerTopLeft, centerBottomLeft],
    [centerTopRight, centerBottomRight],
    [centerBottomLeft, centerBottomRight],
];

class Snake {
    constructor(snakesList, id, canvasWidth, canvasHeight) {
        this.id = id;
        this.snakesList = snakesList;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.age = 0;
        this.hue = (Math.random() * 50) % 50 + 180;
        // this.hue = 220;
        // this.hue = (Math.random() * 360) % 360;
        this.vector;
        this.history = [];        
        this.speed = config.snakeSpeed; //maxspeed
        this.size = config.snakeSize;
        this.radius = 40; //Turning radius??? maxradius?
        this.angle = TWO_PI * Math.random(); //
        this.maxAngle = TWO_PI / 9;
        this.stepAngle = this.maxAngle / 20;
        //this.holeLeft = 2 * Math.PI * this.§_-MF§.radius;
        this.direction = 2; // LEFT RIGHT STILL
        this.whiskersize = config.whiskerSize;
        this.pos = this.randomPos();
        this.lastInputLayer = _.fill(new Array(config.InputSize), 0); // Keeping it for debugging
        this.lastEvaluation = null; // Same
        this.diedOn = 0;
        this.foodPosition = this.randomPos();
    }

    randomPos() {
        const x = Math.random() * this.canvasWidth;
        let y;
        if (x > (this.canvasWidth - config.centerEllipseWidth) / 2 &&
            x < (this.canvasWidth + config.centerEllipseWidth) / 2) {
            y = Math.random() > 0.5 ? 
                ((Math.random() * (this.canvasHeight - config.centerEllipseHeight) / 2) + (this.canvasHeight + config.centerEllipseHeight) / 2) :
                (Math.random() * ((this.canvasHeight - config.centerEllipseHeight) / 2));
        } else {
            y = Math.random() * this.canvasHeight;
        }

        return createVector(x, y);
    }
    // Only used by Human Player
    updateDir() {
        const left = keyIsDown(LEFT_ARROW);
        const right = keyIsDown(RIGHT_ARROW);
        if (left) {
            this.direction = 0;
        }

        if (right) {
            this.direction = 1;
        }

        if (!left && !right) {
            this.direction = 2;
        }
    }

    getDistanceToHitSensor(x, y, a) {
        //Debug;
        let minDistance = 3;
        x += minDistance * Math.cos(a);
        y += minDistance * Math.sin(a);

        let lineX = x + this.whiskersize * Math.cos(a);
        let lineY = y + this.whiskersize * Math.sin(a);
        let hit = false; // Is the whisker triggered ?
        let from = false; // Is it me&wall or enemy?
        let isHead = false; // Is it the enemy head?
        let food = false;

        let shorttestDistance = this.whiskersize;
        //First Checking borders
        let hitBorders = HIT_BORDERS.map(b => {
            let hit2 = collideLineLine(b[0].x, b[0].y, b[1].x, b[1].y, x, y, lineX, lineY, true);

            return hit2.x == false && hit2.y == false ?
                false : [hit2.x, hit2.y];
        }).find(Boolean) || false;

        if (hitBorders) {
            hit = dist(this.pos.x, this.pos.y, hitBorders[0], hitBorders[1]);
            shorttestDistance = hit;
            lineX = hitBorders[0];
            lineY = hitBorders[1];
            from = false;
        }

        let potentialColliders = [];
        //Loop through circles and check if line intersects
        for (let i = 0; i < this.snakesList.length; i++) {
            let c = this.snakesList[i];
            let history = c.history.slice();
            if (i == this.id) {
                potentialColliders = potentialColliders.concat(c.history);
            } else {
                potentialColliders = potentialColliders.concat(c.history, [c.pos.x, c.pos.y]);
            }
        }

        for (let i = 0; i < potentialColliders.length; i++) {
            let p = potentialColliders[i];
            //if further than this.whiskersizepx discard
            if (distNotSquared(x, y, p.x, p.y) > this.whiskersize * this.whiskersize)
                continue;
            let collided = collideLineCircle(x, y, lineX, lineY, p.x, p.y, this.size * 2)
            if (collided) {
                //console.log('Whisker touching!!',collided);
                let distance = dist(x, y, collided[0], collided[1]);
                if (distance < shorttestDistance) {
                    shorttestDistance = distance;
                    hit = distance;
                    lineX = collided[0];
                    lineY = collided[1];
                    from = (p.id != this.id);
                    isHead = p.head ?
                        1 :
                        0;
                }

            }
        }

        if (this.debug) {

            fill(255, 0, 0);
            stroke(225, 204, 0);
            ellipse(lineX, lineY, 4)
            ellipse(x, y, 2);

            //let result = [this.pos.x+100*cos(angle),this.pos.y+100*sin(angle)];
            if (hit) {
                stroke(255, 0, 0);
                if (from) {
                    stroke(0, 255, 0);
                }
                if (isHead) {
                    stroke(0, 0, 255);
                }
            } else {
                stroke(225, 204, 0);
            };
            line(x, y, lineX, lineY);
        }

        //fill(255,0,0);
        const result = {
            x: lineX,
            y: lineY,
            hit: hit,
            from: from,
            isHead: isHead,
            food: food
        };

        return result;
    }

    getInputLayer() {
        //loadPixels(); // Nope too heavy

        let displayedWhiskers = config.nbWhiskers;
        //let inputLayer = Array.from(Array(displayedWhiskers * 4)).map(x => 0);
        let inputLayer = _.fill(new Array(displayedWhiskers * config.inputsPerWhisker), 0);

        let step = TWO_PI / (displayedWhiskers * 1.2);
        for (let i = 0; i < displayedWhiskers; i++) {
            let modifier = i > displayedWhiskers / 2 ? -1 : 1;
            let angle = this.angle + step * (i % (displayedWhiskers / 2)) * modifier;
            let x = this.pos.x;
            let y = this.pos.y;
            let result = this.getDistanceToHitSensor(x, y, angle);
            if (result.hit) {
                let index = i * 3;
                //  inputLayer[index] = 1;
                result.hit = Math.min(result.hit, this.whiskersize);
                inputLayer[index] = 1 - map(result.hit, 0, this.whiskersize, 0, 1);
                inputLayer[index + 1] = result.from;
                inputLayer[index + 2] = result.isHead;
            }
        }
        return inputLayer;
    }

    update() {
        if (this.dead) {
            //this.getInputLayer();
            if (Game.showDraw) this.showSkeleton();
            return;
        } else {
            // this.history.slice(0,-1).map(c => {
            //   fill(0,0,255);
            //   ellipse(c.x,c.y,this.size);
            // });

            //   if (this.humanControlled) {
            //     this.updateDir();
            //   }

            //   this.shouldDraw();            
            this.store();
            this.move();
            this.eat();
            if (Game.showDraw) this.show();
            this.checkCollisions();
        }


    }

    eat() {
        const collidesFood = collidePointCircle(
            this.pos.x, 
            this.pos.y, 
            this.foodPosition.x,
            this.foodPosition.y, 
            config.foodSize);
        if (collidesFood) {
            this.foodPosition = this.randomPos();
            pool.matchResult(curve, 10);
        }
    }

    currentUpdate = 0;
    updateSpeed = 2;

    getInputsAndAssignDir() {
        //return; // REMOVE ME!!
        if (this.currentUpdate >= this.updateSpeed) {
            this.age++;
            this.currentUpdate = 0;
            let inputs = this.getInputLayer();
            this.lastInputLayer = inputs;
        } else {
            this.currentUpdate++;
        }

        //Add sensorsData to Inputs?
        let controller = pool.evaluateGenome(this.lastInputLayer, this.id);
        // let controller = Math.random();
        //console.log(inputs,controller);
        this.lastController = controller;
        this.setPressedKey(controller);
    }

    // Outputs is an array with 3 elements [a,b,c]
    // We arbitrarily decided which is going to do what
    // I could have decided a was stay-still, b was left
    setPressedKey(outputs) {
        var value = outputs[0];
        // console.log(value);
        this.direction = 2;
        if (outputs > 0.55) this.direction = 1;
        if (outputs < .45) this.direction = 0;
    }

    // Adds the snake position to its history if far enough from last one
    store() {
        var farEnough = false;
        var lastHistory = this.history.length && this.history[this.history.length - 1];
        if (!!lastHistory) {
            farEnough = distNotSquared(lastHistory.x, lastHistory.y, this.pos.x, this.pos.y) > ((this.size * this.size) + 1);
        } else {
            farEnough = true;
        }

        if (farEnough) {
            var currentPos = this.pos.copy();

            if (this.history.length) {
                this.history[this.history.length - 1].head = false;
            }

            currentPos.head = true;
            currentPos.id = this.id;

            this.history.push(currentPos);

            if (this.history.length >= config.snakeMaxLength) {
                this.history.shift();
            }
        }
    }

    setSnakesList(snakesList) {
        this.snakesList = snakesList;
    }

    // Did we collide?
    checkCollisions() {
        let snakesList = this.snakesList;
        if (this.history.length < 1)
            return false;
        var potentialColliders = this.history.slice(0, -1);

        //Adding current pos and history
        potentialColliders.push([this.pos.x, this.pos.y]);
        var ownHistoryIndex = potentialColliders.length;
        var others = snakesList.filter(c => c.id != this.id);


        others.forEach(o => {
            potentialColliders = potentialColliders.concat(o.history);
        });


        var target = this.history[this.history.length - 1];
        var isColliding = potentialColliders.some((pos, i) => {
            var d = distNotSquared(pos.x, pos.y, target.x, target.y);
            var colliding = d < this.size * this.size;
            if (colliding) {
                if (i > ownHistoryIndex) {
                    this.diedOn = 1; // He died on enemy
                }                
                if (Game.showDraw) this.showSkeleton(pos, target);
                this.stop();
            };
            return colliding;
        });

        var collidesWithEllipse = collidePointEllipse(
            this.pos.x, 
            this.pos.y, 
            this.canvasWidth / 2, 
            this.canvasHeight / 2, 
            config.centerEllipseWidth / 2, 
            config.centerEllipseHeight / 2
        )

        var isOutOfBounds = this.pos.x > this.canvasWidth || this.pos.x < 0 || this.pos.y > this.canvasHeight || this.pos.y < 0;
        if (isOutOfBounds || collidesWithEllipse) {
            if (Game.showDraw) this.showSkeleton(this.pos);            
            this.stop();
        }
        return isColliding || isOutOfBounds || collidesWithEllipse;
    }

    // Debug snake skeleton
    showSkeleton(pos, target) {
        pos = pos || this.pos;
        this.history.slice(0, -1).map(c => {
            if (this.id <= 0) {
                stroke(255, 90, 137);
                fill(251, 71, 107);
            } else {
                fill(102, 51, 153);
                stroke(110, 80, 187);
            }

            // ellipse(c.x, c.y, this.size);
        });
        if (target) {
            fill(255, 0, 0);
            // ellipse(target.x, target.y, this.size);
        }
        fill(0, 255, 0);
        // ellipse(pos.x, pos.y, this.size);
    }

    stop() {
        //console.log('RIP',this.id);        
        this.dead = true;
    }

    show() {

        // if (this.noDrawing == 0) {
        //     fill('rgba(255,255,255,1)');
        //     stroke(this.hue, 204, 100);            
        //     ellipse(this.pos.x, this.pos.y, this.size, this.size);
        // } else {
        // if (this.debug) {

        if (!this.debug) {
            const gradient = drawingContext.createRadialGradient(
                this.pos.x, 
                this.pos.y, 
                0,
                this.pos.x,
                this.pos.y, 
                config.snakeBlurSize / 2);
            gradient.addColorStop(0, `hsla(${this.hue}, 90%, 50%, 0.2)`);
            gradient.addColorStop(1, 'transparent');
            drawingContext.fillStyle = gradient;

            noStroke();
            ellipse(this.pos.x, this.pos.y, config.snakeBlurSize, config.snakeBlurSize);

            fill(this.hue, 90, 70);
            ellipse(this.pos.x, this.pos.y, this.size, this.size);
        }

        // stroke(this.hue, 204, 100);
        // for (let i = 0; i < this.history.length; i++) {
        //     ellipse(this.history[i].x, this.history[i].y, this.size, this.size);            
        // }   
        // } else {
        //   fill('rgba(255,255,255,0.0)');
        //   stroke(40);
        //   ellipse(this.pos.x, this.pos.y, this.size/2, this.size/2);
        // }
        // }
    }

    setDebug() {
        this.debug = true;
    }

    toggleDebug() {
        this.debug = !this.debug;
    }

    move() {
        if (this.direction != 2) {
            this.angle += (this.direction == 1 ?
                1 :
                -1) * this.stepAngle;
        }
        this.pos.x += this.speed * Math.cos(this.angle);
        this.pos.y += this.speed * Math.sin(this.angle);
    }

}

export default Snake;