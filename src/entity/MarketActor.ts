import { Connection } from "DB";

export class MarketActor {
    public id: number;
}

export const MarketActorRepository = Connection("MarketActors");