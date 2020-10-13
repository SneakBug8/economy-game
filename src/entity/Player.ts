import { Factory } from "entity/Factory";
import { MarketActor } from "entity/MarketActor";
import { PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, Entity, getRepository } from "typeorm";

@Entity()
export class Player
{
    @PrimaryGeneratedColumn()
    public id: number;
    @Column()
    public username: string;
    @Column()
    public password: string;
    @Column()
    public cash: number;
    @OneToOne(type => Factory)
    @JoinColumn()
    public Factory: Factory;
    @OneToOne(type => MarketActor)
    @JoinColumn()
    public Actor: MarketActor;

}

export const PlayerRepository = getRepository(Player);
