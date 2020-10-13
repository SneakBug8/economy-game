import { Good } from "./Good";
import { Market } from "./Market";
import { MarketActor } from "./MarketActor";
import { Connection } from "DataBase";

export class MarketOffer
{
    public id: number;
    amount: number;
    price: number;
    turn_id: number;
    public Good: Good;
    public Market: Market;
    public MarketActor: MarketActor;
    marketId: number;
    actorId: number;
    goodId: number;
}