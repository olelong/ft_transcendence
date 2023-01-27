// Config
const pixelUnit = 400;
const statusBarHeight = 50;
const fontSize = 30;
const margin = 10;
let config = null;

// State
let state = null;
let players = [null, null];
let joinedPos = -1;
let myName = null;
let pauseMsg = null;

const disableJoinBtn = () => document.getElementById('btnJoin')['disabled'] = true;
const disableReadyBtn = (dis) => document.getElementById('btnReady')['disabled'] = dis;

socket = io('http://localhost:3000/in-game');

socket.on('initPong', (data) => {
  disableReadyBtn(true);
  config = getConfig(data.config);
  state = getState(data.state);
  players = data.players;
  // disable join button if room is full
  if (players[0] && players[1])
    disableJoinBtn();
  
  const canvas = createCanvas(config.canvas.width, config.canvas.height + statusBarHeight);
  canvas.parent('canvas');
});

socket.on('playerJoin', (data) => {
  if (myName === data.name) {
    joinedPos = data.idx;
    disableJoinBtn();
    disableReadyBtn(false);
  }
  players[data.idx] = data.name;
})

socket.on('pause', (data) => {
  state.paused = true;
  pauseMsg = data;
})

socket.on('unpause', (data) => {
  state.paused = false;
  pauseMsg = null;
})

socket.on('stateChanged', (s) => state = getState(s));

socket.on('gameEnded', (data) => {
  state.paused = true;
  if (state.scores[0] > state.scores[1])
    pauseMsg = `${players[0]} wins`
  else if (state.scores[0] < state.scores[1])
    pauseMsg = `${players[1]} wins`
  else
    pauseMsg = 'Draw!'
});

function setup() {
  frameRate(60);
  textSize(fontSize);
}

function draw() {
  background(150);
  if (state && config) {
  	captureMouse();
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
    
    // write to status bar
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
    if (state.paused && pauseMsg) {
      textAlign(CENTER, CENTER);
      text(
        pauseMsg,
        config.canvas.width / 2,
        config.canvas.height + statusBarHeight / 2 ,
      );
    }
  }
}

const captureMouse = () => {
  if (joinedPos < 0) return;
  let pos;
  if (mouseY < config.mouseArea.minY)
    pos = config.mouseArea.minY;
  else if (mouseY > config.mouseArea.maxY)
    pos = config.mouseArea.maxY;
  else
    pos = mouseY;
  // state.paddles[joinedPos] = pos;

  socket.emit('paddlePos', pos / pixelUnit);
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
  ballRadius: conf.ballRadius * pixelUnit,
  mouseArea: {
    minY: conf.paddle.height / 2 * pixelUnit,
    maxY: (conf.canvas.height - conf.paddle.height / 2) * pixelUnit,
  },
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

const btnJoinClick = () => {
  myName = prompt("Enter a name");
  if (myName)
    socket.emit('playerJoin', myName);
}

const btnReadyClick = () => {
  socket.emit('playerReady', null);
  disableReadyBtn(true);
}
