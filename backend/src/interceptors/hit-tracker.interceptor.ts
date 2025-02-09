// src/interceptors/hit-tracker.interceptor.ts
import { Injectable } from '@nestjs/common';
import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { APIEndpoint } from '../entities/api.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { tap } from 'rxjs/operators';

@Injectable()
export class HitTrackerInterceptor implements NestInterceptor {
    constructor(
        @InjectRepository(APIEndpoint)
        private apiRepository: Repository<APIEndpoint>,  // Inject API repository
    ) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const apiPath = request.url;  // Get the API path from the request
        const method = request.method;  // Get the HTTP method (GET, POST, etc.)

        return next.handle().pipe(
            tap(() => {
                this.updateApiHits(apiPath, method);  // Update hits after request
            })
        );
    }

    private async updateApiHits(path: string, method: string) {
        const api = await this.apiRepository.findOne({
            where: { path, method },  // Find the API by path and method
        });

        if (api) {
            api.hits += 1;  // Increment the hit count
            await this.apiRepository.save(api);  // Save the updated API entity
        }
    }
}