// Config
const pixelUnit = 400;
const statusBarHeight = 50;
const fontSize = 30;
const margin = 10;
let config = null;

// State
let state = null;
let players = [null, null];

socket = io('http://localhost:3000/in-game');

socket.on('initPong', (o) => {
  config = getConfig(o.config);
  state = getState(o.state);
  players = o.players;
  createCanvas(config.canvas.width, config.canvas.height + statusBarHeight);
});

function setup() {
  textSize(fontSize);
}

function draw() {
  background(150);
  if (state && config) {
    // middle line
    line(config.canvas.width / 2, 0, config.canvas.width / 2, config.canvas.height);
    // draw paddles
    fill(100);
    rect(0,
      state.paddles[0] - config.paddle.height / 2,
      config.paddle.width,
      config.paddle.height
    );
    rect(config.canvas.width - config.paddle.width,
      state.paddles[1] - config.paddle.height / 2,
      config.paddle.width,
      config.paddle.height
    );
    // draw ball
    fill(200);
    ellipse(state.ball.x, state.ball.y, config.ballRadius);
    // draw status bar
    fill(0);
    rect(0, config.canvas.height, config.canvas.width, statusBarHeight);
    
    // write status
    fill(200);
    textAlign(LEFT, CENTER);
    text(
      players[0] ? players[0] : "<no one>",
      margin,
      config.canvas.height + statusBarHeight / 2
    );
    textAlign(RIGHT, CENTER);
    text(
      players[1] ? players[1] : "<no one>",
      config.canvas.width - margin,
      config.canvas.height + statusBarHeight / 2
      );
    textAlign(RIGHT, TOP);
    text(
      `${state.scores[0]}`,
      config.canvas.width / 2 - 2 * margin,
      margin
    );
    textAlign(LEFT, TOP);
    text(
      `${state.scores[1]}`,
      config.canvas.width / 2 + 2 * margin,
      margin
    );
  }
  redraw();
}

const getConfig = (conf) => ({
  canvas: {
    width: conf.canvas.width * pixelUnit,
    height: conf.canvas.height * pixelUnit,
  },
  paddle: {
    width: conf.paddle.width * pixelUnit,
    height: conf.paddle.height * pixelUnit,
  },
  ballRadius: (conf.ballRadius * pixelUnit),
});

const getState = (s) => ({
  ball: {
    x: s.ball.x * pixelUnit,
    y: s.ball.y * pixelUnit,
  },
  paddles: s.paddles.map(x => x * pixelUnit),
  paused: s.paused,
  scores: s.scores,
});


