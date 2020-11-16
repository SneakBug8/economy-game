import { EventsList } from "events/EventsList";
import { ITradeEvent, TradeEventType } from "events/types/TradeEvent";
import { Player } from "entity/Player";
import { Turn } from "entity/Turn";
import { PlayerLog } from "entity/PlayerLog";
import { TurnsService } from "services/TurnsService";
import { PriceRecord } from "entity/PriceRecord";
import { Good } from "entity/Good";

export class PriceRecordWatcher
{
    public static Initialized = false;
    private static records: PriceRecord[] = [];

    public static Init()
    {
        if (!this.Initialized) {
            EventsList.onTrade.on((e) => this.OnTradeListener(e));
            EventsList.onBeforeNewTurn.on((e) => this.commitRecords(e));
            this.Initialized = true;
        }
    }

    public static async OnTradeListener(event: ITradeEvent)
    {
        const record = this.getRecord(event.Good);
        if (event.Price < record.minprice) {
            record.minprice = event.Price;
        }
        if (event.Price > record.maxprice) {
            record.maxprice = event.Price;
        }

        if (event.Price) {
            record.tradeamount += event.Price;
        }
    }

    private static async commitRecords(event: Turn)
    {
        for (const record of this.records) {
            if (record.minprice === Number.MAX_SAFE_INTEGER) {
                record.minprice = null;
            }
            if (record.maxprice === 0) {
                record.maxprice = null;
            }
            await PriceRecord.Create(TurnsService.CurrentTurn.id, record.goodId, record.minprice, record.maxprice, record.tradeamount);
        }

        this.records = [];
    }

    private static getRecord(good: Good)
    {
        for (const record of this.records) {
            if (record.goodId === good.id) {
                return record;
            }
        }

        const newrecord = {
            goodId: good.id,
            minprice: Number.MAX_SAFE_INTEGER,
            maxprice: 0,
            tradeamount: 0,
        };

        this.records.push(newrecord);

        return newrecord;
    }
}