import { EventsList } from "events/EventsList";
import { ITradeEvent, TradeEventType } from "events/types/TradeEvent";
import { Player } from "entity/Player";
import { PlayerProfitPerGood } from "entity/PlayerProfitPerGood";

export class PlayerProfitPerGoodWatcher
{
    public static Initialized = false;

    public static Init()
    {
        if (!this.Initialized) {
            EventsList.onTrade.on((e) => this.OnTradeListener(e));
            this.Initialized = true;
        }
    }

    public static async OnTradeListener(event: ITradeEvent)
    {
        if (event.Type === TradeEventType.FromPlayer ||
            event.Type === TradeEventType.FromGovernment) {
            this.Bought(event.Player.id, event.Good.id, event.Price * event.Amount);
        }
        else if (event.Type === TradeEventType.ToPlayer ||
            event.Type === TradeEventType.ToGovernment) {
            this.Sold(event.Player.id, event.Good.id, event.Price * event.Amount);
        }
    }

    public static async Sold(playerId: number, goodid: number, sold: number)
    {
        let record = await PlayerProfitPerGood.GetWithPlayerAndGood(playerId, goodid);
        if (!record) {
            await PlayerProfitPerGood.Create(playerId, goodid);
            record = await PlayerProfitPerGood.GetWithPlayerAndGood(playerId, goodid);
        }

        record.sold += sold;
        record.profit += sold;

        PlayerProfitPerGood.Update(record);
    }

    public static async Bought(playerId: number, goodid: number, bought: number)
    {
        let record = await PlayerProfitPerGood.GetWithPlayerAndGood(playerId, goodid);
        if (!record) {
            await PlayerProfitPerGood.Create(playerId, goodid);
            record = await PlayerProfitPerGood.GetWithPlayerAndGood(playerId, goodid);
        }

        record.bought += bought;
        record.profit -= bought;

        PlayerProfitPerGood.Update(record);
    }
}