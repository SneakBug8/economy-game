import { Turn } from "entity/Turn";
import { Player } from "entity/Player";

export class Turns {
    public static CurrentTurn: Turn = new Turn();
    static LastTurn: Turn;

    public static async Init() {
        this.LastTurn = await Turn.Last();
        this.CurrentTurn.id = this.LastTurn.id + 1;
    }

    public static async MakeReport() {
        this.CurrentTurn.datetime = new Date().toString();
        this.CurrentTurn.freecash += this.LastTurn.freecash;

        for (const pl of await Player.All()) {
            this.CurrentTurn.totalcash += pl.cash;
        }

        this.CurrentTurn.cashperplayer = this.CurrentTurn.totalcash  / await Player.Count();
        this.CurrentTurn.totalcash += this.CurrentTurn.freecash;

        Turn.Insert(this.CurrentTurn);
    }
}