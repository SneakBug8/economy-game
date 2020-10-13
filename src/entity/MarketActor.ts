import { PrimaryGeneratedColumn, Entity, getRepository } from "typeorm";

@Entity()
export class MarketActor {
    @PrimaryGeneratedColumn()
    public id: number;
}

export const MarketActorRepository = getRepository(MarketActor);
