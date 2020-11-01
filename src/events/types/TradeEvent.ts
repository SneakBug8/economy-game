import { MarketActor } from "entity/MarketActor";
import { Good } from "entity/Good";

export class ITradeEvent {
    public Type: TradeEventType;
    public Actor: MarketActor;
    public Good: Good;
    public Amount: number;
    public Price: number;
}

export enum TradeEventType {
    ToPlayer,
    FromPlayer,
    ToGovernment,
    FromGovernment,
}
