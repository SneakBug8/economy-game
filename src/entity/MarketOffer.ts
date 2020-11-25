import { Good } from "./Good";
import { Market } from "./Market";
import { Turn } from "./Turn";

export abstract class MarketOffer
{
    public id: number;
    public amount: number;
    public price: number;
    public turn_id: number;
    public marketId: number;
    public playerId: number;
    public goodId: number;

    public abstract async getGood(): Promise<Good>;
    public abstract setGood(good: Good);

    public abstract async getMarket(): Promise<Market>;
    public abstract setMarket(market: Market);

    public abstract async getTurn(): Promise<Turn>;
    public abstract setTurn(turn: Turn);

}