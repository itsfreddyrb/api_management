// src/services/database.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Database } from './entities/database.entity';

@Injectable()
export class DatabaseService {
    constructor(
        @InjectRepository(Database)
        private databaseRepository: Repository<Database>,
    ) {}

    findAll() {
        return this.databaseRepository.find();
    }

    findOne(id: number) {
        return this.databaseRepository.findOneBy({ id });
    }

    create(database: Partial<Database>) {
        const db = this.databaseRepository.create(database);
        return this.databaseRepository.save(db);
    }

    update(id: number, database: Partial<Database>) {
        return this.databaseRepository.update(id, database);
    }

    remove(id: number) {
        return this.databaseRepository.delete(id);
    }
}