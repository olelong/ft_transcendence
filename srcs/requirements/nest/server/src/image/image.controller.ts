import {
  Controller,
  Get,
  Post,
  Param,
  Res,
  UseInterceptors,
  UploadedFile,
  UseFilters,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Express, Response } from 'express';
import { join, resolve } from 'path';
import { existsSync } from 'fs';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Multer } from 'multer';

import { Public } from '../auth.guard';
import { imagesPath } from './image.module';
import { MultipartFilter, ApiImageDto } from './utils';

@ApiTags('Image')
@Controller('image')
export default class ImageController {
  @Public()
  @Post()
  @UseFilters(MultipartFilter)
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ApiImageDto })
  uploadImage(@UploadedFile() image: Express.Multer.File): { url: string } {
    if (image === undefined) throw new BadRequestException();
    return { url: '/image/' + image.filename };
  }

  @Public()
  @Get('**')
  sendImage(@Param() { 0: path }: { 0: string }, @Res() res: Response): void {
    const imagePath = resolve(join(imagesPath, path));

    if (existsSync(imagePath)) res.sendFile(imagePath);
    else {
      const defaultImagePath = resolve(join(imagesPath, 'default.jpg'));
      if (existsSync(defaultImagePath)) res.sendFile(defaultImagePath);
      else res.status(404).send({ error: 'Image not found' });
    }
  }
}
