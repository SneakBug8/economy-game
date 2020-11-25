import { Good } from "entity/Good";
import { Player } from "entity/Player";

export class ITradeEvent {
    public Type: TradeEventType;
    public Player: Player;
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
