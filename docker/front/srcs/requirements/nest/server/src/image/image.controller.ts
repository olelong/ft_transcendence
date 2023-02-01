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

import { imagesPath } from './image.module';

@Catch(Error)
class MultipartFilter implements ExceptionFilter {
  catch(error: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    res.status(400).json({ message: error.message });
  }
}

@Controller('image')
export default class ImageController {
  @Post()
  @UseFilters(MultipartFilter)
  @UseInterceptors(FileInterceptor('image'))
  uploadImage(@UploadedFile() image: Express.Multer.File): { url: string } {
    if (image === undefined)
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    return { url: '/image/' + image.filename };
  }

  @Get(':imgname')
  sendImage(@Param('imgname') image: string, @Res() res: Response): void {
    res.sendFile(image, { root: imagesPath });
  }
}
