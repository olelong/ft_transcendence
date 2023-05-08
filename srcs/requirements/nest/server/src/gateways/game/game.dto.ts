import { IsNumber, Min, Max } from 'class-validator';
import Engine from '../utils/game-engine';

const conf = Engine.config;

export class UpdateDto {
  @IsNumber()
  @Min(conf.paddle.height / 2)
  @Max(conf.canvas.height - conf.paddle.height / 2)
  paddlePos: number;
}
