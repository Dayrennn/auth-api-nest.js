import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { METHODS } from 'http';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Open API Test')
    .setDescription('API Test')
    .setVersion('1.0')
    .addTag('alahsia')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('openapi', app, document);

  const cors = {
    origin: ['http://localhost:3000', 'http://localhost', '*'],
    METHODS: 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS',
    preflightContinue: false,
    optionSuccessStatus: 204,
    credentials: true,
    allowedHeaders: ['*'],
  };

  app.enableCors(cors);
  await app.listen(3000);
}
bootstrap();
