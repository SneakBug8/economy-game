import { ProductionEvent } from "events/types/ProductionEvent";
import { EventsList } from "events/EventsList";
import { Turn } from "entity/Turn";
import { Good } from "entity/Good";
import { Player } from "entity/Player";
import { PlayerLog } from "entity/PlayerLog";
import { PriceRecord } from "entity/PriceRecord";
import { Log } from "entity/Log";
import { TurnsService } from "services/TurnsService";
import { GDPRecord } from "entity/GDPRecord";
import { ITradeEvent, TradeEventType } from "events/types/TradeEvent";

export class GDPWatcher
{
    public static Initialized = false;

    public static Init()
    {
        if (!this.Initialized) {
            EventsList.onTrade.on(async () => await this.OnTradeListener);
            EventsList.onBeforeNewTurn.on(this.Reset);
            this.Initialized = true;
        }
    }

    public static async OnTradeListener(event: ITradeEvent)
    {
        // Don't apply ToPlayer trades to prevent double GDP count on player-to-player trades
        if (event.Type === TradeEventType.FromPlayer ||
            event.Type === TradeEventType.FromGovernment ||
            event.Type === TradeEventType.ToGovernment) {
            GDPWatcher.Stats.amount += event.Price * event.Amount;
        }
    }

    public static Stats = new GDPRecord();
    // GDP consists of last prices for all sold goods for the last turn

    public static async Reset(event: Turn)
    {
        GDPWatcher.Stats.turnId = event.id;
        GDPRecord.Insert(GDPWatcher.Stats);
        Log.LogText("GDP was: " + GDPWatcher.Stats.amount);
        GDPWatcher.Stats = new GDPRecord();
    }
}