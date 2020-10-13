import { Connection } from "DB";

export class Turn
{
    public id: number;
    public datetime: Date;
    public totalcash: number;
    public cashperplayer: number;
    public freecash: number;

}

export const TurnRepository = Connection("Turns");