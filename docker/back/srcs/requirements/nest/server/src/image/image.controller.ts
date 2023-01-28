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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express, Response } from 'express';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Multer } from 'multer';

import { Public } from '../auth.guard';
import { imagesPath } from './image.module';

@Controller('image')
export default class ImageController {
  @Public()
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  uploadImage(@UploadedFile() image: Express.Multer.File): { url: string } {
    if (image === undefined)
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    return { url: '/image/' + image.filename };
  }

  @Public()
  @Get(':imgname')
  sendImage(@Param('imgname') image: string, @Res() res: Response): void {
    res.sendFile(image, { root: imagesPath });
  }
}
