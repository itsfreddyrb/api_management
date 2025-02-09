import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ApiController } from './api.controller';  // <-- Import the controller
import { ApiService } from './api.service';  // <-- Import the service
import { APIEndpoint } from './entities/api.entity';  // <-- Import the entity
import { Database } from './entities/database.entity'; // <-- Import the new Database entity
import { DatabaseService } from './database.service'; // <-- Import the DatabaseService
import { DatabaseController } from './database.controller'; // <-- Import the DatabaseController
import { HitTrackerInterceptor } from './interceptors/hit-tracker.interceptor'; // <-- Import the HitTrackerInterceptor
import { APP_INTERCEPTOR } from '@nestjs/core'; // <-- Import the APP_INTERCEPTOR token

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'mysql',
      port: parseInt(process.env.DB_PORT ?? '3306', 10),
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'apibuilder',
      autoLoadEntities: true,
      synchronize: true,
    }),
    TypeOrmModule.forFeature([APIEndpoint, Database]),  // <-- Register the Database entity with TypeORM
  ],
  controllers: [ApiController, DatabaseController],  // <-- Register both controllers
  providers: [
    ApiService,
    DatabaseService,
    {
      provide: APP_INTERCEPTOR,  // Register the interceptor globally
      useClass: HitTrackerInterceptor,  // Use the HitTrackerInterceptor class
    },
  ],  // <-- Register both services and the interceptor
})
export class AppModule {}