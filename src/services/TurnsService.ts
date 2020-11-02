import { Turn } from "entity/Turn";
import { Player } from "entity/Player";
import { Log } from "entity/Log";
import { EventsList } from "events/EventsList";

export class TurnsService
{
    static LastTurn: Turn;

    public static Initialized = false;

    public static async Init()
    {
        if (this.Initialized) {
            return;
        }

        this.Initialized = true;

        Turn.CurrentTurn = new Turn();

        this.StartTurn(true);
    }

    public static async StartTurn(frominitialization: boolean = false)
    {
        if (!frominitialization) {
            Turn.CurrentTurn = new Turn();
        }

        this.LastTurn = await Turn.Last();

        if (this.LastTurn) {
            Turn.CurrentTurn.id = this.LastTurn.id + 1;
            Turn.CurrentTurn.freecash = this.LastTurn.freecash;
        }
        else {
            Turn.CurrentTurn.id = 1;
        }

        Log.LogText("Now is turn " + Turn.CurrentTurn.id);

        EventsList.onTurn.emit(Turn.CurrentTurn);
    }

    public static async EndTurn()
    {
        Turn.CurrentTurn.datetime = new Date().toString();

        for (const pl of (await Player.All())) {
            Turn.CurrentTurn.totalcash += pl.cash;
        }

        Turn.CurrentTurn.cashperplayer = Turn.CurrentTurn.totalcash / (await Player.Count());
        Turn.CurrentTurn.totalcash += Turn.CurrentTurn.freecash;

        Turn.Insert(Turn.CurrentTurn);
    }

    public static AddFreeCash(amount: number)
    {
        Turn.CurrentTurn.AddFreeCash(amount);
        console.log(`Current free cash is: ` + Turn.CurrentTurn.freecash);
    }

}