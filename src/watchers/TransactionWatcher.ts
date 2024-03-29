import { Transaction } from "entity/Transaction";
import { EventsList } from "events/EventsList";
import { ITradeEvent } from "events/types/TradeEvent";

export class TransactionWatcher
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
        await Transaction.Create(event.Good, event.Amount, event.Price, event.Player.id, event.Type);
    }
}