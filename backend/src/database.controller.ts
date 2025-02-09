// src/controllers/database.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { Database } from './entities/database.entity';

@Controller('databases')
export class DatabaseController {
    constructor(private readonly databaseService: DatabaseService) {}

    @Get()
    async getAllDatabases() {
        return await this.databaseService.findAll();
    }

    @Get(':id')
    async getDatabase(@Param('id') id: number) {
        return await this.databaseService.findOne(id);
    }

    @Post()
    async createDatabase(@Body() database: Partial<Database>) {
        return await this.databaseService.create(database);
    }

    @Put(':id')
    async updateDatabase(@Param('id') id: number, @Body() database: Partial<Database>) {
        return await this.databaseService.update(id, database);
    }

    @Delete(':id')
    async deleteDatabase(@Param('id') id: number) {
        return await this.databaseService.remove(id);
    }
}