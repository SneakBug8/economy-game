import { Connection } from "DB";

export class Market {
    public id: number;
}

export const MarketRepository = Connection("Markets");