import { Good } from "entity/Good";
import { Market } from "entity/Market";
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, getRepository } from "typeorm";

@Entity()
export class Production {
    @PrimaryGeneratedColumn()
    public id: number;
    @Column()
    public amount: number;
    @Column()
    public minprice: number;
    @OneToOne(type => Good)
    @JoinColumn()
    public Good: Good;
    @OneToOne(type => Market)
    @JoinColumn()
    public Market: Market;

}

export const ProductionRepository = getRepository(Production);
