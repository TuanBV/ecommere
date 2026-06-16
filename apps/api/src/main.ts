import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { static as serveStatic } from 'express';
import type { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { existsSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.setGlobalPrefix('api');
  app.enableCors({ origin: true, credentials: true });
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' }
    })
  );
  const uploadDir = config.get<string>('UPLOAD_DIR') ?? 'uploads';
  const uploadPath = isAbsolute(uploadDir) ? uploadDir : join(process.cwd(), uploadDir);
  app.use('/uploads', serveStatic(uploadPath));
  app.use('/uploads', (req: Request, res: Response, next: NextFunction) => {
    const requestedPath = decodeURIComponent(req.path).replace(/^[/\\]+/, '');
    const basePath = join(uploadPath, requestedPath);
    if (!basePath.startsWith(uploadPath)) return next();

    const candidates = [
      basePath,
      `${basePath}_pc.webp`,
      `${basePath}_tablet.webp`,
      `${basePath}_mobile.webp`,
      `${basePath}.webp`,
      `${basePath}.jpg`,
      `${basePath}.jpeg`,
      `${basePath}.png`
    ];
    const found = candidates.find((candidate) => existsSync(candidate));
    if (found) return res.sendFile(found);
    return next();
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true
    })
  );

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Core Ecommerce API')
      .setVersion('1.0.0')
      .addBearerAuth()
      .build()
  );
  SwaggerModule.setup('docs', app, document);

  await app.listen(config.get<number>('PORT') ?? 3001);
}

void bootstrap();
