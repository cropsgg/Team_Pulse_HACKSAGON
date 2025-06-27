import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from '@fastify/helmet';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  const configService = app.get(ConfigService);

  // Security
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`, `'unsafe-inline'`, 'cdn.jsdelivr.net', 'fonts.googleapis.com'],
        fontSrc: [`'self'`, 'fonts.gstatic.com'],
        imgSrc: [`'self'`, 'data:', 'cdn.jsdelivr.net'],
        scriptSrc: [`'self'`, `'unsafe-inline'`, 'cdn.jsdelivr.net'],
      },
    },
  });

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger API documentation
  if (configService.get('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('ImpactChain API')
      .setDescription('AI × Blockchain Charity Platform API')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication endpoints')
      .addTag('webhooks', 'Webhook endpoints')
      .addTag('health', 'Health check endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  // Set global prefix for REST API
  app.setGlobalPrefix('api/v1', {
    exclude: ['/health', '/healthz', '/graphql'],
  });

  // Set environment variables for blockchain integration
  if (!process.env.MINIMAL_TOKEN_ADDRESS) {
    process.env.MINIMAL_TOKEN_ADDRESS = '0xc9205abC4A4fceC25E15446A8c2DD19ab60e1149';
  }
  if (!process.env.MINIMAL_BADGE_ADDRESS) {
    process.env.MINIMAL_BADGE_ADDRESS = '0xA38062F23cbF30680De009e59E62B62F6c95a35A';
  }
  if (!process.env.FUNDING_ROUND_ADDRESS) {
    process.env.FUNDING_ROUND_ADDRESS = '0xefBa1032bB5f9bEC79e022f52D89C2cc9090D1B8';
  }
  if (!process.env.BLOCKCHAIN_RPC_URL) {
    process.env.BLOCKCHAIN_RPC_URL = 'http://127.0.0.1:8545';
  }

  console.log('🔗 Blockchain Integration:');
  console.log(`  Token Contract: ${process.env.MINIMAL_TOKEN_ADDRESS}`);
  console.log(`  Badge Contract: ${process.env.MINIMAL_BADGE_ADDRESS}`);
  console.log(`  Funding Contract: ${process.env.FUNDING_ROUND_ADDRESS}`);
  console.log(`  RPC URL: ${process.env.BLOCKCHAIN_RPC_URL}`);

  const port = process.env.PORT || 4000;
  const host = configService.get('HOST', '0.0.0.0');

  await app.listen(port, host);

  console.log(`🚀 Gateway application is running on: http://${host}:${port}`);
  console.log(`📊 GraphQL Playground: http://${host}:${port}/graphql`);
  console.log(`📚 API Documentation: http://${host}:${port}/docs`);
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start gateway application:', error);
  process.exit(1);
}); 