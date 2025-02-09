import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: "http://localhost:3000", // Allow only your frontend
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Allow cookies/auth headers if needed
  });

  console.log("🚀 Backend is starting...");

  await app.listen(3001, '0.0.0.0');
  console.log("✅ Backend is running on port 3001");
}

bootstrap();