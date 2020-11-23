import { Good } from "./Good";
import { Market } from "./Market";
import { MarketActor } from "./MarketActor";
import { Connection } from "DataBase";
import { Turn } from "./Turn";

export abstract class MarketOffer
{
    public id: number;
    public amount: number;
    public price: number;
    public turn_id: number;
    protected marketId: number;
    protected actorId: number;
    protected goodId: number;

    public abstract async getGood(): Promise<Good>;
    public abstract setGood(good: Good);

    public abstract async getMarket(): Promise<Market>;
    public abstract setMarket(market: Market);

    public abstract async getTurn(): Promise<Turn>;
    public abstract setTurn(turn: Turn);

    public abstract async getActor(): Promise<MarketActor>;
    public abstract setActor(actor: MarketActor);

}