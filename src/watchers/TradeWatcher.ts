import { EventsList } from "events/EventsList";
import { ITradeEvent, TradeEventType } from "events/types/TradeEvent";
import { Player } from "entity/Player";
import { Turn } from "entity/Turn";
import { PlayerLog } from "entity/PlayerLog";

export class TradeWatcher
{
    public static Initialized = false;
    public static Init()
    {
        if (!this.Initialized) {
            EventsList.onTrade.on(this.OnTradeListener);
            this.Initialized = true;
        }
    }

    public static async OnTradeListener(event: ITradeEvent)
    {
        if (event.Type === TradeEventType.FromPlayer) {
            const player = await Player.GetWithActor(event.Actor);
            PlayerLog.Log(player, Turn.CurrentTurn, `Bought ${event.Amount} of ${event.Good.name}` +
                ` for ${event.Price}`);
        }
        else if (event.Type === TradeEventType.ToPlayer) {
            const player = await Player.GetWithActor(event.Actor);

            PlayerLog.Log(player, Turn.CurrentTurn, `Sold ${event.Amount}` +
                ` of ${event.Good.name} for ${event.Price}`);
        }
        else if (event.Type === TradeEventType.FromGovernment) {
            const player = await Player.GetWithActor(event.Actor);

            PlayerLog.Log(player, Turn.CurrentTurn, `Bought ${event.Amount} of ${event.Good.name}` +
                ` for ${event.Price} from state`);

        }
        else if (event.Type === TradeEventType.ToGovernment) {
            const player = await Player.GetWithActor(event.Actor);
            PlayerLog.Log(player, Turn.CurrentTurn, `Sold ${event.Amount}` +
                ` of ${event.Good.name} for ${event.Price} to state`);
        }
    }
}