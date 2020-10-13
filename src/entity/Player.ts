import { Factory } from "./Factory";
import { MarketActor } from "./MarketActor";
import { Connection } from "DB";

export class Player
{
    public id: number;
    public username: string;
    public password: string;
    public cash: number;
    public Factory: Factory;
    public Actor: MarketActor;

}

export const PlayerRepository = Connection("Players");