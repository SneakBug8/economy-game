import { Turn } from "entity/Turn";
import { Player } from "entity/Player";

export class TurnsService {
    static LastTurn: Turn;

    public static async Init() {
        Turn.CurrentTurn = new Turn();
        this.LastTurn = await Turn.Last();
        Turn.CurrentTurn.id = this.LastTurn.id + 1;
    }

    public static async MakeReport() {
        Turn.CurrentTurn.datetime = new Date().toString();
        Turn.CurrentTurn.freecash += this.LastTurn.freecash;

        for (const pl of await Player.All()) {
            Turn.CurrentTurn.totalcash += pl.cash;
        }

        Turn.CurrentTurn.cashperplayer = Turn.CurrentTurn.totalcash  / await Player.Count();
        Turn.CurrentTurn.totalcash += Turn.CurrentTurn.freecash;

        Turn.Insert(Turn.CurrentTurn);
    }
}