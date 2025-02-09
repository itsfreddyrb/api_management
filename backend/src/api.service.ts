// src/services/api.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { APIEndpoint } from './entities/api.entity';  // Correct import for the API entity
import { Database } from './entities/database.entity';  // Correct import for the Database entity
import { DataSource } from 'typeorm';  // Importing the DataSource object
import * as mysql from 'mysql2';  // Import mysql2 for direct database connection

@Injectable()
export class ApiService {
    constructor(
        @InjectRepository(APIEndpoint)
        private apiRepository: Repository<APIEndpoint>, // Injecting the API endpoint repository
        @InjectRepository(Database)
        private databaseRepository: Repository<Database>, // Injecting the Database repository
        private dataSource: DataSource, // Injecting the DataSource for database management
    ) {}

    async findApiByPath(path: string) {
        return this.apiRepository.findOne({
            where: { path },
            relations: ['database'], // ✅ Ensure the database relation is loaded
        });
    }

    async createApi(path: string, method: string, sqlQuery: string, tokenProtected: boolean, databaseId: number) {
        const newApi = this.apiRepository.create({
            path,
            method,
            sqlQuery,
            tokenProtected,
            database: { id: databaseId }, // Ensure database relation is set
        });

        await this.apiRepository.save(newApi);

        console.log("✅ API Created:", newApi); // Debugging log

        return {
            success: true,   // ✅ Explicitly return success
            message: "API successfully created",
            api: newApi
        };
    }

    async getAllApis() {
        const apis = await this.apiRepository.find({
            relations: ['database'], // Ensure we get database relation
        });

        return apis.map(api => ({
            id: api.id,
            path: api.path,
            method: api.method,
            sqlQuery: api.sqlQuery,
            tokenProtected: api.tokenProtected,
            hits: api.hits,
            databaseId: api.database?.id ?? null, // ✅ Send only the `databaseId`
        }));
    }

    async testApi(databaseId: number, sqlQuery: string) {
        console.log(`🚨 DEBUG: Attempting to test API on database ID: ${databaseId}`);

        const database = await this.databaseRepository.findOne({ where: { id: databaseId } });

        if (!database) {
            console.error("🚨 ERROR: Database ID not found:", databaseId);
            throw new Error('Database not found');
        }

        console.log("🚨 DEBUG: Testing query on database", database.dbName);
        console.log("🚨 DEBUG: Using host:", database.host);
        console.log("🚨 DEBUG: Running SQL:", sqlQuery);
        console.log("🚨 DEBUG: Full Database Object:", database);

        const connection = mysql.createConnection({
            host: database.host,
            user: database.username,
            password: database.password,
            database: database.dbName,
            port: database.port,
        });

        try {
            console.log("🚨 DEBUG: Executing SQL:", sqlQuery);
            const [rows] = await connection.promise().query(sqlQuery);
            console.log("🚨 DEBUG: Query Result:", rows);

            return rows;
        } catch (error) {
            console.error("🚨 ERROR executing query:", error);
            throw new Error('Query execution failed: ' + error.message);
        } finally {
            connection.end();
        }
    }

    // Update hit count for the API (called within testApi)
// Change from private to public
    async updateApiHits(apiId: number) {
        const api = await this.apiRepository.findOne({ where: { id: apiId } });

        if (api) {
            api.hits += 1;  // ✅ Increment hit count
            await this.apiRepository.save(api);
            console.log(`✅ Hits updated for API ID: ${apiId}, New Hits: ${api.hits}`);
        }
    }
}