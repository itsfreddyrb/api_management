import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Database } from './database.entity';

@Entity()
export class APIEndpoint {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    path: string;

    @Column()
    method: string;

    @Column()
    sqlQuery: string;

    @Column()
    tokenProtected: boolean;

    @Column({ default: 0 })
    hits: number; // Track hits

    @ManyToOne(() => Database)
    @JoinColumn({ name: 'databaseId' })
    database: Database; // <-- Link to the selected database
}