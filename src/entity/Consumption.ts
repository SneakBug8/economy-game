import { Market } from "./Market";
import { Good } from "./Good";
import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, OneToOne, getRepository } from "typeorm";

@Entity()
export class Consumption {
    @PrimaryGeneratedColumn()
    public id: number;
    @OneToOne(type => Market)
    @JoinColumn()
    public Market: Market;
    @OneToOne(type => Good)
    @JoinColumn()
    public Good: Good;
    @Column()
    public amount: number;
    @Column()
    public maxprice: number;
}

export const ConsumptionRepository = getRepository(Consumption);
