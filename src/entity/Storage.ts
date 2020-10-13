import { Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, Column, getRepository } from "typeorm";
import { Factory } from "./Factory";
import { Good } from "./Good";

@Entity()
export class Storage {
    @PrimaryGeneratedColumn()
    public id;
    @OneToOne(type => Factory)
    @JoinColumn()
    public Factory: Factory;
    @OneToOne(type => Good)
    @JoinColumn()
    public Good: Good;
    @Column()
    public amount: number;
}

export const StorageRepository = getRepository(Storage);
