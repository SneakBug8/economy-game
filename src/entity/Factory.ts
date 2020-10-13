import { Good } from "entity/Good";
import { PrimaryGeneratedColumn, OneToOne, JoinColumn, Column, Entity, getRepository } from "typeorm";

@Entity()
export class Factory {
    @PrimaryGeneratedColumn()
    public id: number;
    @Column()
    public employeesCount: number;
    @Column()
    public salary: number;
    @OneToOne(type => Good)
    @JoinColumn()
    public Good: Good;
}

export const FactoryRepository = getRepository(Factory);
