import { Turn } from "entity/Turn";
import { Player } from "entity/Player";
import { Log } from "entity/Log";
import { EventsList } from "events/EventsList";
import { Runner } from "Runner";
import { Factory } from "entity/Factory";
import { RGO } from "entity/RGO";

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
        await this.CalculateWorkers();

        EventsList.onBeforeNewTurn.emit(this.CurrentTurn);

        await Turn.Insert(this.CurrentTurn);
    }

    public static async CalculateBalance()
    {
        this.CurrentTurn.totalcash = 0;

        for (const pl of (await Player.All())) {
            this.CurrentTurn.totalcash += pl.cash;
        }

        this.CurrentTurn.cashperplayer = this.CurrentTurn.totalcash / (await Player.Count());
    }

    public static async CalculateWorkers()
    {
        this.CurrentTurn.totalworkers = 0;

        for (const pl of (await Factory.All())) {
            this.CurrentTurn.totalworkers += pl.employeesCount;
        }

        for (const pl of (await RGO.All())) {
            this.CurrentTurn.totalworkers += pl.employeesCount;
        }
    }

    public static async CheckBalance(): Promise<boolean>
    {
        await this.CalculateBalance();

        if (!this.LastTurn) {
            return true;
        }

        if (this.CurrentTurn.totalcash !== this.LastTurn.totalcash) {
            console.log("===");
            console.log("Wrong balance");
            console.log(this.LastTurn);
            console.log(this.CurrentTurn);
            console.log("===");

            this.LastTurn.totalcash = this.CurrentTurn.totalcash;
            return false;
        }

        console.log(this.CurrentTurn);

        return true;
    }
}
