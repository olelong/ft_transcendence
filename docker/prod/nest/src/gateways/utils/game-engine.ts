import { NetGameState } from '../game/game.interface';

const l = 0;
const r = 1;

const collideMargin = 0.01;

const randomMinMax = (min: number, max: number): number =>
  Math.random() * (max - min) + min;

const inRange = (x: number, min: number, max: number): boolean =>
  min <= x && x < max;

type PauseCallback = (msg: string, roomId: string) => void;

export default class Engine {
  static readonly config = {
    canvas: {
      width: 2.0,
      height: 1.0,
    },
    paddle: {
      width: 0.05,
      height: 0.25,
    },
    ballRadius: 0.025,
  };

  readonly defaultPadBallPos = {
    paddles: [
      0.5 * Engine.config.canvas.height,
      0.5 * Engine.config.canvas.height,
    ] as [number, number],
    ball: {
      x: 0.5 * Engine.config.canvas.width,
      y: 0.5 * Engine.config.canvas.height,
    },
  };

  extState: NetGameState = {
    ...this.defaultPadBallPos,
    scores: [0, 0],
    pauseMsg: 'About to start...',
    started: false,
    ended: false,
    watchers: 0,
  };

  private intState = {
    vel: {
      x: 0.0,
      y: 0.0,
    },
    ballSpeed: 0.01,
    lastGoal: Math.random() < 0.5 ? l : r,
  };

  private pauseCb: PauseCallback = null;
  private timeouts: NodeJS.Timeout[] = [];

  constructor(
    public readonly pointLimit: number,
    public readonly roomId: string,
  ) {}

  start(pauseCb: PauseCallback, gameLoopCb: () => void): void {
    this.pauseCb = pauseCb;
    this.pauseCb('5', this.roomId);
    for (let i = 0; i < 4; i++)
      this.timeouts.push(
        setTimeout(
          () => this.pauseCb((4 - i).toString(), this.roomId),
          (i + 1) * 1000,
        ),
      );
    this.timeouts.push(setTimeout(gameLoopCb, 5000));
    this.extState.started = true;
  }

  startRound(): void {
    // Unpause the game
    delete this.extState.pauseMsg;
    const sign = this.intState.lastGoal == l ? -1 : 1;
    this.intState.ballSpeed = 0.01;
    this.intState.vel.x = this.intState.ballSpeed * sign;
    this.intState.vel.y =
      randomMinMax(0.001, 0.0025) * (Math.random() < 0.5 ? -1 : 1);
    this.timeouts.forEach((timeout) => clearTimeout(timeout));
    this.timeouts = [];
  }

  endRound = (goalFor: number): void => {
    let ended = false;
    const scores = this.extState.scores;
    ++scores[goalFor];
    if (this.extState.scores.findIndex((s) => s >= this.pointLimit) >= 0) {
      ended = true;
      // return;
    }

    // Reset position of ball
    this.extState.ball.x = 0.5 * Engine.config.canvas.width;
    this.extState.ball.y = 0.5 * Engine.config.canvas.height;
    this.extState.scores = scores;
    this.extState.pauseMsg = 'End';
    this.extState.ended = ended;
    this.intState.lastGoal = goalFor;
    if (!this.extState.ended) {
      this.pauseCb('3', this.roomId);
      this.timeouts.push(
        setTimeout(() => this.pauseCb('2', this.roomId), 1000),
      );
      this.timeouts.push(
        setTimeout(() => this.pauseCb('1', this.roomId), 2000),
      );
      this.timeouts.push(setTimeout(() => this.startRound(), 3000));
    }
  };

  update = (): boolean => {
    if (this.extState.pauseMsg) return false;

    // If goal detected, end round
    const goal = this.checkGoal();
    if (goal == l || goal == r) {
      this.endRound(goal);
      return false;
    }

    // If collison detected, change the vectors
    if (this.collideWall()) this.intState.vel.y *= -1;
    if (this.collidePaddle()) this.intState.vel.x *= -1;

    // Update new ball's position
    this.extState.ball.x += this.intState.vel.x;
    this.extState.ball.y += this.intState.vel.y;
    return true;
  };

  private collideWall = (): boolean => {
    const y = this.extState.ball.y;
    const ballRadius = Engine.config.ballRadius;
    const canvasHeight = Engine.config.canvas.height;

    if (y < ballRadius - collideMargin) {
      this.extState.ball.y = ballRadius;
      return true;
    } else if (y > canvasHeight - ballRadius + collideMargin) {
      this.extState.ball.y = canvasHeight - ballRadius;
      return true;
    }

    return false;
  };

  private collidePaddle = (): boolean => {
    const x = this.extState.ball.x;
    const y = this.extState.ball.y;

    const collideAndAdjustAngle = (paddleY: number): boolean => {
      const speedIncreaseFactor = 1.05;
      const maxBounceAngle = Math.PI / 3;

      const relativeIntersectionY =
        (y - paddleY) / (Engine.config.paddle.height / 2);
      const bounceAngle = relativeIntersectionY * maxBounceAngle;
      const speed = Math.sqrt(
        this.intState.vel.x * this.intState.vel.x +
          this.intState.vel.y * this.intState.vel.y,
      );
      const newSpeed = speed * speedIncreaseFactor;
      this.intState.vel.x =
        newSpeed * Math.sign(this.intState.vel.x) * Math.cos(bounceAngle);
      this.intState.vel.y = newSpeed * Math.sin(bounceAngle);
      return true;
    };
    if (
      x < Engine.config.ballRadius + Engine.config.paddle.width &&
      this.intState.vel.x < 0 &&
      inRange(
        y,
        this.extState.paddles[0] - Engine.config.paddle.height / 2,
        this.extState.paddles[0] + Engine.config.paddle.height / 2,
      )
    )
      return collideAndAdjustAngle(this.extState.paddles[0]);
    if (
      x >
        Engine.config.canvas.width -
          Engine.config.ballRadius -
          Engine.config.paddle.width &&
      this.intState.vel.x > 0 &&
      inRange(
        y,
        this.extState.paddles[1] - Engine.config.paddle.height / 2,
        this.extState.paddles[1] + Engine.config.paddle.height / 2,
      )
    )
      return collideAndAdjustAngle(this.extState.paddles[1]);
    return false;
  };

  private checkGoal = (): number => {
    const x = this.extState.ball.x;
    if (x < 0) return 1;
    if (x > Engine.config.canvas.width) return 0;
    return -1;
  };
}
