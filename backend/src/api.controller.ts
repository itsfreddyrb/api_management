import { Controller, Get, Post, Options, Body, HttpCode, Param, NotFoundException } from '@nestjs/common';
import { ApiService } from './api.service';
import { DatabaseService } from './database.service';

@Controller('api') // ✅ Keep all APIs under `/api/`
export class ApiController {
    constructor(
        private readonly apiService: ApiService,
        private readonly databaseService: DatabaseService,
    ) {}

    // GET /api/list -> Returns all APIs
    @Get('list')
    async getAllApis() {
        return await this.apiService.getAllApis();
    }

    // POST /api/create -> Creates a new API
    @Post('create')
    async createApi(
        @Body() body: { path: string; method: string; sqlQuery: string; tokenProtected: boolean; databaseId: number },
    ) {
        return await this.apiService.createApi(
            body.path,
            body.method,
            body.sqlQuery,
            body.tokenProtected,
            body.databaseId
        );
    }

    // API Testing
    @Post('test')
    async testApi(@Body() body: { apiId: number; sqlQuery: string; databaseId: number }) {
        console.log("🚨 DEBUG: Received Test API Request", body);

        if (!body.databaseId) {
            console.error("🚨 ERROR: No databaseId provided in test request!");
            throw new Error("Database ID is required");
        }

        return await this.apiService.testApi(body.databaseId, body.sqlQuery);
    }

    // 🔥 Handle dynamic API endpoints under `/api/`
    @Get(':path')
    async handleDynamicGet(@Param('path') path: string) {
        console.log(`🔍 API Lookup for: /api/${path}`);

        const api = await this.apiService.findApiByPath('/' + path);
        if (!api) {
            console.error(`🚨 ERROR: No API found for path: ${path}`);
            throw new NotFoundException(`No API found for path: /api/${path}`);
        }

        console.log(`✅ API Found: ${JSON.stringify(api, null, 2)}`);

        // 🔥 Fix: Access the `id` inside the `database` object
        if (!api.database || !api.database.id) {
            throw new Error(`API ${path} is missing a valid database reference.`);
        }

        await this.apiService.updateApiHits(api.id);  // Ensure hits update

        console.log(`✅ Updated Hits for API ${path}: ${api.hits}`);

        return this.apiService.testApi(api.database.id, api.sqlQuery);
    }
    // ✅ NEW: Update API hits
    @Post('update-hits')
    async updateApiHits(@Body() body: { apiId: number }) {
        const { apiId } = body;
        console.log(`🚀 Updating hits for API ID: ${apiId}`);
        return await this.apiService.updateApiHits(apiId);
    }

    // POST /api/create-database -> Creates a new database
    @Post('create-database')
    async createDatabase(@Body() body: { name: string, type: string, host: string, port: number, username: string, password: string, dbName: string }) {
        const database = await this.databaseService.create({
            name: body.name,
            type: body.type,
            host: body.host,
            port: body.port,
            username: body.username,
            password: body.password,
            dbName: body.dbName,
        });

        return { message: 'Database created successfully', database: database };
    }

    // Explicitly handle preflight OPTIONS request for CORS
    @Options('create')
    @HttpCode(204)
    handlePreflight() {
        return;
    }
}