// src/entities/database.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('databases')
export class Database {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    type: string;

    @Column()
    host: string;

    @Column()
    port: number;

    @Column()
    username: string;

    @Column()
    password: string;

    @Column()
    dbName: string;
}