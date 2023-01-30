import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import ImageController from './image.controller';

export const imagesPath = './src/image/uploads/';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: imagesPath,
        filename: (_, image, cb) =>
          cb(null, `${Date.now()}_${image.originalname}`),
      }),
      limits: {
        fileSize: 8 * 1024 * 1024,
      },
      fileFilter: (_, file, cb) => {
        cb(null, /jpeg|png/.test(file.mimetype));
      },
    }),
  ],
  controllers: [ImageController],
})
export default class ImageModule {}
