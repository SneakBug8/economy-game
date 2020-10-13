import { Good } from "Good";
import { Market } from "Market";
import { DBEntry } from "DBEntry";

export class MarketOffer {

    public id: number;
    market_id: number;
    actor_id: number;
    good_id: number;
    amount: number;
    price: number;
    turn_id: number;
    public Good: Good;
    public Market: Market;
}