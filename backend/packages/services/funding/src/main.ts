import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  // Create HTTP application for GraphQL
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable CORS for GraphQL playground
  app.enableCors({
    origin: configService.get('CORS_ORIGIN', 'http://localhost:3000').split(','),
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Start HTTP server for GraphQL
  const httpPort = configService.get('FUNDING_SERVICE_PORT', 4003);
  await app.listen(httpPort);
  console.log(`💰 Funding service (HTTP/GraphQL) running on port ${httpPort}`);

  // Create microservice for NATS communication
  const microservice = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.NATS,
      options: {
        servers: [configService.get('NATS_URL', 'nats://localhost:4222')],
        queue: 'funding-service',
      },
    },
  );

  await microservice.listen();
  console.log('💰 Funding service (NATS) connected to message broker');
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start funding service:', error);
  process.exit(1);
}); 