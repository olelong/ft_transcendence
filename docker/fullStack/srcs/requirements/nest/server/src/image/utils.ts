import { Catch, ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Response } from 'express';

@Catch(Error)
export class MultipartFilter implements ExceptionFilter {
  catch(error: Error, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    res.status(400).json({ message: error.message });
  }
}

export class ApiImageDto {
  @ApiProperty({ format: 'binary' })
  image: string;
}
