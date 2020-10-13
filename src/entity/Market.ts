import { Entity, PrimaryGeneratedColumn, getRepository } from "typeorm";

@Entity()
export class Market {
    @PrimaryGeneratedColumn()
    public id: number;
}

export const MarketRepository = getRepository(Market);
