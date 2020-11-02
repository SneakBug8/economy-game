import { ProductionEvent } from "events/types/ProductionEvent";
import { EventsList } from "events/EventsList";
import { Turn } from "entity/Turn";
import { Good } from "entity/Good";
import { Player } from "entity/Player";
import { PlayerLog } from "entity/PlayerLog";
import { PriceRecord } from "entity/PriceRecord";
import { Log } from "entity/Log";
import { TurnsService } from "services/TurnsService";

interface GoodProductionStat
{
    good: Good;
    amount: number;
}

export class ProductionWatcher
{
    public static Initialized = false;

    public static Init()
    {
        if (!this.Initialized) {
            EventsList.onProduction.on(this.OnProductionListener);
            EventsList.onTurn.on(this.Reset);
            this.Initialized = true;
        }
    }

    public static Stats = new Array<GoodProductionStat>();
    // GDP consists of last prices for all productioned goods for the last turn
    // though requires production and trade
    public static GDP = 0;

    public static async OnProductionListener(event: ProductionEvent)
    {
        const player = await Player.GetWithFactory(event.Factory);
        PlayerLog.Log(player, TurnsService.CurrentTurn, `Factory ${event.Factory.id} produced ${event.Amount} items`);

        for (const stat of ProductionWatcher.Stats) {
            if (stat.good === event.Good) {
                stat.amount += event.Amount;
                return;
            }
        }

        ProductionWatcher.Stats.push({
            good: event.Good,
            amount: event.Amount,
        });
    }

    public static async Reset(event: Turn)
    {
        ProductionWatcher.GDP = 0;

        for (const stat of ProductionWatcher.Stats) {
            const record = await PriceRecord.GetLatestWithGood(stat.good);

            if (record) {
                ProductionWatcher.GDP += record.price * stat.amount;
            }
        }

        Log.LogText("GDP was: " + ProductionWatcher.GDP);
        ProductionWatcher.Stats = new Array<GoodProductionStat>();
    }
}