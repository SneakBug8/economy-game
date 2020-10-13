import { Good } from "./Good";
import { Market } from "./Market";
import { PrimaryGeneratedColumn, OneToOne, JoinColumn, Column } from "typeorm";
import { MarketActor } from "./MarketActor";

export class MarketOffer {
    @PrimaryGeneratedColumn()
    public id: number;
    @Column()
    amount: number;
    @Column()
    price: number;
    @Column()
    turn_id: number;
    @OneToOne(type => Good)
    @JoinColumn()
    public Good: Good;
    @OneToOne(type => Market)
    @JoinColumn()
    public Market: Market;
    @OneToOne(type => MarketActor)
    @JoinColumn()
    MarketActor : MarketActor;
}
