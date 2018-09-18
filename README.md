# Snake Neural Network

### Neuroevolution of Neural Network of snakes in the Browser.

This is a demonstration of evolving a neural network thanks to genetics algorithms in the browser
using a multilayer perceptron (150-15-15-1).

Each snake has 50 sensors, each reporting 3 inputs:
1) The distance the sensor has hit something normalized between 0 and 1
2) 1 if this sensor touched the enemy body
3) 1 if this sensor touched the enemy body

<br/>

## Install

* **Note: requires a node version >= 6 and an npm version >= 3.**

And then install dependencies.

```bash
$ cd your-project-name && npm install
```

:bulb: *you will need to run npm run build for publishing like for heroku*

## Run

```bash
$ node server.js
```
Then head to `localhost:8080` in the browser.

## Testing
```bash
$ npm run test
```