import {
  Controller,
  Get,
  Post,
  Param,
  Res,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
  UseFilters,
  Catch,
  ExceptionFilter,
  ArgumentsHost,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express, Response } from 'express';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Multer } from 'multer';

import { Public } from '../auth.guard';
import { imagesPath } from './image.module';

@Catch(Error)
class MultipartFilter implements ExceptionFilter {
  catch(error: Error, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    res.status(400).json({ message: error.message });
  }
}

@Controller('image')
export default class ImageController {
  @Public()
  @Post()
  @UseFilters(MultipartFilter)
  @UseInterceptors(FileInterceptor('image'))
  uploadImage(@UploadedFile() image: Express.Multer.File): { url: string } {
    if (image === undefined)
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    return { url: '/image/' + image.filename };
  }

  @Public()
  @Get('**')
  sendImage(@Param() { 0: path }: { 0: string }, @Res() res: Response): void {
    res.sendFile(path, { root: imagesPath }, (err) => {
      if (err) res.status(404).send({ error: 'Image not found' });
    });
  }
}
