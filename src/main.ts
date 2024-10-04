import { VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
import { CustomValidationPipe } from './common/pipes/custom-validation.pipe';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: configService.get('api.defaultVersion'),
  });

  app.useGlobalPipes(new CustomValidationPipe());

  const swaggerConfig = new DocumentBuilder()
    .setTitle(configService.get('swagger.title'))
    .setDescription(configService.get('swagger.description'))
    .setVersion(configService.get('app.version'))
    .addCookieAuth('jwt')
    .addSecurity('bearer', {
      type: 'http',
      scheme: 'bearer',
    })
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(3000);
}
bootstrap();
