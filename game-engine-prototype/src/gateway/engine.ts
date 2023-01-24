interface NetGameState {
  paddles: number[];
  ball: {
    x: number;
    y: number;
  };
  scores: number[];
  paused: boolean;
  ended: boolean;
}

const l = 0;
const r = 1;

export class Engine {
  static readonly config = {
    canvas: {
      width: 2.0,
      height: 1.0,
    },
    paddle: {
      width: 0.05,
      height: 0.25,
    },
    ballRadius: 0.05,
  };

  static readonly defaultPadBallPos = {
    paddles: [
      0.5 * Engine.config.canvas.height,
      0.5 * Engine.config.canvas.height,
    ],
    ball: {
      x: 0.5 * Engine.config.canvas.width,
      y: 0.5 * Engine.config.canvas.height,
    },
  };

  extState: NetGameState = {
    ...Engine.defaultPadBallPos,
    scores: [0, 0],
    paused: true,
    ended: false,
  };

  private intState = {
    vel: {
      x: 0.0,
      y: 0.0,
    },
    lastGoal: Math.random() < 0.5 ? l : r,
  };

  constructor(
    public readonly pointLimit: number,
    public readonly startRoundCallback,
    public readonly endRoundCallback,
  ) {}

  startRound() {
    // Unpause the game
    this.extState.paused = false;
    // this.startRoundCallback();
  }

  endRound = (goalFor: number) => {
    const scores = this.extState.scores;
    ++scores[goalFor];
    if (this.extState.scores.findIndex((s) => s >= this.pointLimit) >= 0) {
      this.extState.ended = true;
      return;
    }

    // Reset position of ball and paddles
    this.extState = {
      ...Engine.defaultPadBallPos,
      scores: scores,
      paused: true,
      ended: false,
    };
    this.endRoundCallback();
  };
}
