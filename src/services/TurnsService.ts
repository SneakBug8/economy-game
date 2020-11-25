import { Turn } from "entity/Turn";
import { Player } from "entity/Player";
import { Log } from "entity/Log";
import { EventsList } from "events/EventsList";
import { Runner } from "Runner";
import { Factory } from "entity/Factory";
import { RGO } from "entity/RGO";
import { Logger } from "utility/Logger";
import { IMedianCashRecord, IPlayerStatisticsRecord, Statistics, StatisticsTypes } from "entity/Statistics";

export class TurnsService
{
    static LastTurn: Turn;
    public static CurrentTurn: Turn;

    public static Initialized = false;

    public static async Init()
    {
        if (this.Initialized) {
            return;
        }

        this.Initialized = true;

        await this.StartTurn();
    }

    public static async StartTurn()
    {
        this.CurrentTurn = await Turn.Last() || new Turn();
        this.LastTurn = await Turn.Last();

        if (this.LastTurn) {
            this.CurrentTurn.id = this.LastTurn.id + 1;
        }
        else {
            this.CurrentTurn.id = 1;
        }

        this.CurrentTurn.freecash = 0;

        if (Runner.ApiProvider) {
            Runner.ApiProvider.broadcast("Now is turn " + this.CurrentTurn.id);
        }

        Log.LogText("Now is turn " + this.CurrentTurn.id);

        EventsList.onAfterNewTurn.emit(this.CurrentTurn);
    }

    public static async EndTurn()
    {
        this.CurrentTurn.datetime = new Date().toString();

        await this.CalculateBalance();
        await this.CalculateMedian();
        await this.CalculateWorkers();

        EventsList.onBeforeNewTurn.emit(this.CurrentTurn);

        await Turn.Insert(this.CurrentTurn);
    }

    public static async CalculateBalance()
    {
        this.CurrentTurn.totalcash = 0;

        // TODO: Imagine a way of controlling money flows other than totalcash
        for (const pl of (await Player.All())) {
            this.CurrentTurn.totalcash += await pl.AgetCash();
        }

        this.CurrentTurn.totalcash -= this.CurrentTurn.freecash;

        this.CurrentTurn.cashperplayer = this.CurrentTurn.totalcash / (await Player.Count());
    }

    public static async CalculateMedian()
    {
        const data = [];

        for (const pl of (await Player.All())) {
            const cash = await pl.AgetCash();
            Statistics.Create<IPlayerStatisticsRecord>(pl.id, this.CurrentTurn.id, StatisticsTypes.PlayerRecord, {
                cash,
            });

            data.push(cash);
        }

        const mediancash = this.Median(data);
        Statistics.Create<IMedianCashRecord>(null, this.CurrentTurn.id, StatisticsTypes.MedianCashRecord, {
            cash: mediancash,
        });
    }

    public static async CalculateWorkers()
    {
        this.CurrentTurn.totalworkers = 0;
        let factoryorrgocount = 0;
        const data = [];

        for (const pl of (await Factory.All())) {
            data.push(pl.employeesCount);
            factoryorrgocount++;
            this.CurrentTurn.totalworkers += pl.employeesCount;
        }

        for (const pl of (await RGO.All())) {
            data.push(pl.employeesCount);
            factoryorrgocount++;
            this.CurrentTurn.totalworkers += pl.employeesCount;
        }

        this.CurrentTurn.averageworkers = this.CurrentTurn.totalworkers / factoryorrgocount;
        this.CurrentTurn.medianworkers = this.Median(data);
    }

    public static async CheckBalance(): Promise<boolean>
    {
        await this.CalculateBalance();

        if (!this.LastTurn) {
            return true;
        }

        if (this.CurrentTurn.totalcash !== this.LastTurn.totalcash) {
            Logger.warn("===" +
                "Wrong balance\n" +
                JSON.stringify(this.LastTurn) + "\n" +
                JSON.stringify(this.CurrentTurn) + "\n" +
                "===");

            this.LastTurn.totalcash = this.CurrentTurn.totalcash;
            return false;
        }

        Logger.verbose("Balance fine");

        return true;
    }

    public static RegisterNewCash(amount: number)
    {
        this.CurrentTurn.freecash += amount;
    }

    public static Median(values: number[])
    {
        if (values.length === 0) { return 0; }

        values.sort((a, b) =>
        {
            return a - b;
        });

        const half = Math.floor(values.length / 2);

        if (values.length % 2) {
            return values[half];
        }

        return (values[half - 1] + values[half]) / 2.0;
    }
}
